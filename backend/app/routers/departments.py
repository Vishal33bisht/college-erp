# app/routers/departments.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db
from app.core.auth import get_current_admin

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
)


@router.post("/", response_model=schemas.DepartmentRead, status_code=status.HTTP_201_CREATED)
def create_department(
    department_in: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    # Ensure unique code and name
    existing = (
        db.query(models.Department)
        .filter(
            (models.Department.code == department_in.code)
            | (models.Department.name == department_in.name)
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this name or code already exists.",
        )

    department = models.Department(
        name=department_in.name,
        code=department_in.code,
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


@router.get("/", response_model=List[schemas.DepartmentRead])
def list_departments(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    departments = db.query(models.Department).order_by(models.Department.id).all()
    return departments


@router.get("/{department_id}", response_model=schemas.DepartmentRead)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found.",
        )
    return department


@router.put("/{department_id}", response_model=schemas.DepartmentRead)
def update_department(
    department_id: int,
    department_in: schemas.DepartmentUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found.",
        )

    # If code or name being changed, ensure uniqueness
    if department_in.code and department_in.code != department.code:
        existing_code = (
            db.query(models.Department)
            .filter(models.Department.code == department_in.code)
            .first()
        )
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another department with this code already exists.",
            )

    if department_in.name and department_in.name != department.name:
        existing_name = (
            db.query(models.Department)
            .filter(models.Department.name == department_in.name)
            .first()
        )
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another department with this name already exists.",
            )

    # Apply changes
    if department_in.name is not None:
        department.name = department_in.name

    if department_in.code is not None:
        department.code = department_in.code

    if department_in.hod_user_id is not None:
        # Optional: we are not yet validating that HOD exists or is from same department.
        department.hod_user_id = department_in.hod_user_id

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found.",
        )

    db.delete(department)
    db.commit()

    return
