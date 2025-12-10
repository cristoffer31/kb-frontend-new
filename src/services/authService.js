import api from "./api";

export async function loginApi(email, password) {
  // 1. Hacemos login
  const res = await api.post("/auth/login", { email, password });

  // 2. El backend ya nos devuelve { token: "...", usuario: { ... } }
  // Así que retornamos los datos directamente sin llamar a /me
  return res.data;
}

export async function registerApi(nombre, email, password, telefono) {
  return api.post("/auth/register", { nombre, email, password, telefono });
}

export async function meApi() {
  return (await api.get("/auth/me")).data;
}

export async function updateProfile(datos) {
  const res = await api.put("/auth/me", datos);
  localStorage.setItem("user", JSON.stringify(res.data));
  return res.data;
}