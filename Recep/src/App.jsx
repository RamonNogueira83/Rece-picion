import React from "react";
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

function App() {
  const cards = [
    { titulo: "Clientes Hoje", valor: 128 },
    { titulo: "Em Espera", valor: 15 },
    { titulo: "Atendidos", valor: 113 },
    { titulo: "Agendamentos", valor: 42 },
  ];

  const fila = [
    {
      nome: "João Silva",
      horario: "09:30",
      status: "Aguardando",
    },
    {
      nome: "Maria Souza",
      horario: "09:45",
      status: "Aguardando",
    },
    {
      nome: "Pedro Santos",
      horario: "10:00",
      status: "Em Atendimento",
    },
  ];

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
            <p style={styles.subtitle}>
              Bem-vindo ao sistema de recepção
            </p>
          </div>

          <div style={styles.userBox}>
            <FaUserCircle size={28} />
            <span>Ramon</span>
          </div>
        </div>

        {/* CARDS */}
        <div style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <div key={index} style={styles.card}>
              <h4>{card.titulo}</h4>
              <h2>{card.valor}</h2>
            </div>
          ))}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div style={styles.content}>
          {/* FORMULÁRIO */}
          <div style={styles.formCard}>
            <h2>Novo Atendimento</h2>

            <input
              style={styles.input}
              type="text"
              placeholder="Nome do Cliente"
            />

            <input
              style={styles.input}
              type="text"
              placeholder="CPF"
            />

            <input
              style={styles.input}
              type="text"
              placeholder="Telefone"
            />

            <button style={styles.button}>
              Cadastrar Cliente
            </button>
          </div>

          {/* TABELA */}
          <div style={styles.tableCard}>
            <h2>Fila de Espera</h2>

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
                            cliente.status === "Aguardando"
                              ? "#fef3c7"
                              : "#dcfce7",
                          color:
                            cliente.status === "Aguardando"
                              ? "#92400e"
                              : "#166534",
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

  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  
  },

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

  main: {
    flex: 1,
    padding: "30px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
  },

  subtitle: {
    color: "#0b5aec",
    marginTop: "5px",
  },

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

  content: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "25px",
 
  },

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

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },

  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
    color: "#005cf0",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #0f4cc7",
  },

  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },
};

export default App;