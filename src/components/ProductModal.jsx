import React, { useState, useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";
// AGREGAMOS FaMinus y FaPlus
import { FaTimes, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import "./ProductModal.css";

export default function ProductModal({ producto, onClose }) {
  const { agregarProducto, obtenerPrecioUnitario } = useContext(CarritoContext);
  const [cantidad, setCantidad] = useState(1);
  const [agregadoExito, setAgregadoExito] = useState(false); // Nuevo estado para feedback visual
  
  // Calculamos precio real
  const precioUnitarioActual = obtenerPrecioUnitario(producto, cantidad);
  const totalCalculado = (precioUnitarioActual * cantidad).toFixed(2);
  
  const precioOriginal = producto.enOferta ? producto.precioOferta : producto.precio;
  const hayAhorro = precioUnitarioActual < precioOriginal;

  // --- NUEVAS FUNCIONES PARA EL SELECTOR MODERNO ---
  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const aumentarCantidad = () => {
    // Opcional: Puedes agregar validación de stock aquí si lo deseas (ej: if cantidad < producto.stock)
    setCantidad(cantidad + 1);
  };
  // ------------------------------------------------

  const handleAgregar = () => {
    if (agregadoExito) return; // Evitar doble click

    agregarProducto(producto, cantidad);
    
    // --- CAMBIO: EN LUGAR DE ALERT, MOSTRAMOS FEEDBACK VISUAL ---
    setAgregadoExito(true);
    // Cerramos el modal automáticamente después de 0.8 segundos
    setTimeout(() => {
      onClose();
      setAgregadoExito(false);
    }, 800);
    // -----------------------------------------------------------
  };

  if (!producto) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><FaTimes /></button>

        <div className="modal-body">
          {/* IMAGEN */}
          <div className="modal-img-container">
            <img src={producto.imagenUrl} alt={producto.nombre} />
            {producto.enOferta && <span className="badge-oferta">OFERTA</span>}
          </div>

          {/* INFO */}
          <div className="modal-info">
            <h2>{producto.nombre}</h2>
            <p className="categoria-badge">{producto.category?.nombre || "General"}</p>
            <p className="descripcion">{producto.descripcion}</p>

            {/* TABLA DE PRECIOS MAYOREO */}
            {producto.preciosMayoreo && producto.preciosMayoreo.length > 0 && (
              <div className="tabla-precios">
                <h4>💰 Ahorra comprando más:</h4>
                <ul>
                  <li className={cantidad < producto.preciosMayoreo[0].cantidadMin ? "active-price" : ""}>
                    1 unidad: <span>${precioOriginal.toFixed(2)}</span>
                  </li>
                  {producto.preciosMayoreo.map((r, i) => (
                    <li key={i} className={cantidad >= r.cantidadMin ? "active-price highlight" : ""}>
                      {r.cantidadMin}+ unidades: <span>${r.precioUnitario.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CONTROLES DE COMPRA */}
            <div className="compra-actions">
              
              {/* --- SELECTOR DE CANTIDAD MODERNO --- */}
              <div className="cantidad-control-modern">
                <label>Cantidad:</label>
                <div className="qty-selector">
                    <button className="qty-btn minus" onClick={disminuirCantidad} disabled={cantidad <= 1}>
                        <FaMinus />
                    </button>
                    <span className="qty-value">{cantidad}</span>
                    <button className="qty-btn plus" onClick={aumentarCantidad}>
                        <FaPlus />
                    </button>
                </div>
              </div>
              {/* ------------------------------------ */}

              <div className="precio-final-box">
                <span>Total a pagar:</span>
                <strong className="gran-total">${totalCalculado}</strong>
                {hayAhorro && <small className="ahorro-text">¡Estás ahorrando con precio de mayoreo!</small>}
              </div>

              {/* BOTÓN CON FEEDBACK DE ÉXITO */}
              <button 
                className={`btn-add-modal ${agregadoExito ? 'success-state' : ''}`} 
                onClick={handleAgregar}
                disabled={agregadoExito}
              >
                {agregadoExito ? (
                    <>¡Agregado con éxito! ✓</>
                ) : (
                    <><FaShoppingCart /> Agregar al Carrito</>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}