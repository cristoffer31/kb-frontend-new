import api from "./api";

export async function listarZonas() {
  const res = await api.get("/zonas");
  return res.data;
}

export async function crearZona(zona) {
  const res = await api.post("/zonas", zona);
  return res.data;
}

export async function actualizarZona(id, zona) {
  const res = await api.put(`/zonas/${id}`, zona);
  return res.data;
}

export async function eliminarZona(id) {
  return api.delete(`/zonas/${id}`);
}