import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import CloudBackground from './components/CloudBackground';
import HomePage from './pages/HomePage';
import DatabasePage from './pages/DatabasePage';
import ActionWorkspacePage from './pages/ActionWorkspacePage';
import ReviewCommunityPage from './pages/ReviewCommunityPage';

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

export default function App() {
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

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
    } catch (_error) {
      // Ignore persistence issues in restricted environments.
    }
  }, [student]);

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
          <Route path="/review" element={<ReviewCommunityPage />} />
          <Route path="/match" element={<Navigate to="/action" replace />} />
        </Routes>
      </Router>
    </StudentContext.Provider>
  );
}
