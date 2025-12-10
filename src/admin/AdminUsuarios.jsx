import React, { useEffect, useState, useContext } from "react";
import { listarUsuarios, alternarBloqueo, cambiarRolUsuario } from "./services/adminUsuarioService";
import { AuthContext } from "../context/AuthContext";
import { FaSearch, FaUserShield, FaBan, FaUnlock, FaUserTie, FaUser } from "react-icons/fa";
import "./AdminUsuarios.css";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const { usuario: miUsuario } = useContext(AuthContext); // Saber quién soy yo

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

  // Filtro
  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-usuarios">
      <h2>👮‍♂️ Control de Usuarios (Zona Super Admin)</h2>

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
                            {u.role !== "SUPER_ADMIN" && u.id !== miUsuario?.id && (
                                <button 
                                    onClick={() => handleBloqueo(u.id)}
                                    className={`btn-action ${u.activo ? 'btn-ban' : 'btn-unlock'}`}
                                    title={u.activo ? "Bloquear acceso" : "Permitir acceso"}
                                >
                                    {u.activo ? <FaBan/> : <FaUnlock/>}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}