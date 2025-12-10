import api from "./api";

// 1. LISTAR (Paginado)
export async function listarProductos(page = 0) {
  const res = await api.get("/productos", {
    params: { page, size: 12 } 
  });
  return res.data; // Devuelve { content: [...], totalPages: ... }
}

// 2. LISTAR OFERTAS (Lista simple)
export async function listarOfertas() {
  const res = await api.get("/productos/ofertas");
  return res.data; 
}

// 3. BUSCADOR AVANZADO (Nombre y Categoría)
export async function buscarProductos(texto = "", categoriaId = null) {
  // Construimos los parámetros que pide el Backend
  const params = {};
  if (texto) params.nombre = texto;
  if (categoriaId) params.categoriaId = categoriaId;

  // Llamamos al endpoint de búsqueda que devuelve una lista sin paginar (filtrada)
  const res = await api.get("/productos/buscar", { params });
  return res.data;
}

// 4. OBTENER UNO
export async function obtenerProducto(id) {
  const res = await api.get(`/productos/${id}`);
  return res.data;
}

// 5. CRUD ADMIN
export async function crearProducto(producto) {
  const res = await api.post("/productos", producto);
  return res.data;
}

export async function actualizarProducto(id, producto) {
  const res = await api.put(`/productos/${id}`, producto);
  return res.data;
}

export async function eliminarProducto(id) {
  await api.delete(`/productos/${id}`);
}