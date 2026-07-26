import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();
  setErro("");
  try {
    const res = await api.post("token/", { username, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    navigate("/dashboard");
  } catch (err) {
    console.error("Erro no login:", err); // <- olha isso no console do navegador (F12 > Console)
    if (err.response) {
      // o backend respondeu, mas com erro
      setErro(`Erro ${err.response.status}: credenciais inválidas ou dados incorretos`);
    } else if (err.request) {
      // a requisição foi feita mas não teve resposta (backend fora do ar, CORS, etc)
      setErro("Não foi possível conectar ao servidor. O backend está rodando?");
    } else {
      setErro("Erro inesperado: " + err.message);
    }
  }
}

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "100px auto" }}>
      <h2>Login</h2>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      <input
        type="text"
        placeholder="Usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10, boxSizing: "border-box" }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10, boxSizing: "border-box" }}
      />
      <button type="submit" style={{ width: "100%", padding: 10 }}>
        Entrar
      </button>
    </form>
  );
}

export default Login;