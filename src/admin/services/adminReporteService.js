import api from "../../services/api";

export async function obtenerVentasPorCategoria(inicio, fin) {
  const params = {};
  if (inicio) params.fechaInicio = inicio;
  if (fin) params.fechaFin = fin;
  
  const res = await api.get("/reportes/categorias", { params });
  return res.data;
}

export async function obtenerTopClientes(inicio, fin) {
  const params = {};
  if (inicio) params.fechaInicio = inicio;
  if (fin) params.fechaFin = fin;

  const res = await api.get("/reportes/clientes", { params });
  return res.data;
}