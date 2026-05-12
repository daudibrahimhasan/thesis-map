const express = require("express");
const { createEnvelope } = require("../utils/response");
const { adminAuth } = require("../middleware/adminAuth");
const { upsertFacultyRecord } = require("../services/faculty-service");
const { normalizeFacultyRecord } = require("../utils/seed-data");

const router = express.Router();

router.post("/faculty", adminAuth, (req, res) => {
  const payload = req.body || {};
  const normalized = normalizeFacultyRecord(payload);

  if (!normalized.name || !normalized.email) {
    return res.status(400).json(createEnvelope(false, null, "Faculty name and email are required"));
  }

  const saved = upsertFacultyRecord(normalized);
  return res.json(createEnvelope(true, saved, null));
});

module.exports = router;
