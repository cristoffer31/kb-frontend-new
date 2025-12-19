import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./Login.css"; 

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);

    try {
      await api.post("/auth/recuperar", { email: email.trim() });
      setMensaje("Enlace enviado. Por favor, revisa tu bandeja de entrada.");
    } catch (err) {
      setError(err.response?.data?.message || "Error al enviar el correo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Recuperar Cuenta</h2>
        {mensaje && <div className="error-msg success-msg"><FaCheckCircle /> {mensaje}</div>}
        {error && <div className="error-msg"><FaExclamationCircle /> {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Tu correo electrónico" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
        
        <div className="login-footer">
          <p onClick={() => navigate("/login")} className="forgot-pass" style={{ cursor: "pointer" }}>
            <FaArrowLeft /> Volver al Login
          </p>
        </div>
      </div>
    </div>
  );
}