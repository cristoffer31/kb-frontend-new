import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }) {
  const token = localStorage.getItem("token");

  // Si no hay token → mandar al login
  if (!token) return <Navigate to="/login" replace />;

  return children;
}
