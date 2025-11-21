# app/schemas.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from .models import UserRole



class UserBase(BaseModel):
    full_name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class UserAdminCreate(UserBase):
    password: str
    role: UserRole
    department_id: int | None = None


class UserAdminUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None
    department_id: int | None = None
    is_active: bool | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: Optional[str] = None  # subject (e.g. email or user id)
    role: Optional[UserRole] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
class DepartmentBase(BaseModel):
    name: str
    code: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    hod_user_id: int | None = None


class DepartmentRead(DepartmentBase):
    id: int
    hod_user_id: int | None = None

    class Config:
        orm_mode = True

class CourseBase(BaseModel):
    code: str
    name: str
    description: str | None = None
    semester: str | None = None
    credits: int | None = None
    department_id: int
    teacher_id: int


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    description: str | None = None
    semester: str | None = None
    credits: int | None = None
    department_id: int | None = None
    teacher_id: int | None = None


class CourseRead(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    semester: str | None = None
    credits: int | None = None
    department_id: int
    teacher_id: int

    class Config:
        orm_mode = True
class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentRead(EnrollmentBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True