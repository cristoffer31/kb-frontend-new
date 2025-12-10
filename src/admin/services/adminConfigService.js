import api from "../../services/api";

export async function obtenerConfiguracion() {
  const res = await api.get("/configuracion");
  return res.data;
}

export async function actualizarConfiguracion(datos) {
  const res = await api.put("/configuracion", datos);
  return res.data;
}