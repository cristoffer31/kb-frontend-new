import React, { useState, useContext, useEffect } from "react";
import api from "../services/api";
import "./Contacto.css";
import { AuthContext } from "../context/AuthContext"; // <--- IMPORTAR CONTEXTO
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";

export default function Contacto() {
  const { usuario } = useContext(AuthContext); // <--- OBTENER USUARIO
  
  const [form, setForm] = useState({ 
      nombre: "", 
      email: "", 
      asunto: "", 
      mensaje: "" 
  });
  
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // EFECTO: Llenar datos automáticamente si el usuario existe
  useEffect(() => {
      if (usuario) {
          setForm(prev => ({
              ...prev,
              nombre: usuario.nombre || "",
              email: usuario.email || ""
          }));
      }
  }, [usuario]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await api.post("/contacto", form);
      setEnviado(true);
      // Limpiamos solo asunto y mensaje, dejamos nombre/email
      setForm(prev => ({ ...prev, asunto: "", mensaje: "" }));
      
      setTimeout(() => setEnviado(false), 5000);

    } catch (err) {
      console.error(err);
      setError("Hubo un problema al enviar el mensaje. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contacto-page">
      <div className="contacto-header">
        <h1>Contáctanos</h1>
        <p>Estamos aquí para ayudarte con cualquier duda sobre tus pedidos.</p>
      </div>

      <div className="contacto-grid">
        
        {/* INFO IZQUIERDA (Igual que antes) */}
        <div className="contacto-card-blue">
          <h3>Información de Contacto</h3>
          <div className="info-item">
            <div className="info-icon"><FaPhoneAlt /></div>
            <div>
              <p style={{opacity:0.8, fontSize:'0.85rem', margin:0, color:'white'}}>Llámanos</p>
              <strong style={{color:'white'}}>+503 7000-0000</strong>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><FaEnvelope /></div>
            <div>
              <p style={{opacity:0.8, fontSize:'0.85rem', margin:0, color:'white'}}>Escríbenos</p>
              <strong style={{color:'white'}}>soporte@kbcollection.com</strong>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><FaMapMarkerAlt /></div>
            <div>
              <p style={{opacity:0.8, fontSize:'0.85rem', margin:0, color:'white'}}>Ubicación</p>
              <strong style={{color:'white'}}>San Salvador, El Salvador</strong>
            </div>
          </div>
          <div className="social-links">
            <a href="#" className="social-btn"><FaWhatsapp /></a>
            <a href="#" className="social-btn"><FaInstagram /></a>
            <a href="#" className="social-btn"><FaFacebook /></a>
          </div>
          <div className="mapa-box">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62014.20756706784!2d-89.24945934179688!3d13.698267200000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6330674f7b0a5d%3A0x821f00a4f7909f22!2sSan%20Salvador%2C%20El%20Salvador!5e0!3m2!1ses!2s!4v1700000000000!5m2!1ses!2s" 
                width="100%" height="100%" style={{border:0}} 
                allowFullScreen="" loading="lazy" 
                title="Mapa KB Collection"
            ></iframe>
          </div>
        </div>

        {/* FORMULARIO DERECHA */}
        <div className="form-card">
          <h3>Envíanos un mensaje</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                    type="text" 
                    name="nombre" 
                    value={form.nombre} 
                    onChange={handleChange} 
                    disabled // Bloqueado para que use su nombre real
                    style={{background:'#f3f4f6', cursor:'not-allowed'}}
                />
            </div>
            <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    disabled // Bloqueado para seguridad
                    style={{background:'#f3f4f6', cursor:'not-allowed'}}
                />
            </div>
            <div className="form-group">
                <label>Asunto</label>
                <input type="text" name="asunto" placeholder="¿En qué podemos ayudarte?" value={form.asunto} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Mensaje</label>
                <textarea name="mensaje" placeholder="Escribe los detalles aquí..." value={form.mensaje} onChange={handleChange} required></textarea>
            </div>

            <button type="submit" className="btn-enviar" disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar Mensaje"}
            </button>

            {enviado && <div className="msg-exito">✅ ¡Mensaje enviado!</div>}
            {error && <div style={{marginTop:'20px', padding:'15px', background:'#fee2e2', color:'#991b1b', borderRadius:'10px', textAlign:'center'}}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}