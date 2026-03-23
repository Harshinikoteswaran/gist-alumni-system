import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}
