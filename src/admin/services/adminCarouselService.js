import api from "../../services/api";

export async function listarCarousel() {
  try {
    const res = await api.get("/carousel");
    if (res.data.data && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (e) { return []; }
}

export async function crearCarousel(archivo, titulo) {
  const fd = new FormData();
  fd.append("titulo", titulo);
  if (archivo) fd.append("imagen", archivo); // Laravel espera 'imagen' o 'file'

  const res = await api.post("/carousel", fd, {
      headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function eliminarCarousel(id) {
  return api.delete(`/carousel/${id}`);
}