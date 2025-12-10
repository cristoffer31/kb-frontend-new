import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Carrito.css";
import { CarritoContext } from "../context/CarritoContext";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaArrowRight, FaShoppingBag, FaMinus, FaPlus, FaTag, FaBoxOpen } from "react-icons/fa";

export default function Carrito() {
  const { items, quitarUno, agregarProducto, quitarProducto, limpiarCarrito, total, totalItems, obtenerPrecioUnitario } = useContext(CarritoContext);
  const { isLogged } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- CÁLCULO DE AHORROS ---
  let totalLista = 0;
  let ahorroOfertas = 0;
  let ahorroMayoreo = 0;

  items.forEach((it) => {
    const precioBase = it.producto.precio; 
    const precioPagado = obtenerPrecioUnitario(it.producto, it.cantidad); 
    const precioOferta = it.producto.enOferta ? it.producto.precioOferta : null;

    totalLista += precioBase * it.cantidad;

    const ahorroEnItem = (precioBase - precioPagado) * it.cantidad;

    if (ahorroEnItem > 0) {
        
        if (precioOferta && precioPagado === precioOferta) {
            ahorroOfertas += ahorroEnItem;
        } else {
          
            ahorroMayoreo += ahorroEnItem;
        }
    }
  });

  if (items.length === 0) {
    return (
      <div className="carrito-vacio-container">
        <div className="icono-vacio"><FaShoppingBag /></div>
        <h2>Tu carrito está vacío</h2>
        <Link to="/productos" className="btn-ir-tienda">Ir a la Tienda</Link>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <h1 className="carrito-titulo">Mi Carrito ({totalItems})</h1>

      <div className="carrito-grid">
        <div className="carrito-items">
          {items.map((it) => {
            const precioFinal = obtenerPrecioUnitario(it.producto, it.cantidad);
            const precioBase = it.producto.precio;
            
            let etiqueta = null;
            const precioOferta = it.producto.enOferta ? it.producto.precioOferta : null;
            
            if (precioOferta && precioFinal === precioOferta) {
                etiqueta = { text: "OFERTA FLASH", icon: <FaTag />, class: "tag-oferta" };
            } else if (precioFinal < precioBase) {
                etiqueta = { text: "PRECIO MAYOREO", icon: <FaBoxOpen />, class: "tag-mayoreo" };
            }

            return (
              <div key={it.producto.id} className="item-card">
                <div className="item-img-wrapper">
                    <img src={it.producto.imagenUrl || "/placeholder.png"} alt={it.producto.nombre} />
                </div>
                
                <div className="item-info">
                  <div className="info-header">
                      <h3>{it.producto.nombre}</h3>
                      <button className="btn-trash" onClick={() => quitarProducto(it.producto.id)}><FaTrash /></button>
                  </div>
                  
                  {etiqueta && (
                      <div className={`badge-descuento ${etiqueta.class}`}>
                          {etiqueta.icon} {etiqueta.text}
                      </div>
                  )}

                  <div className="item-precios">
                    {precioFinal < precioBase && <span className="precio-tachado">${precioBase.toFixed(2)}</span>}
                    <span className="precio-actual">${precioFinal.toFixed(2)}</span>
                  </div>

                  <div className="item-controles">
                    <div className="qty-selector-sm">
                        <button onClick={() => quitarUno(it.producto.id)}><FaMinus/></button>
                        <span>{it.cantidad}</span>
                        <button onClick={() => agregarProducto(it.producto)}><FaPlus/></button>
                    </div>
                    <div className="item-subtotal">Subtotal: <strong>${(precioFinal * it.cantidad).toFixed(2)}</strong></div>
                  </div>
                </div>
              </div>
            );
          })}
          <button className="btn-limpiar" onClick={limpiarCarrito}>Vaciar Carrito</button>
        </div>

        {/* RESUMEN LATERAL */}
        <div className="carrito-sidebar">
          <div className="resumen-card">
            <h2>Resumen del Pedido</h2>
            
            <div className="resumen-fila">
                <span>Subtotal (Lista)</span>
                <span>${totalLista.toFixed(2)}</span>
            </div>
            
            {/* AHORROS */}
            {ahorroOfertas > 0 && (
                <div className="resumen-fila ahorro-oferta">
                    <span><FaTag /> Ahorro Ofertas</span>
                    <span>- ${ahorroOfertas.toFixed(2)}</span>
                </div>
            )}
            {ahorroMayoreo > 0 && (
                <div className="resumen-fila ahorro-mayoreo">
                    <span><FaBoxOpen /> Ahorro Mayoreo</span>
                    <span>- ${ahorroMayoreo.toFixed(2)}</span>
                </div>
            )}

            <div className="divider"></div>
            
            <div className="resumen-total">
              <span>Total</span>
              <div className="total-precio"><span>${total.toFixed(2)}</span></div>
            </div>

            <button className="btn-checkout" onClick={() => navigate(isLogged ? "/checkout" : "/login")}>
              Proceder al Pago <FaArrowRight />
            </button>
            
            <div className="seguridad-info">🔒 Compra 100% Segura</div>
          </div>
        </div>
      </div>
    </div>
  );
}