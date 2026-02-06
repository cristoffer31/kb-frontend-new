import React, { useEffect, useState } from "react";
import { obtenerConfiguracionPublica } from "../services/configService";
import { FaWhatsapp, FaTimes, FaPaperPlane, FaUserTie } from "react-icons/fa";
import "./WhatsAppButton.css";

export default function WhatsAppButton() {
  const [telefono, setTelefono] = useState("");
  const [isOpen, setIsOpen] = useState(false); 
  const [mensaje, setMensaje] = useState("");  

  useEffect(() => {
    obtenerConfiguracionPublica()
      .then((data) => {
        if (data && (data.telefonoVentas || data.telefono)) {
          const rawNum = data.telefonoVentas || data.telefono;
          setTelefono(rawNum.replace(/\D/g, ''));
        }
      })
      .catch((err) => console.error("Error cargando WhatsApp:", err));
  }, []);

  if (!telefono) return null;

  const toggleChat = () => setIsOpen(!isOpen);

const enviarMensaje = () => {
    const textoFinal = mensaje.trim() || "Hola, quisiera más información sobre sus productos.";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(textoFinal)}`;
    
    const width = 1000;
    const height = 650;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    window.open(
      url, 
      'WhatsAppChat', 
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
    
    setMensaje("");
    setIsOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') enviarMensaje();
  };

  return (
    <div className="whatsapp-widget-container">
      
      <div className={`whatsapp-chat-box ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-info">
            <FaWhatsapp className="header-icon" />
            <div>
              <h4>Atención al Cliente</h4>
              <p>Solemos responder en minutos</p>
            </div>
          </div>
          <button onClick={toggleChat} className="close-btn"><FaTimes /></button>
        </div>
        
        <div className="chat-body">
          <div className="message-bubble received">
            <div className="agent-avatar"><FaUserTie/></div>
            <div className="bubble-text">
              ¡Hola! 👋 Bienvenido a KB Collection.<br/>
              ¿En qué podemos ayudarte hoy?
            </div>
          </div>
        </div>

        <div className="chat-footer">
          <input 
            type="text" 
            placeholder="Escribe tu consulta..." 
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus={isOpen}
          />
          <button onClick={enviarMensaje} className="send-btn">
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {/* --- BOTÓN FLOTANTE REDONDO --- */}
      <button 
        className="whatsapp-float-btn" 
        onClick={toggleChat}
        title="Chatea con nosotros"
      >
        <FaWhatsapp size={35} />
        {/* Puntito rojo de notificación si el chat está cerrado */}
        {!isOpen && <span className="notification-dot">1</span>}
      </button>
    </div>
  );
}