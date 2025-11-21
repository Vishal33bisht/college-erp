// src/pages/AdminUsersPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCurrentUser,
  fetchDepartments,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/api";
import { getToken } from "../auth";

const ROLE_OPTIONS = ["admin", "hod", "teacher", "ta", "student"];

const AdminUsersPage = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [userError, setUserError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Filters
  const [filterRole, setFilterRole] = useState("");
  const [filterDeptId, setFilterDeptId] = useState("");
  const [filterActive, setFilterActive] = useState("true"); // 'true' | 'false' | ''

  // Create form
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newDeptId, setNewDeptId] = useState("");

  // Editing
  const [editingId, setEditingId] = useState(null);
  const [editingFullName, setEditingFullName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [editingRole, setEditingRole] = useState("");
  const [editingDeptId, setEditingDeptId] = useState("");
  const [editingIsActive, setEditingIsActive] = useState(true);

  const [saving, setSaving] = useState(false);

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

  // Load departments
  useEffect(() => {
    if (!me || me.role !== "admin") return;

    setLoadingDeps(true);
    fetchDepartments()
      .then((data) => {
        setDepartments(data);
        setLoadingDeps(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingDeps(false);
      });
  }, [me]);

  // Load users
  const loadUsers = () => {
    if (!me || me.role !== "admin") return;

    setLoadingUsers(true);
    setUsersError(null);

    const isActive =
      filterActive === "" ? undefined : filterActive === "true";

    fetchUsers({
      role: filterRole || undefined,
      departmentId: filterDeptId ? Number(filterDeptId) : undefined,
      isActive,
    })
      .then((data) => {
        setUsers(data);
        setLoadingUsers(false);
      })
      .catch((err) => {
        console.error(err);
        setUsersError(err.message || "Failed to load users.");
        setLoadingUsers(false);
      });
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, filterRole, filterDeptId, filterActive]);

  const departmentMap = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [departments]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditingFullName(user.full_name);
    setEditingEmail(user.email);
    setEditingRole(user.role);
    setEditingDeptId(user.department_id ?? "");
    setEditingIsActive(user.is_active);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingFullName("");
    setEditingEmail("");
    setEditingRole("");
    setEditingDeptId("");
    setEditingIsActive(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      return;
    }

    setSaving(true);
    setUsersError(null);
    try {
      const payload = {
        full_name: newFullName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        role: newRole,
        department_id: newDeptId ? Number(newDeptId) : null,
      };
      const created = await createUser(payload);
      setUsers((prev) => [...prev, created]);
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("student");
      setNewDeptId("");
    } catch (err) {
      console.error(err);
      setUsersError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingFullName.trim() || !editingEmail.trim()) {
      return;
    }

    setSaving(true);
    setUsersError(null);
    try {
      const payload = {
        full_name: editingFullName.trim(),
        email: editingEmail.trim(),
        role: editingRole,
        department_id: editingDeptId ? Number(editingDeptId) : null,
        is_active: editingIsActive,
      };
      const updated = await updateUser(id, payload);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      cancelEdit();
    } catch (err) {
      console.error(err);
      setUsersError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    setSaving(true);
    setUsersError(null);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      setUsersError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Admin – Users
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
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Create form */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create User
          </h2>

          {usersError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
              {usersError}
            </p>
          )}

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <input
              type="text"
              placeholder="Full name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newDeptId}
                onChange={(e) => setNewDeptId(e.target.value)}
              >
                <option value="">No dept</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>

        {/* Filters + list */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Users</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <select
                className="border border-gray-300 rounded-lg px-2 py-1"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1"
                value={filterDeptId}
                onChange={(e) => setFilterDeptId(e.target.value)}
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
                <option value="">All</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <p className="text-sm text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">No users found.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const dept = departmentMap[user.department_id];
                const isEditing = editingId === user.id;

                return (
                  <div
                    key={user.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border border-gray-200 rounded-lg px-3 py-2 gap-2"
                  >
                    {isEditing ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingFullName}
                          onChange={(e) =>
                            setEditingFullName(e.target.value)
                          }
                        />
                        <input
                          type="email"
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingEmail}
                          onChange={(e) =>
                            setEditingEmail(e.target.value)
                          }
                        />
                        <select
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 border border-gray-300 rounded-lg px-2 py-1"
                            value={editingDeptId}
                            onChange={(e) =>
                              setEditingDeptId(e.target.value)
                            }
                          >
                            <option value="">No dept</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.code}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1 text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={editingIsActive}
                              onChange={(e) =>
                                setEditingIsActive(e.target.checked)
                              }
                            />
                            Active
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-800">
                          {user.full_name}{" "}
                          {!user.is_active && (
                            <span className="ml-2 text-xs text-red-500">
                              (inactive)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email} • {user.role}
                          {dept && ` • ${dept.code}`}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 text-xs">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdate(user.id)}
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
                            onClick={() => startEdit(user)}
                            className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            disabled={saving}
                            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
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

export default AdminUsersPage;
