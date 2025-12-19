import React, { useEffect, useState } from "react";
import "./AdminProductos.css";
import { listarProductos, crearProducto, actualizarProducto, eliminarProducto } from "./services/adminProductoService";
import { listarCategorias } from "./services/adminCategoriaService";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // 1. ESTADO INICIAL
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
    // VARIANTES
    talla: "",
    variante: "",
    codigoAgrupador: ""
  });

  const [reglaTemp, setReglaTemp] = useState({ cantidad: "", precio: "" });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [cargando, setCargando] = useState(false);

  // --- CARGAR DATOS ---
  async function cargar() {
    try {
        const [resProd, resCat] = await Promise.all([
            listarProductos(),
            listarCategorias()
        ]);
        
        // Blindaje: Asegurar que siempre sea array
        setProductos(Array.isArray(resProd) ? resProd : []);
        setCategorias(Array.isArray(resCat) ? resCat : []);
    } catch (e) { 
        console.error("Error cargando datos:", e); 
        setProductos([]); 
    }
  }

  useEffect(() => { cargar(); }, []);

  // --- MANEJO DEL FORMULARIO ---
  function handleChange(e) { 
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm({ ...form, [e.target.name]: value }); 
  }

  // Gestión de Tabla Mayoreo (Local)
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

  // --- ENVIAR (CREAR / EDITAR) ---
  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    
    // Preparar objeto limpio para el servicio
    // El servicio se encargará de convertirlo a FormData
    const dataToSend = {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0,
        // Enviar ID de categoría correcto
        categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
        // Lógica de oferta
        precioOferta: form.precioOferta ? parseFloat(form.precioOferta) : null,
        enOferta: form.enOferta, // El servicio lo convertirá a 1/0 si es necesario
        // Array de objetos
        preciosMayoreo: form.preciosMayoreo,
        // Strings
        talla: form.talla,
        variante: form.variante,
        codigoAgrupador: form.codigoAgrupador
    };

    try {
      if (editId) {
          // Actualizar
          await actualizarProducto(editId, dataToSend, archivo);
          alert("✅ Producto actualizado correctamente");
      } else {
          // Crear
          await crearProducto(dataToSend, archivo);
          alert("✅ Producto creado correctamente");
      }
      
      // Limpiar todo
      limpiarFormulario();
      cargar();
    } catch (error) { 
        console.error(error);
        alert("❌ Error al guardar el producto. Revisa la consola."); 
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
      setArchivo(null); 
      setPreview(null); 
      setEditId(null);
      // Resetear input file visualmente
      document.getElementById("fileInput").value = "";
  }

  // --- CARGAR DATOS EN EL FORMULARIO (EDITAR) ---
  // Esta función adapta los datos que vienen de Laravel (snake_case) al formulario React
  function cargarProductoEdicion(p) {
    setEditId(p.id);
    setForm({
      nombre: p.nombre || "",
      precio: p.precio || "",
      descripcion: p.descripcion || "",
      
      // Busca: p.categoria_id (Laravel) o p.categoria.id (Relación)
      categoriaId: p.categoriaId || p.categoria_id || p.categoria?.id || "",
      
      imagenUrl: p.imagenUrl || p.imagen || "", // Alias o campo base
      
      stock: p.stock || 0,
      codigoBarras: p.codigo_barras || p.codigoBarras || "", 
      
      precioOferta: p.precio_oferta || p.precioOferta || "",
      // Convierte 1/0 a true/false
      enOferta: (p.oferta === 1 || p.oferta === true || p.enOferta === true), 
      
      // Laravel suele devolver esto como relación 'precios_mayoreo_relacion' o 'preciosMayoreo'
      preciosMayoreo: p.preciosMayoreo || p.precios_mayoreo_relacion || [], 
      
      talla: p.talla || "",
      variante: p.variante || "",
      codigoAgrupador: p.codigo_agrupador || p.codigoAgrupador || ""
    });
    
    setPreview(p.imagenUrl || p.imagen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function borrar(id) { 
      if (confirm("¿Seguro que deseas eliminar este producto permanentemente?")) { 
        try {
            await eliminarProducto(id); 
            cargar(); 
        } catch (e) { alert("Error al eliminar"); }
      } 
  }

  return (
    <div className="admin-productos">
      <h2>Gestionar Productos</h2>
      
      <form className="prod-form" onSubmit={handleSubmit}>
        
        {/* NOMBRE */}
        <input type="text" name="nombre" placeholder="Nombre del producto" value={form.nombre || ''} onChange={handleChange} required />
        
        {/* PRECIO Y STOCK */}
        <div style={{display: 'flex', gap: '10px'}}>
            <input type="number" name="precio" placeholder="Precio ($)" value={form.precio || ''} onChange={handleChange} required step="0.01"/>
            <input type="number" name="stock" placeholder="Stock disponible" value={form.stock || ''} onChange={handleChange} required />
        

        <input type="text" name="codigoBarras" placeholder="Código de barras (Opcional)" value={form.codigoBarras || ''} onChange={handleChange} />
        </div>
        {/* ZONA DE VARIANTES */}
        <div style={{gridColumn:'1/-1', background:'#f0f9ff', padding:'15px', borderRadius:'10px', border:'1px solid #bae6fd', marginBottom:'10px'}}>
            <h4 style={{color:'#0284c7', margin:'0 0 10px 0', fontSize:'0.9rem'}}>Variantes (Tallas y Colores)</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                <input type="text" name="talla" placeholder="Talla (ej: P, M, G)" value={form.talla || ''} onChange={handleChange} />
                <input type="text" name="variante" placeholder="Variante (ej: Rojo, Azul)" value={form.variante || ''} onChange={handleChange} />
                <input type="text" name="codigoAgrupador" placeholder="Cód. Agrupador (ej: CAMISA-01)" value={form.codigoAgrupador || ''} onChange={handleChange} />
            </div>
            <small style={{color:'#64748b', fontSize:'0.8rem'}}>*Productos con el mismo "Cód. Agrupador" se mostrarán relacionados.</small>
        </div>

        <textarea name="descripcion" placeholder="Descripción detallada" value={form.descripcion || ''} onChange={handleChange} required />
        
        {/* CATEGORÍA */}
        <select name="categoriaId" value={form.categoriaId || ''} onChange={handleChange} required>
          <option value="">-- Selecciona una Categoría --</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        {/* ZONA PRECIOS MAYOREO */}
        <div style={{gridColumn: '1 / -1', background:'#1e293b', padding:'15px', borderRadius:'10px'}}>
            <h4 style={{color:'#38bdf8', marginBottom:'10px'}}>Precios de Mayoreo</h4>
            <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                <input type="number" placeholder="Min. Unidades" value={reglaTemp.cantidad} onChange={e=>setReglaTemp({...reglaTemp, cantidad:e.target.value})} style={{width:'120px'}} />
                <input type="number" placeholder="Precio Unitario" value={reglaTemp.precio} onChange={e=>setReglaTemp({...reglaTemp, precio:e.target.value})} style={{width:'120px'}} />
                <button type="button" onClick={agregarRegla} style={{width:'auto', background: '#0ea5e9'}}>Agregar Regla</button>
            </div>
            
            {form.preciosMayoreo && form.preciosMayoreo.length > 0 && (
                <ul style={{padding:0, margin:0}}>
                    {form.preciosMayoreo.map((r, i) => (
                        <li key={i} style={{color:'#cbd5e1', marginBottom:'5px', background:'rgba(255,255,255,0.1)', padding:'5px 10px', borderRadius:'5px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <span>
                                {/* Soporte para leer tanto cantidadMin (React) como cantidad_min (Laravel) */}
                                A partir de <b>{r.cantidadMin || r.cantidad_min}</b> unidades: 
                                <b> ${r.precioUnitario || r.precio_unitario}</b> c/u
                            </span>
                            <button type="button" onClick={() => quitarRegla(i)} className="delete" style={{padding:'2px 8px', marginLeft:'10px', height:'auto'}}>X</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* ZONA OFERTA */}
        <div className="oferta-box" style={{gridColumn: '1 / -1', background: form.enOferta ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'10px', display:'flex', gap:'20px', alignItems:'center', marginTop: '10px', border: form.enOferta ? '1px solid #38bdf8' : 'none'}}>
            <label style={{color:'#e5e7eb', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
                <input type="checkbox" name="enOferta" checked={!!form.enOferta} onChange={handleChange} style={{width: '20px', height: '20px'}} /> 
                ¿Este producto está en Oferta?
            </label>
            {form.enOferta && (
                <input type="number" name="precioOferta" placeholder="Precio Rebajado ($)" value={form.precioOferta || ''} onChange={handleChange} style={{width:'150px', margin:0}} />
            )}
        </div>

        {/* IMAGEN */}
        <div className="imagen-preview-box">
            {preview ? <img src={preview} className="preview-img" alt="preview" /> : <p style={{color:'#ccc'}}>Sin imagen seleccionada</p>}
        </div>
        
        <input id="fileInput" type="file" onChange={handleArchivo} accept="image/*" />
        
        <button type="submit" disabled={cargando} style={{gridColumn: '1 / -1', marginTop: '10px', fontSize:'1.1rem', opacity: cargando ? 0.7 : 1}}>
            {cargando ? "Procesando..." : (editId ? "💾 Guardar Cambios" : "➕ Crear Producto")}
        </button>
        
        {editId && (
            <button type="button" onClick={limpiarFormulario} style={{gridColumn: '1 / -1', background: '#64748b', marginTop: '5px'}}>
                Cancelar Edición
            </button>
        )}
      </form>
      
      {/* TABLA DE PRODUCTOS */}
      <h3 style={{marginTop: '40px', color: '#fff'}}>Inventario Actual ({productos.length})</h3>
      <div className="table-responsive">
          <table className="prod-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Cód. Barras</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id}>
                   <td>
                       <img src={p.imagenUrl || p.imagen || '/placeholder.png'} height="50" style={{borderRadius:'5px', objectFit:'cover'}} alt="prod"/>
                   </td>
                   <td>
                       {p.nombre}
                       {(p.oferta || p.enOferta) ? <span style={{marginLeft:'5px', background:'red', color:'white', padding:'2px 5px', borderRadius:'3px', fontSize:'0.7rem'}}>OFERTA</span> : null}
                       <br/>
                       <small style={{color:'#94a3b8'}}>{p.categoria?.nombre}</small>
                   </td>
                   <td>{p.codigoBarras || p.codigo_barras || '-'}</td>
                   <td>
                       {(p.oferta || p.enOferta) ? (
                           <div>
                               <span style={{textDecoration:'line-through', color:'#aaa', fontSize:'0.8rem'}}>${p.precio}</span>
                               <br/>
                               <span style={{color:'#4ade80', fontWeight:'bold'}}>${p.precio_oferta || p.precioOferta}</span>
                           </div>
                       ) : (
                           <span>${p.precio}</span>
                       )}
                   </td>
                   <td style={{color: p.stock < 5 ? '#f87171' : 'inherit', fontWeight: p.stock < 5 ? 'bold' : 'normal'}}>
                       {p.stock} un.
                   </td>
                   <td>
                       <div className="acciones-group">
                           <button onClick={() => cargarProductoEdicion(p)} title="Editar">✏️</button>
                           <button className="delete" onClick={() => borrar(p.id)} title="Eliminar">🗑️</button>
                       </div>
                   </td>
                </tr>
              ))}
              {productos.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No hay productos registrados.</td></tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}