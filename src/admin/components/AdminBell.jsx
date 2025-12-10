import React, { useEffect, useState, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { obtenerConteoPendientes } from "../services/adminPedidoService"; // Fíjate que sube un nivel con ..
import { useNavigate } from "react-router-dom";
import "./AdminBell.css";

// Sonido de notificación
const AUDIO_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

export default function AdminBell() {
  const [pendientes, setPendientes] = useState(0);
  const [animar, setAnimar] = useState(false);
  const audioRef = useRef(new Audio(AUDIO_URL));
  const navigate = useNavigate();

  useEffect(() => {
    verificar();
    const intervalo = setInterval(verificar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  async function verificar() {
    try {
      const nuevoConteo = await obtenerConteoPendientes();
      setPendientes(prev => {
        if (nuevoConteo > prev && nuevoConteo > 0) {
            sonarAlerta();
        }
        return nuevoConteo;
      });
    } catch (e) {
      console.error("Error verificando notificaciones", e);
    }
  }

  const sonarAlerta = () => {
    setAnimar(true);
    audioRef.current.play().catch(e => console.log("Audio bloqueado", e));
    setTimeout(() => setAnimar(false), 1000);
  };

  return (
    <div 
        className={`admin-bell ${animar ? 'shaking' : ''}`} 
        onClick={() => navigate("/admin/pedidos")}
        title="Ver Pedidos Pendientes"
    >
      <FaBell className="bell-icon" />
      {pendientes > 0 && (
        <span className="bell-badge">{pendientes}</span>
      )}
    </div>
  );
}