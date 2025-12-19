import api from "../../services/api";

// Cambiado de listarCupones a adminListarCupones
export async function adminListarCupones() {
  try {
    const res = await api.get("/cupones");
    if (res.data.data) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

// Cambiado de crearCupon a adminCrearCupon
export async function adminCrearCupon(data) {
  const res = await api.post("/cupones", data);
  return res.data;
}

// Esta no la usa el componente actual, pero la renombramos por consistencia
export async function adminAlternarEstadoCupon(id) {
  const res = await api.put(`/cupones/${id}/toggle`);
  return res.data;
}

// Cambiado de eliminarCupon a adminEliminarCupon
export async function adminEliminarCupon(id) {
  return api.delete(`/cupones/${id}`);
}