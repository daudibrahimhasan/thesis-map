/**
 * Neural graph data — research field nodes and their connections
 * Updated with 11 distinct filters and weighted connection strengths
 */

export const fields = [
  { id: "ml_ds",      label: "ML & Data Science",      fullName: "Machine Learning (General/Applied) & Data Science", count: 12 },
  { id: "healthcare", label: "Healthcare & Bio",      fullName: "Healthcare, Bioinformatics, & Biomedical Applications", count: 7  },
  { id: "dl",          label: "Deep Learning",         fullName: "Deep Learning & Neural Networks", count: 6  },
  { id: "nlp",         label: "NLP",                  fullName: "Natural Language Processing (NLP)", count: 6  },
  { id: "cv",          label: "Computer Vision",      fullName: "Computer Vision & Image Processing", count: 4  },
  { id: "cyber",       label: "Cybersecurity",        fullName: "Cybersecurity, Privacy, Blockchain, & Trust", count: 4  },
  { id: "se",          label: "Software Engineering",  fullName: "Software Engineering, AI4SE, & Automated Tools", count: 3  },
  { id: "hci",         label: "HCI & Accessibility",  fullName: "Human-Computer Interaction (HCI), ICT4D, & Accessibility", count: 2  },
  { id: "xai",         label: "Explainable AI",       fullName: "Explainable AI (XAI), Fairness, & Trustworthy AI", count: 2  },
  { id: "emerging",    label: "Emerging Areas",       fullName: "Emerging & Specialized Areas", count: 2  },
  { id: "iot",         label: "Networking & IoT",      fullName: "Networking, IoT, Edge, SDN, & Distributed Systems", count: 1  },
];

export const edges = [
  // ── Strong Lines (Strength: 3) ──
  { from: "ml_ds",      to: "dl",       strength: 3 },
  { from: "ml_ds",      to: "nlp",      strength: 3 },
  { from: "ml_ds",      to: "cv",       strength: 3 },
  { from: "ml_ds",      to: "healthcare", strength: 3 },
  { from: "ml_ds",      to: "xai",      strength: 3 },
  { from: "cyber",       to: "iot",      strength: 3 },

  // ── Medium Lines (Strength: 2) ──
  { from: "healthcare", to: "cv",       strength: 2 },
  { from: "healthcare", to: "nlp",      strength: 2 },
  { from: "cv",          to: "dl",       strength: 2 },
  { from: "se",          to: "ml_ds",    strength: 2 },
  { from: "cyber",       to: "xai",      strength: 2 },

  // ── Weak Lines (Strength: 1) ──
  { from: "hci",         to: "nlp",      strength: 1 },
  { from: "hci",         to: "healthcare", strength: 1 },
  { from: "emerging",    to: "se",       strength: 1 },
  { from: "emerging",    to: "iot",      strength: 1 },
  { from: "cyber",       to: "ml_ds",    strength: 1 },
];

// Update this when faculty data changes; ideally fetch from /api/faculty/stats
export const FACULTY_COUNT = 49;
export const totalFaculty = FACULTY_COUNT;
