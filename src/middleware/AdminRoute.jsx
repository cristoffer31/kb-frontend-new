import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Si no está logueado → redirigir
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si no es admin → redirigir
  if (user.rol !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Si es admin → permitir acceso
  return children;
}
