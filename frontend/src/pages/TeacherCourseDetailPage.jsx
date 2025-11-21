// src/pages/TeacherCourseDetailPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchCurrentUser,
  fetchDepartments,
  fetchCourseById,
  fetchEnrolledStudentsForCourse,
} from "../services/api";
import { getToken } from "../auth";

const TeacherCourseDetailPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [me, setMe] = useState(null);
  const [userError, setUserError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [course, setCourse] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Load current user
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setLoadingUser(true);
    fetchCurrentUser(token)
      .then((user) => {
        setMe(user);
        setLoadingUser(false);
      })
      .catch((err) => {
        console.error(err);
        setUserError("Failed to load user. Please login again.");
        setLoadingUser(false);
      });
  }, [navigate]);

  // Load course + departments + students
  useEffect(() => {
    if (!me) return;
    if (me.role !== "teacher" && me.role !== "hod") return;
    if (!courseId) return;

    setLoadingData(true);
    setDataError(null);

    Promise.all([
      fetchCourseById(courseId),
      fetchDepartments(),
      fetchEnrolledStudentsForCourse(courseId),
    ])
      .then(([courseData, deps, enrolled]) => {
        setCourse(courseData);
        setDepartments(deps);
        setStudents(enrolled);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error(err);
        setDataError(err.message || "Failed to load course details.");
        setLoadingData(false);
      });
  }, [me, courseId]);

  const deptMap = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [departments]);

  const department = course ? deptMap[course.department_id] : null;

  // ---------- RENDER STATES ----------

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-sm">Loading user...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
          <p className="text-red-600 text-sm mb-2">{userError}</p>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  if (!me || (me.role !== "teacher" && me.role !== "hod")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
          <p className="text-sm text-red-600 mb-2">
            Access denied. Teacher or HOD role required.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Course Details
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teacher/courses")}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Back to My Courses
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          {dataError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
              {dataError}
            </p>
          )}

          {loadingData || !course ? (
            <p className="text-sm text-gray-500">Loading course...</p>
          ) : (
            <>
              {/* Course header */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {course.code} – {course.name}
                  </h2>
                  {course.semester && (
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {course.semester}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {department
                    ? `${department.code} • ${department.name}`
                    : "No department"}
                  {course.credits != null &&
                    ` • ${course.credits} credits`}
                </p>
                {course.description && (
                  <p className="text-sm text-gray-700 mt-1">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Actions: placeholders for future features */}
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => {
                    // placeholder - to be implemented later
                    alert(
                      "Attendance feature will be implemented in the next steps."
                    );
                  }}
                >
                  Take Attendance
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-900"
                  onClick={() => {
                    // placeholder - to be implemented later
                    alert(
                      "Assignments feature will be implemented in the next steps."
                    );
                  }}
                >
                  Manage Assignments
                </button>
              </div>

              {/* Enrolled students */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  Enrolled Students
                </h3>

                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No students enrolled yet.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {students.map((s) => (
                      <div
                        key={s.id}
                        className="px-3 py-2 flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {s.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.email}
                          </p>
                        </div>
                        {!s.is_active && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                            Inactive
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherCourseDetailPage;
