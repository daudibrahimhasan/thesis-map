const express = require("express");
const { createEnvelope } = require("../utils/response");
const { listFaculty } = require("../services/faculty-service");

const router = express.Router();

router.get("/", (_req, res) => {
  const faculty = listFaculty();
  const departments = new Set(faculty.map((member) => member.department));
  const lastUpdated = faculty
    .map((member) => member.last_updated)
    .sort((a, b) => new Date(b) - new Date(a))[0] || null;

  res.json(
    createEnvelope(true, {
      total_faculty: faculty.length,
      available_faculty: faculty.filter((member) => member.available_slots > 0).length,
      total_departments: departments.size,
      last_updated: lastUpdated,
    })
  );
});

module.exports = router;
