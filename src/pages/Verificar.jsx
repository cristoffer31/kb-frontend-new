import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css"; // Reusamos estilos

export default function Verificar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("Verificando...");

  useEffect(() => {
    if (!token) {
      setStatus("Token no válido.");
      return;
    }

    api.post("/auth/verificar", { token })
      .then(() => {
        setStatus("✅ ¡Cuenta verificada con éxito! Redirigiendo...");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        console.error(err);
        setStatus("❌ El enlace de verificación es inválido o ya fue usado.");
      });
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verificación de Cuenta</h2>
        <p className="auth-msg">{status}</p>
      </div>
    </div>
  );
}