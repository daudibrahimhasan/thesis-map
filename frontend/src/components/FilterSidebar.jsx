import React from 'react';
import { fields } from '../data/graphData';
import styles from './FilterSidebar.module.css';

const degreeOptions = ['Undergraduate', 'MSc', 'PhD'];

export default function FilterSidebar({ filters, onChange, onClear }) {
  const {
    search = '',
    areas = [],
    availableOnly = false,
    degreeTypes = [],
  } = filters;

  const toggleArray = (arr, val) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const update = (patch) => onChange({ ...filters, ...patch });

  const activeFilterCount =
    (search.length > 0 ? 1 : 0) +
    (areas.length > 0 ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (degreeTypes.length > 0 ? 1 : 0);

  return (
    <aside className={styles.sidebar} id="filter-sidebar">
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Database</div>
          <div className={styles.title}>Filters</div>
        </div>
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

      <div className={styles.group}>
        <div className={styles.groupTitle}>Research Areas</div>
        <div className={styles.pillGroup}>
          {fields.map((f) => (
            <button
              key={f.id}
              className={areas.includes(f.label) ? styles.pillToggleActive : styles.pillToggle}
              onClick={() => update({ areas: toggleArray(areas, f.label) })}
              id={`filter-area-${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>Availability</div>
        <div className={styles.toggleCard}>
          <div>
            <div className={styles.toggleTitle}>Taking students only</div>
            <div className={styles.toggleMeta}>Show only faculty with open supervision capacity.</div>
          </div>
          <div
            className={availableOnly ? styles.toggleOn : styles.toggle}
            onClick={() => update({ availableOnly: !availableOnly })}
            role="switch"
            aria-checked={availableOnly}
            id="filter-available-toggle"
          >
            <div className={styles.toggleKnob} />
          </div>
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>Degree Type</div>
        <div className={styles.pillGroup}>
          {degreeOptions.map((d) => (
            <button
              key={d}
              className={degreeTypes.includes(d) ? styles.pillToggleActive : styles.pillToggle}
              onClick={() => update({ degreeTypes: toggleArray(degreeTypes, d) })}
              id={`filter-degree-${d.toLowerCase()}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.clearBtn} onClick={onClear} id="filter-clear">
        Clear all filters
      </button>
    </aside>
  );
}
