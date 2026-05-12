require("dotenv").config();

const path = require("path");
const { initializeDatabase, db } = require("./db");
const { readSourceData, normalizeFacultyDataset } = require("./utils/seed-data");

function seed() {
  initializeDatabase();
  const { upsertFacultyRecord } = require("./services/faculty-service");

  const baseDir = __dirname;
  const { sourceName, records } = readSourceData(baseDir);
  const normalizedRecords = normalizeFacultyDataset(records);

  let inserted = 0;
  let updated = 0;

  normalizedRecords.forEach((record) => {
    const existing = db.prepare("SELECT id FROM faculty WHERE email = ?").get(record.email);
    upsertFacultyRecord(record);
    if (existing) {
      updated += 1;
    } else {
      inserted += 1;
    }
  });

  console.log(
    JSON.stringify(
      {
        source: sourceName || path.basename(baseDir),
        total_records: normalizedRecords.length,
        inserted,
        updated,
      },
      null,
      2
    )
  );
}

seed();
