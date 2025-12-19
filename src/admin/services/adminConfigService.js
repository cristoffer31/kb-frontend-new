import api from "../../services/api";

export async function obtenerConfiguracion() {
  try {
    const res = await api.get("/configuracion");
    return res.data;
  } catch (e) { return {}; }
}

export async function actualizarConfiguracion(datos) {
  const res = await api.put("/configuracion", datos);
  return res.data;
}