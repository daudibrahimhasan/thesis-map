const express = require("express");
const { createEnvelope } = require("../utils/response");
const { rateLimit } = require("../middleware/rateLimit");
const { getFacultyById } = require("../services/faculty-service");
const { normalizeWhitespace } = require("../utils/text");

const router = express.Router();

const signOffs = {
  formal: "Sincerely",
  friendly: "Best regards",
  concise: "Thanks",
};

router.post(
  "/draft",
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }),
  (req, res) => {
    const {
      student_name,
      student_id,
      student_dept,
      degree_type,
      faculty_id,
      thesis_summary,
      tone = "formal",
    } = req.body || {};

    if (!student_name || !student_id || !student_dept || !degree_type || !faculty_id || !thesis_summary) {
      return res.status(400).json(createEnvelope(false, null, "Missing required fields for email draft"));
    }

    const faculty = getFacultyById(faculty_id);
    if (!faculty) {
      return res.status(404).json(createEnvelope(false, null, "Faculty not found"));
    }

    const topAreas = faculty.research_areas.slice(0, 2);
    const recentPaper = [...faculty.recent_papers]
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .find((paper) => normalizeWhitespace(paper.title));

    const subject = `Prospective ${degree_type} thesis supervision request from ${student_name}`;

    const openingByTone = {
      formal: `Dear ${faculty.name},`,
      friendly: `Hello ${faculty.name},`,
      concise: `Dear ${faculty.name},`,
    };

    const bodyLines = [
      openingByTone[tone] || openingByTone.formal,
      "",
      `My name is ${student_name} (${student_id}), and I am a ${degree_type} student from the ${student_dept} department.`,
      `I am reaching out to ask whether you would be open to supervising my thesis work.`,
      topAreas.length
        ? `Your work in ${topAreas.join(" and ")} is especially relevant to the direction I want to pursue.`
        : `Your research profile is closely aligned with the direction I want to pursue.`,
      recentPaper
        ? `I was particularly interested in your recent paper, "${recentPaper.title}"${recentPaper.year ? ` (${recentPaper.year})` : ""}.`
        : `I found your recent research profile highly relevant to my proposed topic.`,
      "",
      `Thesis summary: ${normalizeWhitespace(thesis_summary)}`,
      "",
      `If this aligns with your current supervision interests, I would be grateful for the opportunity to discuss it further.`,
      "",
      `${signOffs[tone] || signOffs.formal},`,
      student_name,
      `${student_dept}`,
      `${student_id}`,
    ];

    return res.json(
      createEnvelope(true, {
        subject,
        body: bodyLines.join("\n"),
      })
    );
  }
);

module.exports = router;
