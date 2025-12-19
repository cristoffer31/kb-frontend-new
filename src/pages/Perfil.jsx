import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfileApi } from "../services/authService";
import api from "../services/api"; 
import "./Perfil.css";
import { FaUser, FaLock, FaSave, FaKey } from "react-icons/fa";

export default function Perfil() {
  const { usuario, setUsuario } = useContext(AuthContext);
  
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  useEffect(() => {
    if (usuario) {
        setNombre(usuario.nombre || usuario.name || "");
        setEmail(usuario.email || "");
    }
  }, [usuario]);

  const handleOlvideClave = async () => {
    if (!email) return;
    if(!confirm("¿Enviar enlace de recuperación a tu correo?")) return;
    setEnviandoCorreo(true);
    try {
        await api.post("/auth/recuperar", { email }); 
        setMensaje({ texto: "✅ Enlace enviado con éxito.", tipo: "success" });
    } catch (error) {
        setMensaje({ texto: "❌ Error al enviar el correo.", tipo: "error" });
    } finally { setEnviandoCorreo(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    if (password && password !== confirmPassword) {
        setMensaje({ texto: "Las nuevas contraseñas no coinciden", tipo: "error" });
        return;
    }

    try {
        setCargando(true);
        const payload = { nombre, email };
        
        if (password) {
            payload.current_password = currentPassword;
            payload.password = password;
            payload.password_confirmation = confirmPassword;
        }

        // LLAMADA CORREGIDA: Usa el servicio que apunta a /auth/me
        const data = await updateProfileApi(payload); 
        
        if (setUsuario) setUsuario(data.usuario || data);

        setMensaje({ texto: "✅ Perfil actualizado correctamente", tipo: "success" });
        setPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
        
    } catch (error) {
        const d = error.response?.data;
        if (d?.errors) {
            const firstKey = Object.keys(d.errors)[0];
            setMensaje({ texto: "❌ " + d.errors[firstKey][0], tipo: "error" });
        } else {
            setMensaje({ texto: "❌ " + (d?.message || "Error al actualizar"), tipo: "error" });
        }
    } finally { setCargando(false); }
  };

  return (
    <div className="perfil-container">
      <h1 className="perfil-titulo">Mi Perfil</h1>
      <div className="perfil-grid">
        <div className="perfil-card">
            <div className="card-header">
                <FaUser className="icon-header"/>
                <h3>Información Personal</h3>
            </div>
            <form onSubmit={handleUpdate}>
                <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" value={email} disabled className="input-disabled" />
                </div>
                <div className="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
                </div>

                <div className="card-header mt-4">
                    <FaLock className="icon-header"/>
                    <h3>Cambiar Contraseña</h3>
                </div>
                <div className="form-group">
                    <label><FaKey style={{fontSize:'0.8rem'}}/> Contraseña Actual</label>
                    <input 
                        type="password" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)} 
                        required={password.length > 0}
                    />
                    <button type="button" className="link-olvide" onClick={handleOlvideClave} disabled={enviandoCorreo}>
                        {enviandoCorreo ? "Enviando..." : "¿Olvidaste tu contraseña actual?"}
                    </button>
                </div>
                <div className="form-grid-pass">
                    <div className="form-group">
                        <label>Nueva Contraseña</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Nueva</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                </div>

                {mensaje.texto && <div className={`alert-msg ${mensaje.tipo}`}>{mensaje.texto}</div>}
                <button type="submit" className="btn-save" disabled={cargando}>
                    {cargando ? "Guardando..." : <><FaSave /> Guardar Cambios</>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}