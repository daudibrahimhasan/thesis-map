import React from 'react';
import styles from './MatchResults.module.css';

/**
 * MatchResults — numbered list of matched faculty members.
 * Each shows: number, name, match %, keywords, "Draft email →" link.
 */
export default function MatchResults({ results, onDraftEmail }) {
  if (!results) return null;

  if (results.length === 0) {
    return (
      <div className={styles.empty} id="match-empty">
        No matches found. Try different keywords or broaden your search.
      </div>
    );
  }

  return (
    <div className={styles.wrapper} id="match-results">
      {results.map((r, i) => (
        <div key={r.id} className={styles.resultItem} id={`match-result-${r.id}`}>
          {/* Rank number */}
          <div className={styles.number}>{i + 1}.</div>

          <div className={styles.content}>
            <div>
              <div className={styles.name}>{r.name}</div>
            </div>

            {/* Match percentage bar */}
            <div className={styles.matchRow}>
              <span className={styles.percent}>{r.matchPercent}%</span>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${r.matchPercent}%` }}
                />
              </div>
            </div>

            {/* Matched keywords */}
            {r.matchedKeywords.length > 0 && (
              <div className={styles.keywords}>
                {r.matchedKeywords.map((k, j) => (
                  <span key={j} className={styles.keyword}>{k}</span>
                ))}
              </div>
            )}

            {/* Draft email link */}
            <span
              className={styles.draftLink}
              onClick={() => onDraftEmail(r)}
            >
              Draft email →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
