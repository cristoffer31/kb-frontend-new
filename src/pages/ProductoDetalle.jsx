import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerProducto, listarProductos } from "../services/productoService";
import api from "../services/api"; // Variantes
import { CarritoContext } from "../context/CarritoContext";
import { FaMinus, FaPlus, FaBoxOpen, FaArrowLeft } from "react-icons/fa";
import "./ProductoDetalle.css";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarProducto, obtenerPrecioUnitario } = useContext(CarritoContext);

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]); 
  const [relacionados, setRelacionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true);
        setCantidad(1);
        const prod = await obtenerProducto(id);
        setProducto(prod);

        // 1. BUSCAR VARIANTES
        if (prod.codigoAgrupador) {
            try {
                const res = await api.get(`/productos/variantes/${prod.codigoAgrupador}`);
                setVariantes(res.data); 
            } catch (e) { console.error(e); }
        } else {
            setVariantes([]);
        }

        // 2. RELACIONADOS
        try {
          const data = await listarProductos();
          const todos = data.content || data || [];
          const rel = todos.filter(p => p.id !== prod.id && p.stock > 0 && (!prod.category || p.category?.id === prod.category.id)).slice(0, 4);
          setRelacionados(rel);
        } catch (e) { setRelacionados([]); }

      } catch (error) { setProducto(null); } 
      finally { setCargando(false); }
    }
    cargarDatos();
  }, [id]);

  if (cargando) return <div className="loading-container">Cargando...</div>;
  if (!producto) return <div className="error-container"><h2>Producto no encontrado</h2><button onClick={() => navigate("/productos")}>Volver</button></div>;

  const precioBase = producto.enOferta ? producto.precioOferta : producto.precio;
  const precioUnitarioFinal = obtenerPrecioUnitario(producto, cantidad);
  const total = (precioUnitarioFinal * cantidad).toFixed(2);
  const esMayoreo = precioUnitarioFinal < precioBase;

  const handleAgregar = () => {
    agregarProducto(producto, cantidad);
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 2000);
  };

  return (
    <div className="detalle-page">
      <button className="btn-back" onClick={() => navigate(-1)}><FaArrowLeft/> Volver</button>

      <div className="detalle-grid">
        <div className="detalle-img-box">
          <img src={producto.imagenUrl} alt={producto.nombre} />
          {producto.enOferta && <span className="badge-oferta-lg">¡OFERTA!</span>}
        </div>

        <div className="detalle-info">
          <h1 className="detalle-title">{producto.nombre}</h1>
          
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
              <span className="detalle-cat">{producto.category?.nombre || "General"}</span>
              <span style={{fontSize:'0.85rem', color:'#64748b', background:'#f1f5f9', padding:'4px 10px', borderRadius:'6px'}}>
                  SKU: {producto.codigoBarras || "N/A"}
              </span>
          </div>

          {/* SELECTOR DE VARIANTES */}
          {variantes.length > 1 && (
              <div style={{marginBottom:'25px'}}>
                  <p style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'8px', fontWeight:'600'}}>Opciones:</p>
                  <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                      {variantes.map(v => (
                          <button
                             key={v.id}
                             onClick={() => navigate(`/producto/${v.id}`)}
                             style={{
                                 padding:'8px 16px', borderRadius:'8px', cursor:'pointer',
                                 border: v.id === producto.id ? '2px solid #004aad' : '1px solid #cbd5e1',
                                 background: v.id === producto.id ? '#e0f2fe' : 'white',
                                 color: v.id === producto.id ? '#004aad' : '#334155',
                                 fontWeight: v.id === producto.id ? 'bold' : 'normal',
                                 fontSize: '0.9rem'
                             }}
                          >
                              {v.talla ? `Talla ${v.talla}` : v.variante ? v.variante : "Opción"}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          <p className="detalle-desc">{producto.descripcion}</p>

          {/* TABLA PRECIOS MAYOREO */}
          {producto.preciosMayoreo && producto.preciosMayoreo.length > 0 && (
             <div className="tabla-precios-box">
                <h4><FaBoxOpen/> Descuentos por Volumen</h4>
                <div className="filas-precios">
                    <div className={`fila ${!esMayoreo ? 'activa' : ''}`}>
                        <span>1 unidad</span>
                        <strong>${precioBase.toFixed(2)}</strong>
                    </div>
                    {producto.preciosMayoreo.map((pm, i) => (
                        <div key={i} className={`fila ${cantidad >= pm.cantidadMin ? 'activa-verde' : ''}`}>
                            <span>{pm.cantidadMin}+ un.</span>
                            <strong>${pm.precioUnitario.toFixed(2)}</strong>
                        </div>
                    ))}
                </div>
             </div>
          )}

          <div className="detalle-controls">
             <div className="qty-selector-lg">
                <button onClick={() => setCantidad(c => Math.max(1, c-1))}><FaMinus/></button>
                <span>{cantidad}</span>
                <button onClick={() => setCantidad(c => c+1)}><FaPlus/></button>
             </div>
             
             <div className="precio-final-box">
                <span>Total a pagar:</span>
                <strong className="precio-grande">${total}</strong>
             </div>
          </div>

          <button 
            className={`btn-add-lg ${mensajeExito ? 'success' : ''}`} 
            onClick={handleAgregar}
            disabled={mensajeExito || producto.stock <= 0}
          >
            {producto.stock <= 0 ? "Agotado" : mensajeExito ? "¡Agregado! ✅" : "Agregar al Carrito"}
          </button>

        </div>
      </div>
    </div>
  );
}