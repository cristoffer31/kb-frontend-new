import React, { useEffect, useState } from "react";
import "./AdminProductos.css";
import { listarProductos, crearProducto, actualizarProducto, eliminarProducto } from "./services/adminProductoService";
import { listarCategorias } from "./services/adminCategoriaService";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    nombre: "", precio: "", descripcion: "", categoriaId: "",
    imagenUrl: "", stock: "", codigoBarras: "",
    precioOferta: "", enOferta: false, preciosMayoreo: [],
    // SOLO VARIANTES
    talla: "", variante: "", codigoAgrupador: ""
  });

  const [reglaTemp, setReglaTemp] = useState({ cantidad: "", precio: "" });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  async function cargar() {
    try {
        const resProd = await listarProductos();
        const resCat = await listarCategorias();
        setProductos(resProd.content || (Array.isArray(resProd) ? resProd : []));
        setCategorias(Array.isArray(resCat) ? resCat : []);
    } catch (e) { console.error(e); setProductos([]); }
  }

  useEffect(() => { cargar(); }, []);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  function agregarRegla() {
    if (!reglaTemp.cantidad || !reglaTemp.precio) return;
    setForm({ ...form, preciosMayoreo: [...form.preciosMayoreo, { cantidadMin: parseInt(reglaTemp.cantidad), precioUnitario: parseFloat(reglaTemp.precio) }] });
    setReglaTemp({ cantidad: "", precio: "" });
  }
  function quitarRegla(i) {
     const n = [...form.preciosMayoreo]; n.splice(i,1); setForm({...form, preciosMayoreo:n});
  }
  function handleArchivo(e) {
    const file = e.target.files[0]; setArchivo(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const dataToSend = {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
        precioOferta: form.precioOferta ? parseFloat(form.precioOferta) : 0,
        enOferta: Boolean(form.enOferta),
        preciosMayoreo: form.preciosMayoreo,
        // VARIANTES
        talla: form.talla,
        variante: form.variante,
        codigoAgrupador: form.codigoAgrupador
    };

    try {
      if (editId) await actualizarProducto(editId, dataToSend, archivo);
      else await crearProducto(dataToSend, archivo);
      
      setForm({ 
          nombre: "", precio: "", descripcion: "", categoriaId: "", 
          imagenUrl: "", stock: "", codigoBarras: "", 
          precioOferta: "", enOferta: false, preciosMayoreo: [], 
          talla: "", variante: "", codigoAgrupador: "" 
      });
      setArchivo(null); setPreview(null); setEditId(null);
      cargar();
    } catch (error) { alert("Error al guardar."); }
  }

  function cargarProductoEdicion(p) {
    setEditId(p.id);
    setForm({
      nombre: p.nombre, precio: p.precio, descripcion: p.descripcion,
      categoriaId: p.category ? p.category.id : "", imagenUrl: p.imagenUrl,
      stock: p.stock, codigoBarras: p.codigoBarras,
      precioOferta: p.precioOferta || "", enOferta: p.enOferta || false,
      preciosMayoreo: p.preciosMayoreo || [],
      talla: p.talla || "", variante: p.variante || "", codigoAgrupador: p.codigoAgrupador || ""
    });
    setPreview(p.imagenUrl);
  }

  async function borrar(id) { if (confirm("¿Eliminar?")) { await eliminarProducto(id); cargar(); } }

  return (
    <div className="admin-productos">
      <h2>Gestionar Productos</h2>
      <form className="prod-form" onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input type="number" name="precio" placeholder="Precio ($)" value={form.precio} onChange={handleChange} required step="0.01"/>
        <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <input type="text" name="codigoBarras" placeholder="Código de barras" value={form.codigoBarras} onChange={handleChange} required />
        
        {/* ZONA DE VARIANTES (AZUL) */}
        <div style={{gridColumn:'1/-1', background:'#f0f9ff', padding:'15px', borderRadius:'10px', border:'1px solid #bae6fd', marginBottom:'10px'}}>
            <h4 style={{color:'#0284c7', margin:'0 0 10px 0', fontSize:'0.9rem'}}>Variantes (Opcional)</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                <input type="text" name="talla" placeholder="Talla (ej: P, M)" value={form.talla} onChange={handleChange} />
                <input type="text" name="variante" placeholder="Variante (ej: Lavanda)" value={form.variante} onChange={handleChange} />
                <input type="text" name="codigoAgrupador" placeholder="Cód. Agrupador (ej: HUGG-01)" value={form.codigoAgrupador} onChange={handleChange} />
            </div>
            <small style={{color:'#64748b', fontSize:'0.8rem'}}>*Productos con el mismo "Cód. Agrupador" aparecerán juntos.</small>
        </div>

        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
        <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required>
          <option value="">Categoría</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        {/* Precios Mayoreo */}
        <div style={{gridColumn: '1 / -1', background:'#1e293b', padding:'15px', borderRadius:'10px'}}>
            <h4 style={{color:'#38bdf8', marginBottom:'10px'}}>Precios Mayoreo</h4>
            <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                <input type="number" placeholder="Cant." value={reglaTemp.cantidad} onChange={e=>setReglaTemp({...reglaTemp, cantidad:e.target.value})} style={{width:'100px'}} />
                <input type="number" placeholder="Precio" value={reglaTemp.precio} onChange={e=>setReglaTemp({...reglaTemp, precio:e.target.value})} style={{width:'100px'}} />
                <button type="button" onClick={agregarRegla} style={{width:'auto'}}>Agregar</button>
            </div>
            <ul style={{padding:0}}>
                {form.preciosMayoreo.map((r, i) => (
                    <li key={i} style={{color:'#cbd5e1', marginBottom:'5px'}}>
                        {r.cantidadMin}+ un. ➝ ${r.precioUnitario} <button type="button" onClick={() => quitarRegla(i)} className="delete" style={{padding:'2px 6px', marginLeft:'10px'}}>X</button>
                    </li>
                ))}
            </ul>
        </div>

        <div className="oferta-box" style={{gridColumn: '1 / -1', background: 'rgba(56, 189, 248, 0.1)', padding:'15px', borderRadius:'10px', display:'flex', gap:'20px', alignItems:'center', marginTop: '10px'}}>
            <label style={{color:'#e5e7eb', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px'}}>
                <input type="checkbox" name="enOferta" checked={form.enOferta} onChange={e => setForm({...form, enOferta: e.target.checked})} style={{width: '20px', height: '20px'}} /> ¿Oferta?
            </label>
            {form.enOferta && <input type="number" name="precioOferta" placeholder="Precio Oferta" value={form.precioOferta} onChange={handleChange} style={{width:'120px', margin:0}} />}
        </div>

        <div className="imagen-preview-box">{preview && <img src={preview} className="preview-img" alt="preview" />}</div>
        <input type="file" onChange={handleArchivo} />
        <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
      </form>
      
      <table className="prod-table">
        <thead><tr><th>Imagen</th><th>Nombre</th><th>Cód.</th><th>Precio</th><th>Acciones</th></tr></thead>
        <tbody>
          {Array.isArray(productos) && productos.map(p => (
            <tr key={p.id}>
               <td><img src={p.imagenUrl} height="50" alt="p"/></td>
               <td>{p.nombre}</td>
               <td>{p.codigoBarras}</td>
               <td>${p.precio}</td>
               <td>
                   <button onClick={() => cargarProductoEdicion(p)}>Editar</button>
                   <button className="delete" onClick={() => borrar(p.id)}>Eliminar</button>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}