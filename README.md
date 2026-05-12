# ThesisMatch Backend

Backend API for ThesisMatch, a faculty supervisor finder for university students. This service uses Express, Node's built-in SQLite driver, and a SQLite schema that stays simple to migrate later to PostgreSQL.

## Setup

```bash
npm install
cp .env.example .env
npm run seed
npm start
```

Default server URL: `http://localhost:4000`

## Environment variables

```env
PORT=4000
DB_PATH=./data/thesismatch.sqlite
ADMIN_API_KEY=change-me
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-production-domain.com
DEFAULT_AVAILABLE_SLOTS=1
DEFAULT_DEPARTMENT=CSE
```

## Data seeding

The seed script prefers `faculty_data.json` when present. If it is not present, it falls back to merging `faculty_data.csv` and `faculty_details.csv` by email or name.

Normalization includes:

- trimming whitespace
- lowercasing and deduplicating research areas
- graceful duplicate handling through email-based upsert
- defaulting missing degree types to `["MSc","PhD"]`
- mapping accepting thesis status to available slots

Run:

```bash
npm run seed
```

## Response envelope

All endpoints return:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Endpoints

### Health

```bash
curl http://localhost:4000/health
```

### List faculty

```bash
curl "http://localhost:4000/api/faculty?q=machine%20learning&department=CSE&area=computer%20vision,ai&available=true&degree_type=MSc&sort=availability&order=desc&page=1&limit=20"
```

### Faculty detail

```bash
curl http://localhost:4000/api/faculty/1
```

### Research fields graph data

```bash
curl http://localhost:4000/api/fields
```

### Match faculty to a thesis idea

```bash
curl -X POST http://localhost:4000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "thesis_idea": "privacy preserving machine learning for medical images",
    "skills": ["python", "deep learning", "computer vision"],
    "department": "CSE",
    "degree_type": "MSc"
  }'
```

### Draft supervisor outreach email

```bash
curl -X POST http://localhost:4000/api/email/draft \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "Ayesha Rahman",
    "student_id": "22100001",
    "student_dept": "CSE",
    "degree_type": "MSc",
    "faculty_id": 1,
    "thesis_summary": "I want to build an explainable medical image analysis pipeline for low-resource settings.",
    "tone": "formal"
  }'
```

### Stats

```bash
curl http://localhost:4000/api/stats
```

### Admin upsert faculty

```bash
curl -X POST http://localhost:4000/api/admin/faculty \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-me" \
  -d '{
    "name": "Dr. Example Faculty",
    "email": "example@university.edu",
    "department": "CSE",
    "designation": "Associate Professor",
    "bio": "Works on distributed systems and trustworthy AI.",
    "available_slots": 2,
    "degree_types": ["MSc", "PhD"],
    "research_areas": ["distributed systems", "trustworthy ai"],
    "recent_papers": [
      { "title": "Robust Scheduling for Edge Systems", "year": 2025, "url": "https://example.com/paper" }
    ],
    "cosupervisors": [],
    "last_updated": "2026-05-07T00:00:00.000Z"
  }'
```

## Notes

- `/api/match` and `/api/email/draft` are rate-limited to 20 requests per IP per hour.
- CORS is restricted to the comma-separated origins in `CORS_ORIGINS`.
- JSON array fields are stored as text in SQLite for easier near-term delivery, while keeping the schema straightforward to migrate later.

## Vercel and Supabase Integration

This project is configured to optionally deploy to **Vercel** and use **Supabase** (PostgreSQL) instead of local SQLite. This is particularly useful because Vercel's serverless environment does not support persistent local SQLite databases.

### Deploying to Vercel

1. Import the project into Vercel from your Git repository.
2. The root `vercel.json` file is already configured to deploy the Vite frontend and the Express backend simultaneously as a single Vercel project.
3. Make sure the Framework Preset is set to "Other" or "Vite".
4. Add the necessary Environment Variables (see below).

### Using Supabase

To switch the data source from the local SQLite database to Supabase, you must set the following environment variables in your Vercel project settings (or in your local `.env` file):

- `SUPABASE_URL`: The URL of your Supabase project (e.g., `https://your-project.supabase.co`).
- `SUPABASE_ANON_KEY`: The anon public key for your Supabase project.

Once these environment variables are set, the backend will automatically use the `supabase-service.js` and connect to your Supabase PostgreSQL database instead of using `node:sqlite`.

#### Supabase Database Schema Setup

You will need to run the following SQL queries in your Supabase SQL Editor to match the expected schema:

```sql
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  designation TEXT,
  bio TEXT,
  available_slots INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL
);

CREATE TABLE faculty_degree_types (
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  degree_type TEXT NOT NULL,
  PRIMARY KEY (faculty_id, degree_type)
);

CREATE TABLE research_fields (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE faculty_research_fields (
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  field_id INTEGER REFERENCES research_fields(id) ON DELETE CASCADE,
  PRIMARY KEY (faculty_id, field_id)
);

CREATE TABLE faculty_papers (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  year INTEGER,
  url TEXT
);

CREATE TABLE faculty_cosupervisors (
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  cosupervisor_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  PRIMARY KEY (faculty_id, cosupervisor_id)
);
```
