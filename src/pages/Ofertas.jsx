import React, { useEffect, useState } from "react";
import api from "../services/api"; // O crea la función en productoService
import ProductCard from "../components/ProductCard";

export default function Ofertas() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Llamamos al nuevo endpoint del backend
    api.get("/productos/ofertas")
       .then(res => setProductos(res.data))
       .catch(err => console.error(err));
  }, []);

  return (
    <div className="productos-page">
      <h1 style={{color:'#dc2626'}}>🔥 Super Ofertas 🔥</h1>
      {productos.length === 0 ? (
        <p>No hay ofertas activas por el momento.</p>
      ) : (
        <div className="productos-grid">
          {productos.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  );
}