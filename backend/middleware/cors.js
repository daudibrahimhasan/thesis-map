const { createEnvelope } = require("../utils/response");

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    return next();
  }

  return res.status(403).json(createEnvelope(false, null, "CORS origin not allowed"));
}

module.exports = { corsMiddleware };
