import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function RequireAdmin({ children }) {
  const { isLogged, usuario, cargandoAuth } = useContext(AuthContext);

  if (cargandoAuth) return <div>Cargando...</div>;
  
  if (!isLogged) return <Navigate to="/login" replace />;

  // AHORA PERMITIMOS AMBOS ROLES
  if (usuario.role !== "ADMIN" && usuario.role !== "SUPER_ADMIN") {
      return <Navigate to="/" replace />;
  }

  return children;
}