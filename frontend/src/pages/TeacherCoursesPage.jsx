// src/pages/TeacherCoursesPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCurrentUser,
  fetchDepartments,
  fetchMyTeacherCourses,
} from "../services/api";
import { getToken } from "../auth";

const TeacherCoursesPage = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [userError, setUserError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
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

  // Load departments + teacher courses
  useEffect(() => {
    if (!me) return;
    if (me.role !== "teacher" && me.role !== "hod") return;

    setLoadingData(true);
    setDataError(null);

    Promise.all([fetchDepartments(), fetchMyTeacherCourses()])
      .then(([deps, myCourses]) => {
        setDepartments(deps);
        setCourses(myCourses);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error(err);
        setDataError(err.message || "Failed to load courses.");
        setLoadingData(false);
      });
  }, [me]);

  const deptMap = departments.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

  // ---------- Render states ----------
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
            My Courses
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Back to dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Courses assigned to you
          </h2>

          {dataError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
              {dataError}
            </p>
          )}

          {loadingData ? (
            <p className="text-sm text-gray-500">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-gray-500">
              No courses are currently assigned to you.
            </p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => {
                const dept = deptMap[course.department_id];
                return (
                  <div
                    key={course.id}
                    onClick={() =>
                      navigate(`/teacher/courses/${course.id}`)
                    }
                    className="border border-gray-200 rounded-lg px-4 py-3 flex flex-col gap-1 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        {course.code} – {course.name}
                      </p>
                      {course.semester && (
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {course.semester}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {dept ? `${dept.code} • ${dept.name}` : "No department"}
                      {course.credits != null &&
                        ` • ${course.credits} credits`}
                    </p>
                    {course.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherCoursesPage;
