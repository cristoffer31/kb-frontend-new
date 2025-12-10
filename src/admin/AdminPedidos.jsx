import React, { useEffect, useState } from "react";
import {
  adminListarPedidos,
  adminActualizarEstado,
  adminObtenerPedido,
} from "./services/adminPedidoService";

import "./AdminPedidos.css";
import { FaSearch, FaMapMarkerAlt, FaWhatsapp, FaPrint, FaCalendarAlt } from "react-icons/fa";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  
  // --- NUEVOS ESTADOS PARA FECHA ---
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
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

  // --- FUNCIÓN DE FILTRADO MEJORADA ---
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
      )
      .filter((p) => {
        // Filtro por rango de fechas
        if (!fechaInicio && !fechaFin) return true;
        if (!p.fecha) return false;
        
        // Convertimos la fecha del pedido a YYYY-MM-DD para comparar
        const fechaPedido = new Date(p.fecha).toISOString().split('T')[0];
        
        const cumpleInicio = !fechaInicio || fechaPedido >= fechaInicio;
        const cumpleFin = !fechaFin || fechaPedido <= fechaFin;
        
        return cumpleInicio && cumpleFin;
      });
  }

  const listaFiltrada = filtrarPedidos();

  // --- FUNCIÓN WHATSAPP ---
  const enviarNotificacion = (pedido) => {
    // Busca teléfono en el pedido (nuevo) o en el usuario (viejo)
    const tel = pedido.telefono || pedido.usuario?.telefono;
    
    if (!tel) return alert("Este pedido no tiene número de teléfono asociado.");

    let mensaje = `Hola ${pedido.usuario?.nombre || "Cliente"}, saludamos de KB Collection. `;
    
    if (pedido.status === "ENVIADO") {
      mensaje += `Le informamos que su pedido #${pedido.id} ya fue enviado y va en camino. 🚚`;
    } else if (pedido.status === "ENTREGADO") {
      mensaje += `Su pedido #${pedido.id} ha sido entregado. ¡Gracias por su compra! ⭐`;
    } else {
      mensaje += `Tenemos una actualización sobre su pedido #${pedido.id}.`;
    }

    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  // --- FUNCIÓN IMPRIMIR ---
  const imprimirPedido = (pedido) => {
    const ventana = window.open('', 'PRINT', 'height=600,width=800');
    
    ventana.document.write(`
      <html>
        <head>
          <title>Pedido #${pedido.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; }
            h1 { text-align: center; margin-bottom: 5px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border-bottom: 1px solid #ddd; padding: 5px; text-align: left; font-size: 12px; }
            .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KB COLLECTION</h1>
            <p>San Salvador, El Salvador</p>
            <p>Tel: +503 7000-0000</p>
          </div>
          
          <p><strong>Pedido:</strong> #${pedido.id}</p>
          <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
          <p><strong>Cliente:</strong> ${pedido.usuario?.nombre}</p>
          <p><strong>Tel:</strong> ${pedido.telefono || pedido.usuario?.telefono || 'N/A'}</p>
          <p><strong>Dirección:</strong> ${pedido.direccion}</p>
          
          ${pedido.tipoComprobante === 'CREDITO_FISCAL' ? `
            <div style="border: 1px solid #000; padding: 5px; margin: 5px 0;">
                <strong>DATOS FISCALES</strong><br/>
                Razon Social: ${pedido.razonSocial}<br/>
                NIT: ${pedido.documentoFiscal}<br/>
                NRC: ${pedido.nrc}<br/>
                Giro: ${pedido.giro}
            </div>
          ` : ''}
          
          <table>
            <thead><tr><th>Cant.</th><th>Producto</th><th>Total</th></tr></thead>
            <tbody>
              ${pedido.items.map(item => `
                <tr>
                  <td>${item.cantidad}</td>
                  <td>${item.producto?.nombre}</td>
                  <td>$${(item.precioUnitario * item.cantidad).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            Subtotal: $${pedido.subtotal.toFixed(2)}<br/>
            Envío: $${pedido.costoEnvio.toFixed(2)}<br/>
            ${pedido.descuento > 0 ? `Descuento: -$${pedido.descuento.toFixed(2)}<br/>` : ''}
            TOTAL: $${pedido.total.toFixed(2)}
          </div>

          <div class="footer">
            ¡Gracias por su preferencia!<br/>
            www.kbcollection.com
          </div>
        </body>
      </html>
    `);
    
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
        ventana.print();
        ventana.close();
    }, 500);
  };

  return (
    <div className="admin-pedidos">
      <h2>📦 Gestión de pedidos</h2>

      {/* BARRA DE FILTROS */}
      <div className="pedidos-filtros">
        
        {/* Filtro Estado */}
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="TODOS">Todos los Estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="ENVIADO">Enviados</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>

        {/* Filtro Fechas */}
        <div style={{display:'flex', alignItems:'center', gap:'5px', background:'#020617', padding:'5px 10px', borderRadius:'20px', border:'1px solid #334155'}}>
            <FaCalendarAlt style={{color:'#94a3b8'}}/>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{background:'transparent', border:'none', color:'white', fontSize:'0.85rem'}} />
            <span style={{color:'#94a3b8'}}>-</span>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{background:'transparent', border:'none', color:'white', fontSize:'0.85rem'}} />
        </div>

        {/* Buscador Texto */}
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
                <td style={{display:'flex', gap:'5px', justifyContent:'center'}}>
                  <button className="btn-ver" onClick={() => verDetalle(p.id)} title="Ver Detalle">
                    Ver
                  </button>

                  {/* BOTÓN WHATSAPP RÁPIDO */}
                  <button 
                    onClick={() => enviarNotificacion(p)} 
                    style={{background:'#22c55e', color:'white', border:'none', padding:'6px', borderRadius:'50%', cursor:'pointer', display:'flex'}}
                    title="WhatsApp"
                  >
                    <FaWhatsapp />
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
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3>Pedido #{detalle.id}</h3>
                {/* BOTONES ACCIÓN EN MODAL */}
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => imprimirPedido(detalle)} style={{background:'#64748b', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaPrint/> Imprimir
                    </button>
                    <button onClick={() => enviarNotificacion(detalle)} style={{background:'#22c55e', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaWhatsapp/> Notificar
                    </button>
                </div>
            </div>

            <div className="modal-grid">
                {/* Columna Izquierda: Datos Cliente */}
                <div className="info-col">
                    <h4>👤 Cliente</h4>
                    <p><strong>Nombre:</strong> {detalle.usuario?.nombre}</p>
                    <p><strong>Email:</strong> {detalle.usuario?.email}</p>
                    <p><strong>Teléfono:</strong> {detalle.telefono || detalle.usuario?.telefono || "N/A"}</p>
                    <p><strong>ID Pago:</strong> <span style={{fontSize:'0.85rem', color:'#666'}}>{detalle.paypalOrderId || "Efectivo/Otro"}</span></p>
                </div>
                
                {/* TIPO DE COMPROBANTE */}
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
                            <FaMapMarkerAlt /> Ver en Mapa
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