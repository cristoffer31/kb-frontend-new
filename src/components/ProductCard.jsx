import React, { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";
import "./ProductCard.css";

export default function ProductCard({ producto }) {
  const { agregarProducto } = useContext(CarritoContext);

  const esOferta = producto.enOferta && producto.precioOferta > 0;
  const precioFinal = esOferta ? producto.precioOferta : producto.precio;

  // FUNCIÓN PARA DETENER LA PROPAGACIÓN
  const handleAgregar = (e) => {
    e.stopPropagation(); // <--- ESTO ES LA CLAVE
    // Al hacer clic aquí, el evento NO subirá al padre, 
    // por lo que el Modal NO se abrirá. Solo se agrega al carrito.
    
    agregarProducto(producto);
    
    // Opcional: Puedes poner un alert o toast aquí si quieres feedback rápido
    // alert("Agregado al carrito"); 
  };

  return (
    <div className="product-card">
      {esOferta && <span className="badge-oferta">¡OFERTA!</span>}
      
      <img src={producto.imagenUrl} alt={producto.nombre} />

      <div className="product-info">
        <h3>{producto.nombre}</h3>
        
        <div className="precios-block">
            {esOferta && (
                <span className="precio-original">${Number(producto.precio).toFixed(2)}</span>
            )}
            <span className={`precio ${esOferta ? 'precio-rojo' : ''}`}>
                ${Number(precioFinal).toFixed(2)}
            </span>
        </div>

        {/* Usamos nuestra nueva función handleAgregar */}
        <button className="btn-agregar" onClick={handleAgregar}>
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}