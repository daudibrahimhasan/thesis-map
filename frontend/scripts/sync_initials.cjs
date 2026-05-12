const fs = require('fs');
const path = require('path');

const facultyPath = path.join(__dirname, '../src/data/faculty.json');
const csvPath = path.join(__dirname, '../../backend/faculty_details.csv');

const faculty = JSON.parse(fs.readFileSync(facultyPath, 'utf8'));
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Simple CSV parser for this specific file (handles quotes and commas)
function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const header = lines[0].split(',');
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    // Handling quoted values with commas
    const regex = /(".*?"|[^,]+)(?=\s*,|\s*$)/g;
    const row = [];
    let m;
    while ((m = regex.exec(lines[i])) !== null) {
      row.push(m[0].replace(/"/g, ''));
    }
    
    // Fallback if regex fails for simple lines
    const simpleRow = lines[i].split(',');
    
    const data = {
      name: row[0] || simpleRow[0],
      email: row[1] || simpleRow[1],
    };
    results.push(data);
  }
  return results;
}

const csvData = parseCSV(csvContent);

const updatedFaculty = faculty.map(f => {
  // Find match in CSV by email
  const match = csvData.find(c => c.email && c.email.toLowerCase().trim() === f.email.toLowerCase().trim());
  let initials = '';

  if (match) {
    // Extract [XXX] from name
    const m = match.name.match(/\[(.*?)\]/);
    if (m) {
      initials = m[1];
    }
  }

  // Fallback to my generation logic if not found
  if (!initials) {
    const parts = f.name.replace(/^Dr\.\s*/i, '').split(' ');
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
      initials = parts[0].substring(0, 2).toUpperCase();
    }
  }

  return {
    ...f,
    initials: initials
  };
});

fs.writeFileSync(facultyPath, JSON.stringify(updatedFaculty, null, 2));
console.log(`Updated ${updatedFaculty.length} faculty members with official initials from CSV.`);
