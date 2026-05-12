const express = require("express");
const { createEnvelope } = require("../utils/response");
const {
  listFaculty,
  getFacultyById,
  filterFaculty,
  resolveCosupervisors,
} = require("../services/faculty-service");

const router = express.Router();

router.get("/", (req, res) => {
  const faculty = listFaculty();
  const result = filterFaculty(faculty, req.query);

  res.json(
    createEnvelope(true, {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      filters: result.filters,
    })
  );
});

router.get("/:id", (req, res) => {
  const faculty = getFacultyById(req.params.id);
  if (!faculty) {
    return res.status(404).json(createEnvelope(false, null, "Faculty not found"));
  }

  return res.json(
    createEnvelope(true, {
      ...faculty,
      cosupervisors: resolveCosupervisors(faculty),
    })
  );
});

module.exports = router;
