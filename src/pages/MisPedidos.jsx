import React, { useEffect, useState } from "react";
import { listarMisPedidos } from "../services/pedidoService";
import { 
    FaBoxOpen, FaClock, FaShippingFast, FaCheckCircle, FaTimesCircle, 
    FaEye, FaMapMarkerAlt, FaTimes, FaReceipt, FaMobileAlt 
} from "react-icons/fa";
// Asegúrate de que tu CSS no esté forzando fondos oscuros globales
import "./MisPedidos.css"; 

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      const respuesta = await listarMisPedidos();
      
      let datosEncontrados = [];
      // Lógica universal para encontrar el array de pedidos
      if (respuesta && Array.isArray(respuesta.data)) {
          datosEncontrados = respuesta.data;
      } else if (respuesta && respuesta.data && Array.isArray(respuesta.data.data)) {
          datosEncontrados = respuesta.data.data;
      } else if (Array.isArray(respuesta)) {
           datosEncontrados = respuesta;
      } else if (respuesta && respuesta.data && Array.isArray(respuesta.data)) {
           datosEncontrados = respuesta.data;
      }

      setPedidos(datosEncontrados);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setCargando(false);
    }
  }

  const getEstadoBadge = (estado) => {
      const est = (estado || "PENDIENTE").toUpperCase();
      // Colores ajustados para fondo blanco
      let color = "#64748b"; 
      let bg = "#f1f5f9";
      let icon = <FaClock/>;

      if(est.includes("PAGO")) { color = "#be123c"; bg="#fff1f2"; icon = <FaClock/>; } 
      else if(est === "PENDIENTE") { color = "#b45309"; bg="#fffbeb"; icon = <FaClock/>; }
      else if(est === "ENVIADO") { color = "#1d4ed8"; bg="#eff6ff"; icon = <FaShippingFast/>; }
      else if(est === "ENTREGADO") { color = "#15803d"; bg="#f0fdf4"; icon = <FaCheckCircle/>; }
      else if(est === "CANCELADO") { color = "#b91c1c"; bg="#fef2f2"; icon = <FaTimesCircle/>; }

      return (
          <span style={{
              display:'flex', alignItems:'center', gap:'6px', 
              padding:'6px 12px', borderRadius:'20px', 
              fontSize:'0.8rem', fontWeight:'700',
              border: `1px solid ${color}20`, 
              color: color, 
              background: bg
          }}>
              {icon} {estado}
          </span>
      );
  };

  const abrirDetalles = (pedido) => {
      setPedidoSeleccionado(pedido);
  };

  if (cargando) return <div style={{padding:'50px', textAlign:'center', color:'#666'}}>Cargando historial...</div>;

  return (
    <div className="mis-pedidos-page" style={{padding: '30px 20px', maxWidth: '1000px', margin: '0 auto'}}>
      
      <div style={{borderBottom:'1px solid #e2e8f0', paddingBottom:'15px', marginBottom:'25px'}}>
        <h2 style={{color: '#1e293b', margin: 0, display:'flex', alignItems:'center', gap:'10px'}}>
            <FaBoxOpen style={{color:'#3b82f6'}}/> Mis Pedidos
        </h2>
        <p style={{margin:'5px 0 0 0', color:'#64748b', fontSize:'0.95rem'}}>
            Historial de tus compras recientes
        </p>
      </div>

      {pedidos.length === 0 ? (
          <div style={{textAlign:'center', padding:'50px', background:'#f8fafc', borderRadius:'12px', border:'1px dashed #cbd5e1', color:'#64748b'}}>
              <FaBoxOpen style={{fontSize:'3rem', marginBottom:'10px', opacity:0.3}}/>
              <p style={{fontSize:'1.1rem'}}>Aún no has realizado ninguna compra.</p>
          </div>
      ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              {pedidos.map(p => (
                  <div key={p.id} style={{
                      background:'#ffffff', 
                      padding:'20px', 
                      borderRadius:'12px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                      border:'1px solid #e2e8f0',
                      display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center'
                  }}>
                      
                      {/* Info Principal */}
                      <div style={{minWidth:'220px', paddingRight:'20px'}}>
                          <h4 style={{margin:0, color:'#0f172a', fontSize:'1.1rem'}}>Pedido #{p.id}</h4>
                          <small style={{color:'#64748b', display:'block', marginTop:'4px'}}>
                              {new Date(p.created_at).toLocaleDateString('es-SV', {year:'numeric', month:'long', day:'numeric'})}
                          </small>
                          <small style={{color:'#94a3b8'}}>
                              {new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </small>
                      </div>

                      {/* Estado */}
                      <div style={{margin:'10px 0', flex: 1}}>
                          {getEstadoBadge(p.estado)}
                      </div>

                      {/* Total y Botón */}
                      <div style={{textAlign:'right', minWidth:'150px', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px'}}>
                          <div style={{color:'#0f172a', fontWeight:'800', fontSize:'1.25rem'}}>
                              ${Number(p.total).toFixed(2)}
                          </div>
                          
                          <button 
                            onClick={() => abrirDetalles(p)}
                            style={{
                                background: '#ffffff', color: '#3b82f6', 
                                border: '1px solid #3b82f6', 
                                padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem',
                                fontWeight: '600', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                          >
                              <FaEye/> Ver Detalles
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* --- MODAL DE DETALLES (Light Mode) --- */}
      {pedidoSeleccionado && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex',
            justifyContent: 'center', alignItems: 'center', padding: '20px',
            backdropFilter: 'blur(2px)'
        }} onClick={() => setPedidoSeleccionado(null)}>
            
            <div style={{
                background: '#ffffff', width: '100%', maxWidth: '600px',
                borderRadius: '16px', overflow: 'hidden', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'fadeIn 0.2s ease-out'
            }} onClick={e => e.stopPropagation()}>
                
                {/* Header Modal */}
                <div style={{padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background:'#f8fafc'}}>
                    <h3 style={{margin: 0, color: '#334155', display:'flex', alignItems:'center', gap:'10px', fontSize:'1.1rem'}}>
                        <FaReceipt style={{color:'#64748b'}}/> Detalle Pedido #{pedidoSeleccionado.id}
                    </h3>
                    <button onClick={() => setPedidoSeleccionado(null)} style={{background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer'}}>
                        <FaTimes/>
                    </button>
                </div>

                {/* Body Modal */}
                <div style={{padding: '24px', maxHeight: '70vh', overflowY: 'auto'}}>
                    
                    {/* Sección Envío */}
                    <div style={{marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border:'1px solid #e2e8f0'}}>
                        <h4 style={{margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:'8px', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                            <FaMapMarkerAlt/> Dirección de Entrega
                        </h4>
                        <div style={{color: '#334155', fontSize: '0.95rem'}}>
                            <strong style={{color: '#0f172a', display:'block', marginBottom:'4px'}}>{pedidoSeleccionado.departamento}</strong>
                            <p style={{margin: '0', lineHeight: '1.5', color:'#475569'}}>
                                {pedidoSeleccionado.direccion_completa || pedidoSeleccionado.direccion || pedidoSeleccionado.direccion_envio || "Dirección no especificada"}
                            </p>
                            {pedidoSeleccionado.telefono && (
                                <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'8px', color:'#2563eb', fontWeight:'500', fontSize:'0.9rem'}}>
                                    <FaMobileAlt/> {pedidoSeleccionado.telefono}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabla Productos */}
                    <h4 style={{color: '#64748b', fontSize: '0.85rem', marginBottom: '12px', textTransform:'uppercase', fontWeight:'bold'}}>
                        Productos ({pedidoSeleccionado.items_relacion?.length || 0})
                    </h4>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0'}}>
                        {(pedidoSeleccionado.items_relacion || []).map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                borderBottom: i === (pedidoSeleccionado.items_relacion.length -1) ? 'none' : '1px solid #f1f5f9', 
                                padding: '12px 0'
                            }}>
                                <div>
                                    <div style={{color: '#0f172a', fontWeight: '600', fontSize:'0.95rem'}}>
                                        {item.product?.nombre || "Producto sin nombre"}
                                    </div>
                                    <div style={{color: '#64748b', fontSize: '0.85rem', marginTop:'2px'}}>
                                        {item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}
                                    </div>
                                </div>
                                <div style={{color: '#334155', fontWeight: 'bold'}}>
                                    ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totales */}
                    <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #e2e8f0'}}>
                         <div style={{display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px', fontSize:'0.95rem'}}>
                             <span>Subtotal</span>
                             <span>${(Number(pedidoSeleccionado.total) + Number(pedidoSeleccionado.descuento) - Number(pedidoSeleccionado.costo_envio)).toFixed(2)}</span>
                         </div>
                         
                         <div style={{display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px', fontSize:'0.95rem'}}>
                             <span>Envío</span>
                             {Number(pedidoSeleccionado.costo_envio) === 0 ? (
                                 <span style={{color:'#16a34a', fontWeight:'bold'}}>GRATIS</span>
                             ) : (
                                 <span>${Number(pedidoSeleccionado.costo_envio).toFixed(2)}</span>
                             )}
                         </div>

                         {Number(pedidoSeleccionado.descuento) > 0 && (
                             <div style={{display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '8px', fontSize:'0.95rem'}}>
                                 <span>Descuento</span>
                                 <span>-${Number(pedidoSeleccionado.descuento).toFixed(2)}</span>
                             </div>
                         )}
                         
                         <div style={{display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontSize: '1.3rem', fontWeight: '800', marginTop: '15px', paddingTop:'15px', borderTop:'1px solid #f1f5f9'}}>
                             <span>Total</span>
                             <span>${Number(pedidoSeleccionado.total).toFixed(2)}</span>
                         </div>
                    </div>

                </div>
            </div>
        </div>
      )}

    </div>
  );
}