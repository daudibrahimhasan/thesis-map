import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentContext } from '../App';
import facultyData from '../data/faculty';
import FilterSidebar from '../components/FilterSidebar';
import FacultyTable from '../components/FacultyTable';
import FacultyDrawer from '../components/FacultyDrawer';
import styles from './DatabasePage.module.css';

const defaultFilters = {
  search: '',
  areas: [],
  availableOnly: false,
  degreeTypes: [],
};

const DESIGNATION_RANK = {
  'Professor': 1,
  'Associate Professor & Chairperson': 2,
  'Associate Professor': 3,
  'Assistant Professor': 4,
  'Senior Lecturer': 5,
  'Lecturer': 6,
  'Adjunct Lecturer': 7,
};

function hasResearchInterestMention(faculty) {
  return (
    (Array.isArray(faculty.researchAreas) && faculty.researchAreas.length > 0) ||
    /research interests:/i.test(faculty.bio || '')
  );
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCROLL_GATE_THRESHOLD = 320; // px scrolled before locking

export default function DatabasePage() {
  const { student, setStudent } = useContext(StudentContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [density, setDensity] = useState('comfortable');
  const [sortConfig, setSortConfig] = useState({ key: 'designation', direction: 'asc' });
  const [scrollGated, setScrollGated] = useState(false);
  const [authError, setAuthError] = useState('');
  const contentRef = useRef(null);

  const isSignedIn = Boolean(student.email || student.avatarUrl || student.name);

  // Scroll-gate: lock when user scrolls past threshold (unauthenticated only)
  useEffect(() => {
    if (isSignedIn) {
      setScrollGated(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > SCROLL_GATE_THRESHOLD && !isSignedIn) {
        setScrollGated(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSignedIn]);

  // When gated, prevent body scroll
  useEffect(() => {
    if (scrollGated) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [scrollGated]);

  // Google sign-in handler for the gate
  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setAuthError('Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.');
      return;
    }
    if (!window.google?.accounts?.id) {
      setAuthError('Google Sign-In is loading...');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        try {
          const payload = parseJwt(response.credential);
          setStudent((current) => ({
            ...current,
            name: payload.name || current.name,
            email: payload.email || current.email,
            avatarUrl: payload.picture || current.avatarUrl,
          }));
          setAuthError('');
          setScrollGated(false);
        } catch (_error) {
          setAuthError('Google sign-in could not be completed.');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt();
  };

  const [filters, setFilters] = useState(() => {
    const area = searchParams.get('area');
    const available = searchParams.get('available');
    return {
      ...defaultFilters,
      areas: area ? [area] : [],
      availableOnly: available === 'true',
    };
  });

  useEffect(() => {
    if (selectedFaculty) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [selectedFaculty]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.areas.length > 0) params.set('area', filters.areas.join(','));
    if (filters.availableOnly) params.set('available', 'true');
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const filtered = useMemo(() => {
    return facultyData.filter((f) => {
      // 1. Search Query
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const searchable = `${f.name} ${f.initials} ${f.designation} ${f.department} ${f.bio} ${f.researchAreas.join(' ')} ${(f.researchCategories || []).join(' ')} ${f.degreeTypes.join(' ')}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // 2. Research Category Filter
      if (filters.areas.length > 0) {
        if (!filters.areas.some((a) => (f.researchCategories || []).includes(a))) return false;
      }

      // 3. Availability Filter
      if (filters.availableOnly && f.availableSlots === 0) {
        return false;
      }

      // 4. Degree Type Filter
      if (filters.degreeTypes.length > 0 && !filters.degreeTypes.some((d) => f.degreeTypes.includes(d))) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const sortedFaculty = useMemo(() => {
    const items = [...filtered];
    const direction = sortConfig.direction === 'desc' ? -1 : 1;

    items.sort((a, b) => {
      const interestDelta = Number(hasResearchInterestMention(b)) - Number(hasResearchInterestMention(a));
      if (interestDelta !== 0) {
        return interestDelta;
      }

      if (sortConfig.key === 'availability') {
        return (a.availableSlots - b.availableSlots) * direction || a.name.localeCompare(b.name);
      }

      if (sortConfig.key === 'research') {
        return ((a.researchAreas.length || 0) - (b.researchAreas.length || 0)) * direction || a.name.localeCompare(b.name);
      }

      if (sortConfig.key === 'designation') {
        const rankA = getDesignationRank(a.designation);
        const rankB = getDesignationRank(b.designation);
        return (rankA - rankB) * direction || a.name.localeCompare(b.name);
      }

      if (sortConfig.key === 'degree') {
        return (a.degreeTypes.join(', ').localeCompare(b.degreeTypes.join(', ')) * direction) || a.name.localeCompare(b.name);
      }

      return a.name.localeCompare(b.name) * direction;
    });

    return items;
  }, [filtered, sortConfig]);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.areas.length ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.degreeTypes.length ? 1 : 0);

  const clearFilters = () => setFilters(defaultFilters);

  const handleSortChange = (nextKey) => {
    setSortConfig((current) => {
      if (current.key === nextKey) {
        return {
          key: nextKey,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key: nextKey,
        direction: nextKey === 'availability' ? 'desc' : 'asc',
      };
    });
  };

  const exportFaculty = () => {
    const headers = ['Name', 'Position', 'Department', 'Research Areas', 'Availability', 'Degree Types', 'Email'];
    const rows = sortedFaculty.map((faculty) => [
      faculty.name,
      faculty.designation,
      faculty.department,
      faculty.researchAreas.join('; '),
      faculty.availableSlots,
      faculty.degreeTypes.join('; '),
      faculty.email,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faculty-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortValue = `${sortConfig.key}:${sortConfig.direction}`;

  return (
    <div className={styles.page} ref={contentRef}>
      <div className={styles.panel}>
        <FilterSidebar filters={filters} onChange={setFilters} onClear={clearFilters} />

        <section className={styles.content}>
          {/* Toolbar removed per user request */}


          <FacultyTable
            data={sortedFaculty}
            onSelectFaculty={setSelectedFaculty}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            density={density}
          />
        </section>
      </div>

      <FacultyDrawer faculty={selectedFaculty} onClose={() => setSelectedFaculty(null)} />

      {/* Scroll-gate overlay */}
      {scrollGated && !isSignedIn && (
        <div className={styles.scrollGate} id="scroll-gate-overlay">
          <div className={styles.scrollGateGradient} />
          <div className={styles.scrollGateCard}>
            <div className={styles.scrollGateLock}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className={styles.scrollGateTitle}>Sign in to explore</h2>
            <p className={styles.scrollGateText}>
              Access the full faculty database, research areas, and availability details by signing in with your Google account.
            </p>
            <button className={styles.scrollGateGoogle} onClick={handleGoogleSignIn} id="scroll-gate-google-btn">
              <span className={styles.scrollGateGIcon}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              </span>
              Sign in with Google
            </button>
            {authError && <p className={styles.scrollGateError}>{authError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function getDesignationRank(designation) {
  return DESIGNATION_RANK[designation] || 999;
}

// Token signature is validated by Google Identity Services SDK before this callback fires.
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
