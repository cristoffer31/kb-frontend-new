import api from "../../services/api";

export async function adminListarPedidos() {
  try {
    const res = await api.get("/pedidos");
    if (res.data.data) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

export async function adminObtenerPedido(id) {
  const res = await api.get(`/pedidos/${id}`);
  return res.data;
}

export async function adminActualizarEstado(id, nuevoEstado) {
  // Laravel espera 'estado', no 'status' usualmente, enviamos ambos por seguridad
  const res = await api.post(`/pedidos/${id}`, {
    estado: nuevoEstado,
    status: nuevoEstado
  });
  return res.data;
}

export async function obtenerConteoPendientes() {
  try {
    const res = await api.get("/pedidos/conteo-pendientes");
    return res.data;
  } catch (e) { return 0; }
}