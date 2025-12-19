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
      const lista = data?.data || (Array.isArray(data) ? data : []);
      setPedidos(lista);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setCargando(false);
    }
  }

  // --- CÁLCULO SEGURO DEL SUBTOTAL ---
  const calcularSubtotal = (pedido) => {
    if (!pedido.items_relacion) return 0;
    return pedido.items_relacion.reduce((acc, it) => {
      return acc + (Number(it.precio_unitario || 0) * Number(it.cantidad || 0));
    }, 0);
  };

  if (cargando) return <div className="mis-pedidos-container"><p>Cargando compras...</p></div>;

  return (
    <div className="mis-pedidos-container">
      <h2>Mi Historial de Compras</h2>

      {pedidos.length === 0 ? (
        <div className="sin-pedidos">
          <p>No tienes pedidos registrados.</p>
          <Link to="/productos" className="btn-primary">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="lista-pedidos">
          {pedidos.map((p) => {
            // --- CÁLCULOS DENTRO DEL MAP PARA EVITAR ERRORES DE REFERENCIA ---
            const subtotal = calcularSubtotal(p);
            const envio = Number(p.costo_envio) || 0;
            const totalPagado = Number(p.total) || 0;
            
            // Calculamos cuánto fue el descuento realmente aplicado (Monto en dinero)
            const descuentoMonto = Number(p.descuento) || 0;
            
            return (
              <div key={p.id} className="pedido-card-mejorada">
                <div className="pedido-header">
                  <div>
                    <h4>Pedido #{p.id}</h4>
                    <small className="pedido-fecha">{new Date(p.created_at).toLocaleDateString()}</small>
                  </div>
                  <span className={`pedido-status status-${(p.estado || 'pendiente').toLowerCase()}`}>
                    {p.estado}
                  </span>
                </div>

                <div className="pedido-productos">
                  {p.items_relacion?.map((item, idx) => (
                    <div key={idx} className="producto-fila">
                      <span>{item.product?.nombre} (x{item.cantidad})</span>
                      <span>${(Number(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pedido-desglose">
                  <div className="desglose-fila">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {/* AQUÍ SE MUESTRA EL MONTO DEL DESCUENTO EN ROJO */}
                  {descuentoMonto > 0 && (
                    <div className="desglose-fila descuento" style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                      <span>Cupón ({p.codigo_cupon || 'KB2025'}):</span>
                      <span>- ${descuentoMonto.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="desglose-fila">
                    <span>Envío:</span>
                    <span>${envio.toFixed(2)}</span>
                  </div>

                  <div className="desglose-fila total">
                    <span>Total Neto Pagado:</span>
                    <span>${totalPagado.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pedido-footer">
                  <small>Pago: {p.metodo_pago} | Transacción: {p.paypal_order_id || 'N/A'}</small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}