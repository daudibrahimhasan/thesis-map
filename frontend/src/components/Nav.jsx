import React, { useState, useContext, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { StudentContext } from '../App';
import styles from './Nav.module.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Nav() {
  const { student, setStudent } = useContext(StudentContext);
  const [showProfile, setShowProfile] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();

  const isSignedIn = Boolean(student.email || student.avatarUrl || student.name);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleGoogleReady = () => {
      if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };

    if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
      handleGoogleReady();
    } else {
      const onLoad = () => handleGoogleReady();
      window.addEventListener('google-loaded', onLoad);
      return () => window.removeEventListener('google-loaded', onLoad);
    }
  }, []);

  const initials = useMemo(() => {
    if (!student.name) return 'TM';
    const parts = student.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [student.name]);

  function handleGoogleCredential(response) {
    try {
      const payload = parseJwt(response.credential);
      setStudent((current) => ({
        ...current,
        name: payload.name || current.name,
        email: payload.email || current.email,
        avatarUrl: payload.picture || current.avatarUrl,
      }));
      setAuthError('');
      setShowProfile(true);
    } catch (_error) {
      setAuthError('Google sign-in could not be completed.');
    }
  }

  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setAuthError('Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.');
      return;
    }
    if (!window.google?.accounts?.id) {
      setAuthError('Google Sign-In is loading...');
      return;
    }
    window.google.accounts.id.prompt();
  };

  const handleLogout = () => {
    if (student.email && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setStudent({
      name: '',
      studentId: '',
      university: '',
      department: '',
      degreeType: '',
      email: '',
      avatarUrl: '',
    });
    setShowProfile(false);
  };

  return (
    <nav className={`${styles.nav} ${isHidden ? styles.navHidden : ''}`}>
      <div className={styles.navInner}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <img src="/happy-face.png" className={styles.logoIcon} alt="ThesisMap" />
          <span className={styles.wordmark}>Thesis<span className={styles.wordmarkAccent}>Map</span></span>
        </div>

        <div className={styles.links}>
          <NavLink
            to="/database"
            className={({ isActive }) => isActive ? styles.linkActive : styles.link}
          >
            Faculty
          </NavLink>
          <NavLink
            to="/action"
            className={({ isActive }) => isActive ? styles.linkActive : styles.link}
          >
            Action
          </NavLink>
          <NavLink
            to="/review"
            className={({ isActive }) => isActive ? styles.linkActive : styles.link}
          >
            Review
          </NavLink>
        </div>

        <div className={styles.navRight}>
          <button
            className={showProfile ? styles.avatarButtonActive : styles.avatarButton}
            onClick={() => setShowProfile((prev) => !prev)}
            id="profile-btn"
            aria-label="Open profile"
          >
            {student.avatarUrl ? (
              <img className={styles.avatarImage} src={student.avatarUrl} alt="Avatar" />
            ) : (
              <span className={styles.avatarFallback}>{initials}</span>
            )}
          </button>
        </div>

        {showProfile && (
          <>
            <div className={styles.overlay} onClick={() => setShowProfile(false)} />
            <div className={styles.dropdown}>
              {isSignedIn ? (
                <>
                  <div className={styles.profileHeader}>
                    <div className={styles.profileAvatarShell}>
                      {student.avatarUrl ? (
                        <img className={styles.avatarImage} src={student.avatarUrl} alt="P" />
                      ) : (
                        <span className={styles.avatarFallback}>{initials}</span>
                      )}
                    </div>
                    <div className={styles.profileMeta}>
                      <div className={styles.profileName}>{student.name}</div>
                      <div className={styles.profileEmail}>{student.email}</div>
                    </div>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoRow}>
                      <p className={styles.infoLabel}>Student ID</p>
                      <input
                        className={styles.fieldInput}
                        value={student.studentId}
                        onChange={(e) => setStudent({ ...student, studentId: e.target.value })}
                        placeholder="Add your ID"
                      />
                    </div>
                  </div>

                  <button className={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <div className={styles.signInCard}>
                  <p className={styles.infoLabel}>Academic Account</p>
                  <p className={styles.signInText}>
                    Sign in to personalize your thesis outreach and collaborate with mates.
                  </p>
                  <button className={styles.googleButton} onClick={handleGoogleSignIn}>
                    <span className={styles.googleIcon}>G</span>
                    Sign in with Google
                  </button>
                  {authError && <p className={styles.authError}>{authError}</p>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

// Token signature is validated by Google Identity Services SDK before this callback fires; verify server-side via Google tokeninfo endpoint if this payload is ever used for backend authorization.
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
}
