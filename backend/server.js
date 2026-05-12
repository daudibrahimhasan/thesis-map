require("dotenv").config();

const express = require("express");
const { initializeDatabase } = require("./db");
const { createEnvelope } = require("./utils/response");
const { corsMiddleware } = require("./middleware/cors");

const facultyRoutes = require("./routes/faculty");
const fieldsRoutes = require("./routes/fields");
const matchRoutes = require("./routes/match");
const emailRoutes = require("./routes/email");
const statsRoutes = require("./routes/stats");
const adminRoutes = require("./routes/admin");

initializeDatabase();

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json(createEnvelope(true, { status: "ok" }, null));
});

app.use("/api/faculty", facultyRoutes);
app.use("/api/fields", fieldsRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json(createEnvelope(false, null, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  res.status(status).json(createEnvelope(false, null, err.message || "Internal server error"));
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`ThesisMatch backend listening on port ${port}`);
});
