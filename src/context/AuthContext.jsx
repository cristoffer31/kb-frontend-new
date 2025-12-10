import React, { createContext, useEffect, useState } from "react";
import { loginApi, meApi, registerApi } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    async function cargarUsuario() {
      const token = localStorage.getItem("token");
      if (!token) {
        setCargandoAuth(false);
        return;
      }

      try {
        const user = await meApi();
        setUsuario(user);
      } catch (e) {
        console.error("Error cargando sesión", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setCargandoAuth(false);
      }
    }
    cargarUsuario();
  }, []);

  async function login(email, password) {
    const data = await loginApi(email, password);
    localStorage.setItem("token", data.token);
    
    const user = data.usuario;
    localStorage.setItem("user", JSON.stringify(user));
    setUsuario(user);
  }

  async function register(nombre, email, password) {
    await registerApi(nombre, email, password);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsuario(null);
  }

  // --- CORRECCIÓN: AMBOS ROLES SON ADMIN ---
  const esAdmin = usuario?.role === "ADMIN" || usuario?.role === "SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        cargandoAuth,
        login,
        register,
        logout,
        isLogged: !!usuario,
        isAdmin: esAdmin, // <--- Esto permitirá el acceso a las rutas protegidas
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}