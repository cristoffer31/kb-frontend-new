import React, { useState, useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";
// Iconos de React Icons para decorar
import { FaTimes, FaShoppingCart, FaMinus, FaPlus, FaCheck, FaTag, FaBoxOpen } from "react-icons/fa";
import "./ProductModal.css"; // Asegúrate de que importe el CSS nuevo

const BASE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage/";

export default function ProductModal({ producto, onClose }) {
  const { agregarProducto, obtenerPrecioUnitario } = useContext(CarritoContext);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  if (!producto) return null;

  const stock = parseInt(producto.stock || 0);
  const sinStock = stock <= 0;
  
  const precioUnitarioReal = obtenerPrecioUnitario(producto, cantidad);
  const totalModal = (precioUnitarioReal * cantidad).toFixed(2);
  
  const precioBase = producto.oferta 
      ? parseFloat(producto.precio_oferta || producto.precioOferta) 
      : parseFloat(producto.precio);
  const ahorroUnitario = precioBase - precioUnitarioReal;
  const hayAhorro = ahorroUnitario > 0.01;

  const getImagen = (img) => {
    if (!img) return "https://via.placeholder.com/400x400?text=Sin+Imagen";
    if (img.startsWith("http")) return img;
    return `${BASE_URL}${img}`;
  };

  const handleAgregar = () => {
    if (sinStock) return;
    agregarProducto(producto, cantidad);
    setAgregado(true);
    setTimeout(() => { 
        setAgregado(false); 
        onClose(); 
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        <button className="close-btn" onClick={onClose}><FaTimes /></button>
        
        <div className="modal-body">
          
          {/* IMAGEN IZQUIERDA */}
          <div className="modal-img-container">
            {producto.oferta && <span className="badge-oferta">🔥 OFERTA</span>}
            <img 
                src={getImagen(producto.imagen || producto.imagenUrl)} 
                alt={producto.nombre} 
                onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/400?text=Error"}}
            />
          </div>

          {/* INFO DERECHA */}
          <div className="modal-info">
            
            {/* Badge de Categoría */}
            {producto.categoria && (
                <span className="categoria-badge">
                   <FaBoxOpen style={{marginRight:5}}/> {producto.categoria.nombre || "Producto"}
                </span>
            )}

            <h2>{producto.nombre}</h2>
            <p className="descripcion">
                {producto.descripcion || "Descripción detallada del producto no disponible."}
            </p>

            {/* TABLA MAYOREO */}
            {(producto.preciosMayoreo || []).length > 0 && (
                <div className="tabla-precios">
                    <h4><FaTag /> Precios por Mayoreo</h4>
                    <ul>
                        {producto.preciosMayoreo.map((pm, i) => (
                            <li key={i} className={cantidad >= (pm.cantidadMin || pm.cantidad_min) ? "active-price" : ""}>
                                <span>Comprando {pm.cantidadMin || pm.cantidad_min}+</span>
                                <span>${parseFloat(pm.precioUnitario || pm.precio_unitario).toFixed(2)} c/u</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* BARRA ACCIONES INFERIOR */}
            <div className="compra-actions">
                <div className="cantidad-control-modern">
                    
                    <div className="qty-selector">
    <button 
        className="qty-btn" 
        onClick={() => setCantidad(c => Math.max(1, c - 1))}
        disabled={agregado}
    >
        <FaMinus size={12} />
    </button>
    
    <div className="qty-value">{cantidad}</div>
    
    <button 
        className="qty-btn" 
        onClick={() => setCantidad(c => (c < stock ? c + 1 : c))} 
        disabled={cantidad >= stock || agregado}
    >
        <FaPlus size={12} />
    </button>
</div>

                    <div className="precio-final-box">
                        <span>Total estimado</span>
                        <div className="gran-total">${totalModal}</div>
                        {hayAhorro && (
                           <span style={{color:'#10b981', fontSize:'0.8rem', fontWeight:700}}>
                               (Ahorras ${(ahorroUnitario * cantidad).toFixed(2)})
                           </span>
                        )}
                    </div>
                </div>

                <button 
                    className={`btn-add-modal ${agregado ? 'success-state' : ''}`} 
                    onClick={handleAgregar} 
                    disabled={sinStock}
                >
                    {sinStock ? (
                        "Agotado Temporalmente"
                    ) : agregado ? (
                        <><FaCheck size={18} /> ¡Listo, agregado!</>
                    ) : (
                        <><FaShoppingCart size={18} /> Agregar al Carrito</>
                    )}
                </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}