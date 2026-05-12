import React, { useContext, useEffect, useState } from 'react';
import { StudentContext } from '../App';
import facultyData from '../data/faculty';
import { generateThesisEmail } from '../utils/emailTemplate';
import styles from './EmailForm.module.css';

export default function EmailForm({ preselectedFaculty, onGenerate }) {
  const { student } = useContext(StudentContext);
  const [facultySearch, setFacultySearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({
    professorName: '',
    studentName: '',
    interests: '',
    researchArea: '',
    specificWork: '',
    skills: '',
    studentId: '',
    email: '',
    link: '',
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      studentName: current.studentName || student.name || '',
      studentId: current.studentId || student.studentId || '',
      email: current.email || student.email || '',
    }));
  }, [student.email, student.name, student.studentId]);

  useEffect(() => {
    if (!preselectedFaculty) {
      return;
    }

    setSelectedFaculty(preselectedFaculty);
    setFacultySearch(preselectedFaculty.name);
    setShowDropdown(false);
    setForm((current) => ({
      ...current,
      professorName: getProfessorLastName(preselectedFaculty.name),
      researchArea:
        current.researchArea || preselectedFaculty.researchAreas.slice(0, 3).join(', '),
      specificWork:
        current.specificWork ||
        preselectedFaculty.recentPapers[0]?.title ||
        preselectedFaculty.researchAreas[0] ||
        '',
    }));
  }, [preselectedFaculty]);

  const filtered = facultySearch.trim()
    ? facultyData.filter((faculty) =>
        faculty.name.toLowerCase().includes(facultySearch.toLowerCase())
      )
    : facultyData;

  const selectFaculty = (faculty) => {
    setSelectedFaculty(faculty);
    setFacultySearch(faculty.name);
    setShowDropdown(false);
    setForm((current) => ({
      ...current,
      professorName: getProfessorLastName(faculty.name),
      researchArea: faculty.researchAreas.slice(0, 3).join(', '),
      specificWork: faculty.recentPapers[0]?.title || faculty.researchAreas[0] || '',
    }));
  };

  const handleGenerate = () => {
    if (!selectedFaculty || !form.interests.trim() || !form.skills.trim()) {
      return;
    }

    const fullDraft = generateThesisEmail({
      professorName: form.professorName || getProfessorLastName(selectedFaculty.name),
      studentName: form.studentName || student.name || '[Your Name]',
      interests: form.interests,
      researchArea:
        form.researchArea ||
        selectedFaculty.researchAreas.slice(0, 3).join(', ') ||
        '[research area/topic]',
      specificWork:
        form.specificWork ||
        selectedFaculty.recentPapers[0]?.title ||
        '[specific topic/paper/project if applicable]',
      skills: form.skills,
      studentId: form.studentId || student.studentId || '[Student ID]',
      email: form.email || student.email || '[Email Address]',
      link: form.link || '[Optional: GitHub / Portfolio / LinkedIn]',
    });

    const [subjectLine, ...bodyLines] = fullDraft.split('\n');
    onGenerate({
      subject: subjectLine.replace(/^Subject:\s*/, '').trim(),
      body: bodyLines.join('\n').trim(),
      faculty: selectedFaculty,
    });
  };

  return (
    <div className={styles.wrapper} id="email-form">
      <div className={styles.title}>Email Draft</div>

      {student.name && (
        <div className={styles.preFilled}>
          <span className={styles.preFilledName}>{student.name}</span>
          {student.studentId && ` - ${student.studentId}`}
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Select Faculty</label>
        <div className={styles.selectorWrap}>
          <input
            className={styles.selectorInput}
            value={facultySearch}
            onChange={(event) => {
              setFacultySearch(event.target.value);
              setShowDropdown(true);
              if (!event.target.value.trim()) {
                setSelectedFaculty(null);
              }
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search faculty by name..."
            id="email-faculty-search"
          />
          {showDropdown && filtered.length > 0 && (
            <div className={styles.selectorDropdown}>
              {filtered.map((faculty) => (
                <div
                  key={faculty.id}
                  className={styles.selectorOption}
                  onClick={() => selectFaculty(faculty)}
                >
                  {faculty.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Professor Last Name</label>
          <input
            className={styles.selectorInput}
            value={form.professorName}
            onChange={(event) => setForm({ ...form, professorName: event.target.value })}
            placeholder="Professor last name"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Your Name</label>
          <input
            className={styles.selectorInput}
            value={form.studentName}
            onChange={(event) => setForm({ ...form, studentName: event.target.value })}
            placeholder="Your full name"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Student ID</label>
          <input
            className={styles.selectorInput}
            value={form.studentId}
            onChange={(event) => setForm({ ...form, studentId: event.target.value })}
            placeholder="Student ID"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.selectorInput}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Your email address"
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Your Research Interests</label>
        <textarea
          className={styles.textarea}
          value={form.interests}
          onChange={(event) => setForm({ ...form, interests: event.target.value })}
          placeholder="e.g. NLP, computer vision, trustworthy AI"
          id="email-interests"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Professor Research Area</label>
        <textarea
          className={styles.textarea}
          value={form.researchArea}
          onChange={(event) => setForm({ ...form, researchArea: event.target.value })}
          placeholder="Professor research area or lab topic"
          id="email-research-area"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Specific Work</label>
        <textarea
          className={styles.textarea}
          value={form.specificWork}
          onChange={(event) => setForm({ ...form, specificWork: event.target.value })}
          placeholder="Specific paper, project, or idea you want to mention"
          id="email-specific-work"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Skills / Projects</label>
        <textarea
          className={styles.textarea}
          value={form.skills}
          onChange={(event) => setForm({ ...form, skills: event.target.value })}
          placeholder="Relevant skills, tools, coursework, or projects"
          id="email-skills"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Portfolio Link</label>
        <input
          className={styles.selectorInput}
          value={form.link}
          onChange={(event) => setForm({ ...form, link: event.target.value })}
          placeholder="Optional: GitHub, portfolio, or LinkedIn"
          id="email-link"
        />
      </div>

      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={!selectedFaculty || !form.interests.trim() || !form.skills.trim()}
        id="email-generate-btn"
      >
        Generate Draft
      </button>
    </div>
  );
}

function getProfessorLastName(name) {
  return (
    name
      .replace(/^Dr\.\s*/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .at(-1) || ''
  );
}
