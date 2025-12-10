import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfile } from "../services/authService";
import api from "../services/api"; // <--- IMPORTAR API
import "./Perfil.css";
import { FaUser, FaLock, FaSave, FaKey } from "react-icons/fa";

export default function Perfil() {
  const { usuario, setUsuario } = useContext(AuthContext);
  
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  
  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false); // Estado para el botón de olvido

  useEffect(() => {
    if (usuario) {
        setNombre(usuario.nombre || "");
        setEmail(usuario.email || "");
    }
  }, [usuario]);

  // --- NUEVA FUNCIÓN: Enviar correo de recuperación si olvidó la actual ---
  const handleOlvideClave = async () => {
    if (!email) return;
    
    if(!confirm("¿Quieres que te enviemos un enlace a tu correo para restablecer tu contraseña?")) {
        return;
    }

    setEnviandoCorreo(true);
    try {
        await api.post("/auth/forgot-password", { email });
        setMensaje({ texto: "✅ Hemos enviado un enlace de recuperación a tu correo.", tipo: "success" });
    } catch (error) {
        setMensaje({ texto: "❌ Error al enviar el correo.", tipo: "error" });
    } finally {
        setEnviandoCorreo(false);
    }
  };
  // ----------------------------------------------------------------------

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    if (password && password !== confirmPassword) {
        setMensaje({ texto: "Las nuevas contraseñas no coinciden", tipo: "error" });
        return;
    }
    if (password && !currentPassword) {
        setMensaje({ texto: "Debes ingresar tu contraseña actual para cambiarla", tipo: "error" });
        return;
    }

    try {
        setCargando(true);
        const datos = { nombre };
        
        if (password) {
            datos.password = password;
            datos.currentPassword = currentPassword;
        }

        const usuarioActualizado = await updateProfile(datos);
        
        if (setUsuario) setUsuario(usuarioActualizado);

        setMensaje({ texto: "✅ Perfil actualizado correctamente", tipo: "success" });
        setPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
        
    } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.error) {
            setMensaje({ texto: "❌ " + error.response.data.error, tipo: "error" });
        } else {
            setMensaje({ texto: "❌ Error al actualizar perfil", tipo: "error" });
        }
    } finally {
        setCargando(false);
    }
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

                {/* SECCIÓN SEGURIDAD */}
                <div className="card-header mt-4">
                    <FaLock className="icon-header"/>
                    <h3>Cambiar Contraseña</h3>
                </div>
                <p style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'15px'}}>
                    Llena estos campos <strong>solo si deseas cambiar tu clave</strong>.
                </p>

                <div className="form-group">
                    <label style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaKey style={{fontSize:'0.8rem'}}/> Contraseña Actual
                    </label>
                    <input 
                        type="password" 
                        placeholder="Tu contraseña actual..."
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)} 
                        required={password.length > 0}
                    />
                    {/* ENLACE PARA RECUPERAR CLAVE */}
                    <button 
                        type="button" 
                        className="link-olvide" 
                        onClick={handleOlvideClave}
                        disabled={enviandoCorreo}
                    >
                        {enviandoCorreo ? "Enviando..." : "¿Olvidaste tu contraseña actual?"}
                    </button>
                </div>

                <div className="form-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                    <div className="form-group">
                        <label>Nueva Contraseña</label>
                        <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Confirmar Nueva</label>
                        <input type="password" placeholder="Repite la nueva" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
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