import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

export default function Restablecer() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { token, password });
      setMensaje("✅ ¡Contraseña actualizada! Redirigiendo...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMensaje("❌ El enlace ha expirado o es inválido.");
    }
  };

  if (!token) return <div className="auth-page"><div className="auth-card"><p>Enlace no válido.</p></div></div>;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Nueva Contraseña</h2>
        <p>Ingresa tu nueva clave segura.</p>
        {mensaje && <div className="auth-ok">{mensaje}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="password" placeholder="Nueva contraseña" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}/>
          <button className="auth-btn">Cambiar contraseña</button>
        </form>
      </div>
    </div>
  );
}