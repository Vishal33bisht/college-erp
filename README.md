# College Management System

A full-stack College Management System built with React, Tailwind CSS, FastAPI, and PostgreSQL/MySQL.  
The system supports multiple roles (Admin, HOD, Teacher, Teaching Assistant, Student) and covers core academic workflows such as course management, assignments, grades, 

---

## 🚀 Tech Stack

**Frontend**
- React
- Tailwind CSS
- React Router
- Axios (for API calls)

**Backend**
- FastAPI
- Pydantic
- SQLAlchemy / ORM of choice
- JWT authentication

**Database**
- PostgreSQL or MySQL


- Git & GitHub for version control and collaboration

---

## 🎯 Key Features 

### Student

- Dashboard with:
  - Enrolled courses overview
  - Upcoming assignments
  - Recent grades
  - Attendance summary
- Course management:
  - Browse and enroll in courses
  - View course syllabus and materials
- Assignments:
  - View assignments by course
  - Filter by status (pending, submitted, graded)
  - Submit assignments and upload files
  - View grades and feedback

### Teacher

- Dashboard with:
  - Assigned courses
  - Pending assignments to grade
  - Class attendance summary
- Course management:
  - Manage course content and materials
  - Set course schedules
  - View enrolled students
- Assignment management:
  - Create and manage assignments
  - View and grade submissions
  - Provide feedback and bulk grading
- Attendance management:
  - Take attendance
  - View and export attendance reports
- Class analytics:
  - Grade distribution
  - Attendance trends
  - At-risk students

### Teaching Assistant (TA)

- Dashboard with assigned courses
- Assignment review:
  - View student submissions
  - Provide initial feedback
  - Flag submissions for teacher review

### Head of Department (HOD)

- Department dashboard:
  - Department overview
  - All courses in department
  - Teacher performance metrics
- Course oversight:
  - Monitor course progress and enrollments
- Teacher management:
  - View teachers and workloads
  - Assign teachers to courses
- Grade review and approval:
  - Review, approve, or request grade revisions
  - Final grade approval workflows
- Department reports:
  - Success/failure rates
  - Enrollment trends
  - Exportable reports

### Admin

- System-wide admin dashboard
- User management:
  - Create/update/delete users
  - Assign roles (Admin / HOD / Teacher / TA / Student)
  - Bulk user import (CSV)
  - Password reset, activate/deactivate accounts
- Department management:
  - Create/manage departments
  - Assign HODs
- Course management:
  - Create courses
  - Assign courses to departments and teachers
  - Set prerequisites and capacity
- Resource management:
  - Manage labs/rooms/equipment
  - Set availability and utilization
- System settings:
  - Academic calendar configuration
  - Grading scales
  - Notifications and email templates
  - System-wide policies

---

## 🧱 System Architecture

High level architecture:

- **Frontend (React + Tailwind)**  
  - Consumes REST APIs from FastAPI backend  
  - Uses role-based routing and protected routes

- **Backend (FastAPI)**  
  - Exposes RESTful APIs for auth, users, courses, assignments, attendance, resources, etc.  
  - Implements role-based access control (RBAC) with JWT

- **Database (PostgreSQL/MySQL)**  
  - Core tables: `users`, `departments`, `courses`, `enrollments`, `assignments`, `grades`, `attendance`, `resources`, `bookings`  
  - Managed via migrations


---

## 📂 Project Structure 

```text
college-management-system/
  frontend/
    src/
      components/
      pages/
      hooks/
      services/
      routes/
    public/
    package.json
    tailwind.config.js
    vite.config.js or similar
  backend/
    app/
      api/
      core/
      models/
      schemas/
      services/
      db/
    alembic/ (or migrations/)
    requirements.txt
    main.py
  docs/
    roadmap.md
    architecture.md
    api.md
  .gitignore
  README.md
  LICENSE


- RBAC implemented using JSON Web Tokens and backend permission checks
- Alembic used for schema migrations
- Modular backend structure (API routes / schemas / services / models)

---

## 📂 Repository Structure



Backend and frontend run independently to allow scalable deployment.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (LTS)
- Python 3.10+
- PostgreSQL
- Git

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Vishal33bisht/college-erp.git
cd college-erp


cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env       # Edit DB_URL and JWT_SECRET here

# Apply migrations
alembic upgrade head

# Start backend
uvicorn main:app --reload

cd ../frontend
npm install
npm run dev
