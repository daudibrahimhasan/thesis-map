const express = require("express");
const { createEnvelope } = require("../utils/response");
const { adminAuth } = require("../middleware/adminAuth");
const { upsertFacultyRecord } = require("../services/index");
const { normalizeFacultyRecord } = require("../utils/seed-data");

const router = express.Router();

router.post("/faculty", adminAuth, async (req, res) => {
  const payload = req.body || {};
  const normalized = normalizeFacultyRecord(payload);

  if (!normalized.name || !normalized.email) {
    return res.status(400).json(createEnvelope(false, null, "Faculty name and email are required"));
  }

  const saved = await upsertFacultyRecord(normalized);
  return res.json(createEnvelope(true, saved, null));
});

module.exports = router;
