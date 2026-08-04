import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

function formatarDataBR(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 8);
  const partes = [];
  if (digits.length > 0) partes.push(digits.slice(0, 2));
  if (digits.length > 2) partes.push(digits.slice(2, 4));
  if (digits.length > 4) partes.push(digits.slice(4, 8));
  return partes.join("/");
}

function formatarHora24(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + ":" + digits.slice(2, 4);
}

function horaValida(horaBR) {
  const m = /^(\d{2}):(\d{2})$/.exec(horaBR);
  if (!m) return false;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

function converterParaISO(dataBR, horaBR) {
  const [dia, mes, ano] = dataBR.split("/");
  if (!dia || !mes || !ano || ano.length !== 4) return null;
  if (!horaValida(horaBR)) return null;
  return `${ano}-${mes}-${dia}T${horaBR}`;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%)",
    padding: "32px",
    paddingLeft: "292px",
    boxSizing: "border-box",
    fontFamily: "Segoe UI, sans-serif",
  },
  topBar: {
    maxWidth: "900px",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  titleBlock: {
    display: "grid",
    gap: "6px",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "32px",
  },
  subtitle: {
    margin: 0,
    color: "#2563eb",
    fontWeight: 600,
  },
  backButton: {
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "12px 18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
  },
  card: {
    background: "#fff",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
    border: "1px solid #dbeafe",
    maxWidth: "900px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: "18px",
  },
  form: {
    display: "grid",
    gap: "14px",
    marginTop: "8px",
  },
  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #93c5fd",
    boxSizing: "border-box",
    background: "#f8fbff",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
  },
};

function Agendamentos() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [agendamentoPaciente, setAgendamentoPaciente] = useState("");
  const [agendamentoDataBR, setAgendamentoDataBR] = useState("");
  const [agendamentoHoraBR, setAgendamentoHoraBR] = useState("");
  const [agendamentoValor, setAgendamentoValor] = useState("");
  const [mensagemAgendamento, setMensagemAgendamento] = useState("");

  async function carregarPacientes() {
    try {
      const resPacientes = await api.get("pacientes/");
      setPacientes(resPacientes.data);
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
      setMensagemAgendamento("Não foi possível carregar os pacientes.");
    }
  }

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function handleCriarAgendamento(e) {
    e.preventDefault();
    setMensagemAgendamento("");

    const dataHoraISO = converterParaISO(agendamentoDataBR, agendamentoHoraBR);
    if (!dataHoraISO) {
      setMensagemAgendamento("Preencha a data (DD/MM/AAAA) e o horário (HH:MM) corretamente.");
      return;
    }

    try {
      await api.post("agendamentos/", {
        paciente: agendamentoPaciente,
        data_hora: dataHoraISO,
        valor: agendamentoValor === "" ? null : agendamentoValor,
      });
      setMensagemAgendamento("Agendamento criado com sucesso!");
      setAgendamentoPaciente("");
      setAgendamentoDataBR("");
      setAgendamentoHoraBR("");
      setAgendamentoValor("");
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      if (err.response?.data) {
        const primeiroErro = Object.values(err.response.data)[0];
        setMensagemAgendamento(`Erro: ${primeiroErro}`);
      } else {
        setMensagemAgendamento("Erro ao criar agendamento.");
      }
    }
  }

  return (
    <div>
      <Sidebar />
      <div style={styles.page}>
        <div style={styles.topBar}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Novo Agendamento</h1>
          <p style={styles.subtitle}>Crie um novo agendamento e organize a agenda</p>
        </div>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Voltar para Dashboard
        </button>
      </div>

        <div style={styles.card}>
          <span style={styles.badge}>Agenda operacional</span>
          <form style={styles.form} onSubmit={handleCriarAgendamento}>
          <select
            style={styles.input}
            value={agendamentoPaciente}
            onChange={(e) => setAgendamentoPaciente(e.target.value)}
            required
          >
            <option value="">Selecione o paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            type="text"
            placeholder="Data (DD/MM/AAAA)"
            value={agendamentoDataBR}
            onChange={(e) => setAgendamentoDataBR(formatarDataBR(e.target.value))}
            maxLength={10}
            required
          />

          <input
            style={styles.input}
            type="text"
            placeholder="Horário (HH:MM)"
            value={agendamentoHoraBR}
            onChange={(e) => setAgendamentoHoraBR(formatarHora24(e.target.value))}
            maxLength={5}
            required
          />

          <input
            style={styles.input}
            type="number"
            step="0.01"
            placeholder="Valor (opcional)"
            value={agendamentoValor}
            onChange={(e) => setAgendamentoValor(e.target.value)}
          />

            <button type="submit" style={styles.button}>
              Criar Agendamento
            </button>
          </form>

          {mensagemAgendamento && <p style={{ marginTop: 14 }}>{mensagemAgendamento}</p>}
        </div>
      </div>
    </div>
  );
}

export default Agendamentos;
