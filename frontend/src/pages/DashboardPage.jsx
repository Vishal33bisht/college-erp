// src/pages/DashboardPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../services/api";
import { getToken, clearToken } from "../auth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchCurrentUser(token)
      .then((data) => setMe(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load user info. Please login again.");
      });
  }, [navigate, token]);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            College Management System
          </h1>
          <div className="flex items-center gap-4">
            {me && me.role === "admin" && (
              <>
                <button
                  onClick={() => navigate("/admin/departments")}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Manage Departments
                </button>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Manage Users
                </button>
                <button
            onClick={() => navigate("/admin/courses")}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Manage Courses
          </button>
              </>
            )}
                  {me && (me.role === "teacher" || me.role === "hod") && (
        <button
          onClick={() => navigate("/teacher/courses")}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          My Courses
        </button>
      )}
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
              
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Dashboard
          </h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
              {error}
            </p>
          )}

          {me ? (
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Name:</span> {me.full_name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {me.email}
              </p>
              <p>
                <span className="font-medium">Role:</span> {me.role}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This information comes from the protected <code>/users/me</code>{" "}
                endpoint using your JWT token.
              </p>
            </div>
          ) : (
            !error && <p className="text-sm text-gray-500">Loading...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
