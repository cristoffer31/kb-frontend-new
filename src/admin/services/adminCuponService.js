import api from "../../services/api";

// LISTAR TODOS
export async function listarCupones() {
  const res = await api.get("/cupones");
  return res.data;
}

// CREAR
export async function crearCupon(data) {
  const res = await api.post("/cupones", data);
  return res.data;
}

// ACTIVAR / DESACTIVAR
export async function alternarEstadoCupon(id) {
  const res = await api.put(`/cupones/${id}/toggle`);
  return res.data;
}

// ELIMINAR
export async function eliminarCupon(id) {
  return api.delete(`/cupones/${id}`);
}