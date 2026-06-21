import React, { useState } from 'react';
import { categories } from '../data/graphData';
import styles from './FilterSidebar.module.css';

export default function FilterSidebar({ filters, onChange }) {
  const {
    search = '',
    areas = [],
  } = filters;

  const [open, setOpen] = useState(false);

  const toggleArray = (arr, val) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className={styles.sidebar} id="filter-sidebar">
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Database</div>
          <div className={styles.title}>Filters</div>
        </div>

        {/* Mobile-only toggle to collapse the category list */}
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="filter-categories"
        >
          Domain
          {areas.length > 0 && <span className={styles.toggleCount}>{areas.length}</span>}
          <svg
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      <label className={styles.searchWrap}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search faculty, topics, labs..."
          value={search}
          onChange={(e) => update({ search: e.target.value })}
          id="filter-search"
        />
        <span className={styles.shortcut}>/</span>
      </label>

      <div
        id="filter-categories"
        className={`${styles.group} ${open ? styles.groupOpen : ''}`}
      >
        <div className={styles.groupTitle}>Domain</div>
        <div className={styles.pillGroup}>
          {categories.map((c) => (
            <button
              key={c.id}
              className={areas.includes(c.label) ? styles.pillToggleActive : styles.pillToggle}
              onClick={() => update({ areas: toggleArray(areas, c.label) })}
              id={`filter-area-${c.id}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

    </aside>
  );
}
