import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext); // Esta función debe guardar el token en localStorage
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("verified") === "1") {
      setSuccessMsg("¡Cuenta verificada con éxito! Ya puedes iniciar sesión.");
      window.history.replaceState({}, document.title, "/login");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null); // Limpiamos mensajes anteriores
    setLoading(true);

    try {
      // 1. Llamamos a la función login del contexto
      const res = await login(email, password);

      // 2. Si llegamos aquí, el login fue exitoso. 
      // Verificamos que tengamos la respuesta necesaria.
      if (res && res.usuario) {
        setSuccessMsg("Acceso concedido. Redirigiendo...");
        
        // 3. Redirección inmediata según el rol
        if (res.usuario.role === "ADMIN" || res.usuario.role === "SUPER_ADMIN") {
          navigate("/admin/stats");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      // 4. Manejo de errores específico
      console.error("Error detallado:", err);

      if (err.response?.status === 403) {
        setError("Tu cuenta aún no ha sido verificada. Revisa tu correo.");
      } else if (err.response?.status === 401) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("Hubo un problema al conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <p className="subtitle">Bienvenido a KB Collection</p>

        {successMsg && (
          <div className="error-msg success-msg">
            <FaCheckCircle /> {successMsg}
          </div>
        )}

        {error && (
          <div className="error-msg">
            <FaExclamationCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <span onClick={() => navigate("/register")}>Regístrate aquí</span></p>
          <p className="forgot-pass" onClick={() => navigate("/auth/recuperar")}>Olvidé mi contraseña</p>
        </div>
      </div>
    </div>
  );
}