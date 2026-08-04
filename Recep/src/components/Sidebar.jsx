import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaChartPie,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaChartLine,
  FaCog,
  FaHospital,
} from "react-icons/fa";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: <FaChartPie /> },
  { to: "/clientes", label: "Clientes", icon: <FaUsers /> },
  { to: "/agendamentos", label: "Agendamentos", icon: <FaCalendarAlt /> },
  { to: "/cadastros", label: "Cadastros", icon: <FaClipboardList /> },
  { to: "/relatorios", label: "Relatórios", icon: <FaChartLine /> },
  { to: "/configuracoes", label: "Configurações", icon: <FaCog /> },
];

function Sidebar() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  useEffect(() => {
    const atualizarLayout = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", atualizarLayout);
    return () => window.removeEventListener("resize", atualizarLayout);
  }, []);

  const styles = {
    sidebar: {
      position: isMobile ? "sticky" : "fixed",
      top: 0,
      left: 0,
      right: isMobile ? 0 : undefined,
      bottom: isMobile ? "auto" : 0,
      width: isMobile ? "100%" : "260px",
      background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
      color: "#fff",
      padding: isMobile ? "12px 14px" : "22px 18px",
      boxSizing: "border-box",
      zIndex: 50,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: isMobile ? "12px" : "28px",
    },
    menu: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "1fr",
      gap: "12px",
    },
    link: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "14px 15px",
      borderRadius: "12px",
      textDecoration: "none",
      color: "#e5eefc",
      fontWeight: "600",
      background: "rgba(255,255,255,0.06)",
    },
    activeLink: {
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      color: "#fff",
      boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
    },
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <FaHospital size={28} />
        <span>Sistema Recepção</span>
      </div>

      <ul style={styles.menu}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.activeLink : {}),
              })}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
