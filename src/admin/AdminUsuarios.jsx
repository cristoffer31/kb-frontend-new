import React, { useEffect, useState, useContext } from "react";
import { listarUsuarios, alternarBloqueo, cambiarRolUsuario, obtenerHistorialCompras } from "./services/adminUsuarioService";
import { AuthContext } from "../context/AuthContext";
import { FaSearch, FaUserShield, FaBan, FaUnlock, FaUserTie, FaUser, FaHistory, FaTimes, FaBoxOpen } from "react-icons/fa";
import "./AdminUsuarios.css";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const { usuario: miUsuario } = useContext(AuthContext);
  
  const [historial, setHistorial] = useState(null); 
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
        const data = await listarUsuarios();
        setUsuarios(data);
    } catch (error) {
        console.error("Acceso denegado o error", error);
    }
  }

  const handleBloqueo = async (id) => {
      if(confirm("¿Seguro que deseas cambiar el estado de bloqueo de este usuario?")) {
          await alternarBloqueo(id);
          cargar();
      }
  };

  const handleRol = async (id, rolActual) => {
      const nuevoRol = rolActual === "ADMIN" ? "USER" : "ADMIN";
      if(confirm(`¿Cambiar rol de ${rolActual} a ${nuevoRol}?`)) {
          await cambiarRolUsuario(id, nuevoRol);
          cargar();
      }
  };

  const verHistorial = async (usuario) => {
      setClienteSeleccionado(usuario);
      setCargandoHistorial(true);
      setHistorial([]); 
      try {
          const pedidos = await obtenerHistorialCompras(usuario.id);
          // Aseguramos que 'pedidos' sea un array
          setHistorial(Array.isArray(pedidos) ? pedidos : []);
      } catch (error) {
          console.error(error);
          alert("No se pudo cargar el historial.");
      } finally {
          setCargandoHistorial(false);
      }
  };

  const cerrarModal = () => {
      setClienteSeleccionado(null);
      setHistorial(null);
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-usuarios">
      <h2>👮‍♂️ Control de Usuarios</h2>

      <div className="toolbar">
        <div className="search-input">
            <FaSearch className="icon" />
            <input type="text" placeholder="Buscar usuario..." value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
        </div>
      </div>

      <div className="table-container">
        <table className="user-table">
            <thead>
                <tr>
                    <th>Nombre / Email</th>
                    <th>Rol Actual</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {usuariosFiltrados.map(u => (
                    <tr key={u.id} className={!u.activo ? "fila-bloqueada" : ""}>
                        <td>
                            <div style={{fontWeight:'bold'}}>{u.nombre}</div>
                            <div style={{fontSize:'0.8rem', color:'#94a3b8'}}>{u.email}</div>
                            {u.telefono && <div style={{fontSize:'0.75rem', color:'#38bdf8'}}>📞 {u.telefono}</div>}
                        </td>
                        
                        <td>
                            {u.role === "SUPER_ADMIN" ? (
                                <span className="badge-super">👑Admin General</span>
                            ) : (
                                <button 
                                    onClick={() => handleRol(u.id, u.role)}
                                    className={`btn-rol ${u.role === 'ADMIN' ? 'is-admin' : 'is-user'}`}
                                >
                                    {u.role === "ADMIN" ? <><FaUserTie/> Admin</> : <><FaUser/> Cliente</>}
                                </button>
                            )}
                        </td>

                        <td>
                            {u.activo ? (
                                <span className="badge-ok">Activo</span>
                            ) : (
                                <span className="badge-error">⛔ BLOQUEADO</span>
                            )}
                        </td>

                        <td>
                            <div style={{display:'flex', gap:'8px'}}>
                                <button 
                                    onClick={() => verHistorial(u)}
                                    className="btn-action btn-history"
                                    title="Ver historial de compras"
                                >
                                    <FaHistory />
                                </button>

                                {u.role !== "SUPER_ADMIN" && u.id !== miUsuario?.id && (
                                    <button 
                                        onClick={() => handleBloqueo(u.id)}
                                        className={`btn-action ${u.activo ? 'btn-ban' : 'btn-unlock'}`}
                                        title={u.activo ? "Bloquear acceso" : "Permitir acceso"}
                                    >
                                        {u.activo ? <FaBan/> : <FaUnlock/>}
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* --- MODAL DE HISTORIAL CORREGIDO --- */}
      {clienteSeleccionado && (
          <div className="modal-overlay-user">
              <div className="modal-content-user">
                  <div className="modal-header">
                      <h3>📂 Historial: {clienteSeleccionado.nombre}</h3>
                      <button onClick={cerrarModal} className="close-btn-user"><FaTimes/></button>
                  </div>
                  
                  <div className="modal-body-user">
                      {cargandoHistorial ? (
                          <p>Cargando pedidos...</p>
                      ) : historial && historial.length > 0 ? (
                          <table className="history-table">
                              <thead>
                                  <tr>
                                      <th>ID</th>
                                      <th>Fecha</th>
                                      <th>Estado</th>
                                      <th>Total</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {historial.map(p => (
                                      <tr key={p.id}>
                                          <td>#{p.id}</td>
                                          {/* CORRECCIÓN: Usamos created_at que es el estándar de Laravel */}
                                          <td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "N/A"}</td>
                                          <td>
                                              {/* CORRECCIÓN: Usamos p.estado y clases dinámicas */}
                                              <span className={`status-pill ${(p.estado || "pendiente").toLowerCase().replace(/\s/g, '-')}`}>
                                                  {p.estado || "Pendiente"}
                                              </span>
                                          </td>
                                          <td className="td-total">
                                              {/* CORRECCIÓN: Number() para evitar error de toFixed */}
                                              ${Number(p.total || 0).toFixed(2)}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      ) : (
                          <div className="empty-history">
                              <FaBoxOpen size={40} color="#64748b"/>
                              <p>Este usuario aún no ha realizado compras.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}