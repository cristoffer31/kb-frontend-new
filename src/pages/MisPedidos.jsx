import React, { useEffect, useState } from "react";
import { listarMisPedidos } from "../services/pedidoService";
import api from "../services/api"; 
import { useLocation, useNavigate } from "react-router-dom"; 
import { 
    FaBoxOpen, FaClock, FaShippingFast, FaCheckCircle, FaTimesCircle, 
    FaEye, FaMapMarkerAlt, FaTimes, FaReceipt, FaMobileAlt, FaSpinner, FaSync,
    FaCreditCard, FaFileInvoiceDollar, FaMapMarkedAlt, FaInfoCircle
} from "react-icons/fa";
import "./MisPedidos.css"; 

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  
  const [verificandoWompi, setVerificandoWompi] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    cargar();
    verificarRetornoWompi(); 
  }, []);

  const verificarRetornoWompi = async () => {
      const params = new URLSearchParams(location.search);
      const idTransaccion = params.get("idTransaccion");

      if (idTransaccion) {
          setVerificandoWompi(true);
          try {
              const { data } = await api.get(`/api/wompi/validar?id_transaccion=${idTransaccion}`);
              if (data.status === 'APPROVED') {
                  alert("✅ ¡Pago Confirmado! Tu pedido ha sido pagado exitosamente.");
              } else {
                  alert("⚠ El pago no fue aprobado o está pendiente.");
              }
              navigate("/mis-pedidos", { replace: true });
              cargar();
          } catch (error) {
              console.error("Error validando Wompi", error);
              navigate("/mis-pedidos", { replace: true });
          } finally {
              setVerificandoWompi(false);
          }
      }
  };

  const verificarEstadoManual = async (pedido) => {
    if(!pedido.id) return;
    try {
        setVerificandoWompi(true);
        const { data } = await api.get(`/api/wompi/validar-orden/${pedido.id}`);
        if (data.status === 'APPROVED') {
            alert("✅ ¡Confirmado! Hemos actualizado tu pago.");
            cargar(); 
        } else {
            alert("ℹ El pago aún aparece como pendiente en el sistema del banco.");
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo verificar el estado en este momento.");
    } finally {
        setVerificandoWompi(false);
    }
  };

  async function cargar() {
    try {
      const respuesta = await listarMisPedidos();
      let datosEncontrados = [];
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
      let color = "#64748b"; 
      let bg = "#f1f5f9";
      let icon = <FaClock/>;

      if(est.includes("PAGO") || est.includes("PREPARANDO")) { color = "#be123c"; bg="#fff1f2"; icon = <FaCheckCircle/>; } 
      else if(est.includes("PENDIENTE")) { color = "#b45309"; bg="#fffbeb"; icon = <FaClock/>; } 
      else if(est === "ENVIADO") { color = "#1d4ed8"; bg="#eff6ff"; icon = <FaShippingFast/>; }
      else if(est === "ENTREGADO") { color = "#15803d"; bg="#f0fdf4"; icon = <FaCheckCircle/>; }
      else if(est === "CANCELADO") { color = "#b91c1c"; bg="#fef2f2"; icon = <FaTimesCircle/>; }

      return (
          <span style={{
              display:'flex', alignItems:'center', gap:'6px', 
              padding:'6px 12px', borderRadius:'20px', 
              fontSize:'0.8rem', fontWeight:'700',
              border: `1px solid ${color}20`, color: color, background: bg
          }}>
              {icon} {estado}
          </span>
      );
  };

  if (cargando && !verificandoWompi) return <div style={{padding:'50px', textAlign:'center', color:'#666'}}>Cargando historial...</div>;

  return (
    <div className="mis-pedidos-page" style={{padding: '30px 20px', maxWidth: '1000px', margin: '0 auto'}}>
      
      {verificandoWompi && (
        <div style={{
            background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1e40af',
            padding:'15px', borderRadius:'8px', marginBottom:'20px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'
        }}>
            <FaSpinner className="spin-animation" /> Verificando estado de tu pago con el banco...
            <style>{`.spin-animation { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div style={{borderBottom:'1px solid #e2e8f0', paddingBottom:'15px', marginBottom:'25px'}}>
        <h2 style={{color: '#1e293b', margin: 0, display:'flex', alignItems:'center', gap:'10px'}}>
            <FaBoxOpen style={{color:'#3b82f6'}}/> Mis Pedidos
        </h2>
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
                      background:'#ffffff', padding:'20px', borderRadius:'12px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border:'1px solid #e2e8f0',
                      display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center'
                  }}>
                      <div style={{minWidth:'220px', paddingRight:'20px'}}>
                          <h4 style={{margin:0, color:'#0f172a', fontSize:'1.1rem'}}>Pedido #{p.id}</h4>
                          <small style={{color:'#64748b', display:'block', marginTop:'4px'}}>
                              {new Date(p.created_at).toLocaleDateString('es-SV', {year:'numeric', month:'long', day:'numeric'})}
                          </small>
                      </div>

                      <div style={{margin:'10px 0', flex: 1}}>
                          {getEstadoBadge(p.estado)}
                      </div>

                      <div style={{textAlign:'right', minWidth:'150px', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px'}}>
                          <div style={{color:'#0f172a', fontWeight:'800', fontSize:'1.25rem'}}>
                              ${Number(p.total).toFixed(2)}
                          </div>
                          
                          {/* {(p.estado === "Pendiente de Pago" || p.estado === "Pendiente") && (
                              <button onClick={() => verificarEstadoManual(p)} style={{
                                    background: '#fffbeb', color: '#b45309', border: '1px solid #b45309', 
                                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600'
                                }}>
                                  <FaSync /> Verificar Pago
                              </button>
                          )} */}

                          <button onClick={() => setPedidoSeleccionado(p)} style={{
                                background: '#ffffff', color: '#3b82f6', border: '1px solid #3b82f6', 
                                padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600'
                            }}>
                              <FaEye/> Ver Detalles
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* --- MODAL DETALLADO --- */}
      {pedidoSeleccionado && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex',
            justifyContent: 'center', alignItems: 'center', padding: '10px',
            backdropFilter: 'blur(3px)'
        }} onClick={() => setPedidoSeleccionado(null)}>
            
            <div style={{
                background: '#ffffff', width: '100%', maxWidth: '650px',
                borderRadius: '16px', overflow: 'hidden', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background:'#f8fafc'}}>
                    <h3 style={{margin: 0, color: '#1e293b', display:'flex', alignItems:'center', gap:'10px', fontSize:'1.2rem'}}>
                        <FaReceipt/> Pedido #{pedidoSeleccionado.id}
                    </h3>
                    <button onClick={() => setPedidoSeleccionado(null)} style={{background:'transparent', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#94a3b8'}}><FaTimes/></button>
                </div>

                {/* Body (Scrollable) */}
                <div style={{padding: '24px', overflowY: 'auto'}}>
                    
                    {/* SECCIÓN 1: DETALLES DE PAGO Y FACTURACIÓN */}
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                        {/* Pago */}
                        <div style={{background:'#f8fafc', padding:'15px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                            <h4 style={{margin:'0 0 10px 0', fontSize:'0.9rem', color:'#64748b', display:'flex', alignItems:'center', gap:'6px'}}><FaCreditCard/> INFORMACIÓN DE PAGO</h4>
                            <div style={{fontSize:'0.9rem', color:'#334155'}}>
                                <div style={{marginBottom:'4px'}}><strong>Método:</strong> {pedidoSeleccionado.metodo_pago || 'No especificado'}</div>
                                {pedidoSeleccionado.transaction_id ? (
                                    <div style={{wordBreak:'break-all'}}><strong>Transacción ID:</strong> <span style={{color:'#16a34a', fontWeight:'bold'}}>{pedidoSeleccionado.transaction_id}</span></div>
                                ) : (
                                    <div style={{color:'#f59e0b'}}><em>Pago pendiente de registrar</em></div>
                                )}
                                <div style={{marginTop:'4px'}}><strong>Estado:</strong> {pedidoSeleccionado.estado}</div>
                            </div>
                        </div>

                        {/* Facturación */}
                        <div style={{background:'#f8fafc', padding:'15px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                            <h4 style={{margin:'0 0 10px 0', fontSize:'0.9rem', color:'#64748b', display:'flex', alignItems:'center', gap:'6px'}}><FaFileInvoiceDollar/> DATOS FACTURACIÓN</h4>
                            <div style={{fontSize:'0.9rem', color:'#334155'}}>
                                <div style={{marginBottom:'4px'}}><strong>Tipo:</strong> {pedidoSeleccionado.tipo_comprobante === 'CREDITO_FISCAL' ? 'Crédito Fiscal' : 'Consumidor Final'}</div>
                                {pedidoSeleccionado.tipo_comprobante === 'CREDITO_FISCAL' && (
                                    <>
                                        <div><strong>Razón Social:</strong> {pedidoSeleccionado.razon_social}</div>
                                        <div><strong>NIT:</strong> {pedidoSeleccionado.nit}</div>
                                        <div><strong>NRC:</strong> {pedidoSeleccionado.nrc}</div>
                                        <div><strong>Giro:</strong> {pedidoSeleccionado.giro}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: DIRECCIÓN Y GPS */}
                    <div style={{marginBottom: '20px', background: '#fffbeb', padding: '15px', borderRadius: '8px', border:'1px solid #fef3c7'}}>
                        <h4 style={{margin: '0 0 8px 0', color: '#b45309', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:'8px'}}>
                            <FaMapMarkerAlt/> DIRECCIÓN DE ENTREGA
                        </h4>
                        <div style={{color: '#334155', fontSize: '0.95rem'}}>
                            <strong style={{display:'block', marginBottom:'4px'}}>{pedidoSeleccionado.departamento}</strong>
                            <p style={{margin: '0 0 8px 0', lineHeight: '1.4'}}>
                                {pedidoSeleccionado.direccion_completa || pedidoSeleccionado.direccion_envio}
                            </p>
                            
                            <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                                {pedidoSeleccionado.telefono && (
                                    <span style={{display:'flex', alignItems:'center', gap:'6px', color:'#2563eb', fontWeight:'600'}}>
                                        <FaMobileAlt/> {pedidoSeleccionado.telefono}
                                    </span>
                                )}
                                
                                {pedidoSeleccionado.coordenadas && (
                                    <a href={pedidoSeleccionado.coordenadas} target="_blank" rel="noopener noreferrer" 
                                       style={{
                                           display:'flex', alignItems:'center', gap:'5px', 
                                           background:'#2563eb', color:'white', padding:'5px 10px', 
                                           borderRadius:'5px', textDecoration:'none', fontSize:'0.85rem'
                                       }}>
                                        <FaMapMarkedAlt/> Ver Ubicación GPS
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: PRODUCTOS */}
                    <h4 style={{color: '#64748b', fontSize: '0.85rem', marginBottom: '10px', textTransform:'uppercase', fontWeight:'bold', borderBottom:'1px solid #e2e8f0', paddingBottom:'5px'}}>
                        Detalle de Productos
                    </h4>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {(pedidoSeleccionado.items_relacion || []).map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                borderBottom: '1px solid #f1f5f9', padding: '10px 0'
                            }}>
                                <div>
                                    <div style={{color: '#0f172a', fontWeight: '600', fontSize:'0.95rem'}}>
                                        {item.product?.nombre || "Producto"}
                                    </div>
                                    <div style={{color: '#64748b', fontSize: '0.85rem'}}>
                                        {item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}
                                    </div>
                                </div>
                                <div style={{color: '#334155', fontWeight: 'bold'}}>
                                    ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TOTALES */}
                    <div style={{marginTop: '20px', paddingTop: '15px', background:'#f8fafc', padding:'15px', borderRadius:'8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                            <span>Subtotal</span> <span>${(Number(pedidoSeleccionado.total) + Number(pedidoSeleccionado.descuento) - Number(pedidoSeleccionado.costo_envio)).toFixed(2)}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                            <span>Envío</span> <span>${Number(pedidoSeleccionado.costo_envio).toFixed(2)}</span>
                        </div>
                        {Number(pedidoSeleccionado.descuento) > 0 && (
                            <div style={{display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '5px'}}>
                                <span>Descuento</span> <span>-${Number(pedidoSeleccionado.descuento).toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', marginTop: '10px', paddingTop:'10px', borderTop:'1px solid #cbd5e1', color:'#0f172a'}}>
                            <span>TOTAL</span> <span>${Number(pedidoSeleccionado.total).toFixed(2)}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}
    </div>
  );
}