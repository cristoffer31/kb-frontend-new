import React, { useEffect, useState } from "react";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";
import { obtenerConfiguracionPublica } from "../services/configService"; 

export default function Footer() {
  const [config, setConfig] = useState(null);
  const year = new Date().getFullYear();

  // Cargar datos al montar el componente
  useEffect(() => {
    obtenerConfiguracionPublica()
      .then((data) => setConfig(data))
      .catch((err) => console.error("Error footer:", err));
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        
        {/* COLUMNA 1: LOGO */}
        <div className="footer-col">
          <h3 className="footer-logo">
            {config?.nombreTienda ? config.nombreTienda.toUpperCase() : "KB COLLECTION"}
          </h3>
          <p>
            Tienda en línea especializada en higiene, estilo y productos
            personales de calidad premium.
          </p>
          <p className="footer-copy">
            © {year} {config?.nombreTienda || "KB COLLECTION"}. Todos los derechos reservados.
          </p>
        </div>

        {/* COLUMNA 2: ENLACES */}
        <div className="footer-col">
          <h4>Explorar</h4>
          <a href="/">Inicio</a>
          <a href="/productos">Productos</a>
          <a href="/carrito">Mi carrito</a>
          <a href="/contacto">Contacto</a>
        </div>

        {/* COLUMNA 3: INFORMACIÓN (AQUÍ ESTÁ EL CAMBIO CLAVE) */}
        <div className="footer-col">
          <h4>Información</h4>
          
          <p style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <FaEnvelope style={{opacity:0.7}}/> 
            {config ? config.emailContacto : "Cargando..."}
          </p>
          
          {/* USAMOS EL TELÉFONO DE CONTACTO (Fijo/Llamadas) */}
          <p style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <FaPhoneAlt style={{opacity:0.7}}/> 
            {config ? config.telefonoContacto : "Cargando..."}
          </p>

           {config?.horarios && (
             <p style={{display:'flex', alignItems:'start', gap:'8px'}}>
                <FaClock style={{opacity:0.7, marginTop:'4px'}}/> 
                {config.horarios}
             </p>
          )}
          
          <p style={{display:'flex', alignItems:'start', gap:'8px'}}>
            <FaMapMarkerAlt style={{opacity:0.7, marginTop:'4px'}}/> 
            {config ? config.direccionTienda : "Cargando..."}
          </p>
        </div>

        {/* COLUMNA 4: REDES SOCIALES */}
        <div className="footer-col">
          <h4>Síguenos</h4>
          <div className="footer-socials">
            
            {config?.facebookUrl && (
                <a href={config.facebookUrl} target="_blank" rel="noreferrer" title="Facebook">
                  <FaFacebook />
                </a>
            )}
            
            {config?.instagramUrl && (
                <a href={config.instagramUrl} target="_blank" rel="noreferrer" title="Instagram">
                  <FaInstagram />
                </a>
            )}
            
            {config?.tiktokUrl && (
                <a href={config.tiktokUrl} target="_blank" rel="noreferrer" title="TikTok">
                  <FaTiktok />
                </a>
            )}
            
            {/* EL BOTÓN DE WHATSAPP SIGUE USANDO EL NÚMERO DE VENTAS */}
            {config?.telefonoVentas && (
                <a href={`https://wa.me/${config.telefonoVentas}`} target="_blank" rel="noreferrer" title="WhatsApp">
                  <FaWhatsapp />
                </a>
            )}

          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>Desarrollado con ❤️ por {config?.nombreTienda || "KB COLLECTION"}</span>
      </div>
    </footer>
  );
}