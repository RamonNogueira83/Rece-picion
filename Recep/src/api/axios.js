import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

api.interceptors.request.use((config) => {
  // garante barra no final em toda chamada
  if (config.url && !config.url.endsWith("/")) {
    config.url += "/";
  }

  // anexa o token JWT, se existir (login não precisa disso, os outros endpoints precisam)
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;