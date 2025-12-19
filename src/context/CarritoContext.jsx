import React, { createContext, useState, useEffect } from "react";

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  // 1. Cargar carrito evitando errores de datos viejos
  const [carrito, setCarrito] = useState(() => {
    try {
      const datos = localStorage.getItem("carrito");
      return datos ? JSON.parse(datos) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  // ==============================================================
  // 🧠 LÓGICA DE PRECIOS INTELIGENTE (ADAPTADOR LARAVEL)
  // ==============================================================
  const obtenerPrecioUnitario = (producto, cantidad) => {
    if (!producto) return 0;

    // A. Detectar Precio Base (Oferta vs Normal)
    // Laravel manda 'oferta' o 'precio_oferta'. React busca 'enOferta'.
    // Usamos || para que funcione con ambos sistemas.
    const esOferta = (producto.oferta || producto.enOferta) === true || (producto.oferta || producto.enOferta) === 1;
    const precioRegular = parseFloat(producto.precio || 0);
    const precioOferta = parseFloat(producto.precio_oferta || producto.precioOferta || 0);

    // Si hay oferta válida, ese es el precio base. Si no, el regular.
    let precioBase = (esOferta && precioOferta > 0) ? precioOferta : precioRegular;

    // B. Detectar Reglas de Mayoreo
    const reglasRaw = producto.preciosMayoreo || producto.precios_mayoreo || [];
    
    // Normalizamos las reglas a un formato limpio
    const reglas = reglasRaw.map(r => ({
        min: parseInt(r.cantidadMin || r.cantidad_min),
        precio: parseFloat(r.precioUnitario || r.precio_unitario)
    })).sort((a, b) => b.min - a.min); // Ordenar de mayor a menor

    // C. Aplicar la mejor regla disponible
    const reglaAplicable = reglas.find(r => cantidad >= r.min);

    // Si el precio de mayoreo es MEJOR que la oferta, gana el mayoreo.
    if (reglaAplicable && reglaAplicable.precio < precioBase) {
        return reglaAplicable.precio;
    }

    return precioBase;
  };

  // ==============================================================
  // 🛒 GESTIÓN DEL CARRITO
  // ==============================================================

  const agregarProducto = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      // Normalizamos el ID para evitar duplicados
      const idProd = producto.id || producto.product_id;
      const existente = prev.find((p) => p.id === idProd);

      if (existente) {
        // Sumamos cantidad
        return prev.map((p) =>
          p.id === idProd ? { ...p, cantidad: p.cantidad + cantidad } : p
        );
      } else {
        // Agregamos nuevo (Asegurando estructura plana)
        return [...prev, { 
            ...producto, 
            id: idProd, 
            cantidad 
        }];
      }
    });
  };

  const eliminarProducto = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const vaciarCarrito = () => setCarrito([]);

  const actualizarCantidad = (id, nuevaCantidad) => {
    setCarrito(prev => prev.map(p => {
        if (p.id === id) {
            // Validar Stock si existe
            const stock = p.stock || 0;
            if (stock > 0 && nuevaCantidad > stock) return p; // No subir más del stock
            return { ...p, cantidad: Math.max(1, nuevaCantidad) };
        }
        return p;
    }));
  };

  // Cálculos Globales
  const cantidadTotal = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
  
  const total = carrito.reduce((acc, prod) => {
    const precioReal = obtenerPrecioUnitario(prod, prod.cantidad);
    return acc + (precioReal * prod.cantidad);
  }, 0);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarProducto,
        eliminarProducto,
        vaciarCarrito,
        actualizarCantidad,
        cantidadTotal,
        total,
        obtenerPrecioUnitario
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};