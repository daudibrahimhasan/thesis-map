const express = require("express");
const { createEnvelope } = require("../utils/response");
const { adminAuth } = require("../middleware/adminAuth");
const { rateLimit } = require("../middleware/rateLimit");
const { upsertFacultyRecord } = require("../services/index");
const { normalizeFacultyRecord } = require("../utils/seed-data");

const router = express.Router();

router.post("/faculty", rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }), adminAuth, async (req, res) => {
  const payload = req.body || {};
  const normalized = normalizeFacultyRecord(payload);

  if (!normalized.name || !normalized.email) {
    return res.status(400).json(createEnvelope(false, null, "Faculty name and email are required"));
  }

  const saved = await upsertFacultyRecord(normalized);
  return res.json(createEnvelope(true, saved, null));
});

module.exports = router;
