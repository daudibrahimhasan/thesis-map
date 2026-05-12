import React from 'react';
import styles from './TagPill.module.css';

/**
 * Semantic color map — updated for Academic Premium palette.
 * Using Royal Indigo and Gold as base for consistency.
 */
const AREA_COLORS = {
  'ML & Data Science':      { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'Healthcare & Bio':       { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'Deep Learning':          { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'NLP':                    { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'Computer Vision':        { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'Cybersecurity':          { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'Software Engineering':   { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'HCI & Accessibility':    { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'Explainable AI':         { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'Emerging Areas':         { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
  'IoT & Networking':       { bg: '#FFFDF9', color: '#1E0398', border: '#C2A76D' },
};

/**
 * TagPill — semantic-colored badge for research area tags.
 */
export default function TagPill({ label, small, overflow }) {
  if (overflow) {
    return <span className={styles.overflow}>{label}</span>;
  }

  // Use the new academic styling: surface background, indigo text, gold border
  const style = {
    background: 'var(--surface)',
    color: 'var(--primary)',
    borderColor: 'var(--border-gold)',
    borderWidth: '1px',
    borderStyle: 'solid',
  };

  return (
    <span
      className={small ? styles.pillSmall : styles.pill}
      style={style}
    >
      {label}
    </span>
  );
}
