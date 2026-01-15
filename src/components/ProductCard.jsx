import React, { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";
import "./ProductCard.css";

export default function ProductCard({ producto }) {
  const { agregarProducto } = useContext(CarritoContext);

  const esOferta = (producto.enOferta || producto.oferta) === true || (producto.enOferta || producto.oferta) === 1;
  
  const precioRegular = parseFloat(producto.precio || 0);
  const precioOferta = parseFloat(producto.precioOferta || producto.precio_oferta || 0);
  
  const ofertaActiva = esOferta && precioOferta > 0 && precioOferta < precioRegular;
  
  const precioFinal = ofertaActiva ? precioOferta : precioRegular;
  const imagenMostrar = producto.imagenUrl || producto.imagen || "/placeholder.png";
  
  const sinStock = (producto.stock || 0) <= 0;

  const handleAgregar = (e) => {
    e.stopPropagation(); 
    
    if (sinStock) return; 

    const productoParaCarrito = {
        ...producto,
        precio: precioFinal, 
        imagenUrl: imagenMostrar,
        originalPrice: precioRegular 
    };
    
    agregarProducto(productoParaCarrito);
  };

  return (
    <div className={`product-card ${sinStock ? 'card-agotado' : ''}`}>
      {ofertaActiva && <span className="badge-oferta">¡OFERTA!</span>}
      
      {sinStock && <span className="badge-agotado">AGOTADO</span>}
      
      <div className="card-img-container">
          <img src={imagenMostrar} alt={producto.nombre || "Producto"} loading="lazy" />
      </div>

      <div className="product-info">
        <h3 title={producto.nombre}>{producto.nombre || "Sin nombre"}</h3>
        
      
        {producto.category?.nombre || producto.categoria?.nombre ? (
            <small style={{color:'#888', display:'block', marginBottom:'5px'}}>
                {producto.category?.nombre || producto.categoria?.nombre}
            </small>
        ) : null}
        
        <div className="precios-block">
            {ofertaActiva && (
                <span className="precio-original">${Number(precioRegular).toFixed(2)}</span>
            )}
            <span className={`precio ${ofertaActiva ? 'precio-rojo' : ''}`}>
                ${Number(precioFinal).toFixed(2)}
            </span>
        </div>

        <button 
            className={`btn-agregar ${sinStock ? 'btn-disabled' : ''}`} 
            onClick={handleAgregar}
            disabled={sinStock}
        >
          {sinStock ? "Agotado" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
} 