const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../../backend/data/faculty_scraped_full.csv');
const jsonPath = path.resolve(__dirname, '../src/data/faculty.json');

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

const csvContent = fs.readFileSync(csvPath, 'utf8').replace(/\r/g, '');
const lines = csvContent.split('\n').filter(Boolean);
const headers = parseCsvLine(lines[0]);

const emailToData = {};
for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  if (row.length < 2) continue;
  const record = {};
  headers.forEach((h, idx) => { record[h.trim()] = (row[idx] || '').trim(); });
  const email = record['email'];
  if (email) {
    emailToData[email.toLowerCase()] = record;
  }
}

const faculty = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let updated = 0;

for (const member of faculty) {
  if (!member.email) continue;
  const csvData = emailToData[member.email.toLowerCase()];
  if (!csvData) continue;

  let changed = false;

  const link = csvData['profile_link'];
  if (link && link !== 'N/A') {
    member.profileLink = link;
    changed = true;
  }

  const publications = csvData['publications'];
  if (publications && publications !== 'N/A') {
    // Basic parse if there are publications
    // Just split by newlines or assume it's one big string?
    // Let's add them as objects
    const pubs = publications.split('\n').map(p => p.trim()).filter(Boolean);
    if (pubs.length > 0) {
      member.recentPapers = pubs.map(p => ({ title: p, year: null, url: '' }));
      changed = true;
    }
  }

  const researchAreas = csvData['research_areas'];
  if (researchAreas && researchAreas !== 'N/A') {
    const areas = researchAreas.split(',').map(a => a.trim()).filter(Boolean);
    const existingSet = new Set(member.researchAreas || []);
    for (const area of areas) {
      existingSet.add(area);
    }
    member.researchAreas = Array.from(existingSet);
    changed = true;
  }

  if (changed) {
    updated++;
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(faculty, null, 2) + '\n', 'utf8');
console.log(`Updated ${updated} faculty entries with scraped data.`);
