/**
 * update-faculty-data.cjs
 * Reads faculty_info.csv and patches frontend/src/data/faculty.json with:
 *   - photoUrl from the faculty_photos directory
 *   - researchAreas from CSV's "research interest" column
 *   - thesisStatus + availableSlots from CSV's "thesis status" column
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../../backend/data/faculty_info.csv');
const photosDir = path.resolve(__dirname, '../public/faculty_photos');
const jsonPath = path.resolve(__dirname, '../src/data/faculty.json');

// Parse the CSV manually (handles quoted fields)
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

// Build initials -> photo filename map from the photos directory
const photoFiles = fs.readdirSync(photosDir);
const initialsToPhotoFile = {};
for (const file of photoFiles) {
  const match = file.match(/\(([^)]+)\)(\.\w+)$/);
  if (match) {
    initialsToPhotoFile[match[1].trim()] = file;
  }
}

console.log(`Found ${photoFiles.length} photo files`);
console.log(`Mapped ${Object.keys(initialsToPhotoFile).length} initials to photos`);

// Parse CSV rows into a map keyed by initials
const initialsToData = {};
for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  if (row.length < 2) continue;
  const record = {};
  headers.forEach((h, idx) => { record[h.trim()] = (row[idx] || '').trim(); });
  const initials = record['initials'];
  if (initials) {
    initialsToData[initials] = record;
  }
}

// Load the faculty JSON
const faculty = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let photoCount = 0;
let researchUpdated = 0;
let statusUpdated = 0;

for (const member of faculty) {
  const initials = member.initials;
  if (!initials) continue;

  // 1. Photo URL
  const photoFile = initialsToPhotoFile[initials];
  member.photoUrl = photoFile ? `/faculty_photos/${photoFile}` : null;
  if (photoFile) photoCount++;

  // 2. Merge CSV data
  const csvData = initialsToData[initials];
  if (!csvData) continue;

  // 2a. Research interests from CSV
  const csvResearch = csvData['research interest'] || '';
  if (csvResearch && csvResearch !== 'N/A') {
    const csvAreas = csvResearch
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    // Merge: add any areas from CSV not already in the JSON
    const existingSet = new Set(member.researchAreas || []);
    let added = false;
    for (const area of csvAreas) {
      if (!existingSet.has(area)) {
        existingSet.add(area);
        added = true;
      }
    }
    if (added || member.researchAreas.length === 0) {
      member.researchAreas = Array.from(existingSet);
      researchUpdated++;
    }
  }

  // 2b. Thesis status
  const csvStatus = csvData['thesis status'] || '';
  if (csvStatus) {
    member.thesisStatus = csvStatus;
    member.availableSlots = csvStatus === 'Accepting' ? 1 : 0;
    statusUpdated++;
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(faculty, null, 2) + '\n', 'utf8');

console.log(`\nResults:`);
console.log(`  Photos assigned: ${photoCount}`);
console.log(`  Research areas updated: ${researchUpdated}`);
console.log(`  Thesis status updated: ${statusUpdated}`);
console.log(`  Total faculty: ${faculty.length}`);

// Verify
const accepting = faculty.filter(f => f.thesisStatus === 'Accepting').length;
const notAccepting = faculty.filter(f => f.thesisStatus === 'Not Accepting').length;
const withAreas = faculty.filter(f => f.researchAreas && f.researchAreas.length > 0).length;
console.log(`\nVerification:`);
console.log(`  Accepting: ${accepting}`);
console.log(`  Not Accepting: ${notAccepting}`);
console.log(`  With research areas: ${withAreas}`);
console.log('\nDone!');
