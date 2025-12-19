import api from "../../services/api";

export async function listarUsuarios() {
  try {
    const res = await api.get("/usuarios");
    if (res.data.data) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

export async function alternarBloqueo(id) {
  const res = await api.put(`/usuarios/${id}/bloqueo`);
  return res.data;
}

export async function cambiarRolUsuario(id, nuevoRol) {
  const res = await api.put(`/usuarios/${id}/rol`, { role: nuevoRol });
  return res.data;
}

export async function obtenerHistorialCompras(idUsuario) {
  try {
    const res = await api.get(`/pedidos/usuario/${idUsuario}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) { return []; }
}