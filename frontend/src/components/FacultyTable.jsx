import React, { useState, useCallback } from 'react';
import TagPill from './TagPill';
import AvailabilityBadge from './AvailabilityBadge';
import styles from './FacultyTable.module.css';

const sortLabels = {
  name: 'Faculty',
  initials: 'Initial',
  research: 'Research Areas',
  availability: 'Availability',
  contact: 'Contact',
};

export default function FacultyTable({ data, onSelectFaculty, sortConfig, onSortChange, density = 'comfortable' }) {
  const [copied, setCopied] = useState(false);
  const isCompact = density === 'compact';

  const copyEmail = useCallback((e, email) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  if (data.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <div className={styles.empty} id="table-empty">
          <div className={styles.emptyIcon}>Search</div>
          <div className={styles.emptyTitle}>No faculty found</div>
          <div className={styles.emptyText}>
            Try adjusting your filters or search query to find matching faculty members.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap} id="faculty-table-wrap">
      <table className={`${styles.table} ${isCompact ? styles.tableCompact : ''}`}>
        <thead>
          <tr>
            <SortableHeader label={sortLabels.name} column="name" sortConfig={sortConfig} onSortChange={onSortChange} />
            <SortableHeader label={sortLabels.initials} column="initials" sortConfig={sortConfig} onSortChange={onSortChange} className={styles.initialsColumn} />
            <SortableHeader label={sortLabels.research} column="research" sortConfig={sortConfig} onSortChange={onSortChange} />
            <SortableHeader label={sortLabels.availability} column="availability" sortConfig={sortConfig} onSortChange={onSortChange} align="center" />
            <th className={styles.contactHeader}>{sortLabels.contact}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((faculty) => (
            <tr key={faculty.id} onClick={() => onSelectFaculty(faculty)} id={`faculty-row-${faculty.id}`}>
              <td className={styles.facultyColumn}>
                <div className={styles.nameCell}>
                  <div className={styles.avatar} style={{ background: getAvatarColor(faculty.name) }}>
                    {faculty.initials}
                  </div>
                  <div className={styles.nameInfo}>
                    <span className={styles.facultyName}>{faculty.name}</span>
                    <span className={styles.position}>{shortDesignation(faculty.designation)}</span>
                  </div>
                </div>
              </td>

              <td className={styles.initialsColumn}>
                <div className={styles.initialPill}>
                  {faculty.initials}
                </div>
              </td>

              <td className={styles.researchColumn}>
                <div className={styles.researchText}>
                  {faculty.researchAreas.length > 0 ? (
                    faculty.researchAreas.join(', ')
                  ) : (
                    <span className={styles.placeholder}>No topics listed</span>
                  )}
                </div>
              </td>

              <td className={styles.availabilityColumn}>
                <AvailabilityBadge slots={faculty.availableSlots} compact={isCompact} />
              </td>

              <td className={styles.contactColumn}>
                <button
                  className={styles.emailCell}
                  onClick={(e) => copyEmail(e, faculty.email)}
                  title="Click to copy"
                >
                  <span className={styles.emailText}>{faculty.email}</span>
                  <svg className={styles.copyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {copied && <div className={styles.toast}>Email copied to clipboard</div>}
    </div>
  );
}

function SortableHeader({ label, column, sortConfig, onSortChange, align, className = '' }) {
  const active = sortConfig.key === column;
  const direction = active ? sortConfig.direction : null;

  return (
    <th className={`${align === 'center' ? styles.centerHeader : ''} ${className}`.trim()}>
      <button
        className={active ? styles.sortButtonActive : styles.sortButton}
        onClick={() => onSortChange(column)}
      >
        <span>{label}</span>
        <span className={styles.sortArrow}>{direction === 'desc' ? '↓' : '↑'}</span>
      </button>
    </th>
  );
}

function shortDesignation(d) {
  if (d === 'Professor') return 'Professor';
  if (d === 'Associate Professor') return 'Associate Professor';
  if (d === 'Assistant Professor') return 'Assistant Professor';
  return d;
}

const AVATAR_COLORS = [
  'linear-gradient(135deg, #38BDF8, #2563EB)',
  'linear-gradient(135deg, #7DD3FC, #38BDF8)',
  'linear-gradient(135deg, #60A5FA, #2563EB)',
  '#D4A95A',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
