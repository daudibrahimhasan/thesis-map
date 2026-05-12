function parseFacultyRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department,
    designation: row.designation,
    bio: row.bio,
    available_slots: row.available_slots,
    degree_types: row.degree_types || [],
    research_areas: row.research_areas || [],
    recent_papers: row.recent_papers || [],
    cosupervisors: row.cosupervisors || [],
    last_updated: row.last_updated,
  };
}

function parseFacultyRows(rows) {
  return rows.map(parseFacultyRow);
}

module.exports = {
  parseFacultyRow,
  parseFacultyRows,
};
