import React, { useState, useContext, useEffect } from "react";
import api from "../services/api";
import { obtenerConfiguracionPublica } from "../services/configService";
import "./Contacto.css";
import { AuthContext } from "../context/AuthContext";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

export default function Contacto() {
  const { usuario } = useContext(AuthContext);
  const [config, setConfig] = useState(null);

  const [form, setForm] = useState({ 
      nombre: "", 
      email: "", 
      asunto: "", 
      mensaje: "" 
  });
  
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Cargar configuración
  useEffect(() => {
    obtenerConfiguracionPublica().then(data => {
        if (data) setConfig(data);
    });
  }, []);

  // Prellenar datos
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
        
        {/* INFO IZQUIERDA (DINÁMICA) */}
        <div className="contacto-card-blue">
          <h3>Información de Contacto</h3>
          
          <div className="info-item">
            <div className="info-icon"><FaPhoneAlt /></div>
            <div>
              <p style={{opacity:0.8, fontSize:'0.85rem', margin:0, color:'white'}}>Llámanos</p>
              {/* CAMBIO CLAVE: USA TELEFONO CONTACTO (TEXTO) */}
              <strong style={{color:'white'}}>{config ? config.telefonoContacto : "Cargando..."}</strong>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><FaEnvelope /></div>
            <div>
              <p style={{opacity:0.8, fontSize:'0.85rem', margin:0, color:'white'}}>Escríbenos</p>
              <strong style={{color:'white'}}>{config ? config.emailContacto : "Cargando..."}</strong>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><FaMapMarkerAlt /></div>
            <div>
              <p style={{opacity:0.8, fontSize:'0.85rem', margin:0, color:'white'}}>Ubicación</p>
              <strong style={{color:'white'}}>{config ? config.direccionTienda : "Cargando..."}</strong>
            </div>
          </div>

          {/* REDES SOCIALES */}
          <div className="social-links">
            {/* WHATSAPP USA TELEFONO VENTAS (LINK) */}
            {config?.telefonoVentas && (
                <a 
                    href={`https://wa.me/${config.telefonoVentas}`} 
                    target="_blank" rel="noreferrer" 
                    className="social-btn" title="WhatsApp"
                >
                    <FaWhatsapp />
                </a>
            )}
            
            {config?.facebookUrl && (
                <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="social-btn" title="Facebook">
                    <FaFacebook />
                </a>
            )}

            {config?.instagramUrl && (
                <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                    <FaInstagram />
                </a>
            )}

            {config?.tiktokUrl && (
                <a href={config.tiktokUrl} target="_blank" rel="noreferrer" className="social-btn" title="TikTok">
                    <FaTiktok />
                </a>
            )}
          </div>

          <div className="mapa-box">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15505.686622345678!2d-89.218191!3d13.692940!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f63306733220555%3A0x6d90e2920e03000!2sSan%20Salvador!5e0!3m2!1ses!2ssv!4v1600000000000!5m2!1ses!2ssv" 
                width="100%" height="100%" style={{border:0}} 
                allowFullScreen="" loading="lazy" 
                title="Mapa Tienda"
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
                    disabled={!!usuario}
                    required
                    style={usuario ? {background:'#f3f4f6', cursor:'not-allowed'} : {}}
                />
            </div>
            <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    disabled={!!usuario}
                    required
                    style={usuario ? {background:'#f3f4f6', cursor:'not-allowed'} : {}}
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