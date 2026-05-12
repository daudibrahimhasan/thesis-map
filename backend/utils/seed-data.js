const fs = require("fs");
const path = require("path");
const { readCsvFile } = require("./csv");
const {
  normalizeWhitespace,
  normalizeResearchArea,
  normalizeList,
  splitFlexibleList,
  normalizeDegreeTypes,
} = require("./text");

function readSourceData(baseDir) {
  const jsonPath = path.join(baseDir, "faculty_data.json");
  const csvPath = path.join(baseDir, "faculty_data.csv");
  const detailsCsvPath = path.join(baseDir, "faculty_details.csv");

  if (fs.existsSync(jsonPath)) {
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error("faculty_data.json must contain an array of faculty objects");
    }
    return {
      sourceName: "faculty_data.json",
      records: parsed,
    };
  }

  const basicRows = fs.existsSync(csvPath) ? readCsvFile(csvPath) : [];
  const detailRows = fs.existsSync(detailsCsvPath) ? readCsvFile(detailsCsvPath) : [];

  if (!basicRows.length && !detailRows.length) {
    throw new Error("No faculty_data.json, faculty_data.csv, or faculty_details.csv found");
  }

  const mergedByKey = new Map();

  [...basicRows, ...detailRows].forEach((row) => {
    const key = buildKey(row);
    const existing = mergedByKey.get(key) || {};
    mergedByKey.set(key, { ...existing, ...row });
  });

  return {
    sourceName: "faculty_data.csv + faculty_details.csv",
    records: Array.from(mergedByKey.values()),
  };
}

function buildKey(record) {
  const email = normalizeWhitespace(record.email || record.Email).toLowerCase();
  if (email) {
    return email;
  }
  return normalizeWhitespace(record.name || record.Name).toLowerCase();
}

function inferDepartment(record) {
  const explicit = normalizeWhitespace(record.department || record.Department);
  if (explicit) {
    return explicit;
  }

  const address = normalizeWhitespace(record.Address || "");
  const addressMatch = address.match(/^([A-Za-z&/.\-\s]+?)\s+Department/i);
  if (addressMatch) {
    return normalizeWhitespace(addressMatch[1]);
  }

  return process.env.DEFAULT_DEPARTMENT || "CSE";
}

function inferAvailability(record) {
  const status = normalizeWhitespace(record["Thesis Status"] || record.thesis_status || "");
  const slots = Number(record.available_slots);

  if (Number.isInteger(slots) && slots >= 0) {
    return slots;
  }

  if (/accepting|available|open/i.test(status)) {
    return Number(process.env.DEFAULT_AVAILABLE_SLOTS || 1);
  }

  return 0;
}

function normalizePapers(value) {
  if (Array.isArray(value)) {
    return value
      .map((paper) => ({
        title: normalizeWhitespace(paper.title),
        year: Number(paper.year) || null,
        url: normalizeWhitespace(paper.url),
      }))
      .filter((paper) => paper.title);
  }

  const text = normalizeWhitespace(value);
  if (!text || /^(n\/a|none|null)$/i.test(text)) {
    return [];
  }

  return text
    .split(/\n+/)
    .map((entry) => normalizeWhitespace(entry))
    .filter(Boolean)
    .map((title) => ({ title, year: null, url: "" }));
}

function normalizeCosupervisors(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry));
  }

  return splitFlexibleList(value)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry));
}

function normalizeResearchAreas(value) {
  return Array.from(
    new Set(
      splitFlexibleList(value)
        .map((entry) => normalizeResearchArea(entry))
        .filter(Boolean)
    )
  );
}

function normalizeFacultyRecord(record) {
  const researchAreas = normalizeResearchAreas(
    record.research_areas || record["Research Interests"] || record.research_interests
  );

  return {
    name: normalizeWhitespace(record.name || record.Name),
    email: normalizeWhitespace(record.email || record.Email).toLowerCase(),
    department: inferDepartment(record),
    designation: normalizeWhitespace(record.designation || record.Position),
    bio: normalizeWhitespace(record.bio || record.Biography),
    available_slots: inferAvailability(record),
    degree_types: normalizeDegreeTypes(record.degree_types || record["Thesis Level"]),
    research_areas: researchAreas,
    recent_papers: normalizePapers(record.recent_papers || record["Recent Papers"] || record.Synopses),
    cosupervisors: normalizeCosupervisors(record.cosupervisors),
    last_updated: new Date().toISOString(),
  };
}

function normalizeFacultyDataset(records) {
  return normalizeList(records.map((record) => JSON.stringify(normalizeFacultyRecord(record))))
    .map((entry) => JSON.parse(entry))
    .filter((record) => record.name && record.email);
}

module.exports = {
  readSourceData,
  normalizeFacultyRecord,
  normalizeFacultyDataset,
};
