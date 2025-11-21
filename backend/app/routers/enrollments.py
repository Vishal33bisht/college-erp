# app/routers/enrollments.py

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db
from app.core.auth import get_current_admin
from app.models import UserRole

router = APIRouter(
    prefix="/enrollments",
    tags=["enrollments"],
)


@router.post("/", response_model=schemas.EnrollmentRead, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment_in: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    # Validate student
    student = db.query(models.User).filter(models.User.id == enrollment_in.student_id).first()
    if not student or student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="student_id must refer to a user with role 'student'.",
        )

    # Validate course
    course = db.query(models.Course).filter(models.Course.id == enrollment_in.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course_id must refer to an existing course.",
        )

    # Check duplicate
    existing = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.student_id == enrollment_in.student_id,
            models.Enrollment.course_id == enrollment_in.course_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this course.",
        )

    enrollment = models.Enrollment(
        student_id=enrollment_in.student_id,
        course_id=enrollment_in.course_id,
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return enrollment


@router.get("/", response_model=List[schemas.EnrollmentRead])
def list_enrollments(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
    student_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
):
    query = db.query(models.Enrollment)

    if student_id is not None:
        query = query.filter(models.Enrollment.student_id == student_id)
    if course_id is not None:
        query = query.filter(models.Enrollment.course_id == course_id)

    enrollments = query.order_by(models.Enrollment.id).all()
    return enrollments
# app/routers/enrollments.py

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db
from app.core.auth import get_current_admin
from app.models import UserRole

router = APIRouter(
    prefix="/enrollments",
    tags=["enrollments"],
)


@router.post("/", response_model=schemas.EnrollmentRead, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment_in: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    # Validate student
    student = db.query(models.User).filter(models.User.id == enrollment_in.student_id).first()
    if not student or student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="student_id must refer to a user with role 'student'.",
        )

    # Validate course
    course = db.query(models.Course).filter(models.Course.id == enrollment_in.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course_id must refer to an existing course.",
        )

    # Check duplicate
    existing = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.student_id == enrollment_in.student_id,
            models.Enrollment.course_id == enrollment_in.course_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this course.",
        )

    enrollment = models.Enrollment(
        student_id=enrollment_in.student_id,
        course_id=enrollment_in.course_id,
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return enrollment


@router.get("/", response_model=List[schemas.EnrollmentRead])
def list_enrollments(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
    student_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
):
    query = db.query(models.Enrollment)

    if student_id is not None:
        query = query.filter(models.Enrollment.student_id == student_id)
    if course_id is not None:
        query = query.filter(models.Enrollment.course_id == course_id)

    enrollments = query.order_by(models.Enrollment.id).all()
    return enrollments
