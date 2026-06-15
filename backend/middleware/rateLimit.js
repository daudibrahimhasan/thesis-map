const { createEnvelope } = require("../utils/response");

const buckets = new Map();

setInterval(() => {
  const cutoff = Date.now() - 3600000;
  for (const [ip, timestamps] of buckets) {
    const fresh = timestamps.filter(t => t > cutoff);
    if (fresh.length === 0) buckets.delete(ip);
    else buckets.set(ip, fresh);
  }
}, 5 * 60 * 1000).unref();

function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const current = buckets.get(ip) || [];
    const recent = current.filter((timestamp) => now - timestamp < windowMs);

    if (recent.length >= max) {
      return res.status(429).json(createEnvelope(false, null, "Rate limit exceeded"));
    }

    recent.push(now);
    buckets.set(ip, recent);
    next();
  };
}

module.exports = { rateLimit };
