import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUp, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // If already logged in, redirect
  if (user) {
    navigate('/database', { replace: true });
    return null;
  }

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Redirect happens automatically after OAuth callback
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSignUpSuccess(false);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { user: newUser } = await signUp(email, password, {
          full_name: fullName.trim(),
        });

        if (newUser && !newUser.identities?.length) {
          setError('An account with this email already exists.');
        } else {
          setSignUpSuccess(true);
        }
      } else {
        await signInWithEmail(email, password);
        navigate('/database', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setSignUpSuccess(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
            </svg>
          </div>
          <h1 className={styles.title}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'signin'
              ? 'Sign in to personalize your thesis journey'
              : 'Join ThesisMap and find your perfect supervisor'}
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={mode === 'signin' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('signin'); setError(''); setSignUpSuccess(false); }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={mode === 'signup' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('signup'); setError(''); setSignUpSuccess(false); }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Google OAuth */}
        <div className={styles.oauthSection}>
          <button
            className={styles.googleBtn}
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            id="google-signin-btn"
          >
            <svg className={styles.googleLogo} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        {/* Success message for signup */}
        {signUpSuccess && (
          <div className={styles.success}>
            <span className={styles.successIcon}>✉️</span>
            Check your email for a confirmation link to complete your registration.
          </div>
        )}

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Email / Password Form */}
        {!signUpSuccess && (
          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="login-name">Full Name</label>
                <input
                  id="login-name"
                  className={styles.input}
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className={styles.input}
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className={styles.input}
                type="password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </div>

            <button
              className={styles.submitBtn}
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
            >
              {loading && <span className={styles.spinner} />}
              {loading
                ? 'Please wait…'
                : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
          </form>
        )}

        {/* Footer toggle */}
        <div className={styles.footer}>
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <span className={styles.footerLink} onClick={switchMode} role="button" tabIndex={0}>
                Sign up
              </span>
            </>
          ) : (
            <>Already have an account?{' '}
              <span className={styles.footerLink} onClick={switchMode} role="button" tabIndex={0}>
                Sign in
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
