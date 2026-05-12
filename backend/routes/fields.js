const express = require("express");
const { createEnvelope } = require("../utils/response");
const { listFaculty } = require("../services/index");

const router = express.Router();

router.get("/", async (_req, res) => {
  const faculty = await listFaculty();
  const fieldMap = new Map();

  faculty.forEach((member) => {
    const areas = member.research_areas || [];

    areas.forEach((field) => {
      const existing = fieldMap.get(field) || {
        field,
        facultyIds: new Set(),
        availableIds: new Set(),
      };

      existing.facultyIds.add(member.id);
      if (member.available_slots > 0) {
        existing.availableIds.add(member.id);
      }

      fieldMap.set(field, existing);
    });
  });

  const fields = Array.from(fieldMap.values()).map((entry) => {
    const relatedFields = Array.from(fieldMap.values())
      .filter((candidate) => candidate.field !== entry.field)
      .filter((candidate) => {
        let overlap = 0;
        candidate.facultyIds.forEach((id) => {
          if (entry.facultyIds.has(id)) overlap += 1;
        });
        return overlap >= 2;
      })
      .map((candidate) => candidate.field)
      .sort((a, b) => a.localeCompare(b));

    return {
      field: entry.field,
      faculty_count: entry.facultyIds.size,
      available_count: entry.availableIds.size,
      related_fields: relatedFields,
    };
  });

  fields.sort((a, b) => a.field.localeCompare(b.field));

  res.json(createEnvelope(true, fields, null));
});

module.exports = router;
