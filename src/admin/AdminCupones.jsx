import React, { useEffect, useState } from "react";
// Asegúrate de tener estas funciones en tu servicio
import { adminListarCupones, adminCrearCupon, adminEliminarCupon } from "./services/adminCuponService"; 
import "./AdminPedidos.css"; 
import { FaTicketAlt, FaTrash, FaPlus, FaTruck } from "react-icons/fa";

export default function AdminCupones() {
  const [cupones, setCupones] = useState([]);
  
  // 1. ESTADOS DEL FORMULARIO
  const [codigo, setCodigo] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [fecha, setFecha] = useState("");
  const [esEnvioGratis, setEsEnvioGratis] = useState(false); // <--- NUEVO ESTADO

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
        const data = await adminListarCupones();
        setCupones(data);
    } catch (error) { console.error(error); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación: Si NO es envío gratis, el porcentaje es obligatorio
    if (!codigo || (!esEnvioGratis && !porcentaje) || !fecha) {
        return alert("Completa los campos obligatorios");
    }

    // Preparamos los datos
    const payload = {
        codigo: codigo.toUpperCase(),
        // Si es envío gratis, mandamos 0 en porcentaje, si no, lo que escribió el usuario
        porcentaje: esEnvioGratis ? 0 : parseInt(porcentaje),
        esEnvioGratis: esEnvioGratis, // <--- Enviamos la bandera al Backend
        fecha_expiracion: fecha,
        activo: true
    };

    try {
        await adminCrearCupon(payload);
        alert("✅ Cupón creado con éxito");
        
        // Limpiar formulario
        setCodigo("");
        setPorcentaje("");
        setFecha("");
        setEsEnvioGratis(false); // Resetear checkbox
        
        cargar();

    } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 422) {
            alert("Error: El código ya existe o los datos son inválidos.");
        } else {
            alert("Error al crear cupón.");
        }
    }
  };

  const eliminar = async (id) => {
      if(!confirm("¿Borrar cupón?")) return;
      await adminEliminarCupon(id);
      cargar();
  };

  return (
    <div className="admin-pedidos">
      <h2><FaTicketAlt style={{marginRight:'10px'}}/> Gestión de Cupones</h2>

      {/* FORMULARIO DE CREACIÓN */}
      <div className="pedidos-filtros" style={{display:'block', marginBottom:'20px'}}>
          <h4 style={{color:'#38bdf8', marginTop:0}}>Nuevo Cupón</h4>
          <form onSubmit={handleSubmit} style={{display:'flex', gap:'15px', flexWrap:'wrap', alignItems:'end'}}>
              
              <div style={{display:'flex', flexDirection:'column'}}>
                  <label style={{color:'#94a3b8', fontSize:'12px'}}>Código:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: VERANO2025" 
                    className="filtro-select"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                  />
              </div>

              {/* CHECKBOX ENVÍO GRATIS */}
              <div style={{display:'flex', alignItems:'center', marginBottom:'12px', background:'rgba(255,255,255,0.05)', padding:'5px 10px', borderRadius:'5px', border: esEnvioGratis ? '1px solid #4ade80' : '1px solid transparent'}}>
                  <input 
                    type="checkbox" 
                    id="chkEnvio"
                    style={{width:'18px', height:'18px', marginRight:'8px', cursor:'pointer'}}
                    checked={esEnvioGratis}
                    onChange={e => setEsEnvioGratis(e.target.checked)}
                  />
                  <label htmlFor="chkEnvio" style={{color: esEnvioGratis ? '#4ade80' : '#cbd5e1', cursor:'pointer', fontSize:'14px', fontWeight: esEnvioGratis?'bold':'normal'}}>
                      <FaTruck style={{marginRight:'5px'}}/> Envío Gratis
                  </label>
              </div>

              {/* CAMPO PORCENTAJE (Se oculta o deshabilita si es envío gratis) */}
              {!esEnvioGratis && (
                  <div style={{display:'flex', flexDirection:'column'}}>
                      <label style={{color:'#94a3b8', fontSize:'12px'}}>Porcentaje (%):</label>
                      <input 
                        type="number" 
                        placeholder="Ej: 10" 
                        className="filtro-select"
                        style={{width:'80px'}}
                        value={porcentaje}
                        onChange={e => setPorcentaje(e.target.value)}
                      />
                  </div>
              )}

              <div style={{display:'flex', flexDirection:'column'}}>
                  <label style={{color:'#94a3b8', fontSize:'12px'}}>Vence:</label>
                  <input 
                    type="date" 
                    className="filtro-select"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                  />
              </div>

              <button type="submit" className="btn-whatsapp-sm" style={{background:'#3b82f6', border:'none', height:'38px'}}>
                  <FaPlus/> Crear
              </button>
          </form>
      </div>

      {/* LISTA DE CUPONES */}
      <div className="tabla-responsive">
          <table className="tabla-pedidos">
              <thead>
                  <tr>
                      <th>Código</th>
                      <th>Beneficio</th>
                      <th>Vence</th>
                      <th>Estado</th>
                      <th>Acción</th>
                  </tr>
              </thead>
              <tbody>
                  {cupones.map(c => (
                      <tr key={c.id}>
                          <td style={{fontWeight:'bold', color:'#e2e8f0', fontSize:'1.1rem'}}>{c.codigo}</td>
                          
                          {/* Lógica de visualización en la tabla */}
                          <td>
                              {c.es_envio_gratis || c.esEnvioGratis ? (
                                  <span style={{background:'#064e3b', color:'#4ade80', padding:'4px 8px', borderRadius:'4px', fontSize:'0.85rem', display:'flex', alignItems:'center', width:'fit-content', gap:'5px'}}>
                                      <FaTruck/> ENVÍO GRATIS
                                  </span>
                              ) : (
                                  <span style={{color:'#38bdf8', fontWeight:'bold', fontSize:'1.1rem'}}>
                                      {c.porcentaje}% OFF
                                  </span>
                              )}
                          </td>

                          <td>{c.fecha_expiracion || c.fechaVencimiento}</td>
                          
                          <td>
                              {new Date(c.fecha_expiracion) < new Date() ? 
                                <span className="badge-pedido cancelado">Vencido</span> : 
                                <span className="badge-pedido entregado">Activo</span>
                              }
                          </td>
                          <td>
                              <button onClick={() => eliminar(c.id)} className="btn-ver" style={{background:'rgba(239, 68, 68, 0.2)', color:'#f87171', border:'1px solid rgba(239, 68, 68, 0.3)'}}>
                                  <FaTrash/>
                              </button>
                          </td>
                      </tr>
                  ))}
                  {cupones.length === 0 && <tr><td colSpan="5" style={{padding:'20px', textAlign:'center'}}>No hay cupones creados</td></tr>}
              </tbody>
          </table>
      </div>
    </div>
  );
}