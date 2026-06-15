import React, { useState } from 'react';
import styles from './ReviewCommunityPage.module.css';

const initialReviews = [
  {
    id: 1,
    author: 'SK',
    name: 'Samiha Karim',
    role: 'BSc Student',
    rating: 5,
    body: 'Found the right supervisor in under 20 minutes. The research area filters are exactly what I needed — I could see who works on NLP without emailing around blindly.',
  },
  {
    id: 2,
    author: 'RI',
    name: 'Rakib Islam',
    role: 'MSc Student',
    rating: 5,
    body: 'The email draft feature is genuinely useful. I went from having no idea how to reach out to sending a polished email the same afternoon.',
  },
  {
    id: 3,
    author: 'MT',
    name: 'Maliha Tabassum',
    role: 'BSc Student',
    rating: 4,
    body: "Seeing availability slots listed per faculty was a game changer. I stopped wasting time on supervisors who weren't taking students.",
  },
  {
    id: 4,
    author: 'FA',
    name: 'Farhan Ahmed',
    role: 'PhD Candidate',
    rating: 5,
    body: 'Clean interface, clear information. I referred three of my juniors here when they were looking for supervisors this semester.',
  },
];

export default function ReviewCommunityPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewBody.trim() || !reviewName.trim()) return;
    const initials = reviewName.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    setReviews(prev => [{
      id: Date.now(),
      author: initials,
      name: reviewName.trim(),
      role: 'Student',
      rating: 5,
      body: reviewBody.trim(),
    }, ...prev]);
    setReviewBody('');
    setReviewName('');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) return;
    setContactSent(true);
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topGrid}>

        <section className={styles.feedbackPanel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Reviews</p>
              <h2 className={styles.sectionTitle}>What students say</h2>
            </div>
            <p className={styles.sectionText}>
              Honest feedback from students who used ThesisMap to find their supervisor.
            </p>
          </div>

          <form className={styles.quickFeedback} onSubmit={handleReviewSubmit}>
            <input
              className={styles.input}
              placeholder="Your name"
              value={reviewName}
              onChange={e => setReviewName(e.target.value)}
            />
            <textarea
              className={styles.textarea}
              placeholder="Share your experience with ThesisMap..."
              value={reviewBody}
              onChange={e => setReviewBody(e.target.value)}
              rows={2}
            />
            <div className={styles.composerFooter}>
              <span className={styles.shortcutHint}>Your review helps other students</span>
              <button
                className={styles.primaryButtonSmall}
                type="submit"
                disabled={!reviewBody.trim() || !reviewName.trim()}
              >
                Post review
              </button>
            </div>
          </form>

          <div className={styles.cardStack}>
            {reviews.map(entry => (
              <article key={entry.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewIdentity}>
                    <span className={styles.reviewAvatar}>{entry.author}</span>
                    <div className={styles.reviewMetaBlock}>
                      <span className={styles.reviewName}>{entry.name}</span>
                      <span className={styles.reviewMetaLine}>{entry.role}</span>
                    </div>
                  </div>
                  <div className={styles.starRating}>
                    {'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}
                  </div>
                </div>
                <p className={styles.cardText}>{entry.body}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className={styles.contactPanel}>
          <div className={styles.sectionHeaderCompact}>
            <p className={styles.eyebrow}>Contact</p>
            <h2 className={styles.sectionTitle}>Get in touch</h2>
            <p className={styles.sectionText}>
              Have a suggestion, found a bug, or want to collaborate? We read every message.
            </p>
          </div>

          {contactSent ? (
            <div className={styles.contactSuccess}>
              <div className={styles.contactSuccessIcon}>✓</div>
              <p className={styles.contactSuccessTitle}>Message sent</p>
              <p className={styles.sectionText}>We'll get back to you within 2 business days.</p>
              <button
                className={styles.inlinePrimary}
                type="button"
                onClick={() => setContactSent(false)}
              >
                Send another
              </button>
            </div>
          ) : (
            <form className={styles.contactForm} onSubmit={handleContactSubmit}>
              <label className={styles.label}>
                Name
                <input
                  className={styles.input}
                  value={contactForm.name}
                  onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </label>
              <label className={styles.label}>
                Email
                <input
                  className={styles.input}
                  type="email"
                  value={contactForm.email}
                  onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@university.edu"
                />
              </label>
              <label className={styles.label}>
                Message
                <textarea
                  className={styles.textareaLarge}
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us what's on your mind..."
                  rows={6}
                />
              </label>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()}
              >
                Send message
              </button>
            </form>
          )}

          <div className={styles.contactInfo}>
            <div className={styles.contactInfoItem}>
              <span className={styles.contactInfoLabel}>Email</span>
              <span className={styles.contactInfoValue}>thesismap@gmail.com</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
