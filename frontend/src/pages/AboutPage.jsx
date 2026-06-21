import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.block}>

        <div className={styles.text}>
          <p className={styles.brand}>ThesisMap</p>
          <p className={styles.role}>find your supervisor</p>
          <h1 className={styles.title}>About</h1>
          <p className={styles.body}>
            ThesisMap brings every supervisor’s research, recent work, and availability
            into one place. Instead of emailing professors blindly, students can see who
            works on what, find the right match for their thesis, and reach out with a
            thoughtful first email — all in one workspace.
          </p>
          <Link to="/database" className={styles.readMore}>read more</Link>
        </div>

        <div className={styles.media}>
          {/* Swap this image for your own — drop a file in /public and update the src. */}
          <img
            className={styles.image}
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80"
            alt="A student working on their thesis"
            loading="lazy"
          />
        </div>

      </section>
    </div>
  );
}
