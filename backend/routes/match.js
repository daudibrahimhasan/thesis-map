const express = require("express");
const { createEnvelope } = require("../utils/response");
const { rateLimit } = require("../middleware/rateLimit");
const { listFaculty, buildMatchCandidates } = require("../services/faculty-service");
const { tokenizeText, normalizeWhitespace } = require("../utils/text");

const router = express.Router();

router.post(
  "/",
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }),
  (req, res) => {
    const { thesis_idea, skills = [], department, degree_type } = req.body || {};

    if (!normalizeWhitespace(thesis_idea)) {
      return res.status(400).json(createEnvelope(false, null, "thesis_idea is required"));
    }

    const studentKeywords = Array.from(
      new Set([
        ...tokenizeText(thesis_idea),
        ...skills.flatMap((skill) => tokenizeText(skill)),
      ])
    );

    if (!studentKeywords.length) {
      return res.status(400).json(createEnvelope(false, null, "No usable keywords found in thesis_idea or skills"));
    }

    const results = listFaculty()
      .filter((faculty) => {
        if (!degree_type) return true;
        return faculty.degree_types.map((item) => item.toLowerCase()).includes(String(degree_type).toLowerCase());
      })
      .map((faculty) => {
        const candidateKeywords = buildMatchCandidates(faculty);
        const matchedKeywords = studentKeywords.filter((keyword) => candidateKeywords.has(keyword));
        const baseScore = (matchedKeywords.length / studentKeywords.length) * 100;

        let boostedScore = baseScore;
        if (department && faculty.department.toLowerCase() === String(department).toLowerCase()) {
          boostedScore *= 1.2;
        }
        if (faculty.available_slots > 0) {
          boostedScore *= 1.1;
        }

        const matchingPapers = (faculty.recent_papers || []).filter((paper) => {
          const paperText = `${paper.title || ""}`.toLowerCase();
          return matchedKeywords.some((keyword) => paperText.includes(keyword));
        });

        return {
          ...faculty,
          match_score: Number(Math.min(boostedScore, 100).toFixed(2)),
          matched_keywords: matchedKeywords,
          matching_papers: matchingPapers,
        };
      })
      .filter((faculty) => faculty.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score || b.available_slots - a.available_slots || a.name.localeCompare(b.name))
      .slice(0, 10);

    return res.json(
      createEnvelope(true, {
        student_keywords: studentKeywords,
        matches: results,
      })
    );
  }
);

module.exports = router;
