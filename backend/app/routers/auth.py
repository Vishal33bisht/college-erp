# app/routers/auth.py

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.deps import get_db
from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models import UserRole

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register-admin", response_model=schemas.UserRead)
def register_admin(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    One-time Admin registration endpoint.

    Logic:
    - If an admin already exists, block.
    - If email already exists, block.
    - Create a new user with role=ADMIN and hashed password.
    """

    # Check if an admin already exists
    existing_admin = db.query(models.User).filter(models.User.role == UserRole.ADMIN).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An admin user already exists. Admin registration is disabled.",
        )

    # Check if this email is already used
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    hashed_password = get_password_hash(user_in.password)

    user = models.User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_password,
        role=UserRole.ADMIN,  # Force ADMIN for this endpoint
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login")
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token + basic user info.
    """

    user = db.query(models.User).filter(models.User.email == user_in.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
        },
    }
