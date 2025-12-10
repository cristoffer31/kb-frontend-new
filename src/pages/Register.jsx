// src/pages/Register.jsx
import React, { useState, useContext } from "react";
import "./Auth.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    try {
      await register(nombre, email, password);
      setOk("Registro exitoso. Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Error de registro:", err);

      // --- LÓGICA PARA LEER EL ERROR REAL ---
      if (err.response && err.response.data) {
        // 1. Error personalizado del backend (ej: "El correo ya existe")
        if (err.response.data.error) {
            setError(err.response.data.error);
        } 
        // 2. Error de validación de Quarkus (ej: Contraseña corta)
        else if (err.response.data.parameterViolations) {
            const msg = err.response.data.parameterViolations[0].message;
            setError(msg);
        }
        // 3. Otros errores
        else {
            setError("Datos inválidos. Revisa que el correo y contraseña sean correctos.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Crear cuenta</h2>

        {error && <div className="auth-error">{error}</div>}
        {ok && <div className="auth-ok">{ok}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Nombre completo"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-btn">
            Registrarme
          </button>
        </form>

        <div className="auth-footer-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}