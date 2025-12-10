import React, { useEffect, useState } from "react";
import {
  adminListarPedidos,
  adminActualizarEstado,
  adminObtenerPedido,
} from "./services/adminPedidoService";

import "./AdminPedidos.css";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState(null);

  async function cargar() {
    try {
      const data = await adminListarPedidos();
      if (Array.isArray(data)) {
        setPedidos(data);
      } else {
        setPedidos([]);
      }
    } catch (e) {
      console.error("Error cargando pedidos", e);
      setPedidos([]);
    }
  }

  async function verDetalle(id) {
    try {
      const data = await adminObtenerPedido(id);
      setDetalle(data);
    } catch (e) {
      console.error("Error cargando detalle", e);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await adminActualizarEstado(id, estado);
      cargar();
    } catch (e) {
      console.error("Error actualizando estado", e);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function filtrarPedidos() {
    if (!Array.isArray(pedidos)) return [];

    return pedidos
      .filter((p) =>
        filtro === "TODOS" ? true : p.status?.toUpperCase() === filtro
      )
      .filter((p) =>
        busqueda === ""
          ? true
          : p.id.toString().includes(busqueda) ||
            (p.usuario && p.usuario.nombre && p.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      );
  }

  const listaFiltrada = filtrarPedidos();

  return (
    <div className="admin-pedidos">
      <h2>📦 Gestión de pedidos</h2>

      {/* BARRA DE FILTROS */}
      <div className="pedidos-filtros">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="TODOS">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="ENVIADO">Enviados</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>

        <div className="buscador">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por ID o cliente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE PEDIDOS */}
      <table className="tabla-pedidos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {listaFiltrada.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No se encontraron pedidos.
              </td>
            </tr>
          ) : (
            listaFiltrada.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.usuario?.nombre || "Cliente"}</td>
                <td>${p.total ? p.total.toFixed(2) : "0.00"}</td>
                <td>
                  <span className={`badge-pedido estado-${p.status ? p.status.toLowerCase() : "pendiente"}`}>
                    {p.status || "PENDIENTE"}
                  </span>
                </td>
                <td>{p.fecha ? new Date(p.fecha).toLocaleDateString() : "-"}</td>
                <td>
                  <button className="btn-ver" onClick={() => verDetalle(p.id)}>
                    Ver detalle
                  </button>

                  <select
                    className="select-estado"
                    value={p.status || "PENDIENTE"}
                    onChange={(e) => cambiarEstado(p.id, e.target.value)}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="ENTREGADO">Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL CON DETALLE COMPLETO (GPS Y COSTOS) */}
      {detalle && (
        <div className="modal-pedido">
          <div className="modal-card">
            <h3>Pedido #{detalle.id} - Detalles</h3>

            <div className="modal-grid">
                {/* Columna Izquierda: Datos Cliente */}
                <div className="info-col">
                    <h4>👤 Cliente</h4>
                    <p><strong>Nombre:</strong> {detalle.usuario?.nombre}</p>
                    <p><strong>Email:</strong> {detalle.usuario?.email}</p>
                    <p><strong>ID PayPal:</strong> <span style={{fontSize:'0.85rem', color:'#666'}}>{detalle.paypalOrderId || "N/A"}</span></p>
                </div>
                {/* NUEVO: MOSTRAR TIPO DE COMPROBANTE */}
    <div style={{marginTop:'10px', padding:'10px', background:'#1e293b', borderRadius:'6px', borderLeft: detalle.tipoComprobante === "CREDITO_FISCAL" ? '4px solid #facc15' : '4px solid #38bdf8'}}>
        <p style={{color:'white', fontWeight:'bold', margin:'0 0 5px 0'}}>
            {detalle.tipoComprobante === "CREDITO_FISCAL" ? "🏢 CRÉDITO FISCAL" : "👤 CONSUMIDOR FINAL"}
        </p>
        
        {detalle.tipoComprobante === "CREDITO_FISCAL" && (
            <div style={{fontSize:'0.85rem', color:'#cbd5e1'}}>
                <p style={{margin:'2px 0'}}><strong>Empresa:</strong> {detalle.razonSocial}</p>
                <p style={{margin:'2px 0'}}><strong>NIT:</strong> {detalle.documentoFiscal}</p>
                <p style={{margin:'2px 0'}}><strong>NRC:</strong> {detalle.nrc}</p>
                <p style={{margin:'2px 0'}}><strong>Giro:</strong> {detalle.giro}</p>
            </div>
        )}
    </div>

                {/* Columna Derecha: Datos Envío */}
                <div className="info-col">
                    <h4>📍 Envío</h4>
                    <p><strong>Depto:</strong> {detalle.departamento || "No especificado"}</p>
                    <div className="direccion-box">
                        <strong>Dirección:</strong>
                        <p>{detalle.direccion}</p>
                    </div>
                    
                    {/* BOTÓN GPS */}
                    {detalle.coordenadas ? (
                        <a 
                            href={detalle.coordenadas} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-gps-link"
                        >
                            <FaMapMarkerAlt /> Ver ubicación en Mapa
                        </a>
                    ) : (
                        <span className="no-gps">Sin ubicación GPS</span>
                    )}
                </div>
            </div>

            {/* Lista de Productos */}
            <h4>🛒 Productos</h4>
            <ul className="lista-productos-modal">
              {detalle.items && detalle.items.map((item, index) => (
                <li key={index}>
                  <span>{item.producto?.nombre || "Producto"} <small>x{item.cantidad}</small></span>
                  <span>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            {/* Totales */}
            <div className="modal-totales">
                <div className="fila-total">
                    <span>Subtotal:</span>
                    <span>${(detalle.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="fila-total">
                    <span>Envío:</span>
                    <span>${(detalle.costoEnvio || 0).toFixed(2)}</span>
                </div>
                {detalle.descuento > 0 && (
                    <div className="fila-total descuento">
                        <span>Descuento:</span>
                        <span>-${detalle.descuento.toFixed(2)}</span>
                    </div>
                )}
                <div className="fila-total final">
                    <span>Total:</span>
                    <span>${(detalle.total || 0).toFixed(2)}</span>
                </div>
            </div>

            <button className="btn-cerrar" onClick={() => setDetalle(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}