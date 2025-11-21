import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDepartmentsPage from "./pages/AdminDepartmentsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminCoursesPage from "./pages/AdminCoursesPage"; // NEW
import TeacherCoursesPage from "./pages/TeacherCoursesPage";
import TeacherCourseDetailPage from "./pages/TeacherCourseDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute>
              <AdminDepartmentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <AdminCoursesPage />
            </ProtectedRoute>
          }
        />
<Route
  path="/teacher/courses"
  element={
    <ProtectedRoute>
      <TeacherCoursesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/teacher/courses/:courseId"
  element={
    <ProtectedRoute>
      <TeacherCourseDetailPage />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
