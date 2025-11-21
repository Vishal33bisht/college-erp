// src/services/api.js

import { getToken } from "../auth";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let detail = `Login failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) {
        detail = data.detail;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(detail);
  }

  return response.json(); // { access_token, token_type }
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`);
  }

  return response.json(); // UserRead
}

// --------- Auth header helper ----------

function getAuthHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// --------- Department APIs ----------

export async function fetchDepartments() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/departments/`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch departments: ${response.status}`);
  }

  return response.json(); // DepartmentRead[]
}

export async function createDepartment({ name, code }) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/departments/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, code }),
  });

  if (!response.ok) {
    let detail = `Failed to create department: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json(); // DepartmentRead
}

export async function updateDepartment(id, payload) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `Failed to update department: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json(); // DepartmentRead
}

export async function deleteDepartment(id) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok && response.status !== 204) {
    let detail = `Failed to delete department: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }
}

// --------- User APIs ----------

export async function fetchUsers({ role, departmentId, isActive } = {}) {
  const headers = getAuthHeaders();

  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (departmentId) params.append("department_id", String(departmentId));
  if (typeof isActive === "boolean") params.append("is_active", String(isActive));

  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`${API_BASE_URL}/users/${query}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  return response.json(); // UserRead[]
}

export async function createUser(payload) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `Failed to create user: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json(); // UserRead
}

export async function updateUser(id, payload) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `Failed to update user: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json(); // UserRead
}

export async function deleteUser(id) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok && response.status !== 204) {
    let detail = `Failed to delete user: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }
}
// --------- Course APIs ----------

export async function fetchCourses({ departmentId, teacherId, semester } = {}) {
  const headers = getAuthHeaders();

  const params = new URLSearchParams();
  if (departmentId) params.append("department_id", String(departmentId));
  if (teacherId) params.append("teacher_id", String(teacherId));
  if (semester) params.append("semester", semester);

  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`${API_BASE_URL}/courses/${query}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.status}`);
  }

  return response.json(); // CourseRead[]
}

export async function createCourse(payload) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/courses/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `Failed to create course: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json(); // CourseRead
}

export async function updateCourse(id, payload) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `Failed to update course: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json(); // CourseRead
}

export async function deleteCourse(id) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok && response.status !== 204) {
    let detail = `Failed to delete course: ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }
}
// --------- Teacher APIs ----------

export async function fetchMyTeacherCourses() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch teacher courses: ${response.status}`);
  }

  return response.json(); // CourseRead[]
}
// Single course by id (any authenticated user can view)
export async function fetchCourseById(id) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch course: ${response.status}`);
  }

  return response.json(); // CourseRead
}

// Enrolled students for a course (teacher/hod only)
export async function fetchEnrolledStudentsForCourse(courseId) {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/teacher/courses/${courseId}/students`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch enrolled students: ${response.status}`
    );
  }

  return response.json(); // UserRead[]
}
