import React, { useState } from 'react';
import api from '../services/api'; 
import { FaCreditCard } from 'react-icons/fa';

const WompiButton = ({ monto }) => {
  const [loading, setLoading] = useState(false);

  const handlePago = async () => {
    setLoading(true);
    try {
      // 1. Pedimos el link a nuestro Backend
      const { data } = await api.post('/wompi/link', { monto });
      
      if (data.url_pago) {
        // 2. Redirigimos al cliente a la página segura de Wompi SV
        window.location.href = data.url_pago;
      } else {
        alert("No se recibió la URL de pago");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con Wompi El Salvador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePago} 
      disabled={loading}
      className="btn-pago-bac"
      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
    >
      <FaCreditCard />
      {loading ? "Generando Link..." : `Pagar $${parseFloat(monto).toFixed(2)}`}
    </button>
  );
};

export default WompiButton;