import api from "./api";

export async function listarCategorias() {
  const res = await api.get("/categorias");
  return res.data;
}

export async function obtenerCategoria(id) {
  const res = await api.get(`/categorias/${id}`);
  return res.data;
}

export async function crearCategoria(data) {
  const res = await api.post("/categorias", data);
  return res.data;
}

export async function actualizarCategoria(id, data) {
  const res = await api.put(`/categorias/${id}`, data);
  return res.data;
}

export async function eliminarCategoria(id) {
  const res = await api.delete(`/categorias/${id}`);
  return res.data;
}
