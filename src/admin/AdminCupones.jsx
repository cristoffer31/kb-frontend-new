import React, { useEffect, useState } from "react";
import { listarCupones, crearCupon, alternarEstadoCupon, eliminarCupon } from "./services/adminCuponService";
import { FaTicketAlt, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import "./AdminCupones.css";

export default function AdminCupones() {
  const [cupones, setCupones] = useState([]);
  const [form, setForm] = useState({ codigo: "", porcentaje: "" });

  async function cargar() {
    try {
      const data = await listarCupones();
      setCupones(data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.codigo || !form.porcentaje) return;
    try {
        await crearCupon({ codigo: form.codigo, porcentaje: parseFloat(form.porcentaje) });
        setForm({ codigo: "", porcentaje: "" });
        cargar();
    } catch (e) { alert("Error al crear cupón"); }
  }

  async function toggle(id) {
    await alternarEstadoCupon(id);
    cargar();
  }

  async function borrar(id) {
    if(confirm("¿Eliminar cupón?")) {
        await eliminarCupon(id);
        cargar();
    }
  }

  return (
    <div className="admin-cupones">
      <h2>🎫 Gestión de Cupones</h2>

      <form className="cupon-form" onSubmit={handleSubmit}>
        <input 
            type="text" 
            placeholder="CÓDIGO (Ej: VERANO2025)" 
            value={form.codigo}
            onChange={e => setForm({...form, codigo: e.target.value.toUpperCase()})}
            maxLength={15}
            required
        />
        <input 
            type="number" 
            placeholder="% Descuento (Ej: 10)" 
            value={form.porcentaje}
            onChange={e => setForm({...form, porcentaje: e.target.value})}
            min="1" max="100"
            required
        />
        <button type="submit">Crear Cupón</button>
      </form>

      <div className="cupones-grid">
        {cupones.map(c => (
            <div key={c.id} className={`cupon-card ${c.activo ? 'activo' : 'inactivo'}`}>
                <div className="cupon-icon"><FaTicketAlt /></div>
                <div className="cupon-info">
                    <h3>{c.codigo}</h3>
                    <span className="porcentaje">{c.porcentaje}% OFF</span>
                    <span className="estado">{c.activo ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="cupon-actions">
                    <button onClick={() => toggle(c.id)} className="btn-toggle">
                        {c.activo ? <FaToggleOn color="#22c55e" size={24}/> : <FaToggleOff color="#94a3b8" size={24}/>}
                    </button>
                    <button onClick={() => borrar(c.id)} className="btn-trash">
                        <FaTrash />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}