import api from "./api";

// Validar cupón (Público)
export async function validarCuponApi(codigo) {
  const res = await api.get(`/cupones/validar/${codigo}`);
  return res.data; // Retorna { codigo, porcentaje }
}