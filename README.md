# AI Resume Filtering & Recruitment Management System

Production-ready web app: **React + Tailwind** frontend, **Flask** REST API, **MongoDB**, **JWT** auth, and **TF-IDF + Cosine Similarity** ML filtering for resumes.

---

## Features

- **Roles:** Admin, User (Applicant)
- **Admin:** Create company (on signup), create recruitment drives, view resumes per drive, run **AI Filter** (keywords + job description vs resume text → Selected/Rejected by similarity threshold)
- **User:** Browse companies → open drives → upload PDF/DOCX resume; track status and similarity score
- **ML:** TF-IDF vectorization + cosine similarity; preprocessing (lowercase, stopwords, lemmatization)
- **UI:** Cards, modals, progress bars, status badges (Selected=Green, Rejected=Red, Pending=Yellow), responsive layout

---

## Tech Stack

| Layer      | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 18, React Router, Tailwind CSS, Axios |
| Backend   | Python 3, Flask, Flask-CORS   |
| Database  | MongoDB                       |
| Auth      | JWT (PyJWT), bcrypt           |
| ML        | scikit-learn, NLTK            |
| Parsing   | PyPDF2, python-docx           |

---

## Folder Structure

```
idp-2/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory, DB, blueprints
│   │   ├── config.py
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   └── resume_filter.py # TF-IDF + cosine similarity, PDF/DOCX text extraction
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── auth.py          # Signup, Login (JWT)
│   │   │   ├── companies.py     # List companies
│   │   │   ├── recruitment_drives.py
│   │   │   ├── resumes.py       # Upload, list by drive, run analyze
│   │   │   └── users.py         # GET /me
│   │   └── utils/
│   │       ├── auth.py          # JWT helpers, token_required, admin_required
│   │       └── parsers.py       # allowed_file, safe_save_path
│   ├── uploads/                 # Uploaded resumes (created automatically)
│   ├── scripts/
│   │   └── seed_sample_data.py  # Sample admin, company, drives, users, resumes
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Layout, Modal, StatusBadge
│   │   ├── context/             # AuthContext
│   │   ├── pages/               # Login, Signup, AdminDashboard, AdminDriveDetail, UserDashboard, UserCompanyDrives, MyApplications
│   │   └── services/            # api.js
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** (for frontend)
- **MongoDB** running locally (e.g. `mongod`) or a remote URI

---

## Run Locally

### 1. MongoDB

Start MongoDB (e.g. on Windows with default port):

```bash
# If installed as service it may already be running; otherwise:
mongod
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Copy env (optional):

```bash
copy .env.example .env
# Edit .env if needed (MONGO_URI, MONGO_DB, SECRET_KEY, JWT_SECRET_KEY, CORS_ORIGINS)
```

Run the app:

```bash
python run.py
```

API: **http://localhost:5000**  
Health: **http://localhost:5000/api/health**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**  
Vite proxies `/api` to `http://localhost:5000` (see `vite.config.js`).

### 4. Sample Data (optional)

From `backend` folder, with venv activated:

```bash
python -m scripts.seed_sample_data
```

Creates:

- **Admin:** `admin@company.com` / `admin123`  
  Company: **Acme Corp**, 2 open drives (Senior Python Developer, Frontend React Developer).
- **Users:** `alice@example.com`, `bob@example.com` / `user123`  
  Sample resumes linked to those drives (text only; no real files).

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/signup` | Signup (name, email, password, role; Admin: companyName) |
| POST   | `/api/auth/login`  | Login → `{ token, user }` |
| GET    | `/api/users/me`   | Current user + companyName (Admin) |
| GET    | `/api/companies`   | List companies (for User dashboard) |
| GET    | `/api/drives`     | Drives (Admin: own company; User: ?companyId= for open) |
| POST   | `/api/drives`     | Create drive (Admin) |
| GET    | `/api/drives/:id` | Get one drive |
| PATCH  | `/api/drives/:id` | Update drive (Admin) |
| POST   | `/api/resumes/upload` | Upload resume (User); form: recruitmentDriveId, file |
| GET    | `/api/resumes/drive/:driveId` | List resumes (Admin: all; User: own) |
| POST   | `/api/resumes/drive/:driveId/analyze` | Run AI filter (Admin); body: `{ keywords }` |
| GET    | `/api/resumes/my-applications` | User's applications |

All except signup/login require header: `Authorization: Bearer <token>`.

---

## ML Module (`backend/app/ml/resume_filter.py`)

- **Text extraction:** PDF (PyPDF2), DOCX (python-docx).
- **Preprocessing:** Lowercase, remove non-alphanumeric, tokenize (NLTK), remove stopwords, lemmatize (WordNet).
- **Similarity:** `TfidfVectorizer` on job description + keywords vs each resume; `cosine_similarity`; threshold (default 0.65) → Selected / Rejected.
- **Config:** `SIMILARITY_THRESHOLD` in env (default 0.65).

---

## UI Notes

- **Status badges:** Selected (green), Rejected (red), Pending (yellow).
- **Progress bar:** Similarity % per resume / application.
- **Loading:** Spinner during AI analysis and on initial dashboard load.
- **Secure upload:** Allowed extensions PDF/DOCX, max 10MB; safe filenames.

---

## Environment Variables (Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/` | MongoDB connection string |
| `MONGO_DB`  | `recruitment_db` | Database name |
| `SECRET_KEY` | (dev default) | Flask secret |
| `JWT_SECRET_KEY` | same as SECRET_KEY | JWT signing key |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed origins |
| `SIMILARITY_THRESHOLD` | `0.65` | Min similarity for "Selected" (0–1) |

---

## Quick Test Flow

1. **Sign up** as Admin (e.g. company "Test Co") or run seed and use `admin@company.com`.
2. **Login** as Admin → create a recruitment drive (role title + job description, Open).
3. **Sign up** as User (or use `alice@example.com`), **login** → Dashboard shows companies → open company → see open drives → **Apply** (upload PDF/DOCX).
4. **Login** as Admin → open the drive → see resumes → **Start AI Filter** → enter keywords → **Analyze** → see Selected/Rejected and similarity %.
5. **Login** as User → **My Applications** → see status and score.

---

## License

MIT.
