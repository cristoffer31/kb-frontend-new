import api from "./api";

export async function obtenerInventarioCompleto() {
  const res = await api.get("/productos");
  return res.data;
}
