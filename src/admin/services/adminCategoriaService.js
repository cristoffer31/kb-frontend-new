import api from "../../services/api";

// 1. LISTAR
export async function listarCategorias() {
  try {
    const res = await api.get("/categorias");
    if (res.data.data && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

// 2. CREAR
export async function crearCategoria(formData) {
  // RECIBIMOS EL PAQUETE (formData) LISTO DESDE EL COMPONENTE
  // No creamos 'new FormData()' aquí. Solo lo enviamos.
  const res = await api.post("/categorias", formData, {
      headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

// 3. ACTUALIZAR
export async function actualizarCategoria(id, formData) {
  // El componente ya incluyó '_method: PUT' dentro del formData
  const res = await api.post(`/categorias/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

// 4. ELIMINAR
export async function eliminarCategoria(id) {
  return api.delete(`/categorias/${id}`);
}