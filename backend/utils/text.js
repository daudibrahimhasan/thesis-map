const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into",
  "is", "it", "of", "on", "or", "s", "such", "t", "that", "the", "their", "this",
  "to", "with", "using", "use", "we", "our", "your", "you", "than", "via", "based",
  "study", "system", "systems", "analysis", "approach", "method", "methods"
]);

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeResearchArea(value) {
  return normalizeWhitespace(value).toLowerCase();
}

function normalizeList(values) {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeWhitespace(value))
        .filter(Boolean)
    )
  );
}

function tokenizeText(value) {
  return Array.from(
    new Set(
      normalizeWhitespace(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token && token.length > 1 && !STOPWORDS.has(token))
    )
  );
}

function splitFlexibleList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  const text = normalizeWhitespace(value);
  if (!text || /^(n\/a|none|null|nil)$/i.test(text)) {
    return [];
  }

  return text
    .split(/[\n|;,]/)
    .map((entry) => normalizeWhitespace(entry))
    .filter(Boolean);
}

function normalizeDegreeTypes(value) {
  const list = Array.isArray(value) ? value : splitFlexibleList(value);
  const normalized = list
    .map((entry) => entry.toLowerCase())
    .flatMap((entry) => {
      if (entry.includes("phd")) return ["PhD"];
      if (entry.includes("msc") || entry.includes("ms")) return ["MSc"];
      if (entry.includes("ug") || entry.includes("undergrad") || entry.includes("bsc")) return ["UG"];
      return [];
    });

  return normalized.length ? Array.from(new Set(normalized)) : ["MSc", "PhD"];
}

module.exports = {
  normalizeWhitespace,
  normalizeResearchArea,
  normalizeList,
  tokenizeText,
  splitFlexibleList,
  normalizeDegreeTypes,
};
