import api from "../../services/api";

// LISTAR TODAS
export async function listarCategorias() {
  const res = await api.get("/categorias");
  return res.data;
}

// CREAR (Con Imagen)
export async function crearCategoria(data, archivo) {
  let urlImagen = "";
  
  if (archivo) {
      const fd = new FormData();
      fd.append("file", archivo);
      const uploadRes = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      urlImagen = uploadRes.data.url;
  }

  // Enviamos JSON con la URL
  const payload = { ...data, imagenUrl: urlImagen };
  const res = await api.post("/categorias", payload);
  return res.data;
}

// ACTUALIZAR (Con Imagen)
export async function actualizarCategoria(id, data, archivo) {
  let urlImagen = data.imagenUrl; // Mantener la anterior si no hay nueva

  if (archivo) {
      const fd = new FormData();
      fd.append("file", archivo);
      const uploadRes = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      urlImagen = uploadRes.data.url;
  }

  const payload = { ...data, imagenUrl: urlImagen };
  const res = await api.put(`/categorias/${id}`, payload);
  return res.data;
}

// ELIMINAR
export async function eliminarCategoria(id) {
  return api.delete(`/categorias/${id}`);
}