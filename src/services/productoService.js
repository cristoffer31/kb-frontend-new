import api from "./api";

// 1. LISTAR (Paginado para Laravel)
export async function listarProductos(page = 0) {
  try {
    // NOTA: Laravel usa paginación base 1, React suele usar base 0.
    // Sumamos 1 a la página para sincronizar.
    const res = await api.get("/productos", {
      params: { 
          page: page + 1, 
          size: 12 
      } 
    });
    // Retorna la estructura completa de Laravel (data, current_page, last_page...)
    return res.data; 
  } catch (error) {
    console.error("Error al listar productos:", error);
    // Retornamos estructura vacía para evitar fallos en el componente
    return { data: [] }; 
  }
}

// 2. LISTAR OFERTAS (Lista simple)
export async function listarOfertas() {
  try {
    const res = await api.get("/productos/ofertas");
    // Verificamos si Laravel devolvió un array directo o envuelto en 'data'
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
    return [];
  }
}

// 3. BUSCADOR AVANZADO (Nombre y Categoría)
export async function buscarProductos(texto = "", categoriaId = null) {
  try {
    // Construimos los parámetros exactamente como el Controller de Laravel los pide
    const params = {};
    if (texto) params.nombre = texto;
    if (categoriaId) params.categoriaId = categoriaId;

    const res = await api.get("/productos/buscar", { params });
    
    // Normalizamos la respuesta
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (error) {
    console.error("Error en búsqueda:", error);
    return [];
  }
}

// 4. OBTENER UNO (Detalle)
export async function obtenerProducto(id) {
  try {
    const res = await api.get(`/productos/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    return null;
  }
}

// 5. CRUD ADMIN (Básico)
// Nota: Para subida de imágenes compleja, se recomienda usar adminProductoService.js
// que configuramos con FormData, pero dejamos esto funcional para ediciones simples.

export async function crearProducto(producto) {
  try {
    const res = await api.post("/productos", producto);
    return res.data;
  } catch (error) {
    console.error("Error creando producto:", error);
    throw error;
  }
}

export async function actualizarProducto(id, producto) {
  try {
    const res = await api.put(`/productos/${id}`, producto);
    return res.data;
  } catch (error) {
    console.error("Error actualizando producto:", error);
    throw error;
  }
}

export async function eliminarProducto(id) {
  try {
    await api.delete(`/productos/${id}`);
  } catch (error) {
    console.error("Error eliminando producto:", error);
    throw error;
  }
}