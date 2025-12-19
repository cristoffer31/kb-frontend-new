import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaExclamationCircle, FaCheckCircle, FaLock } from "react-icons/fa";
import "./Login.css";

export default function Restablecer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Capturamos los datos que vienen en la URL del correo
  const query = new URLSearchParams(location.search);
  const tokenFromUrl = query.get("token") || "";
  const emailFromUrl = query.get("email") || "";

  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/restablecer", {
        token: tokenFromUrl,
        email: emailFromUrl,
        password: password,
        password_confirmation: password_confirmation,
      });

      alert("¡Contraseña restablecida correctamente!");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const validationErrors = err.response.data.errors;
        setError(Object.values(validationErrors).flat()[0]);
      } else {
        setError(err.response?.data?.message || "Error al procesar la solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Nueva Contraseña</h2>
        <p className="subtitle">Establece tu nueva clave para <b>{emailFromUrl}</b></p>

        {error && <div className="error-msg"><FaExclamationCircle /> {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña (mín. 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={password_confirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Restablecer Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}