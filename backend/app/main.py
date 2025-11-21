from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .deps import get_db
from . import models
from .routers import auth,departments,users,courses,teacher,enrollments
from app.core.auth import get_current_active_user

from .deps import get_db
from . import models

app = FastAPI(
    title="College Management System API",
    version="0.1.0"
)


origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(teacher.router)
app.include_router(enrollments.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "FastAPI backend running"}


@app.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    # Count users (should be 0 at the start)
    users_count = db.query(models.User).count()
    return {
      "status": "ok",
      "db": "connected",
      "users_count": users_count
    }
