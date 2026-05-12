const fs = require('fs');
const path = require('path');

const facultyPath = path.join(__dirname, '../src/data/faculty.json');
const faculty = JSON.parse(fs.readFileSync(facultyPath, 'utf8'));

const mapping = {
  'ML & Data Science': [
    'Machine Learning', 'Data Science', 'Data Mining', 'Optimization', 
    'Big Data', 'Big-data'
  ],
  'Deep Learning': ['Deep Learning', 'Neural Networks'],
  'Healthcare & Bio': ['Bioinformatics', 'Biomedical', 'Healthcare', 'Bio-informatics'],
  'NLP': ['Natural Language Processing', 'NLP'],
  'Computer Vision': ['Computer Vision', 'Image Processing'],
  'Cybersecurity': ['Cybersecurity', 'Privacy', 'Blockchain', 'Trust', 'Security', 'Cryptography'],
  'Software Engineering': ['Software Engineering', 'AI4SE', 'Automated Tools'],
  'HCI & Accessibility': ['HCI', 'Human-Computer Interaction', 'Accessibility', 'ICT4D'],
  'Explainable AI': ['Explainable AI', 'XAI', 'Fairness', 'Trustworthy AI'],
  'Emerging Areas': ['Emerging', 'Specialized Areas'],
  'Networking & IoT': ['Networking', 'IoT', 'Edge', 'SDN', 'Distributed Systems']
};

const updatedFaculty = faculty.map(f => {
  const newFilters = new Set();
  
  // Check researchAreas
  f.researchAreas.forEach(area => {
    // If it's already one of our 11 labels from a previous run, keep it if it's still valid
    // Or just clear and re-map
  });

  // Re-map from original bio/interests if possible
  // Since we don't have the original CSV, we use keywords against the current bio or previous labels
  // But wait, id 8 had "NLP" in its bio and I mapped it to "ML & Data Science" in the previous turn.
  // I should check the bio again.

  for (const [filterName, keywords] of Object.entries(mapping)) {
    if (f.bio && keywords.some(k => f.bio.toLowerCase().includes(k.toLowerCase()))) {
      newFilters.add(filterName);
    }
    // Also check current researchAreas just in case some labels were manual
    if (f.researchAreas.some(area => keywords.some(k => area.toLowerCase().includes(k.toLowerCase())))) {
      newFilters.add(filterName);
    }
  }

  return {
    ...f,
    researchAreas: Array.from(newFilters)
  };
});

fs.writeFileSync(facultyPath, JSON.stringify(updatedFaculty, null, 2));
console.log(`Updated ${updatedFaculty.length} faculty members to 11 distinct filters.`);
