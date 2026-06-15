const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.resolve(process.env.DB_PATH || "./data/thesismatch.sqlite");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
try {
  db.exec("PRAGMA journal_mode = WAL;");
} catch (_error) {
  db.exec("PRAGMA journal_mode = DELETE;");
}
db.exec("PRAGMA foreign_keys = ON;");

function tableExists(tableName) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);
  return Boolean(row);
}

function getTableColumns(tableName) {
  if (!tableExists(tableName)) {
    return [];
  }
  const ALLOWED_TABLES = ["faculty"];
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error(`Unknown table: ${tableName}`);
  }
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

function safeJsonParse(value, fallback = []) {
  if (value == null || value === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function createNormalizedTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS faculty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      designation TEXT,
      bio TEXT,
      available_slots INTEGER NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS faculty_degree_types (
      faculty_id INTEGER NOT NULL,
      degree_type TEXT NOT NULL,
      PRIMARY KEY (faculty_id, degree_type),
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS research_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS faculty_research_fields (
      faculty_id INTEGER NOT NULL,
      field_id INTEGER NOT NULL,
      PRIMARY KEY (faculty_id, field_id),
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
      FOREIGN KEY (field_id) REFERENCES research_fields(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS faculty_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      faculty_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      year INTEGER,
      url TEXT,
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS faculty_cosupervisors (
      faculty_id INTEGER NOT NULL,
      cosupervisor_id INTEGER NOT NULL,
      PRIMARY KEY (faculty_id, cosupervisor_id),
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
      FOREIGN KEY (cosupervisor_id) REFERENCES faculty(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_faculty_name ON faculty(name);
    CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);
    CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department);
    CREATE INDEX IF NOT EXISTS idx_degree_type_lookup ON faculty_degree_types(degree_type);
    CREATE INDEX IF NOT EXISTS idx_research_field_name ON research_fields(name);
    CREATE INDEX IF NOT EXISTS idx_faculty_research_field_lookup ON faculty_research_fields(field_id, faculty_id);
    CREATE INDEX IF NOT EXISTS idx_faculty_papers_faculty ON faculty_papers(faculty_id);
    CREATE INDEX IF NOT EXISTS idx_faculty_cosupervisors_faculty ON faculty_cosupervisors(faculty_id, cosupervisor_id);
  `);
}

function migrateLegacyFacultyTable() {
  if (!tableExists("faculty")) {
    createNormalizedTables();
    return;
  }

  const columns = getTableColumns("faculty");
  const hasLegacyJsonColumns =
    columns.includes("degree_types") ||
    columns.includes("research_areas") ||
    columns.includes("recent_papers") ||
    columns.includes("cosupervisors");

  if (!hasLegacyJsonColumns) {
    createNormalizedTables();
    return;
  }

  const legacyRows = db.prepare(`
    SELECT
      id,
      name,
      email,
      department,
      designation,
      bio,
      available_slots,
      degree_types,
      research_areas,
      recent_papers,
      cosupervisors,
      last_updated
    FROM faculty
  `).all();

  db.exec(`
    DROP TABLE IF EXISTS faculty_degree_types;
    DROP TABLE IF EXISTS faculty_research_fields;
    DROP TABLE IF EXISTS research_fields;
    DROP TABLE IF EXISTS faculty_papers;
    DROP TABLE IF EXISTS faculty_cosupervisors;

    ALTER TABLE faculty RENAME TO faculty_legacy;

    CREATE TABLE faculty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      designation TEXT,
      bio TEXT,
      available_slots INTEGER NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL
    );
  `);

  const insertFaculty = db.prepare(`
    INSERT INTO faculty (id, name, email, department, designation, bio, available_slots, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  legacyRows.forEach((row) => {
    insertFaculty.run(
      row.id,
      row.name,
      row.email,
      row.department,
      row.designation,
      row.bio,
      row.available_slots,
      row.last_updated
    );
  });

  createNormalizedTables();

  const insertDegreeType = db.prepare(`
    INSERT OR IGNORE INTO faculty_degree_types (faculty_id, degree_type)
    VALUES (?, ?)
  `);
  const insertField = db.prepare(`
    INSERT OR IGNORE INTO research_fields (name)
    VALUES (?)
  `);
  const getFieldId = db.prepare("SELECT id FROM research_fields WHERE name = ?");
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

  legacyRows.forEach((row) => {
    safeJsonParse(row.degree_types, []).forEach((degreeType) => {
      insertDegreeType.run(row.id, degreeType);
    });

    safeJsonParse(row.research_areas, []).forEach((fieldName) => {
      insertField.run(fieldName);
      const field = getFieldId.get(fieldName);
      if (field) {
        insertFacultyField.run(row.id, field.id);
      }
    });

    safeJsonParse(row.recent_papers, []).forEach((paper) => {
      if (paper && paper.title) {
        insertPaper.run(row.id, paper.title, paper.year || null, paper.url || "");
      }
    });

    safeJsonParse(row.cosupervisors, []).forEach((cosupervisorId) => {
      if (Number.isInteger(cosupervisorId)) {
        insertCosupervisor.run(row.id, cosupervisorId);
      }
    });
  });

  db.exec("DROP TABLE IF EXISTS faculty_legacy;");
}

function initializeDatabase() {
  migrateLegacyFacultyTable();
  createNormalizedTables();
}

module.exports = {
  db,
  initializeDatabase,
  dbPath,
};
