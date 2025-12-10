// src/components/RequireAuth.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function RequireAuth({ children }) {
  const { isLogged, cargandoAuth } = useContext(AuthContext);

  if (cargandoAuth) return <div>Cargando...</div>;
  if (!isLogged) return <Navigate to="/login" replace />;

  return children;
}
