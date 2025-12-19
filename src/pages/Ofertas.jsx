import React, { useEffect, useState } from "react";
import api from "../services/api"; 
import ProductCard from "../components/ProductCard";

export default function Ofertas() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Usamos el endpoint que definimos en Laravel
    api.get("/productos/ofertas")
       .then(res => {
           // Normalización data.data
           const lista = res.data.data || (Array.isArray(res.data) ? res.data : []);
           setProductos(lista);
       })
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