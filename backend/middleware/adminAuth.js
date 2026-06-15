const crypto = require("crypto");
const { createEnvelope } = require("../utils/response");

function adminAuth(req, res, next) {
  const providedKey = req.header("X-API-Key");
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    return res.status(500).json(createEnvelope(false, null, "ADMIN_API_KEY is not configured"));
  }

  if (!providedKey || providedKey.length !== expectedKey.length ||
      !crypto.timingSafeEqual(Buffer.from(providedKey), Buffer.from(expectedKey))) {
    return res.status(401).json(createEnvelope(false, null, "Invalid API key"));
  }

  return next();
}

module.exports = { adminAuth };
