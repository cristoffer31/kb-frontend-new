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

  useEffect(() => {
    obtenerConfiguracionPublica().then(data => {
        if (data) setConfig(data);
    });
  }, []);

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
        <div className="contacto-card-blue">
          <h3>Información de Contacto</h3>
          
          <div className="info-item">
            <div className="info-icon"><FaPhoneAlt /></div>
            <div>
              <p style={{opacity:0.8, fontSize:'0.85rem', margin:0, color:'white'}}>Llámanos</p>
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

          <div className="social-links">
            {config?.telefonoVentas && (
                <a href={`https://wa.me/${config.telefonoVentas}`} target="_blank" rel="noreferrer" className="social-btn" title="WhatsApp">
                    <FaWhatsapp />
                </a>
            )}
            {config?.facebookUrl && <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="social-btn"><FaFacebook /></a>}
            {config?.instagramUrl && <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="social-btn"><FaInstagram /></a>}
            {config?.tiktokUrl && <a href={config.tiktokUrl} target="_blank" rel="noreferrer" className="social-btn"><FaTiktok /></a>}
          </div>

          <div className="mapa-box">
            {config?.mapaUrl && (
                <div dangerouslySetInnerHTML={{__html: config.mapaUrl}} style={{width:'100%', height:'100%', overflow:'hidden', borderRadius:'10px'}} />
            )}
          </div>
        </div>

        <div className="form-card">
          <h3>Envíanos un mensaje</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Asunto</label>
                <input type="text" name="asunto" value={form.asunto} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Mensaje</label>
                <textarea name="mensaje" value={form.mensaje} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="btn-enviar" disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar Mensaje"}
            </button>
            {enviado && <div className="msg-exito">✅ ¡Mensaje enviado!</div>}
            {error && <div style={{marginTop:'20px', color:'red', textAlign:'center'}}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}