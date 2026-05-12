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
