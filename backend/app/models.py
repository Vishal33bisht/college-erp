from datetime import datetime, date, time
from enum import Enum as PyEnum

from sqlalchemy import (
    Column, Integer, String, DateTime, Date, Time,
    Boolean, ForeignKey, Enum, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship

from .database import Base


class UserRole(str, PyEnum):
    STUDENT = "student"
    TA = "ta"
    TEACHER = "teacher"
    HOD = "hod"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)

    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="users",foreign_keys=[department_id],)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)

    hod_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="department", foreign_keys=[User.department_id])

    hod = relationship("User", foreign_keys=[hod_user_id], post_update=True)


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    semester = Column(String(50), nullable=True)
    credits = Column(Integer, nullable=True)

    department = relationship("Department")
    teacher = relationship("User")

    enrollments = relationship("Enrollment", back_populates="course")
    assignments = relationship("Assignment", back_populates="course")
    attendance_records = relationship("Attendance", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_student_course"),
    )
    student = relationship("User", foreign_keys=[student_id])
    course = relationship("Course", foreign_keys=[course_id])



class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)

    course = relationship("Course", back_populates="assignments")
    grades = relationship("Grade", back_populates="assignment")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    graded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    grade_value = Column(String(10), nullable=False)  # e.g., "A", "B+", "85"
    feedback = Column(Text, nullable=True)
    is_finalized = Column(Boolean, default=False, nullable=False)
    graded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    assignment = relationship("Assignment", back_populates="grades")
    student = relationship("User", foreign_keys=[student_id])
    graded_by = relationship("User", foreign_keys=[graded_by_id])


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)  # "present", "absent", etc.
    marked_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Optional: period or slot within the day
    period = Column(String(50), nullable=True)

    course = relationship("Course", back_populates="attendance_records")
    student = relationship("User", foreign_keys=[student_id])
    marked_by = relationship("User", foreign_keys=[marked_by_id])


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # e.g., "lab", "classroom"
    location = Column(String(255), nullable=True)
    capacity = Column(Integer, nullable=True)

    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    department = relationship("Department")
    bookings = relationship("Booking", back_populates="resource")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    booked_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # "pending", "approved", "rejected"

    resource = relationship("Resource", back_populates="bookings")
    booked_by = relationship("User")
