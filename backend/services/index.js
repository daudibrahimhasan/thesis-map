const facultyServiceSqlite = require('./faculty-service');
const facultyServiceSupabase = require('./supabase-service');

const useSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

module.exports = useSupabase ? facultyServiceSupabase : facultyServiceSqlite;
