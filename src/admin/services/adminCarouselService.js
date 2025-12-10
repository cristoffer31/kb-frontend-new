import api from "../../services/api";

// Listar (Público)
export async function listarCarousel() {
  const res = await api.get("/carousel");
  return res.data;
}

// Crear (Admin) - Sube imagen y guarda
export async function crearCarousel(archivo, titulo) {
  // 1. Subir a Cloudinary
  const fd = new FormData();
  fd.append("file", archivo);
  
  const uploadRes = await api.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" }
  });
  
  const url = uploadRes.data.url;

  // 2. Guardar en base de datos
  const res = await api.post("/carousel", {
      imageUrl: url,
      titulo: titulo
  });
  
  return res.data;
}

// Eliminar (Admin)
export async function eliminarCarousel(id) {
  return api.delete(`/carousel/${id}`);
}