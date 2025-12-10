import api from "./api";

// Obtener la configuración general de la tienda (Público)
export async function obtenerConfiguracionPublica() {
  try {
    const res = await api.get("/configuracion");
    return res.data;
  } catch (error) {
    console.error("Error cargando configuración:", error);
    return null;
  }
}