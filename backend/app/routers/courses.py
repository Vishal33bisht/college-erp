# app/routers/courses.py

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db
from app.core.auth import get_current_admin, get_current_active_user
from app.models import UserRole

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
)


def ensure_teacher_exists(db: Session, teacher_id: int):
    teacher = db.query(models.User).filter(models.User.id == teacher_id).first()
    if not teacher or teacher.role not in (UserRole.TEACHER, UserRole.HOD):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="teacher_id must refer to a user with role 'teacher' or 'hod'.",
        )
    return teacher


def ensure_department_exists(db: Session, department_id: int):
    dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="department_id must refer to an existing department.",
        )
    return dept


@router.post("/", response_model=schemas.CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: schemas.CourseCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    """
    Admin-only: create a course and assign a teacher.
    """

    # Ensure unique course code
    existing = (
        db.query(models.Course)
        .filter(models.Course.code == course_in.code)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A course with this code already exists.",
        )

    ensure_department_exists(db, course_in.department_id)
    ensure_teacher_exists(db, course_in.teacher_id)

    course = models.Course(
        code=course_in.code,
        name=course_in.name,
        description=course_in.description,
        semester=course_in.semester,
        credits=course_in.credits,
        department_id=course_in.department_id,
        teacher_id=course_in.teacher_id,
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return course


@router.get("/", response_model=List[schemas.CourseRead])
def list_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    department_id: Optional[int] = Query(default=None),
    teacher_id: Optional[int] = Query(default=None),
    semester: Optional[str] = Query(default=None),
):
    """
    List courses.

    Any authenticated user can list courses, but filters are available.
    """

    query = db.query(models.Course)

    if department_id is not None:
        query = query.filter(models.Course.department_id == department_id)

    if teacher_id is not None:
        query = query.filter(models.Course.teacher_id == teacher_id)

    if semester is not None:
        query = query.filter(models.Course.semester == semester)

    # If the current user is a teacher or HOD, you may optionally enforce scope. For now,
    # we allow them to see all courses; we can tighten this later if needed.

    courses = query.order_by(models.Course.id).all()
    return courses


@router.get("/{course_id}", response_model=schemas.CourseRead)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found.",
        )
    return course


@router.put("/{course_id}", response_model=schemas.CourseRead)
def update_course(
    course_id: int,
    course_in: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Admin: can update any course.
    Teacher/HOD: can update only their own courses (basic fields).
    """

    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found.",
        )

    # Authorization: admin can update any; teacher/hod can only update their own course
    if current_user.role not in (UserRole.ADMIN, UserRole.HOD, UserRole.TEACHER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges to update courses.",
        )

    if current_user.role in (UserRole.HOD, UserRole.TEACHER) and course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update courses you teach.",
        )

    # If code changed, check uniqueness
    if course_in.code and course_in.code != course.code:
        existing_code = (
            db.query(models.Course)
            .filter(models.Course.code == course_in.code)
            .first()
        )
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another course with this code already exists.",
            )

    # Validate department/teacher if changed
    if course_in.department_id is not None:
        ensure_department_exists(db, course_in.department_id)
        course.department_id = course_in.department_id

    if course_in.teacher_id is not None:
        ensure_teacher_exists(db, course_in.teacher_id)
        course.teacher_id = course_in.teacher_id

    if course_in.name is not None:
        course.name = course_in.name

    if course_in.description is not None:
        course.description = course_in.description

    if course_in.semester is not None:
        course.semester = course_in.semester

    if course_in.credits is not None:
        course.credits = course_in.credits

    db.add(course)
    db.commit()
    db.refresh(course)

    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    """
    Admin-only: delete a course.
    """

    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found.",
        )

    db.delete(course)
    db.commit()

    return
