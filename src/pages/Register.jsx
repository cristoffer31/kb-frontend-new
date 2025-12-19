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
  const [telefono, setTelefono] = useState("");
  
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    try {
      await register(nombre, email, password, telefono);
      setOk("Registro exitoso. Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Error registro:", err);

      // --- MANEJO DE ERRORES LARAVEL ---
      if (err.response && err.response.data) {
        const d = err.response.data;
        
        // 1. Mensaje directo
        if (d.message) {
            // Si hay errores de campos específicos (ValidationException)
            if (d.errors) {
                const firstKey = Object.keys(d.errors)[0];
                setError(d.errors[firstKey][0]); // Muestra: "El campo email ya ha sido registrado"
            } else {
                setError(d.message);
            }
        } else if (d.error) {
            setError(d.error);
        } else {
            setError("Datos inválidos. Revisa la información.");
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
            type="text" 
            placeholder="Teléfono" 
            value={telefono} 
            onChange={(e) => setTelefono(e.target.value)} 
            required 
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