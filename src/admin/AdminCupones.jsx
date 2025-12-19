import React, { useEffect, useState } from "react";
// Asegúrate de tener estas funciones en tu servicio, o créalas
import { adminListarCupones, adminCrearCupon, adminEliminarCupon } from "./services/adminCuponService"; 
import "./AdminPedidos.css"; // Reutilizamos estilos del admin
import { FaTicketAlt, FaTrash, FaPlus } from "react-icons/fa";

export default function AdminCupones() {
  const [cupones, setCupones] = useState([]);
  
  // 1. DEFINIR LOS ESTADOS (Esto es lo que te faltaba)
  const [codigo, setCodigo] = useState("");
  const [porcentaje, setPorcentaje] = useState("");
  const [fecha, setFecha] = useState("");
  
  // Cargar cupones al inicio
  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
        const data = await adminListarCupones();
        setCupones(data);
    } catch (error) { console.error(error); }
  }

  // 2. FUNCIÓN DE GUARDAR CORREGIDA
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!codigo || !porcentaje || !fecha) {
        return alert("Todos los campos son obligatorios");
    }

    // Preparamos los datos EXACTAMENTE como los pide Laravel
    const payload = {
        codigo: codigo.toUpperCase(),       // Backend espera 'codigo'
        porcentaje: parseInt(porcentaje),   // Backend espera 'porcentaje' (número)
        fecha_expiracion: fecha,            // Backend espera 'fecha_expiracion'
        activo: true
    };

    try {
        await adminCrearCupon(payload);
        alert("✅ Cupón creado con éxito");
        
        // Limpiar formulario
        setCodigo("");
        setPorcentaje("");
        setFecha("");
        
        // Recargar lista
        cargar();

    } catch (error) {
        console.error(error);
        // Manejo del error 422 (Validación de Laravel)
        if (error.response && error.response.status === 422) {
            const errors = error.response.data.errors;
            let msg = "Error de validación:\n";
            // Recorrer errores y mostrarlos
            Object.keys(errors).forEach(key => {
                msg += `- ${errors[key][0]}\n`;
            });
            alert(msg);
        } else {
            alert("Error al crear cupón. Revisa la consola.");
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
          <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'end'}}>
              
              <div style={{display:'flex', flexDirection:'column'}}>
                  <label style={{color:'#94a3b8', fontSize:'12px'}}>Código:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: VERANO2025" 
                    className="filtro-select"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)} // Vinculamos estado
                  />
              </div>

              <div style={{display:'flex', flexDirection:'column'}}>
                  <label style={{color:'#94a3b8', fontSize:'12px'}}>Porcentaje (%):</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 10" 
                    className="filtro-select"
                    style={{width:'80px'}}
                    value={porcentaje}
                    onChange={e => setPorcentaje(e.target.value)} // Vinculamos estado
                  />
              </div>

              <div style={{display:'flex', flexDirection:'column'}}>
                  <label style={{color:'#94a3b8', fontSize:'12px'}}>Vence:</label>
                  <input 
                    type="date" 
                    className="filtro-select"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)} // Vinculamos estado
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
                      <th>Descuento</th>
                      <th>Vence</th>
                      <th>Estado</th>
                      <th>Acción</th>
                  </tr>
              </thead>
              <tbody>
                  {cupones.map(c => (
                      <tr key={c.id}>
                          <td style={{fontWeight:'bold', color:'#e2e8f0'}}>{c.codigo}</td>
                          <td style={{color:'#4ade80', fontWeight:'bold'}}>{c.porcentaje}% OFF</td>
                          <td>{c.fecha_expiracion}</td>
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
                  {cupones.length === 0 && <tr><td colSpan="5" style={{padding:'20px'}}>No hay cupones creados</td></tr>}
              </tbody>
          </table>
      </div>
    </div>
  );
}