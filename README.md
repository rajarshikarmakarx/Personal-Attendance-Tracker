# Personal Attendance Tracker

A full-stack personal attendance tracker for college students.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy 2.x, PostgreSQL, Alembic
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts

---

## Setup & Running

### 1. PostgreSQL

Create the database manually:
```bash
createdb attendance_db
```

### 2. Backend

```bash
cd backend

# Edit .env with your database credentials
nano .env  # or your preferred editor
# DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/attendance_db

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed the timetable (run once)
python seed_data.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

Interactive docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Start dev server
npm run dev
```

The app will be available at: http://localhost:5173

---

## Timetable

The timetable is defined in `backend/seed_data.py`.

To modify the schedule:
1. Edit the `TIMETABLE` dict in `seed_data.py`
2. Clear timetable entries from the database (or drop + recreate tables)
3. Re-run `python seed_data.py`

Current schedule is for **Group 1**, Session 2026-2027.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List all subjects |
| GET | `/api/subjects/{id}` | Subject detail |
| GET | `/api/teachers` | List all teachers |
| GET | `/api/timetable` | Full timetable |
| GET | `/api/timetable/{weekday}` | Timetable for a weekday |
| GET | `/api/schedule/{date}` | Daily schedule + attendance |
| PUT | `/api/attendance` | Mark/update attendance |
| DELETE | `/api/attendance/{id}` | Unmark attendance |
| GET | `/api/statistics/overall` | Overall stats |
| GET | `/api/statistics/subjects` | Per-subject stats |
| GET | `/api/statistics/teachers` | Per-teacher stats |

---

## Attendance Rules

| Status | Attended | Conducted |
|--------|----------|-----------|
| PRESENT | 1 | 1 |
| ABSENT | 0 | 1 |
| CANCELLED | 0 | 0 |
| UNMARKED | — | — |

- **Cancelled** classes don't affect percentage.
- **Unmarked** classes are not counted as absent.
- `percentage = present / (present + absent) * 100`

## Thresholds

| Percentage | Level |
|-----------|-------|
| ≥ 85% | 🟢 Good |
| 75–84.9% | 🟡 Warning |
| < 75% | 🔴 Critical |
