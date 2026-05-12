const { createClient } = require('@supabase/supabase-js');
const { normalizeWhitespace, tokenizeText } = require('../utils/text');
const { parseFacultyRow, parseFacultyRows } = require('../utils/faculty');

let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
} else if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

function checkSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.");
  }
}

function hydrateSupabaseFaculty(row) {
  if (!row) return null;
  
  return parseFacultyRow({
    ...row,
    degree_types: (row.faculty_degree_types || []).map(d => d.degree_type),
    research_areas: (row.faculty_research_fields || []).map(f => f.research_fields?.name).filter(Boolean),
    recent_papers: (row.faculty_papers || []).map(p => ({
      title: p.title,
      year: p.year,
      url: p.url
    })),
    cosupervisors: (row.faculty_cosupervisors || []).map(c => c.cosupervisor_id)
  });
}

async function listFaculty() {
  checkSupabase();
  const { data, error } = await supabase
    .from('faculty')
    .select(`
      *,
      faculty_degree_types(degree_type),
      faculty_research_fields(research_fields(name)),
      faculty_papers(title, year, url),
      faculty_cosupervisors(cosupervisor_id)
    `)
    .order('name');
    
  if (error) throw error;
  
  return parseFacultyRows(data.map(hydrateSupabaseFaculty));
}

async function getFacultyById(id) {
  checkSupabase();
  const { data, error } = await supabase
    .from('faculty')
    .select(`
      *,
      faculty_degree_types(degree_type),
      faculty_research_fields(research_fields(name)),
      faculty_papers(title, year, url),
      faculty_cosupervisors(cosupervisor_id)
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return hydrateSupabaseFaculty(data);
}

async function upsertFacultyRecord(record) {
  checkSupabase();
  // 1. Check if exists by email
  const { data: existing } = await supabase
    .from('faculty')
    .select('id')
    .eq('email', record.email)
    .single();

  let facultyId;
  const facultyData = {
    name: record.name,
    email: record.email,
    department: record.department,
    designation: record.designation,
    bio: record.bio,
    available_slots: record.available_slots,
    last_updated: record.last_updated
  };

  if (existing) {
    facultyId = existing.id;
    await supabase.from('faculty').update(facultyData).eq('id', facultyId);
  } else {
    const { data: inserted, error: insertError } = await supabase.from('faculty').insert(facultyData).select().single();
    if (insertError) throw insertError;
    facultyId = inserted.id;
  }

  // Handle relations (delete existing, then insert)
  await supabase.from('faculty_degree_types').delete().eq('faculty_id', facultyId);
  await supabase.from('faculty_research_fields').delete().eq('faculty_id', facultyId);
  await supabase.from('faculty_papers').delete().eq('faculty_id', facultyId);
  await supabase.from('faculty_cosupervisors').delete().eq('faculty_id', facultyId);

  // Re-insert degree types
  if (record.degree_types?.length) {
    await supabase.from('faculty_degree_types').insert(
      record.degree_types.map(dt => ({ faculty_id: facultyId, degree_type: dt }))
    );
  }

  // Re-insert research fields (ensure they exist in research_fields first)
  if (record.research_areas?.length) {
    for (const area of record.research_areas) {
      let { data: fieldData } = await supabase.from('research_fields').select('id').eq('name', area).single();
      if (!fieldData) {
        const { data: newField } = await supabase.from('research_fields').insert({ name: area }).select().single();
        fieldData = newField;
      }
      if (fieldData) {
        await supabase.from('faculty_research_fields').insert({ faculty_id: facultyId, field_id: fieldData.id });
      }
    }
  }

  // Re-insert papers
  if (record.recent_papers?.length) {
    await supabase.from('faculty_papers').insert(
      record.recent_papers
        .filter(p => p && p.title)
        .map(p => ({
          faculty_id: facultyId,
          title: p.title,
          year: p.year || null,
          url: p.url || ""
        }))
    );
  }

  // Re-insert cosupervisors
  if (record.cosupervisors?.length) {
    await supabase.from('faculty_cosupervisors').insert(
      record.cosupervisors
        .filter(id => Number.isInteger(id))
        .map(id => ({ faculty_id: facultyId, cosupervisor_id: id }))
    );
  }

  return getFacultyById(facultyId);
}

async function resolveCosupervisors(faculty) {
  if (!faculty.cosupervisors || !faculty.cosupervisors.length) return [];
  const promises = faculty.cosupervisors.map(id => getFacultyById(id));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

// Keeping the original synchronous filtering logic for now
function sortFaculty(records, sort = "name", order = "asc") {
  const direction = String(order).toLowerCase() === "desc" ? -1 : 1;
  const copy = [...records];
  copy.sort((a, b) => {
    if (sort === "availability") return (a.available_slots - b.available_slots) * direction;
    if (sort === "publications") return ((a.recent_papers?.length || 0) - (b.recent_papers?.length || 0)) * direction;
    return a.name.localeCompare(b.name) * direction;
  });
  return copy;
}

function splitFilter(value) {
  return normalizeWhitespace(value).toLowerCase().split(",").map((entry) => entry.trim()).filter(Boolean);
}

function filterFaculty(records, query) {
  const q = normalizeWhitespace(query.q || "").toLowerCase();
  const qTokens = tokenizeText(q);
  const departments = splitFilter(query.department);
  const areas = splitFilter(query.area);
  const degreeType = normalizeWhitespace(query.degree_type);
  const availableOnly = String(query.available || "").toLowerCase() === "true";

  let filtered = records.filter((faculty) => {
    if (q) {
      const haystack = [faculty.name, faculty.bio, ...(faculty.research_areas || [])].join(" ").toLowerCase();
      const matchesQuery = qTokens.length ? qTokens.every((token) => haystack.includes(token)) : haystack.includes(q);
      if (!matchesQuery) return false;
    }
    if (departments.length && !departments.includes(faculty.department.toLowerCase())) return false;
    if (areas.length && !areas.some((area) => faculty.research_areas.map((item) => item.toLowerCase()).includes(area))) return false;
    if (degreeType && !faculty.degree_types.map((item) => item.toLowerCase()).includes(degreeType.toLowerCase())) return false;
    if (availableOnly && faculty.available_slots <= 0) return false;
    return true;
  });

  filtered = sortFaculty(filtered, query.sort, query.order);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  return {
    total: filtered.length,
    page,
    limit,
    items: filtered.slice(offset, offset + limit),
    filters: {
      q: query.q || "",
      department: departments,
      area: areas,
      available: availableOnly,
      degree_type: degreeType || "",
      sort: query.sort || "name",
      order: query.order || "asc",
    },
  };
}

function buildMatchCandidates(faculty) {
  const areaTokens = tokenizeText((faculty.research_areas || []).join(" "));
  const paperTokens = tokenizeText((faculty.recent_papers || []).map((paper) => paper.title).join(" "));
  return new Set([...areaTokens, ...paperTokens]);
}

module.exports = {
  listFaculty,
  getFacultyById,
  upsertFacultyRecord,
  resolveCosupervisors,
  filterFaculty,
  buildMatchCandidates,
  supabase
};
