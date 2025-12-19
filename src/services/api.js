import axios from "axios";
import { API_URL } from "../config/constants";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Interceptor de Solicitud (Envía el Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuesta (Manejo de errores globales)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde con 401, el token ya no es válido
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o token inválido. Limpiando...");
      
      // Limpiamos los datos locales para evitar bucles
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirigimos al login solo si no estamos ya en la página de login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;