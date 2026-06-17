/**
 * Neural graph data — research field nodes and their connections
 * Updated with 11 distinct filters and weighted connection strengths
 */

export const fields = [
  { id: "ml_ds",      label: "ML & Data Science",      fullName: "Machine Learning (General/Applied) & Data Science",  keywords: ["ML & Data Science", "machine learning", "data science", "applied machine learning"] },
  { id: "cv",          label: "Computer Vision",      fullName: "Computer Vision & Image Processing",                   keywords: ["Computer Vision", "computer vision", "image processing", "image recognition"] },
  { id: "dl",          label: "Deep Learning",         fullName: "Deep Learning & Neural Networks",                     keywords: ["Deep Learning", "deep learning", "neural network"] },
  { id: "nlp",         label: "NLP",                  fullName: "Natural Language Processing (NLP)",                    keywords: ["NLP", "natural language processing", "large language model", "text processing"] },
  { id: "healthcare", label: "Healthcare & Bio",      fullName: "Healthcare, Bioinformatics, & Biomedical Applications", keywords: ["Healthcare & Bio", "healthcare", "bioinformatics", "biomedical", "medical image"] },
  { id: "cyber",       label: "Cybersecurity",        fullName: "Cybersecurity, Privacy, Blockchain, & Trust",          keywords: ["Cybersecurity", "cybersecurity", "cyber security", "blockchain", "cryptography", "information security"] },
  { id: "hci",         label: "HCI & Accessibility",  fullName: "Human-Computer Interaction (HCI), ICT4D, & Accessibility", keywords: ["HCI & Accessibility", "human-computer interaction", "human computer interaction", "hci", "accessibility", "ict4d", "usability"] },
  { id: "se",          label: "Software Engineering",  fullName: "Software Engineering, AI4SE, & Automated Tools",      keywords: ["Software Engineering", "software engineering"] },
  { id: "iot",         label: "Networking & IoT",      fullName: "Networking, IoT, Edge, SDN, & Distributed Systems",  keywords: ["Networking & IoT", "internet of things", "networking", "wireless", "edge computing"] },
  { id: "xai",         label: "Explainable AI",       fullName: "Explainable AI (XAI), Fairness, & Trustworthy AI",   keywords: ["Explainable AI", "explainable ai", "xai", "explainability", "trustworthy ai"] },
  { id: "emerging",    label: "Emerging Areas",       fullName: "Emerging & Specialized Areas",                        keywords: ["Emerging Areas", "robotics", "reinforcement learning", "quantum", "multi-agent"] },
];

export const edges = [
  // ── Strong Lines (Strength: 3) ──
  { from: "ai_ml",    to: "dl",       strength: 3 },
  { from: "ai_ml",    to: "cv",       strength: 3 },
  { from: "ai_ml",    to: "nlp",      strength: 3 },
  { from: "dl",       to: "cv",       strength: 3 },
  { from: "llm",      to: "nlp",      strength: 3 },
  { from: "security", to: "systems",  strength: 3 },

  // ── Medium Lines (Strength: 2) ──
  { from: "ai_ml",    to: "data_sci", strength: 2 },
  { from: "ai_ml",    to: "xai",      strength: 2 },
  { from: "ai_ml",    to: "bio",      strength: 2 },
  { from: "dl",       to: "nlp",      strength: 2 },
  { from: "llm",      to: "se",       strength: 2 },
  { from: "llm",      to: "security", strength: 2 },
  { from: "bio",      to: "cv",       strength: 2 },
  { from: "theory",   to: "ai_ml",    strength: 2 },

  // ── Weak Lines (Strength: 1) ──
  { from: "hci",      to: "se",       strength: 1 },
  { from: "hci",      to: "xai",      strength: 1 },
  { from: "quantum",  to: "ai_ml",    strength: 1 },
  { from: "robotics", to: "systems",  strength: 1 },
  { from: "hardware", to: "systems",  strength: 1 },
  { from: "se",       to: "security", strength: 1 },
];

export const FACULTY_COUNT = 210;
export const totalFaculty = FACULTY_COUNT;

export const categories = [
  { id: "ai_ml",       label: "AI & Machine Learning" },
  { id: "dl",          label: "Deep Learning" },
  { id: "cv",          label: "Computer Vision" },
  { id: "nlp",         label: "NLP" },
  { id: "llm",         label: "Large Language Models" },
  { id: "data_sci",    label: "Data Science" },
  { id: "security",    label: "Security & Privacy" },
  { id: "bio",         label: "Bioinformatics & Healthcare" },
  { id: "hci",         label: "HCI & UX" },
  { id: "systems",     label: "Systems & Networking" },
  { id: "se",          label: "Software Engineering" },
  { id: "theory",      label: "Theory & Algorithms" },
  { id: "hardware",    label: "Hardware & Electronics" },
  { id: "robotics",    label: "Robotics & Automation" },
  { id: "quantum",     label: "Quantum Computing" },
  { id: "xai",         label: "Explainability & Ethics" },
];
