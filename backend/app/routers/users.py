# app/routers/users.py

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db
from app.core.auth import get_current_admin, get_current_active_user
from app.core.security import get_password_hash
from app.models import UserRole

router = APIRouter(
    prefix="/users",
    tags=["users"],
)
@router.get("/me", response_model=schemas.UserRead)
def read_users_me(
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Return the currently authenticated user (any role).
    """
    return current_user


@router.post("/", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: schemas.UserAdminCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    # Prevent duplicate emails
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Optionally, you can prevent creating another admin via this endpoint
    # For now, allow admin creation as well:
    hashed_password = get_password_hash(user_in.password)

    user = models.User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role,
        department_id=user_in.department_id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get("/", response_model=List[schemas.UserRead])
def list_users(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
    role: Optional[UserRole] = Query(default=None),
    department_id: Optional[int] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
):
    """
    List users with optional filters:
    - role
    - department_id
    - is_active
    """
    query = db.query(models.User)

    if role is not None:
        query = query.filter(models.User.role == role)

    if department_id is not None:
        query = query.filter(models.User.department_id == department_id)

    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)

    users = query.order_by(models.User.id).all()
    return users


@router.get("/{user_id}", response_model=schemas.UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return user


@router.put("/{user_id}", response_model=schemas.UserRead)
def update_user(
    user_id: int,
    user_in: schemas.UserAdminUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Email uniqueness check if changed
    if user_in.email and user_in.email != user.email:
        existing = (
            db.query(models.User)
            .filter(models.User.email == user_in.email)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another user with this email already exists.",
            )

    if user_in.full_name is not None:
        user.full_name = user_in.full_name

    if user_in.email is not None:
        user.email = user_in.email

    if user_in.role is not None:
        user.role = user_in.role

    if user_in.department_id is not None:
        user.department_id = user_in.department_id

    if user_in.is_active is not None:
        user.is_active = user_in.is_active

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    """
    Hard delete user.
    In many real systems you'd prefer to set is_active=False instead.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    db.delete(user)
    db.commit()
    return
