import React, { useEffect, useState } from 'react';
import styles from './EmailPreview.module.css';

export default function EmailPreview({ email, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    setSubject(email?.subject || '');
    setBody(email?.body || '');
  }, [email]);

  if (!email) return null;

  const handleCopy = () => {
    const text = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleGmail = () => {
    const to = email.faculty?.email || '';
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${to}&su=${encodedSubject}&body=${encodedBody}`,
      '_blank'
    );
  };

  return (
    <div className={styles.wrapper} id="email-preview">
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Subject</div>
        <input
          className={styles.subjectInput}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Generated Email Draft</div>
        <textarea
          className={styles.bodyInput}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={14}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtnPrimary} onClick={handleCopy} id="email-copy-btn">
          {copied ? 'Copied!' : 'Copy Email'}
        </button>
        <button className={styles.actionBtn} onClick={handleGmail} id="email-gmail-btn">
          Open in Gmail
        </button>
        <button className={styles.actionBtn} onClick={onRegenerate} id="email-regen-btn">
          Regenerate
        </button>
      </div>

      {copied && <div className={styles.toast}>Email copied to clipboard</div>}
    </div>
  );
}
