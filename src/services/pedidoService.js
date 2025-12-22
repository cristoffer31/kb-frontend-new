import api from "./api";

// 1. CREAR PEDIDO
export async function crearPedido(pedido) {
  const res = await api.post("/pedidos", pedido);
  return res.data;
}

// 2. LISTAR MIS PEDIDOS (CORREGIDO PARA LEER PAGINACIÓN)
export async function listarMisPedidos() {
  try {
    const res = await api.get("/pedidos/mis-pedidos");
    
    // --- CORRECCIÓN AQUÍ ---
    
    // Caso A: Laravel devuelve Paginación (Tu caso actual)
    // La estructura es { data: [ ...pedidos... ], current_page: 1 }
    // Verificamos si existe .data y si ESE .data es el array
    if (res.data && Array.isArray(res.data.data)) {
        return res.data.data; // <--- ¡AQUÍ ESTÁN TUS PEDIDOS!
    }

    // Caso B: Laravel devuelve Array directo (Por si quitas paginate() en el futuro)
    if (Array.isArray(res.data)) {
        return res.data;
    }

    // Si no es ninguno de los dos, devolvemos vacío
    console.warn("Formato de respuesta no reconocido:", res.data);
    return [];

  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    return []; 
  }
}