const fs = require("fs");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((entry) => entry !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => String(header || "").trim());
  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] != null ? String(values[idx]).trim() : "";
    });
    return record;
  });
}

function readCsvFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return parseCsv(text);
}

module.exports = {
  parseCsv,
  readCsvFile,
};
