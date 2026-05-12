import React from 'react';
import styles from './AvailabilityBadge.module.css';

/**
 * AvailabilityBadge — color-coded pill showing availability status.
 * Green: 2+ slots, Yellow: 1 slot (limited), Gray: full.
 */
export default function AvailabilityBadge({ slots, compact = false }) {
  let variant;
  let label;

  if (slots >= 2) {
    variant = styles.available;
    label = 'Accepting';
  } else if (slots === 1) {
    variant = styles.limited;
    label = 'Limited';
  } else {
    variant = styles.full;
    label = 'Full';
  }

  return (
    <span className={variant}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}
