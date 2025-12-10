import api from "../../services/api";

// LISTAR
export async function listarProductos() {
  const res = await api.get("/productos");
  return res.data;
}

// CREAR (Modo 2 Pasos: Subir Imagen -> Enviar JSON)
export async function crearProducto(producto, archivo) {
  let urlImagen = producto.imagenUrl || "";

  // 1. Si hay archivo, lo subimos primero al endpoint de upload
  if (archivo) {
    const fd = new FormData();
    fd.append("file", archivo);
    
    try {
        const uploadRes = await api.post("/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        urlImagen = uploadRes.data.url; // Obtenemos la URL segura (Cloudinary/Local)
    } catch (e) {
        console.error("Error subiendo imagen", e);
        throw new Error("No se pudo subir la imagen");
    }
  }

  // 2. Preparamos el JSON final para el backend
  const payload = {
      ...producto,
      imagenUrl: urlImagen,
      // Mapeo importante: Frontend usa "categoriaId", Backend espera "categoryId"
      categoryId: producto.categoriaId 
  };

  // 3. Enviamos JSON al endpoint de productos
  const res = await api.post("/productos", payload);
  return res.data;
}

// ACTUALIZAR (Modo 2 Pasos)
export async function actualizarProducto(id, producto, archivo) {
  let urlImagen = producto.imagenUrl;

  // 1. Si hay archivo nuevo, lo subimos
  if (archivo) {
    const fd = new FormData();
    fd.append("file", archivo);
    
    try {
        const uploadRes = await api.post("/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        urlImagen = uploadRes.data.url;
    } catch (e) {
        console.error("Error subiendo imagen", e);
        throw new Error("No se pudo subir la imagen");
    }
  }

  // 2. Preparamos el JSON
  const payload = {
      ...producto,
      imagenUrl: urlImagen,
      // Mapeo importante
      categoryId: producto.categoriaId
  };

  // 3. Enviamos JSON (PUT)
  const res = await api.put(`/productos/${id}`, payload);
  return res.data;
}

// ELIMINAR
export async function eliminarProducto(id) {
  return api.delete(`/productos/${id}`);
}