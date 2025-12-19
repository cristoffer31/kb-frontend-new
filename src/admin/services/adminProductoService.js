import api from "../../services/api";

export async function listarProductos() {
  try {
    const res = await api.get("/productos");
    if (res.data.data) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

export async function crearProducto(datos, archivo) {
  const fd = new FormData();
  
  Object.keys(datos).forEach(key => {
    if (key === 'preciosMayoreo' && Array.isArray(datos[key])) {
        datos[key].forEach((pm, index) => {
            fd.append(`preciosMayoreo[${index}][cantidadMin]`, pm.cantidadMin);
            fd.append(`preciosMayoreo[${index}][precioUnitario]`, pm.precioUnitario);
        });
    } else if (datos[key] !== null && datos[key] !== undefined) {
        // Convertimos booleano a 1/0 para Laravel
        if (typeof datos[key] === 'boolean') fd.append(key, datos[key] ? 1 : 0);
        else fd.append(key, datos[key]);
    }
  });

  if (archivo) fd.append("imagen", archivo);

  const res = await api.post("/productos", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function actualizarProducto(id, datos, archivo) {
  const fd = new FormData();
  fd.append("_method", "PUT"); // CRUCIAL PARA LARAVEL

  Object.keys(datos).forEach(key => {
    if (key === 'preciosMayoreo' && Array.isArray(datos[key])) {
        datos[key].forEach((pm, index) => {
            fd.append(`preciosMayoreo[${index}][cantidadMin]`, pm.cantidadMin);
            fd.append(`preciosMayoreo[${index}][precioUnitario]`, pm.precioUnitario);
        });
    } else if (datos[key] !== null && datos[key] !== undefined) {
        if (typeof datos[key] === 'boolean') fd.append(key, datos[key] ? 1 : 0);
        else fd.append(key, datos[key]);
    }
  });

  if (archivo) fd.append("imagen", archivo);

  const res = await api.post(`/productos/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function eliminarProducto(id) {
  return api.delete(`/productos/${id}`);
}