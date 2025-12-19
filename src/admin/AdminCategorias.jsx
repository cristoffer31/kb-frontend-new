import React, { useEffect, useState } from "react";
import "./AdminCategorias.css";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from "./services/adminCategoriaService";

// 1. URL BASE PARA LAS IMÁGENES (Ajusta si tu puerto es diferente)
// 1. URL BASE PARA LAS IMÁGENES (Desde variables de entorno)
const BASE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage/";

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState(null); // El archivo nuevo
  const [preview, setPreview] = useState(null); // Vista previa (local o servidor)
  const [editId, setEditId] = useState(null);

  async function cargar() {
    try {
        const data = await listarCategorias();
        setCategorias(data);
    } catch (error) { console.error(error); }
  }

  useEffect(() => { cargar(); }, []);

  // 2. MANEJO DEL ARCHIVO (INPUT FILE)
  function handleArchivo(e) {
    const file = e.target.files[0];
    if (file) {
        setArchivo(file);
        // Creamos una URL temporal segura para ver lo que acabamos de seleccionar
        setPreview(URL.createObjectURL(file));
    }
  }

  // 3. ENVÍO DEL FORMULARIO (CORREGIDO CON FORMDATA)
  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;

    // CREAMOS EL FORMDATA
    const formData = new FormData();
    formData.append("nombre", nombre);
    
    // Si hay un archivo nuevo seleccionado, lo agregamos
    if (archivo) {
        formData.append("imagen", archivo); 
    }

    try {
        if (editId) {
            // Para actualizar (algunos backends requieren _method: PUT en FormData)
            formData.append("_method", "PUT"); 
            await actualizarCategoria(editId, formData);
        } else {
            // Para crear
            await crearCategoria(formData);
        }

        alert(editId ? "Categoría actualizada" : "Categoría creada");
        limpiar();
        cargar();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error. Revisa la consola.");
    }
  }

  function limpiar() {
    setNombre("");
    setArchivo(null);
    setPreview(null);
    setEditId(null);
    // Limpiamos el input file visualmente
    document.getElementById("input-file-cat").value = ""; 
  }

  // 4. MODO EDICIÓN
  function handleEdit(cat) {
    setEditId(cat.id);
    setNombre(cat.nombre);
    setArchivo(null); // Reseteamos archivo nuevo
    
    // Si la categoría tiene imagen guardada, mostramos esa
    if (cat.imagen) {
        // Detectamos si es una URL completa (http) o una ruta relativa (categorias/foto.jpg)
        const rutaImagen = cat.imagen.startsWith("http") 
            ? cat.imagen 
            : `${BASE_URL}${cat.imagen}`;
        setPreview(rutaImagen);
    } else {
        setPreview(null);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("¿Eliminar categoría?")) {
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
            {/* Agregamos ID para poder limpiarlo luego */}
            <input 
                id="input-file-cat"
                type="file" 
                onChange={handleArchivo} 
                accept="image/*" 
            />
        </div>

        {/* VISTA PREVIA */}
        {preview && (
            <div style={{width:'60px', height:'60px', borderRadius:'8px', overflow:'hidden', border:'1px solid #ccc', background:'#f0f0f0'}}>
                <img 
                    src={preview} 
                    alt="Preview" 
                    style={{width:'100%', height:'100%', objectFit:'cover'}} 
                />
            </div>
        )}

        <div style={{display:'flex', gap:'5px'}}>
            <button type="submit" className="btn-guardar">
              {editId ? "Actualizar" : "Crear"}
            </button>
            {editId && <button type="button" onClick={limpiar} style={{background:'#64748b'}}>Cancelar</button>}
        </div>
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
                  {/* 5. MOSTRAR IMAGEN DE LA LISTA */}
                  {cat.imagen ? (
                      <img 
                        src={cat.imagen.startsWith("http") ? cat.imagen : `${BASE_URL}${cat.imagen}`} 
                        alt={cat.nombre} 
                        style={{width:'40px', height:'40px', borderRadius:'6px', objectFit:'cover', border:'1px solid #ddd'}} 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40?text=?"; }} // Fallback si falla
                      />
                  ) : (
                      <span style={{fontSize:'0.8rem', color:'#888'}}>Sin img</span>
                  )}
              </td>
              <td>{cat.nombre}</td>
              <td>
                <button onClick={() => handleEdit(cat)} className="btn-edit">Editar</button>
                <button className="delete" onClick={() => handleDelete(cat.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}