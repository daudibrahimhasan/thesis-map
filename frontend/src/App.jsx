import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import CloudBackground from './components/CloudBackground';
import HomePage from './pages/HomePage';
import DatabasePage from './pages/DatabasePage';
import ActionWorkspacePage from './pages/ActionWorkspacePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';

/**
 * StudentContext — stores the student's profile data
 * entered via the nav profile dropdown. Pre-fills email drafts
 * and match forms automatically.
 */
export const StudentContext = createContext({
  student: {
    name: '',
    studentId: '',
    university: '',
    department: '',
    degreeType: '',
    email: '',
    avatarUrl: '',
  },
  setStudent: () => {},
});

const STORAGE_KEY = 'thesismap.student-profile';

/**
 * Inner app — has access to AuthContext via useAuth().
 * Syncs Supabase auth user data → StudentContext automatically
 * so all existing components (EmailForm, etc.) keep working.
 */
function AppShell() {
  const { user } = useAuth();

  const [student, setStudent] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_error) {
      // Ignore localStorage issues and fall back to defaults.
    }

    return {
      name: '',
      studentId: '',
      university: '',
      department: '',
      degreeType: '',
      email: '',
      avatarUrl: '',
    };
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
    } catch (_error) {
      // Ignore persistence issues in restricted environments.
    }
  }, [student]);

  // Sync Supabase auth user → StudentContext
  useEffect(() => {
    if (!user) return;

    const meta = user.user_metadata || {};
    setStudent((current) => ({
      ...current,
      name: meta.full_name || meta.name || current.name,
      email: user.email || current.email,
      avatarUrl: meta.avatar_url || meta.picture || current.avatarUrl,
    }));
  }, [user]);

  return (
    <StudentContext.Provider value={{ student, setStudent }}>
      <Router>
        {/* Sky + animated clouds — behind everything */}
        <CloudBackground />

        {/* Nav — consistent across all pages */}
        <Nav />

        {/* Page content */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/action" element={<ActionWorkspacePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/match" element={<Navigate to="/action" replace />} />
          <Route path="/review" element={<Navigate to="/about" replace />} />
        </Routes>
      </Router>
    </StudentContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
