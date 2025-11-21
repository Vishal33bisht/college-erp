// src/pages/AdminCoursesPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCurrentUser,
  fetchDepartments,
  fetchUsers,
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/api";
import { getToken } from "../auth";

const AdminCoursesPage = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [userError, setUserError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  // Filters
  const [filterDeptId, setFilterDeptId] = useState("");
  const [filterTeacherId, setFilterTeacherId] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  // Create form
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSemester, setNewSemester] = useState("");
  const [newCredits, setNewCredits] = useState("");
  const [newDeptId, setNewDeptId] = useState("");
  const [newTeacherId, setNewTeacherId] = useState("");

  // Editing
  const [editingId, setEditingId] = useState(null);
  const [editingCode, setEditingCode] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingSemester, setEditingSemester] = useState("");
  const [editingCredits, setEditingCredits] = useState("");
  const [editingDeptId, setEditingDeptId] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState("");

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

  // Load departments + teachers (meta)
  useEffect(() => {
    if (!me || me.role !== "admin") return;

    setLoadingMeta(true);

    Promise.all([
      fetchDepartments(),
      fetchUsers({ role: "teacher" }),
      fetchUsers({ role: "hod" }),
    ])
      .then(([deps, teachersOnly, hods]) => {
        setDepartments(deps);
        // merge teachers + HODs as potential course instructors
        const merged = [...teachersOnly, ...hods].filter(
          (u, index, self) => self.findIndex((x) => x.id === u.id) === index
        );
        setTeachers(merged);
        setLoadingMeta(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingMeta(false);
      });
  }, [me]);

  // Load courses with filters
  const loadCourses = () => {
    if (!me || me.role !== "admin") return;

    setLoadingCourses(true);
    setCoursesError(null);

    fetchCourses({
      departmentId: filterDeptId ? Number(filterDeptId) : undefined,
      teacherId: filterTeacherId ? Number(filterTeacherId) : undefined,
      semester: filterSemester || undefined,
    })
      .then((data) => {
        setCourses(data);
        setLoadingCourses(false);
      })
      .catch((err) => {
        console.error(err);
        setCoursesError(err.message || "Failed to load courses.");
        setLoadingCourses(false);
      });
  };

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, filterDeptId, filterTeacherId, filterSemester]);

  const departmentMap = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [departments]);

  const teacherMap = useMemo(() => {
    const map = {};
    teachers.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teachers]);

  const startEdit = (course) => {
    setEditingId(course.id);
    setEditingCode(course.code);
    setEditingName(course.name);
    setEditingDescription(course.description || "");
    setEditingSemester(course.semester || "");
    setEditingCredits(course.credits != null ? String(course.credits) : "");
    setEditingDeptId(course.department_id);
    setEditingTeacherId(course.teacher_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingCode("");
    setEditingName("");
    setEditingDescription("");
    setEditingSemester("");
    setEditingCredits("");
    setEditingDeptId("");
    setEditingTeacherId("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim() || !newDeptId || !newTeacherId) {
      return;
    }

    setSaving(true);
    setCoursesError(null);
    try {
      const payload = {
        code: newCode.trim(),
        name: newName.trim(),
        description: newDescription.trim() || null,
        semester: newSemester.trim() || null,
        credits: newCredits ? Number(newCredits) : null,
        department_id: Number(newDeptId),
        teacher_id: Number(newTeacherId),
      };
      const created = await createCourse(payload);
      setCourses((prev) => [...prev, created]);
      // reset form
      setNewCode("");
      setNewName("");
      setNewDescription("");
      setNewSemester("");
      setNewCredits("");
      setNewDeptId("");
      setNewTeacherId("");
    } catch (err) {
      console.error(err);
      setCoursesError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingCode.trim() || !editingName.trim()) return;

    setSaving(true);
    setCoursesError(null);
    try {
      const payload = {
        code: editingCode.trim(),
        name: editingName.trim(),
        description: editingDescription.trim() || null,
        semester: editingSemester.trim() || null,
        credits: editingCredits ? Number(editingCredits) : null,
        department_id: editingDeptId ? Number(editingDeptId) : null,
        teacher_id: editingTeacherId ? Number(editingTeacherId) : null,
      };
      const updated = await updateCourse(id, payload);
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      cancelEdit();
    } catch (err) {
      console.error(err);
      setCoursesError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }
    setSaving(true);
    setCoursesError(null);
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setCoursesError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
            Admin – Courses
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
            Create Course
          </h2>

          {coursesError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
              {coursesError}
            </p>
          )}

          {loadingMeta ? (
            <p className="text-sm text-gray-500">
              Loading departments and teachers...
            </p>
          ) : (
            <form
              onSubmit={handleCreate}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <input
                type="text"
                placeholder="Course code"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <input
                type="text"
                placeholder="Course name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Semester (e.g. SEM1)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSemester}
                onChange={(e) => setNewSemester(e.target.value)}
              />
              <input
                type="number"
                placeholder="Credits"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newDeptId}
                onChange={(e) => setNewDeptId(e.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} – {d.name}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newTeacherId}
                onChange={(e) => setNewTeacherId(e.target.value)}
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.role})
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                className="md:col-span-2 lg:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
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
          )}
        </div>

        {/* Filters + list */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Courses</h2>
            <div className="flex flex-wrap gap-2 text-sm">
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
                value={filterTeacherId}
                onChange={(e) => setFilterTeacherId(e.target.value)}
              >
                <option value="">All teachers</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Semester filter"
                className="border border-gray-300 rounded-lg px-2 py-1"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              />
            </div>
          </div>

          {loadingCourses ? (
            <p className="text-sm text-gray-500">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-gray-500">No courses found.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => {
                const dept = departmentMap[course.department_id];
                const teacher = teacherMap[course.teacher_id];
                const isEditing = editingId === course.id;

                return (
                  <div
                    key={course.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border border-gray-200 rounded-lg px-3 py-2 gap-2"
                  >
                    {isEditing ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingCode}
                          onChange={(e) => setEditingCode(e.target.value)}
                        />
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                        <select
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingDeptId}
                          onChange={(e) =>
                            setEditingDeptId(e.target.value)
                          }
                        >
                          <option value="">Select dept</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.code}
                            </option>
                          ))}
                        </select>
                        <select
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingTeacherId}
                          onChange={(e) =>
                            setEditingTeacherId(e.target.value)
                          }
                        >
                          <option value="">Select teacher</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.full_name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Semester"
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingSemester}
                          onChange={(e) =>
                            setEditingSemester(e.target.value)
                          }
                        />
                        <input
                          type="number"
                          placeholder="Credits"
                          className="border border-gray-300 rounded-lg px-2 py-1"
                          value={editingCredits}
                          onChange={(e) =>
                            setEditingCredits(e.target.value)
                          }
                        />
                        <textarea
                          placeholder="Description"
                          className="md:col-span-2 border border-gray-300 rounded-lg px-2 py-1"
                          rows={2}
                          value={editingDescription}
                          onChange={(e) =>
                            setEditingDescription(e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-800">
                          {course.code} – {course.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dept ? dept.code : "No dept"}{" "}
                          {teacher
                            ? `• ${teacher.full_name} (${teacher.role})`
                            : ""}
                          {course.semester && ` • ${course.semester}`}
                          {course.credits != null &&
                            ` • ${course.credits} credits`}
                        </p>
                        {course.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {course.description}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 text-xs">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdate(course.id)}
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
                            onClick={() => startEdit(course)}
                            className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(course.id)}
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

export default AdminCoursesPage;
