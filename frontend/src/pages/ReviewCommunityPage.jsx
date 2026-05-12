import React, { useContext, useMemo, useState } from 'react';
import { StudentContext } from '../App';
import facultyData from '../data/faculty';
import styles from './ReviewCommunityPage.module.css';

const initialReviews = [
  {
    id: 1,
    author: 'SK',
    name: 'Samiha Karim',
    time: '2h ago',
    tag: 'Proposal Scope',
    votes: 12,
    replies: 3,
    edited: false,
    body: 'If your topic is still broad, narrow it to one dataset, one model family, and one measurable outcome before you email a supervisor.',
  },
  {
    id: 2,
    author: 'RI',
    name: 'Rakib Islam',
    time: '5h ago',
    tag: 'Supervisor Outreach',
    votes: 9,
    replies: 1,
    edited: true,
    body: 'Shortlisted supervisors responded better when I attached a 4 to 5 line problem statement and one tentative methodology.',
  },
  {
    id: 3,
    author: 'MT',
    name: 'Maliha Tabassum',
    time: '1d ago',
    tag: 'Topic Framing',
    votes: 7,
    replies: 5,
    edited: false,
    body: 'Mention both the academic problem and the local Bangladesh context if your thesis has applied or social impact value.',
  },
];

const initialChatMessages = [
  {
    id: 1,
    sender: 'Samiha Karim',
    time: '10:14',
    body: 'Looking for a thesis mate who is interested in Bangla NLP resources and can help with model experiments.',
    own: false,
  },
  {
    id: 2,
    sender: 'Rakib Hossain',
    time: '10:20',
    body: 'Anyone working on secure systems or network traffic analysis this semester?',
    own: false,
  },
  {
    id: 3,
    sender: 'Rakib Hossain',
    time: '10:21',
    body: 'I want a practical collaborator for weekly check-ins.',
    own: false,
  },
  {
    id: 4,
    sender: 'Maliha Tabassum',
    time: '10:31',
    body: 'I am interested in medical imaging and can help with paper reading, annotation, and TensorFlow baselines.',
    own: false,
  },
];

export default function ReviewCommunityPage() {
  const { student } = useContext(StudentContext);
  const [showModal, setShowModal] = useState(false);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [chatInput, setChatInput] = useState('');
  const [reviews, setReviews] = useState(initialReviews);
  const [feedbackBody, setFeedbackBody] = useState('');
  const [mateForm, setMateForm] = useState({
    name: student.name || '',
    studentId: student.studentId || '',
    thesisTopic: '',
    supervisor: '',
    interestField: '',
    skills: '',
    cgpa: '',
    about: '',
  });

  const suggestedSupervisors = useMemo(() => facultyData.slice(0, 8), []);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackBody.trim()) return;

    setReviews((prev) => [
      {
        id: Date.now(),
        author: (student.name || 'You')
          .split(' ')
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        name: student.name || 'You',
        time: 'Just now',
        tag: 'Student Note',
        votes: 1,
        replies: 0,
        edited: false,
        body: feedbackBody.trim(),
      },
      ...prev,
    ]);
    setFeedbackBody('');
  };

  const handleMateSubmit = (event) => {
    event.preventDefault();
    setShowModal(false);
  };

  const handleChatSubmit = (event) => {
    event.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: student.name || 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: chatInput.trim(),
        own: true,
      },
    ]);
    setChatInput('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.topGrid}>
        <section className={styles.feedbackPanel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Student Corner</p>
              <h2 className={styles.sectionTitle}>Feedback & Review</h2>
            </div>
            <div className={styles.sectionActions}>
              <p className={styles.sectionText}>
                Community advice, proposal feedback, and outreach tips.
              </p>
              <button className={styles.inlineAction} type="button">
                View all
              </button>
            </div>
          </div>

          <form className={styles.quickFeedback} onSubmit={handleFeedbackSubmit}>
            <textarea
              className={styles.textarea}
              placeholder="What's your advice for thesis students?"
              value={feedbackBody}
              onChange={(e) => setFeedbackBody(e.target.value)}
              rows={2}
            />
            <div className={styles.composerFooter}>
              <span className={styles.shortcutHint}>Enter to post • Shift+Enter for new line</span>
              <button className={styles.primaryButtonSmall} type="submit" disabled={!feedbackBody.trim()}>
                Write Post
              </button>
            </div>
          </form>

          <div className={styles.cardStack}>
            {reviews.map((entry) => (
              <article key={entry.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewIdentity}>
                    <span className={styles.reviewAvatar}>{entry.author}</span>
                    <div className={styles.reviewMetaBlock}>
                      <span className={styles.reviewName}>{entry.name}</span>
                      <span className={styles.reviewMetaLine}>{entry.tag} • {entry.time}{entry.edited ? ' • Edited' : ''}</span>
                    </div>
                  </div>
                  <div className={styles.reviewActions}>
                    <span className={styles.votePill}>▲ {entry.votes}</span>
                    <button className={styles.ghostAction} type="button">Reply {entry.replies > 0 ? entry.replies : ''}</button>
                    <button className={styles.ghostAction} type="button">Save</button>
                  </div>
                </div>
                <p className={styles.cardText}>{entry.body}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className={styles.matesPanel}>
          <div className={styles.sectionHeaderCompact}>
            <div className={styles.chatTopbar}>
              <div>
                <p className={styles.eyebrow}>Find Thesis Mate</p>
                <h2 className={styles.sectionTitle}>Student Chat</h2>
              </div>
              <button
                className={styles.inlinePrimary}
                type="button"
                onClick={() => setShowModal(true)}
              >
                Add Your Info
              </button>
            </div>
            <p className={styles.sectionText}>
              Find thesis collaborators.
            </p>
          </div>

          <div className={styles.chatMetaBar}>
            <span className={styles.chatChannelHash}>#</span>
            <div className={styles.chatMetaText}>
              <span className={styles.chatChannelName}>find-thesis-mate</span>
            </div>
          </div>

          <div className={styles.chatThread}>
            {chatMessages.map((message) => (
              <article key={message.id} className={message.own ? styles.chatRowOwn : styles.chatRow}>
                <div className={message.own ? styles.chatAvatarOwn : styles.chatAvatar}>
                  {message.sender
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className={styles.chatMessageBlock}>
                  <div className={styles.chatBubbleHeader}>
                    <span className={styles.chatSender}>{message.sender}</span>
                    <span className={styles.chatTime}>{message.time}</span>
                  </div>
                  <p className={styles.chatBody}>{message.body}</p>
                  <div className={styles.chatActions}>
                    <button className={styles.chatAction} type="button">Reply</button>
                    <button className={styles.chatAction} type="button">React</button>
                    <button className={styles.chatAction} type="button">More</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <form className={styles.chatComposer} onSubmit={handleChatSubmit}>
            <div className={styles.chatInputRow}>
              <button className={styles.chatIconButton} type="button" aria-label="Attach">
                +
              </button>
              <textarea
                className={styles.chatInput}
                placeholder="Message #find-thesis-mate"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                rows={1}
              />
              <button className={styles.chatIconButton} type="button" aria-label="Emoji">
                :)
              </button>
            </div>
            <div className={styles.composerFooter}>
              <button className={styles.primaryButtonSmall} type="submit" disabled={!chatInput.trim()}>
                Send
              </button>
            </div>
          </form>
        </aside>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowModal(false)} aria-label="Close modal">×</button>

            <div className={styles.modalHeader}>
              <p className={styles.eyebrow}>Find Thesis Mate</p>
              <h2 className={styles.sectionTitle}>Add Your Info</h2>
              <p className={styles.sectionText}>
                Add your profile so other students can find you based on topic, skills, and collaboration style.
              </p>
            </div>

            <form className={styles.mateForm} onSubmit={handleMateSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.label}>
                  Name
                  <input
                    className={styles.input}
                    value={mateForm.name}
                    onChange={(event) => setMateForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your full name"
                  />
                </label>

                <label className={styles.label}>
                  ID
                  <input
                    className={styles.input}
                    value={mateForm.studentId}
                    onChange={(event) => setMateForm((current) => ({ ...current, studentId: event.target.value }))}
                    placeholder="Student ID"
                  />
                </label>

                <label className={styles.label}>
                  Interest field
                  <input
                    className={styles.input}
                    value={mateForm.interestField}
                    onChange={(event) => setMateForm((current) => ({ ...current, interestField: event.target.value }))}
                    placeholder="e.g. NLP, CV, Security"
                  />
                </label>

                <label className={styles.label}>
                  Skills
                  <input
                    className={styles.input}
                    value={mateForm.skills}
                    onChange={(event) => setMateForm((current) => ({ ...current, skills: event.target.value }))}
                    placeholder="e.g. Python, ML, writing, scraping"
                  />
                </label>

                <label className={styles.label}>
                  Thesis topic if any
                  <input
                    className={styles.input}
                    value={mateForm.thesisTopic}
                    onChange={(event) => setMateForm((current) => ({ ...current, thesisTopic: event.target.value }))}
                    placeholder="Working or tentative topic"
                  />
                </label>

                <label className={styles.label}>
                  Supervisor if any
                  <input
                    className={styles.input}
                    value={mateForm.supervisor}
                    onChange={(event) => setMateForm((current) => ({ ...current, supervisor: event.target.value }))}
                    placeholder="Supervisor name"
                    list="supervisor-options"
                  />
                </label>

                <label className={styles.label}>
                  CGPA
                  <input
                    className={styles.input}
                    value={mateForm.cgpa}
                    onChange={(event) => setMateForm((current) => ({ ...current, cgpa: event.target.value }))}
                    placeholder="e.g. 3.78"
                  />
                </label>
              </div>

              <label className={styles.label}>
                1 line about you
                <textarea
                  className={styles.textareaLarge}
                  value={mateForm.about}
                  onChange={(event) => setMateForm((current) => ({ ...current, about: event.target.value }))}
                  placeholder="Say what kind of partner you are or what kind of thesis work you enjoy."
                  rows={3}
                />
              </label>

              <div className={styles.formFooter}>
                <p className={styles.helperText}>
                  This profile will be visible to other students in the open list.
                </p>
                <button className={styles.primaryButton} type="submit">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <datalist id="supervisor-options">
        {suggestedSupervisors.map((faculty) => (
          <option key={faculty.id} value={faculty.name} />
        ))}
      </datalist>
    </div>
  );
}
