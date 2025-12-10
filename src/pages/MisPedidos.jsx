import React, { useEffect, useState } from "react";
import { listarMisPedidos } from "../services/pedidoService";
import { Link } from "react-router-dom";
import "./MisPedidos.css";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const data = await listarMisPedidos();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <div className="mis-pedidos-container"><p>Cargando...</p></div>;


  return (
    <div className="mis-pedidos-container">
      <h2>Historial de Compras</h2>

      {/* PROTECCIÓN: Verificamos que 'pedidos' sea un array antes de medir su longitud */}
      {!Array.isArray(pedidos) || pedidos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p>Aún no has realizado ninguna compra.</p>
          <a href="/productos" className="btn-primary" style={{textDecoration: "none", marginTop: "10px", display: "inline-block"}}>Ir a la tienda</a>
        </div>
      ) : (
        <div className="lista-pedidos">
          {/* PROTECCIÓN: Verificamos de nuevo antes de hacer map */}
          {pedidos.map((p) => (
            <div key={p.id} className="pedido-card">
              <div className="pedido-info">
                <h4>Pedido #{p.id}</h4>
                <p><strong>Método:</strong> {p.metodoPago}</p>
                <small>Ref: {p.paypalOrderId || "N/A"}</small>
              </div>

              <span className={`pedido-status status-${p.status ? p.status.toLowerCase() : 'pendiente'}`}>
                {p.status}
              </span>

              <div className="pedido-total">
                ${Number(p.total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}