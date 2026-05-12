import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TagPill from './TagPill';
import AvailabilityBadge from './AvailabilityBadge';
import styles from './FacultyDrawer.module.css';

/**
 * FacultyDrawer — right-side drawer showing full faculty profile.
 * Slides in 200ms using Framer Motion.
 * Shows: name, dept, bio, papers, co-supervisors, "Draft email" button.
 * Click outside (overlay) to close.
 */
export default function FacultyDrawer({ faculty, onClose }) {
  const navigate = useNavigate();

  const handleDraft = () => {
    navigate(`/action?faculty=${faculty.id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {faculty && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            id="drawer-overlay"
          />

          {/* Drawer panel */}
          <motion.div
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            id="faculty-drawer"
          >
            {/* Close button */}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close drawer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.name}>{faculty.name}</div>
              <div className={styles.designation}>{faculty.designation}</div>
              <div style={{ marginTop: 10 }}>
                <AvailabilityBadge slots={faculty.availableSlots} />
              </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {/* Bio */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>About</div>
                <div className={styles.bio}>{faculty.bio}</div>
              </div>

              {/* Research areas */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Research Areas</div>
                <div className={styles.areaList}>
                  {faculty.researchAreas.map(a => (
                    <TagPill key={a} label={a} />
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Email</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--gray-600)' }}>
                  {faculty.email}
                </div>
              </div>

              {/* Degree types */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Accepts</div>
                <div className={styles.areaList}>
                  {faculty.degreeTypes.map(d => (
                    <TagPill key={d} label={d} />
                  ))}
                </div>
              </div>

              {/* Papers */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Recent Papers</div>
                {faculty.recentPapers.map((p, i) => (
                  <div key={i} className={styles.paper}>
                    <div className={styles.paperTitle}>{p.title}</div>
                    <div className={styles.paperYear}>{p.year}</div>
                  </div>
                ))}
              </div>

              {/* Co-supervisors */}
              {faculty.coSupervisors.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Co-Supervisors</div>
                  <div className={styles.coList}>
                    {faculty.coSupervisors.map((c, i) => (
                      <div key={i} className={styles.coName}>{c}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Draft email button */}
              <button className={styles.draftBtn} onClick={handleDraft} id="drawer-draft-btn">
                Draft email →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
