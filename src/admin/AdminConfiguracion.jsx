import React, { useEffect, useState } from "react";
import { obtenerConfiguracion, actualizarConfiguracion } from "./services/adminConfigService";
import { FaSave, FaStore, FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaFacebook, FaInstagram, FaTiktok, FaPhoneAlt, FaClock, FaMap, FaTruck } from "react-icons/fa";
import "./AdminConfiguracion.css";

export default function AdminConfiguracion() {
  const [form, setForm] = useState({
    nombreTienda: "",
    telefonoVentas: "",
    telefonoContacto: "",
    direccionTienda: "",
    emailContacto: "",
    costoEnvioBase: 0,
    horarios: "",
    mapaUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: ""
  });
  
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerConfiguracion().then(data => {
        if (data) {
            // CORRECCIÓN AQUÍ: Forzamos a que si viene null, se convierta en ""
            setForm({
                nombreTienda: data.nombreTienda || "",
                telefonoVentas: data.telefonoVentas || "",
                telefonoContacto: data.telefonoContacto || "",
                direccionTienda: data.direccionTienda || "",
                emailContacto: data.emailContacto || "",
                costoEnvioBase: data.costoEnvioBase || 0,
                horarios: data.horarios || "",
                mapaUrl: data.mapaUrl || "",
                facebookUrl: data.facebookUrl || "",
                instagramUrl: data.instagramUrl || "",
                tiktokUrl: data.tiktokUrl || ""
            });
        }
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("Guardando...");
    try {
        await actualizarConfiguracion(form);
        setMensaje("✅ Configuración actualizada con éxito.");
        setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
        setMensaje("❌ Error al guardar.");
    }
  };

  return (
    <div className="admin-config">
      <h2>⚙️ Configuración General</h2>
      
      <form onSubmit={handleSubmit} className="config-form-grid">
        
        {/* BLOQUE 1: DATOS TIENDA */}
        <div className="config-card">
            <h3><FaStore/> Información de la Tienda</h3>
            
            <div className="form-group">
                <label>Nombre de la Tienda</label>
                <input type="text" name="nombreTienda" value={form.nombreTienda} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label><FaPhoneAlt/> Teléfono Público</label>
                <input type="text" name="telefonoContacto" value={form.telefonoContacto} onChange={handleChange} placeholder="Ej: 2250-5555" />
            </div>

            <div className="form-group">
                <label><FaWhatsapp/> WhatsApp Ventas</label>
                <input type="text" name="telefonoVentas" value={form.telefonoVentas} onChange={handleChange} placeholder="Ej: 50370000000" />
            </div>

            <div className="form-group">
                <label><FaEnvelope/> Correo de Contacto</label>
                <input type="email" name="emailContacto" value={form.emailContacto} onChange={handleChange} />
            </div>
        </div>

        {/* BLOQUE 2: UBICACIÓN Y HORARIOS */}
        <div className="config-card">
            <h3><FaMapMarkerAlt/> Ubicación y Logística</h3>
            
            <div className="form-group">
                <label><FaClock/> Horarios de Atención</label>
                <input type="text" name="horarios" value={form.horarios} onChange={handleChange} placeholder="Ej: Lun-Vie 8am-5pm" />
            </div>

            <div className="form-group">
                <label><FaTruck/> Costo de Envío Base ($)</label>
                <input type="number" step="0.01" name="costoEnvioBase" value={form.costoEnvioBase} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Dirección Física</label>
                <textarea name="direccionTienda" value={form.direccionTienda} onChange={handleChange} rows="2"></textarea>
            </div>

            <div className="form-group">
                <label><FaMap/> Código Embed Google Maps (iframe)</label>
                <textarea 
                    name="mapaUrl" 
                    value={form.mapaUrl} 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder='Pega aquí el código <iframe src="..."> de Google Maps'
                    style={{fontSize:'0.8rem', fontFamily:'monospace'}}
                ></textarea>
            </div>
        </div>

        {/* BLOQUE 3: REDES SOCIALES */}
        <div className="config-card">
            <h3>🌐 Redes Sociales</h3>
            <div className="form-group"><label><FaFacebook/> Facebook</label><input type="text" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} /></div>
            <div className="form-group"><label><FaInstagram/> Instagram</label><input type="text" name="instagramUrl" value={form.instagramUrl} onChange={handleChange} /></div>
            <div className="form-group"><label><FaTiktok/> TikTok</label><input type="text" name="tiktokUrl" value={form.tiktokUrl} onChange={handleChange} /></div>
        </div>

        <div style={{gridColumn: '1 / -1', marginTop:'20px'}}>
            <button type="submit" className="btn-save-config"><FaSave/> Guardar Cambios</button>
            {mensaje && <span className="msg-config">{mensaje}</span>}
        </div>

      </form>
    </div>
  );
}