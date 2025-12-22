import api from "../../services/api";

export async function listarProductos() {
  try {
    const res = await api.get("/productos");
    // Soporte para datos paginados o arrays simples
    if (res.data.data) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

export async function crearProducto(datos, archivo) {
  const fd = new FormData();
  prepararFormData(fd, datos, archivo);

  const res = await api.post("/productos", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function actualizarProducto(id, datos, archivo) {
  const fd = new FormData();
  fd.append("_method", "PUT"); // Crucial para que Laravel procese el archivo en el POST
  
  prepararFormData(fd, datos, archivo);

  // Enviamos por POST (con el _method PUT arriba)
  const res = await api.post(`/productos/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function eliminarProducto(id) {
  return api.delete(`/productos/${id}`);
}

/**
 * Función auxiliar para mapear los campos de React al snake_case de Laravel
 * y manejar correctamente el array de precios de mayoreo e imagen.
 */
function prepararFormData(fd, datos, archivo) {
  // 1. Mapeo de campos simples (React -> Laravel)
  const mapa = {
    nombre: datos.nombre,
    precio: datos.precio,
    descripcion: datos.descripcion,
    stock: datos.stock,
    categoria_id: datos.categoriaId, // Cambiado de categoriaId a categoria_id
    codigo_barras: datos.codigoBarras,
    precio_oferta: datos.precioOferta,
    oferta: datos.enOferta ? 1 : 0, // Convertimos boolean a tinyInt
    talla: datos.talla,
    variante: datos.variante,
    codigo_agrupador: datos.codigoAgrupador
  };

  // Añadimos al FormData los campos que tengan valor
  Object.keys(mapa).forEach(key => {
    if (mapa[key] !== null && mapa[key] !== undefined && mapa[key] !== "") {
      fd.append(key, mapa[key]);
    }
  });

  // 2. Manejo de Precios de Mayoreo
  if (Array.isArray(datos.preciosMayoreo)) {
    // Es más seguro enviarlo como JSON string si el controlador lo soporta, 
    // pero si lo usas como array de campos, debe ser snake_case:
    datos.preciosMayoreo.forEach((pm, index) => {
      fd.append(`precios_mayoreo[${index}][cantidad_min]`, pm.cantidadMin || pm.cantidad_min);
      fd.append(`precios_mayoreo[${index}][precio_unitario]`, pm.precioUnitario || pm.precio_unitario);
    });
  }

  // 3. Imagen
  if (archivo) {
    fd.append("imagen", archivo);
  }
}