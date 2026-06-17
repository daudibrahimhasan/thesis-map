import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data/graphData';
import styles from './DotNav.module.css';

const FIELD_COLORS = {
  ai_ml:    '#2563EB',
  dl:       '#4338CA',
  cv:       '#475569',
  nlp:      '#D4A95A',
  llm:      '#7C3AED',
  data_sci: '#0891B2',
  security: '#DC2626',
  bio:      '#14B8A6',
  hci:      '#F59E0B',
  systems:  '#0F766E',
  se:       '#6366F1',
  theory:   '#64748B',
  hardware: '#92400E',
  robotics: '#059669',
  quantum:  '#8B5CF6',
  xai:      '#CA8A04',
};

export default function DotNav({ activeField, onHover }) {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper} id="dot-nav">
      {categories.map(f => {
        const isActive = activeField === f.id;
        const color = FIELD_COLORS[f.id] || 'var(--primary)';

        return (
          <div
            key={f.id}
            className={`${styles.dot} ${isActive ? styles.dotActive : ''}`}
            style={{
              '--dot-color': color,
              borderColor: isActive ? color : 'var(--text-faint)',
              background: isActive ? color : 'var(--surface)'
            }}
            onMouseEnter={() => onHover(f.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => navigate(`/database?area=${encodeURIComponent(f.label)}`)}
            role="button"
            tabIndex={0}
            aria-label={f.label}
          >
            <span className={styles.dotLabel}>{f.label}</span>
          </div>
        );
      })}
    </div>
  );
}
