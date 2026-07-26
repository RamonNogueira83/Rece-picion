import React, { useEffect, useState } from "react";
import {
  FaChartPie,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaChartLine,
  FaCog,
  FaUserCircle,
  FaHospital,
} from "react-icons/fa";
import api from "../api/axios";

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
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <FaHospital size={30} />
          <span>Sistema Recepção</span>
        </div>
        <ul style={styles.menu}>
          <li style={styles.menuItem}>
            <FaChartPie />
            <span>Dashboard</span>
          </li>
          <li style={styles.menuItem}>
            <FaUsers />
            <span>Clientes</span>
          </li>
          <li style={styles.menuItem}>
            <FaCalendarAlt />
            <span>Agendamentos</span>
          </li>
          <li style={styles.menuItem}>
            <FaClipboardList />
            <span>Cadastros</span>
          </li>
          <li style={styles.menuItem}>
            <FaChartLine />
            <span>Relatórios</span>
          </li>
          <li style={styles.menuItem}>
            <FaCog />
            <span>Configurações</span>
          </li>
        </ul>
      </aside>

      {/* CONTEÚDO */}
      <main style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
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

        {/* CARDS */}
        <div style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <div key={index} style={styles.card}>
              <h4>{card.titulo}</h4>
              <h2>{carregando ? "..." : card.valor}</h2>
            </div>
          ))}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div style={styles.content}>
          {/* COLUNA ESQUERDA: os dois formulários */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* FORMULÁRIO: NOVO PACIENTE */}
            <div style={styles.formCard}>
              <h2>Novo Atendimento</h2>
              <form onSubmit={handleCadastrarPaciente}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Nome do Cliente"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                />

                <input
                  style={styles.input}
                  type="text"
                  placeholder="CPF"
                  value={novoCpf}
                  onChange={(e) => setNovoCpf(formatarCPF(e.target.value))}
                  maxLength={14}
                  required
                />
                {novoCpf.length > 0 && cpfCompleto && cpfInvalido && (
                  <p style={{ color: "#b91c1c", fontSize: 13, margin: "4px 0 0" }}>
                    CPF inválido.
                  </p>
                )}

                <input
                  style={styles.input}
                  type="text"
                  placeholder="Telefone"
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(formatarTelefone(e.target.value))}
                  maxLength={15}
                />

                <button type="submit" style={styles.button}>
                  Cadastrar Cliente
                </button>
              </form>
              {mensagemForm && <p style={{ marginTop: 10 }}>{mensagemForm}</p>}
            </div>

            {/* FORMULÁRIO: NOVO AGENDAMENTO */}
            <div style={styles.formCard}>
              <h2>Novo Agendamento</h2>
              <form onSubmit={handleCriarAgendamento}>
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
              {mensagemAgendamento && <p style={{ marginTop: 10 }}>{mensagemAgendamento}</p>}
            </div>
          </div>

          {/* TABELA */}
          <div style={styles.tableCard}>
            <h2>Fila de Espera</h2>
            {carregando ? (
              <p>Carregando...</p>
            ) : fila.length === 0 ? (
              <p>Nenhum agendamento pendente para hoje.</p>
            ) : (
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f6fb",
    fontFamily: "Segoe UI, sans-serif",
  },
  sidebar: {
    width: "260px",
    background: "#111827",
    color: "#fff",
    padding: "25px",
    boxSizing: "border-box",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "40px",
  },
  menu: { listStyle: "none", padding: 0, margin: 0 },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "12px",
    background: "#32371f",
    cursor: "pointer",
    transition: "0.3s",
  },
  main: { flex: 1, padding: "30px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: { margin: 0 },
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
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(255, 13, 13, 0.08)",
    color: "#126cc0",
  },
  content: { display: "grid", gridTemplateColumns: "350px 1fr", gap: "25px" },
  formCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  tableCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "10px",
    border: "1px solid #182ef8",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    marginTop: "15px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#000000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "15px" },
  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
    color: "#005cf0",
  },
  td: { padding: "15px", borderBottom: "1px solid #0f4cc7" },
  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },
};

export default Dashboard;