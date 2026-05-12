function safeJsonParse(value, fallback) {
  if (value == null || value === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

module.exports = { safeJsonParse };
