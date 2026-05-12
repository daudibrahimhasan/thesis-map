import React, { useState, useContext } from 'react';
import { StudentContext } from '../App';
import faculty from '../data/faculty';
import styles from './MatchForm.module.css';

/**
 * MatchForm — "Find Your Supervisor" panel on the Action page.
 * Collects thesis idea, department, degree type.
 * On submit, computes match results using keyword similarity.
 */
export default function MatchForm({ onResults }) {
  const { student } = useContext(StudentContext);

  const [idea, setIdea] = useState('');
  const [department, setDepartment] = useState('');
  const [degree, setDegree] = useState(student.degreeType || '');

  /* ── Submit: simple keyword-based matching ── */
  const handleSubmit = () => {
    if (!idea.trim()) return;

    // Combine all search terms
    const terms = idea.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Score each faculty member
    const scored = faculty.map(f => {
      const searchable = [
        f.name,
        f.bio,
        ...f.researchAreas,
        ...f.recentPapers.map(p => p.title),
        f.department,
      ].join(' ').toLowerCase();

      let score = 0;
      const matchedKeywords = [];

      terms.forEach(term => {
        if (searchable.includes(term)) {
          score += 10;
          if (!matchedKeywords.includes(term)) matchedKeywords.push(term);
        }
      });

      // Bonus for matching research areas by keyword
      f.researchAreas.forEach(area => {
        const areaLower = area.toLowerCase();
        if (terms.some(t => areaLower.includes(t) || t.includes(areaLower))) {
          score += 20;
          if (!matchedKeywords.includes(area)) matchedKeywords.push(area);
        }
      });

      // Bonus for availability
      if (f.availableSlots > 0) score += 5;

      // Filter by department if selected
      if (department && f.department !== department) score -= 50;

      // Filter by degree
      if (degree && !f.degreeTypes.includes(degree)) score -= 50;

      return {
        ...f,
        score: Math.max(0, score),
        matchPercent: Math.min(98, Math.max(15, Math.round((score / (terms.length * 12 + 25)) * 100))),
        matchedKeywords: matchedKeywords.slice(0, 5),
      };
    });

    // Sort by score, take top 5
    const results = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    onResults(results);
  };

  return (
    <div className={styles.wrapper} id="match-form">
      <div className={styles.title}>Find Your Supervisor</div>

      {/* Thesis idea */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Describe your thesis idea</label>
        <textarea
          className={styles.textarea}
          value={idea}
          onChange={e => setIdea(e.target.value)}
          placeholder="e.g. I want to explore how NLP can be used to detect misinformation in Bengali social media..."
          id="match-idea"
        />
      </div>


      {/* Department */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Preferred Department (optional)</label>
        <select
          className={styles.select}
          value={department}
          onChange={e => setDepartment(e.target.value)}
          id="match-department"
        >
          <option value="">Any department</option>
          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
          <option value="Electrical & Computer Engineering">Electrical & Computer Engineering</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      {/* Degree */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Degree Type</label>
        <select
          className={styles.select}
          value={degree}
          onChange={e => setDegree(e.target.value)}
          id="match-degree"
        >
          <option value="">Any</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="MSc">MSc</option>
          <option value="PhD">PhD</option>
        </select>
      </div>

      {/* Submit */}
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!idea.trim()}
        id="match-search-btn"
      >
        Search
      </button>
    </div>
  );
}
