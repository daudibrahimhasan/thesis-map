import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CloudBackground.module.css';

/**
 * Background — Adapts to page route.
 * Sky (Home/Database): Light blue sky, soft white clouds.
 * Sunlight (Action): Warm yellow sunlight dots, radial glow.
 */
export default function CloudBackground() {
  const location = useLocation();
  const isActionPage = location.pathname === '/action' || location.pathname === '/match';

  return (
    <div className={`${styles.bg} ${isActionPage ? styles.sunlight : styles.sky}`} aria-hidden="true">
      {isActionPage ? (
        <>
          <div className={styles.sunDot1} />
          <div className={styles.sunDot2} />
          <div className={styles.sunDot3} />
        </>
      ) : (
        <>
          {/* Small soft white clouds */}
          <div className={`${styles.cloud} ${styles.cloud1}`} />
          <div className={`${styles.cloud} ${styles.cloud2}`} />
          <div className={`${styles.cloud} ${styles.cloud3}`} />
          <div className={`${styles.cloud} ${styles.cloud4}`} />
        </>
      )}
      <div className={styles.noise} aria-hidden="true" />
    </div>
  );
}
