import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./Auth.css"; 

export default function Verificar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // A veces la ruta es /verificar/:id/:hash, a veces es query params.
  // Asumiremos que el link del correo lleva a /verificar-email con query params completos
  // URL esperada del front: http://tusitio.com/verificar?verify_url=... (Encodeada)
  // O MÁS COMÚN: Laravel envía un link al backend, y el backend redirige al front con status=verified.
  
  // ESTRATEGIA: Si Laravel envía una URL firmada (signed url), debemos enviarla tal cual de regreso al backend
  // O extraer ID y Hash de los query params si configuraste el front así.

  // Vamos a asumir que tu App.jsx tiene ruta: path="/verify-email/:id/:hash"
  const { id, hash } = useParams(); 
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");
  
  const [status, setStatus] = useState("Verificando tu cuenta...");

  useEffect(() => {
    // Si no hay parámetros en la URL, algo anda mal
    if (!id || !hash || !expires || !signature) {
      setStatus("Enlace incompleto o inválido.");
      return;
    }

    // Construimos la URL de verificación para enviarla al backend
    // Laravel espera una petición a /email/verify/{id}/{hash}?expires=...&signature=...
    const verifyUrl = `/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;

    api.get(verifyUrl)
      .then(() => {
        setStatus("✅ ¡Cuenta verificada con éxito! Redirigiendo...");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        console.error(err);
        setStatus("❌ El enlace de verificación es inválido o ha expirado.");
      });
  }, [id, hash, expires, signature, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Verificación de Cuenta</h2>
        <p className="auth-msg" style={{fontSize:'1.1rem', fontWeight:'bold', marginTop:'20px'}}>
            {status}
        </p>
      </div>
    </div>
  );
}