import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import facultyData from '../data/faculty';
import MatchForm from '../components/MatchForm';
import MatchResults from '../components/MatchResults';
import EmailForm from '../components/EmailForm';
import EmailPreview from '../components/EmailPreview';
import styles from './ActionWorkspacePage.module.css';

export default function ActionWorkspacePage() {
  const [searchParams] = useSearchParams();
  const [matchResults, setMatchResults] = useState(null);
  const [emailDraft, setEmailDraft] = useState(null);
  const [preselectedFaculty, setPreselectedFaculty] = useState(null);

  useEffect(() => {
    const facultyId = searchParams.get('faculty');
    if (!facultyId) {
      return;
    }

    const found = facultyData.find((faculty) => faculty.id === Number.parseInt(facultyId, 10));
    if (found) {
      setPreselectedFaculty(found);
    }
  }, [searchParams]);

  const handleDraftFromMatch = (faculty) => {
    setPreselectedFaculty(faculty);
  };

  const handleRegenerate = () => {
    setEmailDraft(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Student Tools</p>
            <h2 className={styles.sectionTitle}>Match and Reach Out</h2>
            <p className={styles.sectionText}>
              Find faculty aligned with your thesis direction, then draft an email without leaving the workspace.
            </p>
          </div>

          <MatchForm onResults={setMatchResults} />
          <MatchResults results={matchResults} onDraftEmail={handleDraftFromMatch} />
        </div>

        <div className={styles.divider} />

        <div className={styles.rightPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Outreach</p>
            <h2 className={styles.sectionTitle}>Email Draft</h2>
            <p className={styles.sectionText}>
              Generate a draft based on your profile and a selected supervisor.
            </p>
          </div>

          <EmailForm
            preselectedFaculty={preselectedFaculty}
            onGenerate={setEmailDraft}
          />
          <EmailPreview email={emailDraft} onRegenerate={handleRegenerate} />
        </div>
      </div>
    </div>
  );
}
