from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import subjects, teachers, timetable, schedule, attendance, statistics
from app.routers import profile

app = FastAPI(title="Attendance Tracker API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://personal-attendance-tracker-6cssld0gt.vercel.app",
        #"https://personal-attendance-tracker-dun.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subjects.router, prefix="/api")
app.include_router(teachers.router, prefix="/api")
app.include_router(timetable.router, prefix="/api")
app.include_router(schedule.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(statistics.router, prefix="/api")
app.include_router(profile.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}
