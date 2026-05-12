const express = require("express");
const { createEnvelope } = require("../utils/response");
const {
  listFaculty,
  getFacultyById,
  filterFaculty,
  resolveCosupervisors,
} = require("../services/index");

const router = express.Router();

router.get("/", async (req, res) => {
  const faculty = await listFaculty();
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

router.get("/:id", async (req, res) => {
  const faculty = await getFacultyById(req.params.id);
  if (!faculty) {
    return res.status(404).json(createEnvelope(false, null, "Faculty not found"));
  }

  return res.json(
    createEnvelope(true, {
      ...faculty,
      cosupervisors: await resolveCosupervisors(faculty),
    })
  );
});

module.exports = router;
