import React, { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";
import "./ProductCard.css";

export default function ProductCard({ producto }) {
  const { agregarProducto } = useContext(CarritoContext);

  // 1. BLINDAJE DE DATOS (Laravel vs Legacy)
  // Leemos propiedades tanto en camelCase (Frontend viejo) como snake_case (Laravel)
  const esOferta = (producto.enOferta || producto.oferta) === true || (producto.enOferta || producto.oferta) === 1;
  
  const precioRegular = parseFloat(producto.precio || 0);
  const precioOferta = parseFloat(producto.precioOferta || producto.precio_oferta || 0);
  
  // Validamos que sea oferta real (flag activo Y precio oferta válido)
  const ofertaActiva = esOferta && precioOferta > 0 && precioOferta < precioRegular;
  
  const precioFinal = ofertaActiva ? precioOferta : precioRegular;
  
  // Imagen: Buscamos el alias 'imagenUrl' o la propiedad base 'imagen'
  const imagenMostrar = producto.imagenUrl || producto.imagen || "/placeholder.png";
  
  // Stock: Laravel envía 'stock' numérico
  const sinStock = (producto.stock || 0) <= 0;

  // FUNCIÓN PARA AGREGAR AL CARRITO
  const handleAgregar = (e) => {
    e.stopPropagation(); // Evita abrir el modal al hacer click en el botón
    
    if (sinStock) return; // Seguridad extra

    // Normalizamos el producto antes de enviarlo al carrito para evitar errores allí
    const productoParaCarrito = {
        ...producto,
        precio: precioFinal, // El carrito ya debe recibir el precio final calculado
        imagenUrl: imagenMostrar,
        originalPrice: precioRegular // Útil si quieres mostrar ahorro en el carrito
    };
    
    agregarProducto(productoParaCarrito);
  };

  return (
    <div className={`product-card ${sinStock ? 'card-agotado' : ''}`}>
      {/* Badge de Oferta */}
      {ofertaActiva && <span className="badge-oferta">¡OFERTA!</span>}
      
      {/* Badge de Agotado */}
      {sinStock && <span className="badge-agotado">AGOTADO</span>}
      
      <div className="card-img-container">
          <img src={imagenMostrar} alt={producto.nombre || "Producto"} loading="lazy" />
      </div>

      <div className="product-info">
        <h3 title={producto.nombre}>{producto.nombre || "Sin nombre"}</h3>
        
        {/* Categoría (Opcional, si quieres mostrarla) */}
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