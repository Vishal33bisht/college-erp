// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { getToken } from "../auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
