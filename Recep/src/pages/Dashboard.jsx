import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

// ===== FUNÇÕES AUXILIARES (fora do componente) =====

function formatarCPF(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 11);
  const partes = [];
  if (digits.length > 0) partes.push(digits.slice(0, 3));
  if (digits.length > 3) partes.push(digits.slice(3, 6));
  if (digits.length > 6) partes.push(digits.slice(6, 9));
  let resultado = partes.join(".");
  if (digits.length > 9) resultado += "-" + digits.slice(9, 11);
  return resultado;
}

function formatarTelefone(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 11);
  let resultado = "";
  if (digits.length > 0) resultado = "(" + digits.slice(0, 2);
  if (digits.length > 2) {
    resultado += ") " + digits.slice(2, digits.length <= 10 ? 6 : 7);
  }
  if (digits.length > 6 && digits.length <= 10) {
    resultado += "-" + digits.slice(6, 10);
  } else if (digits.length > 7) {
    resultado += "-" + digits.slice(7, 11);
  }
  return resultado;
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  function calcularDigito(parcial) {
    const peso = parcial.length + 1;
    let soma = 0;
    for (let i = 0; i < parcial.length; i++) {
      soma += parseInt(parcial[i]) * (peso - i);
    }
    const resto = soma % 11;
    return resto < 2 ? "0" : String(11 - resto);
  }

  const digito1 = calcularDigito(cpf.slice(0, 9));
  const digito2 = calcularDigito(cpf.slice(0, 9) + digito1);
  return cpf.slice(-2) === digito1 + digito2;
}

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

// ===== COMPONENTE =====

function Dashboard() {
  const [pacientes, setPacientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  useEffect(() => {
    const atualizarLayout = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", atualizarLayout);
    return () => window.removeEventListener("resize", atualizarLayout);
  }, []);

  // form: novo paciente
  const [novoNome, setNovoNome] = useState("");
  const [novoCpf, setNovoCpf] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [mensagemForm, setMensagemForm] = useState("");

  // form: novo agendamento
  const [agendamentoPaciente, setAgendamentoPaciente] = useState("");
  const [agendamentoDataBR, setAgendamentoDataBR] = useState(""); // DD/MM/AAAA
  const [agendamentoHoraBR, setAgendamentoHoraBR] = useState(""); // HH:MM (24h)
  const [agendamentoValor, setAgendamentoValor] = useState("");
  const [mensagemAgendamento, setMensagemAgendamento] = useState("");

  async function carregarDados() {
    try {
      setCarregando(true);
      const [resPacientes, resAgendamentos] = await Promise.all([
        api.get("pacientes/"),
        api.get("agendamentos/"),
      ]);
      setPacientes(resPacientes.data);
      setAgendamentos(resAgendamentos.data);
      setErro("");
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setErro("Não foi possível carregar os dados. Verifique se o backend está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const cpfDigits = novoCpf.replace(/\D/g, "");
  const cpfCompleto = cpfDigits.length === 11;
  const cpfInvalido = cpfCompleto && !validarCPF(novoCpf);

  const hojeStr = new Date().toLocaleDateString("pt-BR");

  const agendamentosHoje = agendamentos.filter(
    (a) => new Date(a.data_hora).toLocaleDateString("pt-BR") === hojeStr
  );

  const cards = [
    { titulo: "Clientes Hoje", valor: agendamentosHoje.length },
    {
      titulo: "Em Espera",
      valor: agendamentosHoje.filter(
        (a) => a.status === "agendado" || a.status === "confirmado"
      ).length,
    },
    {
      titulo: "Atendidos",
      valor: agendamentosHoje.filter((a) => a.status === "realizado").length,
    },
    { titulo: "Agendamentos", valor: agendamentos.length },
  ];

  const fila = agendamentosHoje
    .filter((a) => a.status === "agendado" || a.status === "confirmado")
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
    .map((a) => ({
      nome: a.paciente_nome,
      horario: new Date(a.data_hora).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: a.status === "agendado" ? "Aguardando" : "Confirmado",
    }));

  async function handleCadastrarPaciente(e) {
    e.preventDefault();
    setMensagemForm("");

    if (!validarCPF(novoCpf)) {
      setMensagemForm("CPF inválido. Verifique os números digitados.");
      return;
    }

    try {
      await api.post("pacientes/", {
        nome: novoNome,
        cpf: novoCpf.replace(/\D/g, ""),
        telefone: novoTelefone,
      });
      setMensagemForm("Paciente cadastrado com sucesso!");
      setNovoNome("");
      setNovoCpf("");
      setNovoTelefone("");
      carregarDados();
    } catch (err) {
      console.error("Erro ao cadastrar paciente:", err);
      if (err.response?.data) {
        const primeiroErro = Object.values(err.response.data)[0];
        setMensagemForm(`Erro: ${primeiroErro}`);
      } else {
        setMensagemForm("Erro ao cadastrar paciente.");
      }
    }
  }

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
      carregarDados();
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
      <div style={styles.container(isMobile)}>
      <main style={styles.main(isMobile)}>
        <div style={styles.header(isMobile)}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Bem-vindo ao sistema de recepção</p>
          </div>
          <div style={styles.userBox}>
            <FaUserCircle size={28} />
            <span>Ramon</span>
          </div>
        </div>

        {erro && <p style={{ color: "#b91c1c", marginBottom: 20 }}>{erro}</p>}

        <div style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <div key={index} style={styles.card}>
              <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>{card.titulo}</h4>
              <h2 style={{ margin: 0, fontSize: "30px" }}>
                {carregando ? "..." : card.valor}
              </h2>
            </div>
          ))}
        </div>

        <div style={styles.content(isMobile)}>
          <div style={styles.tableCard}>
            <h2 style={styles.sectionTitle}>Fila de Espera</h2>
            {carregando ? (
              <p>Carregando...</p>
            ) : fila.length === 0 ? (
              <p>Nenhum agendamento pendente para hoje.</p>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nome</th>
                      <th style={styles.th}>Horário</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fila.map((cliente, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{cliente.nome}</td>
                        <td style={styles.td}>{cliente.horario}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.status,
                              background:
                                cliente.status === "Aguardando" ? "#fef3c7" : "#dcfce7",
                              color:
                                cliente.status === "Aguardando" ? "#92400e" : "#166534",
                            }}
                          >
                            {cliente.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

const styles = {
  container: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    minHeight: "100vh",
    backgroundColor: "#f3f6fb",
    fontFamily: "Segoe UI, sans-serif",
    paddingLeft: isMobile ? 0 : "292px",
    boxSizing: "border-box",
  }),
  sidebar: (isMobile) => ({
    width: isMobile ? "100%" : "260px",
    background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
    color: "#fff",
    padding: isMobile ? "18px" : "25px",
    boxSizing: "border-box",
  }),
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "24px",
  },
  menu: (isMobile) => ({
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "1fr",
    gap: "10px",
  }),
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.08)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    overflow: "hidden",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "14px",
    color: "#fff",
    textDecoration: "none",
  },
  main: (isMobile) => ({
    flex: 1,
    padding: isMobile ? "18px" : "30px",
    width: "100%",
    boxSizing: "border-box",
  }),
  header: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: "16px",
    marginBottom: "24px",
  }),
  title: { margin: 0, fontSize: "32px" },
  subtitle: { color: "#0b5aec", marginTop: "5px" },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "10px 20px",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    fontWeight: "600",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.08)",
    border: "1px solid #dbeafe",
  },
  content: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "360px 1fr",
    gap: "25px",
    alignItems: "start",
  }),
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formCard: {
    background: "#fff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.08)",
  },
  sectionTitle: {
    marginBottom: "8px",
  },
  tableCard: {
    background: "#fff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(15, 23, 42, 0.08)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "10px",
    border: "1px solid #93c5fd",
    boxSizing: "border-box",
    background: "#f8fbff",
  },
  button: {
    width: "100%",
    marginTop: "15px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
    marginTop: "12px",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "420px" },
  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#005cf0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #dbeafe",
    whiteSpace: "nowrap",
  },
  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
    display: "inline-block",
  },
};

export default Dashboard;