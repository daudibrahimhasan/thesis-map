const { db } = require("../db");
const { parseFacultyRow } = require("../utils/faculty");
const { normalizeWhitespace, tokenizeText } = require("../utils/text");

const selectFacultyBaseById = db.prepare("SELECT * FROM faculty WHERE id = ?");
const selectFacultyBaseByEmail = db.prepare("SELECT id FROM faculty WHERE email = ?");
const selectAllFacultyBase = db.prepare("SELECT * FROM faculty ORDER BY name ASC");
const selectDegreeTypes = db.prepare(`
  SELECT degree_type
  FROM faculty_degree_types
  WHERE faculty_id = ?
  ORDER BY degree_type ASC
`);
const selectResearchAreas = db.prepare(`
  SELECT rf.name
  FROM faculty_research_fields frf
  JOIN research_fields rf ON rf.id = frf.field_id
  WHERE frf.faculty_id = ?
  ORDER BY rf.name ASC
`);
const selectPapers = db.prepare(`
  SELECT title, year, url
  FROM faculty_papers
  WHERE faculty_id = ?
  ORDER BY COALESCE(year, 0) DESC, title ASC
`);
const selectCosupervisorIds = db.prepare(`
  SELECT cosupervisor_id
  FROM faculty_cosupervisors
  WHERE faculty_id = ?
  ORDER BY cosupervisor_id ASC
`);
const insertField = db.prepare("INSERT OR IGNORE INTO research_fields (name) VALUES (?)");
const getFieldId = db.prepare("SELECT id FROM research_fields WHERE name = ?");

function hydrateFacultyRow(row) {
  if (!row) {
    return null;
  }

  return parseFacultyRow({
    ...row,
    degree_types: selectDegreeTypes.all(row.id).map((entry) => entry.degree_type),
    research_areas: selectResearchAreas.all(row.id).map((entry) => entry.name),
    recent_papers: selectPapers.all(row.id).map((paper) => ({
      title: paper.title,
      year: paper.year,
      url: paper.url,
    })),
    cosupervisors: selectCosupervisorIds.all(row.id).map((entry) => entry.cosupervisor_id),
  });
}

function listFaculty() {
  return selectAllFacultyBase.all().map(hydrateFacultyRow);
}

function getFacultyById(id) {
  return hydrateFacultyRow(selectFacultyBaseById.get(Number(id)));
}

function replaceFacultyRelations(facultyId, record) {
  db.prepare("DELETE FROM faculty_degree_types WHERE faculty_id = ?").run(facultyId);
  db.prepare("DELETE FROM faculty_research_fields WHERE faculty_id = ?").run(facultyId);
  db.prepare("DELETE FROM faculty_papers WHERE faculty_id = ?").run(facultyId);
  db.prepare("DELETE FROM faculty_cosupervisors WHERE faculty_id = ?").run(facultyId);

  const insertDegreeType = db.prepare(`
    INSERT OR IGNORE INTO faculty_degree_types (faculty_id, degree_type)
    VALUES (?, ?)
  `);
  const insertFacultyField = db.prepare(`
    INSERT OR IGNORE INTO faculty_research_fields (faculty_id, field_id)
    VALUES (?, ?)
  `);
  const insertPaper = db.prepare(`
    INSERT INTO faculty_papers (faculty_id, title, year, url)
    VALUES (?, ?, ?, ?)
  `);
  const insertCosupervisor = db.prepare(`
    INSERT OR IGNORE INTO faculty_cosupervisors (faculty_id, cosupervisor_id)
    VALUES (?, ?)
  `);

  (record.degree_types || []).forEach((degreeType) => {
    insertDegreeType.run(facultyId, degreeType);
  });

  (record.research_areas || []).forEach((fieldName) => {
    insertField.run(fieldName);
    const field = getFieldId.get(fieldName);
    if (field) {
      insertFacultyField.run(facultyId, field.id);
    }
  });

  (record.recent_papers || []).forEach((paper) => {
    if (paper && paper.title) {
      insertPaper.run(facultyId, paper.title, paper.year || null, paper.url || "");
    }
  });

  (record.cosupervisors || []).forEach((cosupervisorId) => {
    if (Number.isInteger(cosupervisorId)) {
      insertCosupervisor.run(facultyId, cosupervisorId);
    }
  });
}

function upsertFacultyRecord(record) {
  const existing = selectFacultyBaseByEmail.get(record.email);

  if (existing) {
    db.prepare(`
      UPDATE faculty
      SET
        name = ?,
        department = ?,
        designation = ?,
        bio = ?,
        available_slots = ?,
        last_updated = ?
      WHERE email = ?
    `).run(
      record.name,
      record.department,
      record.designation,
      record.bio,
      record.available_slots,
      record.last_updated,
      record.email
    );

    replaceFacultyRelations(existing.id, record);
    return getFacultyById(existing.id);
  }

  const result = db.prepare(`
    INSERT INTO faculty (
      name, email, department, designation, bio, available_slots, last_updated
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.name,
    record.email,
    record.department,
    record.designation,
    record.bio,
    record.available_slots,
    record.last_updated
  );

  replaceFacultyRelations(result.lastInsertRowid, record);
  return getFacultyById(result.lastInsertRowid);
}

function resolveCosupervisors(faculty) {
  return (faculty.cosupervisors || [])
    .map((id) => getFacultyById(id))
    .filter(Boolean);
}

function filterFaculty(records, query) {
  const q = normalizeWhitespace(query.q || "").toLowerCase();
  const qTokens = tokenizeText(q);
  const departments = splitFilter(query.department);
  const areas = splitFilter(query.area);
  const degreeType = normalizeWhitespace(query.degree_type);
  const availableOnly = String(query.available || "").toLowerCase() === "true";

  let filtered = records.filter((faculty) => {
    if (q) {
      const haystack = [faculty.name, faculty.bio, ...(faculty.research_areas || [])].join(" ").toLowerCase();
      const matchesQuery = qTokens.length
        ? qTokens.every((token) => haystack.includes(token))
        : haystack.includes(q);
      if (!matchesQuery) {
        return false;
      }
    }

    if (departments.length && !departments.includes(faculty.department.toLowerCase())) {
      return false;
    }

    if (
      areas.length &&
      !areas.some((area) => faculty.research_areas.map((item) => item.toLowerCase()).includes(area))
    ) {
      return false;
    }

    if (
      degreeType &&
      !faculty.degree_types.map((item) => item.toLowerCase()).includes(degreeType.toLowerCase())
    ) {
      return false;
    }

    if (availableOnly && faculty.available_slots <= 0) {
      return false;
    }

    return true;
  });

  filtered = sortFaculty(filtered, query.sort, query.order);

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  return {
    total: filtered.length,
    page,
    limit,
    items: filtered.slice(offset, offset + limit),
    filters: {
      q: query.q || "",
      department: departments,
      area: areas,
      available: availableOnly,
      degree_type: degreeType || "",
      sort: query.sort || "name",
      order: query.order || "asc",
    },
  };
}

function sortFaculty(records, sort = "name", order = "asc") {
  const direction = String(order).toLowerCase() === "desc" ? -1 : 1;
  const copy = [...records];

  copy.sort((a, b) => {
    if (sort === "availability") {
      return (a.available_slots - b.available_slots) * direction;
    }

    if (sort === "publications") {
      return ((a.recent_papers?.length || 0) - (b.recent_papers?.length || 0)) * direction;
    }

    return a.name.localeCompare(b.name) * direction;
  });

  return copy;
}

function splitFilter(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildMatchCandidates(faculty) {
  const areaTokens = tokenizeText((faculty.research_areas || []).join(" "));
  const paperTokens = tokenizeText((faculty.recent_papers || []).map((paper) => paper.title).join(" "));
  return new Set([...areaTokens, ...paperTokens]);
}

module.exports = {
  listFaculty,
  getFacultyById,
  upsertFacultyRecord,
  resolveCosupervisors,
  filterFaculty,
  buildMatchCandidates,
};
