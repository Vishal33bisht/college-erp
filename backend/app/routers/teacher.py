# app/routers/teacher.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db
from app.core.auth import get_current_active_user
from app.models import UserRole

router = APIRouter(
    prefix="/teacher",
    tags=["teacher"],
)


@router.get("/courses", response_model=List[schemas.CourseRead])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Teacher/HOD: Get courses assigned to the current logged-in teacher.
    """
    if current_user.role not in (UserRole.TEACHER, UserRole.HOD):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers/HOD can view their assigned courses.",
        )

    courses = (
        db.query(models.Course)
        .filter(models.Course.teacher_id == current_user.id)
        .order_by(models.Course.id)
        .all()
    )

    return courses


@router.get(
    "/courses/{course_id}/students",
    response_model=List[schemas.UserRead],
)
def get_enrolled_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Teacher/HOD: View students enrolled in a given course.
    """

    if current_user.role not in (UserRole.TEACHER, UserRole.HOD):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers/HOD can view enrolled students.",
        )

    # Check course exists
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    # Ensure this teacher owns the course
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this course.",
        )

    enrollments = (
        db.query(models.Enrollment)
        .filter(models.Enrollment.course_id == course_id)
        .all()
    )
    student_ids = [e.student_id for e in enrollments]
    if not student_ids:
        return []

    students = (
        db.query(models.User)
        .filter(
            models.User.id.in_(student_ids),
            models.User.role == UserRole.STUDENT,
        )
        .order_by(models.User.full_name)
        .all()
    )

    return students