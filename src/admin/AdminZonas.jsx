import React, { useEffect, useState } from "react";
import { listarZonas, crearZona, actualizarZona, eliminarZona } from "../services/zonaService";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./AdminZonas.css";

export default function AdminZonas() {
  const [zonas, setZonas] = useState([]);
  const [form, setForm] = useState({ departamento: "", tarifa: "", municipios: "" });
  const [editId, setEditId] = useState(null);

  async function cargar() {
    try {
        const data = await listarZonas();
        setZonas(data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
        ...form, 
        tarifa: parseFloat(form.tarifa) 
    };

    try {
        if (editId) await actualizarZona(editId, payload);
        else await crearZona(payload);
        
        setForm({ departamento: "", tarifa: "", municipios: "" });
        setEditId(null);
        cargar();
    } catch (e) { alert("Error al guardar zona"); }
  };

  const handleEdit = (z) => {
      setEditId(z.id);
      setForm({ departamento: z.departamento, tarifa: z.tarifa, municipios: z.municipios });
  };

  const handleDelete = async (id) => {
      if(confirm("¿Eliminar esta zona?")) {
          await eliminarZona(id);
          cargar();
      }
  };

  return (
    <div className="admin-zonas">
      <h2>🌍 Gestión de Zonas de Envío</h2>

      <form className="zona-form" onSubmit={handleSubmit}>
        <div className="form-row">
            <input 
                type="text" placeholder="Departamento (ej: San Salvador)" 
                value={form.departamento} onChange={e => setForm({...form, departamento: e.target.value})} required 
            />
            <input 
                type="number" placeholder="Tarifa ($)" 
                value={form.tarifa} onChange={e => setForm({...form, tarifa: e.target.value})} required step="0.01"
            />
        </div>
        <textarea 
            placeholder="Municipios separados por coma (ej: Escalón, San Benito) o escribe 'TODOS' para cobertura total."
            value={form.municipios} onChange={e => setForm({...form, municipios: e.target.value})}
            required
        />
        <button type="submit">{editId ? "Actualizar" : "Agregar Zona"}</button>
        {editId && <button type="button" className="btn-cancel" onClick={() => {setEditId(null); setForm({departamento:"", tarifa:"", municipios:""})}}>Cancelar</button>}
      </form>

      <div className="zonas-grid">
        {zonas.map(z => (
            <div key={z.id} className="zona-card">
                <div className="zona-header">
                    <h4>{z.departamento}</h4>
                    <span className="zona-precio">${Number(z.tarifa).toFixed(2)}</span>
                </div>
                <p className="zona-lista">{z.municipios}</p>
                <div className="zona-actions">
                    <button onClick={() => handleEdit(z)} className="btn-edit"><FaEdit/></button>
                    <button onClick={() => handleDelete(z.id)} className="btn-trash"><FaTrash/></button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}