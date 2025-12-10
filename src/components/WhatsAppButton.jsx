import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { obtenerConfiguracionPublica } from "../services/configService";
import "./WhatsAppButton.css";

export default function WhatsAppButton() {
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    // Obtenemos el número configurado en el panel
    obtenerConfiguracionPublica()
      .then((data) => {
        if (data && data.telefonoVentas) {
          setTelefono(data.telefonoVentas);
        }
      })
      .catch((err) => console.error("Error cargando WhatsApp:", err));
  }, []);

  // Si no hay teléfono configurado, no mostramos nada
  if (!telefono) return null;

  return (
    <a
      href={`https://wa.me/${telefono}?text=Hola,%20quisiera%20más%20información%20sobre%20sus%20productos.`}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      title="¡Chatea con nosotros!"
    >
      <FaWhatsapp />
    </a>
  );
}