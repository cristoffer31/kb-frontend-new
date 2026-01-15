import React, { useEffect, useState } from "react";
import "./AdminProductos.css";
import { listarProductos, crearProducto, actualizarProducto, eliminarProducto } from "./services/adminProductoService";
import { listarCategorias } from "./services/adminCategoriaService";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    categoriaId: "",
    imagenUrl: "",
    stock: "",
    codigoBarras: "",
    precioOferta: "",
    enOferta: false,
    preciosMayoreo: [],
    talla: "",
    variante: "",
    codigoAgrupador: ""
  });

  const [reglaTemp, setReglaTemp] = useState({ cantidad: "", precio: "" });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    try {
        const [resProd, resCat] = await Promise.all([
            listarProductos('?limit=todo'),
            listarCategorias()
        ]);
        setProductos(Array.isArray(resProd) ? resProd : []);
        setCategorias(Array.isArray(resCat) ? resCat : []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { cargar(); }, []);

  function handleChange(e) { 
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm({ ...form, [e.target.name]: value }); 
  }

  function agregarRegla() {
    if (!reglaTemp.cantidad || !reglaTemp.precio) return;
    setForm({ 
        ...form, 
        preciosMayoreo: [
            ...form.preciosMayoreo, 
            { cantidadMin: parseInt(reglaTemp.cantidad), precioUnitario: parseFloat(reglaTemp.precio) }
        ] 
    });
    setReglaTemp({ cantidad: "", precio: "" });
  }
  
  function quitarRegla(i) {
     const n = [...form.preciosMayoreo]; 
     n.splice(i,1); 
     setForm({...form, preciosMayoreo:n});
  }

  function handleArchivo(e) {
    const file = e.target.files[0]; 
    setArchivo(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    
    // Mantenemos tu objeto original pero aseguramos los nombres para el servicio
    const dataToSend = {
        ...form,
        categoria_id: form.categoriaId, // Parche de compatibilidad
        oferta: form.enOferta ? 1 : 0
    };

    try {
      if (editId) {
          await actualizarProducto(editId, dataToSend, archivo);
          alert("✅ Producto actualizado");
      } else {
          await crearProducto(dataToSend, archivo);
          alert("✅ Producto creado");
      }
      limpiarFormulario();
      cargar();
    } catch (error) { 
        alert("❌ Error al guardar. Revisa la consola."); 
    } finally {
        setCargando(false);
    }
  }

  function limpiarFormulario() {
      setForm({ 
          nombre: "", precio: "", descripcion: "", categoriaId: "", 
          imagenUrl: "", stock: "", codigoBarras: "", 
          precioOferta: "", enOferta: false, preciosMayoreo: [], 
          talla: "", variante: "", codigoAgrupador: "" 
      });
      setArchivo(null); setPreview(null); setEditId(null);
      if(document.getElementById("fileInput")) document.getElementById("fileInput").value = "";
  }

  function cargarProductoEdicion(p) {
    setEditId(p.id);
    setForm({
      nombre: p.nombre || "",
      precio: p.precio || "",
      descripcion: p.descripcion || "",
      categoriaId: p.categoria_id || p.categoria?.id || "",
      imagenUrl: p.imagen || "",
      stock: p.stock || 0,
      codigoBarras: p.codigo_barras || "", 
      precioOferta: p.precio_oferta || "",
      enOferta: (p.oferta === 1 || p.oferta === true), 
      preciosMayoreo: p.precios_mayoreo_relacion || [], 
      talla: p.talla || "",
      variante: p.variante || "",
      codigoAgrupador: p.codigo_agrupador || ""
    });
    setPreview(p.imagen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function borrar(id) { 
      if (confirm("¿Eliminar?")) { 
        try { await eliminarProducto(id); cargar(); } catch (e) { alert("Error"); }
      } 
  }

  async function toggleEstado(producto) {
      try {
          const nuevoEstado = !producto.activo;
          const datos = {
              nombre: producto.nombre,
              precio: producto.precio,
              descripcion: producto.descripcion,
              stock: producto.stock,
              categoriaId: producto.categoria_id, 
              codigoBarras: producto.codigo_barras,
              precioOferta: producto.precio_oferta,
              enOferta: producto.oferta,
              talla: producto.talla,
              variante: producto.variante,
              codigoAgrupador: producto.codigo_agrupador,
              activo: nuevoEstado 
          };

          await actualizarProducto(producto.id, datos, null);
          cargar(); 
      } catch (error) {
          console.error(error);
          alert("No se pudo cambiar el estado");
      }
  }

  return (
    <div className="admin-productos">
      <h2>Gestionar Productos</h2>
      
      <form className="prod-form" onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        
        <div style={{display: 'flex', gap: '10px'}}>
            <input type="number" name="precio" placeholder="Precio ($)" value={form.precio} onChange={handleChange} required step="0.01"/>
            <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required />
            <input type="text" name="codigoBarras" placeholder="Código de barras" value={form.codigoBarras} onChange={handleChange} />
        </div>

        {/* VARIANTES (Tu diseño celeste original) */}
        <div style={{gridColumn:'1/-1', background:'#f0f9ff', padding:'15px', borderRadius:'10px', border:'1px solid #bae6fd', marginBottom:'10px'}}>
            <h4 style={{color:'#0284c7', margin:'0 0 10px 0', fontSize:'0.9rem'}}>Variantes (Tallas y Colores)</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                <input type="text" name="talla" placeholder="Talla" value={form.talla} onChange={handleChange} />
                <input type="text" name="variante" placeholder="Variante" value={form.variante} onChange={handleChange} />
                <input type="text" name="codigoAgrupador" placeholder="Cód. Agrupador" value={form.codigoAgrupador} onChange={handleChange} />
            </div>
        </div>

        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
        
        <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required>
          <option value="">-- Selecciona una Categoría --</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        {/* MAYOREO (Tu diseño oscuro original) */}
        <div style={{gridColumn: '1 / -1', background:'#1e293b', padding:'15px', borderRadius:'10px'}}>
            <h4 style={{color:'#38bdf8', marginBottom:'10px'}}>Precios de Mayoreo</h4>
            <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                <input type="number" placeholder="Min." value={reglaTemp.cantidad} onChange={e=>setReglaTemp({...reglaTemp, cantidad:e.target.value})} style={{width:'100px'}} />
                <input type="number" placeholder="Precio" value={reglaTemp.precio} onChange={e=>setReglaTemp({...reglaTemp, precio:e.target.value})} style={{width:'100px'}} />
                <button type="button" onClick={agregarRegla} style={{background: '#0ea5e9'}}>Agregar</button>
            </div>
            {form.preciosMayoreo.map((r, i) => (
                <div key={i} style={{color:'#cbd5e1', marginBottom:'5px', background:'rgba(255,255,255,0.1)', padding:'8px', borderRadius:'5px', display:'flex', justifyContent:'space-between'}}>
                    <span>{r.cantidadMin || r.cantidad_min} un. - ${r.precioUnitario || r.precio_unitario}</span>
                    <button type="button" onClick={() => quitarRegla(i)} className="delete" style={{padding:'0 5px'}}>X</button>
                </div>
            ))}
        </div>

        {/* OFERTA */}
        <div className="oferta-box" style={{gridColumn: '1 / -1', background: form.enOferta ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'10px', display:'flex', gap:'20px', alignItems:'center', border: form.enOferta ? '1px solid #38bdf8' : 'none'}}>
            <label style={{color:'#fff'}}><input type="checkbox" name="enOferta" checked={form.enOferta} onChange={handleChange} /> ¿En Oferta?</label>
            {form.enOferta && <input type="number" name="precioOferta" placeholder="Precio Oferta" value={form.precioOferta} onChange={handleChange} />}
        </div>

        <div className="imagen-preview-box">
            {preview ? <img src={preview} className="preview-img" alt="preview" /> : <p>Sin imagen</p>}
        </div>
        <input id="fileInput" type="file" onChange={handleArchivo} accept="image/*" />
        
        <button type="submit" disabled={cargando} style={{gridColumn: '1 / -1'}}>
            {cargando ? "Procesando..." : (editId ? "💾 Guardar Cambios" : "➕ Crear Producto")}
        </button>
        {editId && (
        <button 
            type="button" 
            onClick={limpiarFormulario} 
            style={{
                background: '#64748b', 
                flex: 0.3 
            }}
        >
            ❌ Cancelar
        </button>
    )}
      </form>

      {/* TABLA (Tu diseño original) */}
      <table className="prod-table" style={{marginTop:'30px'}}>
        <thead>
            <tr><th>Imagen</th><th>Nombre</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {productos.map(p => (
            // 1. Agregamos estilo de opacidad: Si está inactivo, se ve al 60%
            <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.6, transition: 'opacity 0.3s' }}>
                <td><img src={p.imagen || '/placeholder.png'} height="50" style={{borderRadius:'5px'}} /></td>
                <td>{p.nombre}</td>
                <td style={{color: p.stock < 5 ? 'red' : 'white'}}>{p.stock}</td>
                
                {/* 2. AQUÍ ESTÁ LA NUEVA CELDA DEL BOTÓN DE ESTADO */}
                <td>
                    <button 
                        type="button"
                        onClick={() => toggleEstado(p)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            // Verde suave si es activo, Rojo suave si es inactivo
                            backgroundColor: p.activo ? '#dcfce7' : '#fee2e2', 
                            color: p.activo ? '#166534' : '#991b1b',           
                            border: p.activo ? '1px solid #86efac' : '1px solid #fca5a5'
                        }}
                    >
                        {p.activo ? '🟢 Activo' : '🔴 Inactivo'}
                    </button>
                </td>
                {/* ----------------------------------------------- */}

                <td>
                    <div className="acciones-group">
                        <button onClick={() => cargarProductoEdicion(p)}>✏️</button>
                        <button className="delete" onClick={() => borrar(p.id)}>🗑️</button>
                    </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}