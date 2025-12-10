import React, { useEffect, useState } from "react";
import "./AdminCategorias.css";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from "./services/adminCategoriaService";

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagenUrl, setImagenUrl] = useState(""); // Para guardar la URL existente
  
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  async function cargar() {
    const data = await listarCategorias();
    setCategorias(data);
  }

  useEffect(() => { cargar(); }, []);

  function handleArchivo(e) {
    const file = e.target.files[0];
    setArchivo(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;

    const datos = { nombre, imagenUrl }; // Enviamos la URL vieja por si no cambia

    if (editId) {
      await actualizarCategoria(editId, datos, archivo);
    } else {
      await crearCategoria(datos, archivo);
    }

    // Limpiar
    setNombre("");
    setImagenUrl("");
    setArchivo(null);
    setPreview(null);
    setEditId(null);
    cargar();
  }

  async function handleEdit(cat) {
    setEditId(cat.id);
    setNombre(cat.nombre);
    setImagenUrl(cat.imagenUrl);
    setPreview(cat.imagenUrl); // Mostrar la imagen actual
  }

  async function handleDelete(id) {
    if (confirm("¿Eliminar categoría?")) {
      await eliminarCategoria(id);
      cargar();
    }
  }

  return (
    <div className="admin-categorias">
      <h2>Gestión de Categorías</h2>

      <form className="categoria-form" onSubmit={handleSubmit}>
        <div style={{display:'flex', flexDirection:'column', gap:'10px', flex:1}}>
            <input
              type="text"
              placeholder="Nombre de categoría"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input type="file" onChange={handleArchivo} accept="image/*" />
        </div>

        {preview && (
            <div style={{width:'60px', height:'60px', borderRadius:'8px', overflow:'hidden', border:'1px solid #ccc'}}>
                <img src={preview} alt="Preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
            </div>
        )}

        <button type="submit">
          {editId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <table className="categoria-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                  {cat.imagenUrl ? (
                      <img src={cat.imagenUrl} alt={cat.nombre} style={{width:'40px', height:'40px', borderRadius:'6px', objectFit:'cover'}} />
                  ) : (
                      <span style={{fontSize:'0.8rem', color:'#888'}}>Sin img</span>
                  )}
              </td>
              <td>{cat.nombre}</td>
              <td>
                <button onClick={() => handleEdit(cat)}>Editar</button>
                <button className="delete" onClick={() => handleDelete(cat.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}