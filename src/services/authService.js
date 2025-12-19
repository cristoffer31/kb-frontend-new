import api from "./api";

export async function loginApi(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function registerApi(nombre, email, password, telefono) {
  return api.post("/auth/register", { nombre, email, password, telefono });
}

export async function meApi() {
  return (await api.get("/auth/me")).data;
}

export async function updateProfileApi(datos) {
  // Coincide con Route::put('/auth/me') en Laravel
  const res = await api.put("/auth/me", datos); 
  
  // Sincronizamos el almacenamiento local
  localStorage.setItem("user", JSON.stringify(res.data.usuario || res.data));
  return res.data;
}