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
        // Limpieza total si el token es inválido
        localStorage.clear();
      } finally {
        setCargandoAuth(false);
      }
    }
    cargarUsuario();
  }, []);

  async function login(email, password) {
    try {
      const data = await loginApi(email, password);
      
      // 1. Guardar en Storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      
      // 2. Actualizar estado global INMEDIATAMENTE
      setUsuario(data.usuario);

      // 3. IMPORTANTE: Retornar la data para que el componente Login pueda navegar
      return data; 
    } catch (error) {
      // Propagamos el error para que el componente Login lo capture en su 'catch'
      throw error;
    }
  }

  async function register(nombre, email, password, telefono) {
    return await registerApi(nombre, email, password, telefono);
  }

  function logout() {
    localStorage.clear();
    setUsuario(null);
    // Opcional: Redirigir al inicio tras logout
    window.location.href = "/login";
  }

  const esAdmin = usuario?.role === "ADMIN" || usuario?.role === "SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        usuario,      // Ahora disponible como 'usuario' o 'user' dependiendo de cómo lo llames
        user: usuario, // Alias para compatibilidad con RequireAuth
        setUsuario,
        cargandoAuth,
        login,
        register,
        logout,
        isLogged: !!usuario,
        isAdmin: esAdmin,
      }}
    >
      {!cargandoAuth && children} 
    </AuthContext.Provider>
  );
}