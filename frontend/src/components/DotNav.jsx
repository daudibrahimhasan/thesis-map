import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fields } from '../data/graphData';
import styles from './DotNav.module.css';

const FIELD_COLORS = {
  ml_ds:      '#2563EB',
  dl:          '#4338CA',
  nlp:         '#D4A95A',
  cv:          '#475569',
  healthcare: '#14B8A6',
  cyber:       '#DC2626',
  se:          '#6366F1',
  iot:         '#0F766E',
  hci:         '#F59E0B',
  xai:         '#CA8A04',
  emerging:    '#7C3AED',
};

export default function DotNav({ activeField, onHover }) {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper} id="dot-nav">
      {fields.map(f => {
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
