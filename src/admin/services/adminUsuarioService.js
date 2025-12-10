import api from "../../services/api";

export async function listarUsuarios() {
  const res = await api.get("/usuarios");
  return res.data;
}

export async function alternarBloqueo(id) {
  const res = await api.put(`/usuarios/${id}/bloqueo`);
  return res.data;
}

export async function cambiarRolUsuario(id, nuevoRol) {
  const res = await api.put(`/usuarios/${id}/rol`, { role: nuevoRol });
  return res.data;
}