import React, { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./Auth.css"; // Usa tus estilos bonitos

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("Enviando...");
    try {
      await api.post("/auth/forgot-password", { email });
      setMensaje("✅ Si el correo existe, hemos enviado un enlace.");
    } catch (error) {
      setMensaje("❌ Error al conectar con el servidor.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Recuperar Cuenta</h2>
        <p>Te enviaremos un enlace a tu correo para restablecer tu contraseña.</p>
        {mensaje && <div className="auth-ok">{mensaje}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="email" placeholder="Ingresa tu correo" value={email} onChange={e => setEmail(e.target.value)} required />
          <button className="auth-btn">Enviar enlace</button>
        </form>
        <div className="auth-footer-text">
           <Link to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}