import React, { createContext, useEffect, useState } from "react";

export const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);

  // Cargar
  useEffect(() => {
    const saved = localStorage.getItem("carrito");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);

  // Guardar
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items));
  }, [items]);

  // --- FUNCIÓN MAESTRA DE PRECIO ---
  const obtenerPrecioUnitario = (producto, cantidad) => {
    // 1. Precio Base (Normal u Oferta)
    let precio = producto.precio;
    if (producto.enOferta && producto.precioOferta > 0) {
      precio = producto.precioOferta;
    }

    // 2. Verificar Mayoreo (si mejora el precio base/oferta)
    if (producto.preciosMayoreo && producto.preciosMayoreo.length > 0) {
      // Buscar la mejor regla que se cumpla
      const regla = producto.preciosMayoreo
        .filter(r => cantidad >= r.cantidadMin)
        .sort((a, b) => a.precioUnitario - b.precioUnitario)[0]; // La más barata

      if (regla && regla.precioUnitario < precio) {
        precio = regla.precioUnitario;
      }
    }
    return Number(precio);
  };

  function agregarProducto(producto, cantidad = 1) {
    if (!producto || !producto.id) return;
    setItems(prev => {
      const existe = prev.find(it => it.producto.id === producto.id);
      if (existe) {
        return prev.map(it => it.producto.id === producto.id ? { ...it, cantidad: it.cantidad + cantidad } : it);
      }
      return [...prev, { producto, cantidad }];
    });
  }

  function quitarUno(id) {
    setItems(prev => prev.map(it => it.producto.id === id ? { ...it, cantidad: it.cantidad - 1 } : it).filter(it => it.cantidad > 0));
  }
  
  function quitarProducto(id) { setItems(prev => prev.filter(it => it.producto.id !== id)); }
  function limpiarCarrito() { setItems([]); localStorage.removeItem("carrito"); }

  const totalItems = items.reduce((acc, it) => acc + it.cantidad, 0);
  
  // Total calculado con la función maestra
  const total = items.reduce((acc, it) => acc + (obtenerPrecioUnitario(it.producto, it.cantidad) * it.cantidad), 0);

  return (
    <CarritoContext.Provider value={{ items, agregarProducto, quitarUno, quitarProducto, limpiarCarrito, total, totalItems, obtenerPrecioUnitario }}>
      {children}
    </CarritoContext.Provider>
  );
}