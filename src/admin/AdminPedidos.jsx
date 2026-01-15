import React, { useEffect, useState } from "react";
import { obtenerConfiguracion } from "./services/adminConfigService"; 
import { adminListarPedidos, adminActualizarEstado, adminObtenerPedido } from "./services/adminPedidoService";
import "./AdminPedidos.css";

// Iconos
import { 
    FaSearch, FaMapMarkerAlt, FaWhatsapp, FaPrint, FaTimes, FaBoxOpen, 
    FaClock, FaShippingFast, FaCheckCircle, FaTimesCircle, FaBox, 
    FaCreditCard, FaMapMarkedAlt, FaUser, FaMoneyBillWave
} from "react-icons/fa";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [detalle, setDetalle] = useState(null);

  const [empresa, setEmpresa] = useState({
      nombre: "Cargando...",
      direccion: "",
      telefono: "",
      email: ""
  });

  async function cargar() {
    try {
      const data = await adminListarPedidos();
      if(data) {
        setPedidos(data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (error) { console.error(error); }
  }

  useEffect(() => { 
      cargar(); 
      obtenerConfiguracion().then(data => {
          if (data) {
              setEmpresa({
                  nombre: data.nombreTienda || data.nombre_tienda || "Mi Tienda",
                  direccion: data.direccionTienda || data.direccion || "",
                  telefono: data.telefonoContacto || data.telefono || "",
                  email: data.emailContacto || data.email || ""
              });
          }
      }).catch(err => console.error("Error cargando config", err));
  }, []);

  async function verDetalle(id) {
    try {
        const data = await adminObtenerPedido(id);
        setDetalle(data);
    } catch (error) { alert("Error cargando detalle"); }
  }

  // --- FUNCIÓN QUE CAMBIA EL ESTADO ---
  async function cambiarEstado(id, nuevoEstado) {
    if(!window.confirm(`¿Cambiar estado del Pedido #${id} a ${nuevoEstado}?`)) return;
    try {
        await adminActualizarEstado(id, nuevoEstado);
        // Actualizamos la lista localmente para que se refleje rápido
        const nuevosPedidos = pedidos.map(p => 
            p.id === id ? { ...p, estado: nuevoEstado } : p
        );
        setPedidos(nuevosPedidos);
        
        if(detalle && detalle.id === id) {
            setDetalle({...detalle, estado: nuevoEstado});
        }
    } catch (error) {
        alert("Error al actualizar estado");
        console.error(error);
    }
  }

  const enviarWhatsapp = (telefono, nombre) => {
      if(!telefono) return alert("Sin teléfono");
      const numeroLimpio = telefono.replace(/\D/g, ''); 
      const mensaje = `Hola ${nombre}, le saludamos de ${empresa.nombre} respecto a su pedido...`;
      window.open(`https://wa.me/503${numeroLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const getIconoEstado = (estado) => {
      switch ((estado || "").toUpperCase()) {
          case "PENDIENTE DE PAGO": return <FaClock style={{color: '#be123c'}} />; 
          case "PENDIENTE": return <FaClock />;
          case "ENVIADO": return <FaShippingFast />;
          case "ENTREGADO": return <FaCheckCircle />;
          case "CANCELADO": return <FaTimesCircle />;
          default: return <FaClock />;
      }
  };

  const getMapUrl = (coords) => {
      if (!coords) return null;
      let val = String(coords).trim();
      if (["0", "null", "undefined", "sin gps"].includes(val.toLowerCase()) || val.length < 5) return null;
      if (val.includes("google") && val.includes("q=")) {
          try {
              const parts = val.split("q=");
              if (parts[1]) {
                  const cleanCoords = parts[1].split("&")[0];
                  return `https://googleusercontent.com/maps.google.com/?q=${cleanCoords}`;
              }
          } catch (e) { console.error("Error parseando mapa", e); }
      }
      if (val.toLowerCase().startsWith("http")) return val;
      return `https://googleusercontent.com/maps.google.com/?q=${val}`;
  };

  function filtrarPedidos() {
    return pedidos.filter(p => {
        const estadoReal = (p.estado || "PENDIENTE").toUpperCase();
        
        if (busqueda) {
            const texto = busqueda.trim().toLowerCase();
            const id = (p.id || "").toString();
            const transaccion = (p.transaction_id || "").toLowerCase();
            if (id.includes(texto) || transaccion.includes(texto)) return true;
            return false;
        }

        if (filtro !== "TODOS" && estadoReal !== filtro) return false;
        
        const fecha = (p.created_at || "").split('T')[0];
        if (fechaInicio && fecha < fechaInicio) return false;
        if (fechaFin && fecha > fechaFin) return false;

        return true;
    });
  }

  const lista = filtrarPedidos();
  
  const subtotalProductos = detalle ? (detalle.items_relacion || []).reduce((acc, item) => 
    acc + (Number(item.precio_unitario) * item.cantidad), 0) : 0;

  return (
    <div className="admin-pedidos">
      <h2><FaBox style={{marginRight: '10px'}}/> Gestión de Pedidos</h2>
      
      <div className="pedidos-filtros">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="filtro-select">
          <option value="TODOS">Todos los Estados</option>
          <option value="PENDIENTE DE PAGO">💳 Esperando Pago</option>
          <option value="PENDIENTE">⏳ Pendientes (Pagados)</option>
          <option value="ENVIADO">🚚 Enviados</option>
          <option value="ENTREGADO">✅ Entregados</option>
          <option value="CANCELADO">❌ Cancelados</option>
        </select>
        
        <div className="filtro-fechas">
            <input type="date" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} />
            <span>a</span>
            <input type="date" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} />
        </div>

        <div className="buscador">
            <FaSearch className="icon-search"/>
            <input type="text" placeholder="Buscar ID o Ref Wompi..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
        </div>
      </div>

      <div className="tabla-responsive">
        <table className="tabla-pedidos">
            <thead>
                <tr>
                    <th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th>
                    <th>Ref. Wompi</th>
                    <th>Fecha</th><th>Acciones Rápidas</th>
                </tr>
            </thead>
            <tbody>
                {lista.map(p => (
                    <tr key={p.id} className={p.estado === 'Pendiente de Pago' ? 'fila-bac' : ''}>
                        <td className="td-id">#{p.id}</td>
                        <td className="td-cliente">
                            <div className="cliente-nombre">{p.user?.nombre || "Invitado"}</div>
                            <small className="cliente-zona">{p.departamento}</small>
                        </td>
                        <td className="td-total">
                           <span className={p.estado === 'Pendiente de Pago' ? 'monto-bac' : ''}>
                              ${Number(p.total).toFixed(2)}
                           </span>
                        </td>
                        
                        {/* COLUMNA ESTADO (Badge Visual) */}
                        <td>
                            <span className={`badge-pedido ${(p.estado || "PENDIENTE").replace(/\s/g, '-').toLowerCase()}`}>
                                {getIconoEstado(p.estado)} <span style={{marginLeft:'4px'}}>{p.estado}</span>
                            </span>
                        </td>
                        
                        {/* COLUMNA WOMPI */}
                        <td>
                            {p.transaction_id ? (
                                <span style={{
                                    display:'flex', alignItems:'center', gap:'4px', 
                                    background:'#dcfce7', color:'#166534', 
                                    padding:'2px 6px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold'
                                }}>
                                    <FaCheckCircle/> {p.transaction_id.substring(0,8)}...
                                </span>
                            ) : p.estado === 'Pendiente de Pago' ? (
                                <span style={{color:'#f59e0b', fontSize:'0.8rem'}}>Esperando...</span>
                            ) : (
                                <span style={{color:'#94a3b8', fontSize:'0.8rem'}}>--</span>
                            )}
                        </td>

                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                        
                        {/* --- AQUÍ ESTÁ EL CAMBIO: ACCIONES + SELECTOR RESTAURADO --- */}
                        <td className="td-acciones">
                            <div style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                                <button onClick={() => verDetalle(p.id)} className="btn-ver" title="Ver Detalles">
                                    <FaBoxOpen/>
                                </button>
                                <button className="btn-whatsapp-sm" onClick={() => enviarWhatsapp(p.telefono, p.user?.nombre)} title="WhatsApp">
                                    <FaWhatsapp/>
                                </button>
                            </div>
                            
                            {/* SELECTOR PARA CAMBIO RÁPIDO */}
                            <select 
                                className="select-estado-mini" 
                                value={p.estado} 
                                onChange={(e) => cambiarEstado(p.id, e.target.value)}
                                style={{fontSize:'0.8rem', padding:'2px', width:'100%'}}
                            >
                                <option value="PENDIENTE DE PAGO">💳 Esperando Pago</option>
                                <option value="PENDIENTE">⏳ Pendiente</option>
                                <option value="ENVIADO">🚚 Enviado</option>
                                <option value="ENTREGADO">✅ Entregado</option>
                                <option value="CANCELADO">❌ Cancelado</option>
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal-content premium-modal" onClick={e => e.stopPropagation()}>
            
            <div className="premium-header">
              <div className="header-info">
                <div className="order-id-badge">PEDIDO #{detalle.id}</div>
                <span className="order-date">
                   {new Date(detalle.created_at).toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="header-actions">
                 <button onClick={() => setDetalle(null)} className="btn-close-premium"><FaTimes/></button>
              </div>
            </div>

            <div className="premium-body">
              <div className="info-grid-row">
                  <div className="info-card">
                      <div className="card-label"><FaUser/> Cliente</div>
                      <div className="card-value main">{detalle.user?.nombre || "Invitado"}</div>
                      <div className="sub-data">
                          <div className="row"><span>Tel:</span> {detalle.telefono}</div>
                          <div className="row"><span>Email:</span> {detalle.user?.email || "--"}</div>
                      </div>
                  </div>

                  <div className="info-card" style={detalle.transaction_id ? {borderColor:'#22c55e', background:'#f0fdf4'} : {}}>
                      <div className="card-label" style={{color: detalle.transaction_id ? '#15803d' : '#64748b'}}>
                          <FaMoneyBillWave/> Pago ({detalle.metodo_pago})
                      </div>
                      <div className="card-value">
                        {detalle.transaction_id ? (
                            <span style={{color:'#15803d'}}>PAGADO</span>
                        ) : (
                            <span style={{color:'#be123c'}}>PENDIENTE</span>
                        )}
                      </div>
                      <div className="sub-data">
                          {detalle.transaction_id ? (
                              <>
                                <div className="row" style={{fontWeight:'bold', color:'#15803d'}}>ID: {detalle.transaction_id}</div>
                              </>
                          ) : (
                              <div className="row">Esperando confirmación...</div>
                          )}
                          <div className="row">Tipo: {detalle.tipo_comprobante}</div>
                      </div>
                  </div>

                  <div className="info-card">
                      <div className="card-label"><FaMapMarkerAlt/> Entrega</div>
                      <div className="card-value">
                        {detalle.departamento || "Zona n/d"}
                      </div>
                      <div className="sub-data address-box" style={{
                          whiteSpace: 'pre-wrap', lineHeight: '1.4', background: 'rgba(0,0,0,0.05)',
                          padding: '8px', borderRadius: '6px', marginTop: '5px'
                      }}>
                          {detalle.direccion_completa || detalle.direccion || "Sin dirección"}
                      </div>
                      {getMapUrl(detalle.coordenadas) && (
                          <a href={getMapUrl(detalle.coordenadas)} target="_blank" rel="noopener noreferrer" className="btn-action-text blue" style={{marginTop:'8px', display:'inline-block'}}>
                              <FaMapMarkedAlt/> Abrir GPS
                          </a>
                      )}
                  </div>
              </div>

              <div className="products-container">
                  <h4 className="section-title"><FaBoxOpen/> Productos</h4>
                  <table className="premium-table">
                      <thead>
                          <tr><th>Producto</th><th className="th-center">Cant.</th><th className="th-right">Precio</th><th className="th-right">Subtotal</th></tr>
                      </thead>
                      <tbody>
                          {(detalle.items_relacion || []).map((item, i) => (
                              <tr key={i}>
                                  <td>{item.product?.nombre || "N/A"}</td>
                                  <td className="td-center">{item.cantidad}</td>
                                  <td className="td-right">${Number(item.precio_unitario).toFixed(2)}</td>
                                  <td className="td-right bold">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              <div className="premium-footer">
                    <div className="footer-actions">
                        {/* SELECTOR EN EL MODAL TAMBIÉN */}
                        <select className="status-selector" value={detalle.estado} onChange={(e) => cambiarEstado(detalle.id, e.target.value)}>
                           <option value="PENDIENTE DE PAGO">💳 ESPERANDO PAGO</option>
                           <option value="PENDIENTE">⏳ PENDIENTE (PAGADO)</option>
                           <option value="ENVIADO">🚚 ENVIADO</option>
                           <option value="ENTREGADO">✅ ENTREGADO</option>
                           <option value="CANCELADO">❌ CANCELADO</option>
                        </select>
                        <button className="btn-print" onClick={() => window.print()}><FaPrint/></button>
                    </div>

                    <div className="footer-summary">
                        <div className="sum-row"><span>Subtotal:</span> <span>${subtotalProductos.toFixed(2)}</span></div>
                        <div className="sum-row">
                            <span>Envío:</span> 
                            {Number(detalle.costo_envio) === 0 ? <span style={{color: '#059669', fontWeight: 'bold'}}>GRATIS</span> : <span>+ ${Number(detalle.costo_envio).toFixed(2)}</span>}
                        </div>
                        {Number(detalle.descuento) > 0 && (
                            <div className="sum-row discount" style={{color: '#e53e3e', fontWeight: 'bold'}}>
                                <span>Descuento:</span> <span>- ${Number(detalle.descuento).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="sum-row total">
                            <span>TOTAL</span> <span className="total-amount">${Number(detalle.total).toFixed(2)}</span>
                        </div>
                    </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}