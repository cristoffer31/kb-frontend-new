// src/admin/services/adminPedidoService.js
import api from "../../services/api";

// LISTAR TODOS LOS PEDIDOS
export async function adminListarPedidos() {
  const res = await api.get("/pedidos");
  return res.data;
}

// OBTENER DETALLE DE UN PEDIDO
export async function adminObtenerPedido(id) {
  const res = await api.get(`/pedidos/${id}`);
  return res.data;
}

// ACTUALIZAR ESTADO
export async function adminActualizarEstado(id, nuevoEstado) {
  const res = await api.put(`/pedidos/${id}/status`, {
    status: nuevoEstado
  });
  return res.data;
}
