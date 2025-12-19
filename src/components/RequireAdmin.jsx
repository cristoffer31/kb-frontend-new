import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function RequireAdmin({ children }) {
  const { isLogged, usuario, cargandoAuth } = useContext(AuthContext);
  const location = useLocation();

  // 1. Pantalla de carga mientras verificamos sesión
  if (cargandoAuth) {
      return (
        <div style={{
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: '#f8fafc',
            color: '#64748b'
        }}>
            Verificando permisos...
        </div>
      );
  }
  
  // 2. Si no hay usuario, mandar al login
  if (!isLogged || !usuario) {
      // 'state={{ from: location }}' sirve para que al loguearse regrese aquí
      return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verificación de Roles (Blindada)
  // Convertimos a mayúsculas para evitar errores si la BD guarda "admin" o "Admin"
  const rol = usuario.role ? usuario.role.toUpperCase() : "USER";

  if (rol !== "ADMIN" && rol !== "SUPER_ADMIN") {
      // Si está logueado pero no es admin, lo mandamos al inicio
      return <Navigate to="/" replace />;
  }

  // 4. Acceso concedido
  return children;
}