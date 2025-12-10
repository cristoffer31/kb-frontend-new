// src/services/pedidoService.js
import api from "./api";

// 1. CREAR PEDIDO (Corregido para recibir el objeto completo del Checkout)
export async function crearPedido(pedido) {
  // El "pedido" ya viene con la estructura correcta desde Checkout.jsx
  const res = await api.post("/pedidos", pedido);
  return res.data;
}

// 2. LISTAR MIS PEDIDOS (La función que te faltaba)
export async function listarMisPedidos() {
  try {
    const res = await api.get("/pedidos/mis-pedidos");
    // Protección: Si el backend no devuelve un arreglo, devolvemos lista vacía []
    return Array.isArray(res.data) ? res.data : []; 
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    return []; // En caso de error, devolvemos lista vacía para que no falle el .map
  }
}