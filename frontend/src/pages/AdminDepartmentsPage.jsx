// src/pages/AdminDepartmentsPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  fetchCurrentUser,
} from "../services/api";
import { getToken } from "../auth";

const AdminDepartmentsPage = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptError, setDeptError] = useState(null);

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [saving, setSaving] = useState(false);

  // Load current user to check role
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

  // Load departments (after we know user)
  useEffect(() => {
    if (!me || me.role !== "admin") return;

    setLoading(true);
    fetchDepartments()
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setDeptError(err.message || "Failed to load departments.");
        setLoading(false);
      });
  }, [me]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    setSaving(true);
    setDeptError(null);
    try {
      const created = await createDepartment({
        name: newName.trim(),
        code: newCode.trim(),
      });
      setDepartments((prev) => [...prev, created]);
      setNewName("");
      setNewCode("");
    } catch (err) {
      console.error(err);
      setDeptError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (dept) => {
    setEditingId(dept.id);
    setEditingName(dept.name);
    setEditingCode(dept.code);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingCode("");
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim() || !editingCode.trim()) return;
    setSaving(true);
    setDeptError(null);
    try {
      const updated = await updateDepartment(id, {
        name: editingName.trim(),
        code: editingCode.trim(),
        hod_user_id: null,
      });
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? updated : d))
      );
      cancelEdit();
    } catch (err) {
      console.error(err);
      setDeptError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    setSaving(true);
    setDeptError(null);
    try {
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
      setDeptError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Render states

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

  if (!me || me.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
          <p className="text-sm text-red-600 mb-2">
            Access denied. Admin role required.
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
            Admin – Departments
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Back to dashboard
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Departments
          </h2>

          {deptError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
              {deptError}
            </p>
          )}

          {/* Create form */}
          <form
            onSubmit={handleCreate}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <input
              type="text"
              placeholder="Department name"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Code"
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add"}
            </button>
          </form>

          {/* List */}
          {loading ? (
            <p className="text-sm text-gray-500">Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="text-sm text-gray-500">No departments yet.</p>
          ) : (
            <div className="space-y-2">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 rounded-lg px-3 py-2 gap-2"
                >
                  {editingId === dept.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-28 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                        value={editingCode}
                        onChange={(e) => setEditingCode(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {dept.name}
                      </p>
                      <p className="text-xs text-gray-500">Code: {dept.code}</p>
                    </div>
                  )}

                  <div className="flex gap-2 text-xs">
                    {editingId === dept.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdate(dept.id)}
                          disabled={saving}
                          className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(dept)}
                          className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(dept.id)}
                          disabled={saving}
                          className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDepartmentsPage;
