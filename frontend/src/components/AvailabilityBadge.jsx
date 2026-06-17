import React from 'react';
import styles from './AvailabilityBadge.module.css';

/**
 * AvailabilityBadge — color-coded pill showing availability status.
 * Green: 2+ slots, Yellow: 1 slot (limited), Gray: full.
 */
export default function AvailabilityBadge({ slots, compact = false }) {
  let variant;
  let label;

  if (slots >= 1) {
    variant = styles.available;
    label = 'Accepting';
  } else {
    variant = styles.full;
    label = 'Not Accepting';
  }

  return (
    <span className={variant}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}
