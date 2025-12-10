// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import "./Auth.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    }
  } 

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Iniciar sesión</h2>
        <p>Ingresa con tu cuenta de KB COLLECTION</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-btn">
            Entrar
          </button>
        </form>
        
        <div style={{marginTop:'15px', textAlign:'center', fontSize:'0.9rem'}}>
           <Link to="/recuperar" style={{color:'#64748b', textDecoration:'none'}}>¿Olvidaste tu contraseña?</Link>
        </div>

        <p className="auth-footer-text">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}