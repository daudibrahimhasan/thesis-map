# ThesisMap (t-map)

ThesisMap (also referenced as **ThesisMatch**) is a dual-role academic dashboard and supervisor matcher designed to streamline thesis matching, advisor search, and outreach automation for university students and researchers.

Optimized with an **offline-first philosophy**, ThesisMap offers rich client-side search, keyword-based scoring, and outreach email formulation that runs with sub-100ms response times—fully functional even on low-spec hardware or restricted connectivity settings. It also includes an optional fully-fledged Express API backend with support for local SQLite databases or cloud-scale PostgreSQL (via Supabase).

---

## 🚀 Key Features

*   **Interactive Neural Research Graph**: A dynamic, interactive canvas visualization representing research domains and their interconnections. Built with custom physics animations and HSL color-mapping, it highlights links between academic fields.
*   **Weighted Research Matching Engine**: Auto-correlates student thesis abstracts and skillset lists against faculty databases (titles, abstracts, research fields, publications, and availability slots).
*   **Personalized Outreach Assistant**: Generates structured, publication-informed email drafts with customizable tone dynamics (*formal*, *friendly*, *concise*).
*   **Advanced Faculty Directory**: Filterable directory with search, multiselect domain tags, rank ordering by designation, availability indicators, and built-in CSV exporter.
*   **Student Lounge**: A collaborative forum for academic advice and an interactive peer chat room (`#find-thesis-mate`) allowing students to declare thesis topics, skills, and partner requirements.
*   **Database Adaptability**: Works out-of-the-box using local Node-native SQLite, or automatically switches to Supabase PostgreSQL in production environments.

---

## 📂 Project Architecture

The codebase is organized as a monorepo featuring a decoupled frontend client and a backend API server:

```
thesisMap/
├── backend/                  # Express.js backend server
│   ├── data/                 # SQLite database storage & CSV raw seeds
│   ├── middleware/           # Cors, routing, and rate limit middlewares
│   ├── routes/               # API endpoints (faculty, fields, match, email, admin)
│   ├── services/             # Core database interfaces (SQLite & Supabase services)
│   ├── utils/                # Text processing, response parsing, and helpers
│   ├── db.js                 # Local sqlite database initialize script
│   ├── seed.js               # Data ingest and normalization script
│   └── server.js             # Main server entrypoint
│
├── frontend/                 # Vite + React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI elements (Canvas NeuralGraph, FilterSidebar, etc.)
│   │   ├── data/             # Offline-first faculty datasets & static graphs
│   │   ├── pages/            # View pages (HomePage, DatabasePage, ActionWorkspacePage, ReviewCommunityPage)
│   │   └── App.jsx           # Client router and central StudentContext state
│   ├── package.json          # Frontend dependencies (Vite, Framer Motion, React 19)
│   └── tsconfig.json         # TypeScript configuration
│
└── vercel.json               # Monorepo Vercel deployment configurations
```

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### ⚡ Unified Workspace Commands

If you want to run or install everything from the root directory without manually switching folders:

*   **Install all dependencies** (Frontend & Backend):
    ```bash
    npm run install:all
    ```
*   **Start both frontend and backend concurrently**:
    ```bash
    npm run dev:all
    ```
*   **Start only frontend / backend from the root**:
    ```bash
    npm run dev:frontend
    # or
    npm run dev:backend
    ```

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the local environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit the newly created `.env` file to customize ports or admin keys if necessary.*
4. Seed and normalize the local SQLite database:
   ```bash
   npm run seed
   ```
5. Start the backend in development (watch) mode:
   ```bash
   npm run dev
   ```
   The backend API will run by default at `http://localhost:4000`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the client application in development mode:
   ```bash
   npm run dev
   ```
   The Vite-powered client is accessible by default at `http://localhost:5173`.

---

## 📡 API Reference

All backend responses conform to the following wrapper envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Endpoints Summary

#### 1. Server Health
*   **Route**: `GET /health`
*   **Example**:
    ```bash
    curl http://localhost:4000/health
    ```

#### 2. Query/Filter Faculty
*   **Route**: `GET /api/faculty`
*   **Query Params**: 
    *   `q`: Search query string
    *   `department`: Filter by department (e.g. `CSE`)
    *   `area`: Comma-separated list of research fields
    *   `available`: Filter by availability (`true`/`false`)
    *   `degree_type`: Match acceptable student degrees (`Undergraduate`, `MSc`, `PhD`)
    *   `sort`: Sort property (`name`, `availability`, `publications`)
    *   `order`: Sort order (`asc`, `desc`)
    *   `page` & `limit`: Pagination parameters
*   **Example**:
    ```bash
    curl "http://localhost:4000/api/faculty?q=machine%20learning&department=CSE&area=computer%20vision,ai&available=true&degree_type=MSc&sort=availability&order=desc&page=1&limit=20"
    ```

#### 3. Faculty Specific Details
*   **Route**: `GET /api/faculty/:id`
*   **Example**:
    ```bash
    curl http://localhost:4000/api/faculty/1
    ```

#### 4. Research Fields Graph Coordinates
*   **Route**: `GET /api/fields`
*   **Example**:
    ```bash
    curl http://localhost:4000/api/fields
    ```

#### 5. Faculty Thesis Matching
*   **Route**: `POST /api/match` (Rate limited to 20 requests/hour/IP)
*   **Payload**:
    ```json
    {
      "thesis_idea": "privacy preserving machine learning for medical images",
      "skills": ["python", "deep learning", "computer vision"],
      "department": "CSE",
      "degree_type": "MSc"
    }
    ```
*   **Example**:
    ```bash
    curl -X POST http://localhost:4000/api/match \
      -H "Content-Type: application/json" \
      -d '{"thesis_idea": "privacy preserving ML", "skills": ["python"], "department": "CSE", "degree_type": "MSc"}'
    ```

#### 6. Outreach Email Draft formulation
*   **Route**: `POST /api/email/draft` (Rate limited to 20 requests/hour/IP)
*   **Payload**:
    ```json
    {
      "student_name": "Ayesha Rahman",
      "student_id": "22100001",
      "student_dept": "CSE",
      "degree_type": "MSc",
      "faculty_id": 1,
      "thesis_summary": "I want to build an explainable medical image analysis pipeline for low-resource settings.",
      "tone": "formal"
    }
    ```
*   **Example**:
    ```bash
    curl -X POST http://localhost:4000/api/email/draft \
      -H "Content-Type: application/json" \
      -d '{"student_name":"Ayesha", "student_id":"123", "student_dept":"CSE", "degree_type":"MSc", "faculty_id":1, "thesis_summary":"ML in healthcare", "tone":"formal"}'
    ```

#### 7. System Stats
*   **Route**: `GET /api/stats`
*   **Example**:
    ```bash
    curl http://localhost:4000/api/stats
    ```

#### 8. Admin Upsert Faculty (Secure)
*   **Route**: `POST /api/admin/faculty`
*   **Headers**: `X-API-Key: <ADMIN_API_KEY>`
*   **Example**:
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

---

## ⚡ Data Normalization & Seeding

The backend seed script ([backend/seed.js](file:///d:/Projects/thesisMap/backend/seed.js)) implements clean pipelines to merge and clean incoming data:

1.  Checks if `faculty_data.json` exists.
2.  If absent, automatically falls back to matching and merging `faculty_data.csv` and `faculty_details.csv` files using names and emails.
3.  **Normalization procedures** include:
    *   Trimming whitespace and formatting strings.
    *   Converting research area tags to lowercase, deduplicating, and matching them to uniform entries.
    *   Enforcing email-based upserts to prevent duplicate database rows.
    *   Mapping academic degrees; defaults missing tags to `["MSc", "PhD"]`.
    *   Correlating thesis accepting statuses to available supervisor slots.

To execute the seed script manually:
```bash
cd backend
npm run seed
```

---

## ☁️ Vercel & Supabase Cloud Integration

This codebase is configured to run fully serverless on **Vercel** with a cloud **Supabase (PostgreSQL)** database database system.

### 📦 Vercel Monorepo Settings
The root [vercel.json](file:///d:/Projects/thesisMap/vercel.json) routes traffic dynamically:
*   Vite UI compilation takes place via static builds.
*   Express API endpoints are converted to serverless functions using `@vercel/node`.
*   All `/api/*` requests automatically proxy to [backend/server.js](file:///d:/Projects/thesisMap/backend/server.js).

### 🗄️ Supabase Deployment
When the following environment variables are supplied (either locally in `.env` or in Vercel settings), the app automatically routes traffic from sqlite to PostgreSQL using the Supabase Service Layer ([backend/services/supabase-service.js](file:///d:/Projects/thesisMap/backend/services/supabase-service.js)):
*   `SUPABASE_URL`
*   `SUPABASE_ANON_KEY`

#### SQL Schema Configuration (Supabase SQL Editor)
Run the following statements inside your Supabase dashboard SQL editor to setup the tables:

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

---

## 🤝 Contributing

We welcome contributions to help improve ThesisMap! Before committing code, please read our styling and contribution guidelines detailed in the [CONTRIBUTING.md](file:///d:/Projects/thesisMap/CONTRIBUTING.md) guide.

### Key Architecture Guidelines
*   **Performance Focused**: Keep UI interactions under 100ms.
*   **Offline-first support**: Match mechanisms, filters, and drafts must support client-side/in-memory evaluation using the JSON/JS datasets under `frontend/src/data/`.
*   **CSS Modules**: Avoid global style leaks by wrapping components using `<Name>.module.css` local scoping rules.
