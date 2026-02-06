import api from "../../services/api";

export async function listarProductos(query = '') {
  try {
    const res = await api.get(`/productos${query}`);
    if (res.data.data) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

export async function crearProducto(datos, archivo) {
  const fd = new FormData();
  prepararFormData(fd, datos, archivo);

  const res = await api.post("/productos", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function actualizarProducto(id, datos, archivo) {
  const fd = new FormData();
  fd.append("_method", "PUT"); 
  
  prepararFormData(fd, datos, archivo);

  // CORRECCIÓN 2: FORZAMOS EL HEADER AQUÍ TAMBIÉN
  const res = await api.post(`/productos/${id}`, fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function eliminarProducto(id) {
  return api.delete(`/productos/${id}`);
}

function prepararFormData(fd, datos, archivo) {
  const mapa = {
    nombre: datos.nombre,
    precio: datos.precio,
    descripcion: datos.descripcion,
    stock: datos.stock,
    categoria_id: datos.categoriaId || datos.categoria_id, 
    codigo_barras: datos.codigoBarras || datos.codigo_barras,
    precio_oferta: datos.precioOferta || datos.precio_oferta,
    oferta: datos.enOferta ? 1 : 0, 
    activo: (datos.activo === true || datos.activo === 1 || datos.activo === "1") ? 1 : 0,
    talla: datos.talla,
    variante: datos.variante,
    codigo_agrupador: datos.codigoAgrupador || datos.codigo_agrupador
  };

  Object.keys(mapa).forEach(key => {
    if (mapa[key] !== null && mapa[key] !== undefined && (mapa[key] !== "" || mapa[key] === 0)) {
      fd.append(key, mapa[key]);
    }
  });

  if (Array.isArray(datos.preciosMayoreo)) {
    datos.preciosMayoreo.forEach((pm, index) => {
      fd.append(`precios_mayoreo[${index}][cantidad_min]`, pm.cantidadMin || pm.cantidad_min);
      fd.append(`precios_mayoreo[${index}][precio_unitario]`, pm.precioUnitario || pm.precio_unitario);
    });
  }

  if (archivo && archivo instanceof File) {
    fd.append("imagen", archivo);
  } else if (archivo) {
    console.warn("⚠️ CUIDADO: 'archivo' tiene datos pero no es un objeto File válido:", archivo);
    fd.append("imagen", archivo);
  }
}