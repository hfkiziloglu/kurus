import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, useToastStore } from "../store";
import api from "../api";
import { Icon } from "./Icons";

const NAV = [
  { section: "ANA", items: [
    { id: "dashboard",    label: "Panel",      num: "01", to: "/app/dashboard" },
  ]},
  { section: "PARA", items: [
    { id: "transactions", label: "İşlemler",   num: "02", to: "/app/transactions" },
    { id: "budget",       label: "Bütçe",      num: "03", to: "/app/budget" },
  ]},
  { section: "ZEKA", items: [
    { id: "chat",         label: "AI Asistan", num: "04", to: "/app/chat", ai: true },
  ]},
  { section: "HESAP", items: [
    { id: "admin",        label: "Yönetim",    num: "05", to: "/app/admin", adminOnly: true },
    { id: "profile",      label: "Profil",     num: "06", to: "/app/profile" },
  ]},
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    toast.add("Çıkış yapıldı.", "info");
    navigate("/login");
  }

  const initial = user?.name?.[0]?.toUpperCase() || "K";

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <NavLink to="/app/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="brand-name">Kuruş<span style={{ color: "var(--acid)" }}>.</span></div>
          <div className="brand-tagline">AI · FİNANS · 2026</div>
        </NavLink>
      </div>

      {NAV.map((group) => (
        <div className="nav-group" key={group.section}>
          <div className="nav-label">{group.section}</div>
          {group.items.map((item) => {
            if (item.adminOnly && user?.role !== "admin") return null;
            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item${isActive ? " is-active" : ""}${item.ai ? " is-ai" : ""}`
                }
              >
                <span className="nav-item-num">{item.num}</span>
                <span className="nav-item-text">{item.label}</span>
                {item.ai && <span className="nav-item-flag">AI</span>}
              </NavLink>
            );
          })}
        </div>
      ))}

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <div className="avatar is-acid">{initial}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sidebar-user-name">{user?.name || "Kullanıcı"}</div>
            <div className="sidebar-user-email">{user?.email || ""}</div>
          </div>
          <button className="icon-btn is-ghost" onClick={handleLogout} title="Çıkış yap">
            <Icon name="logout" size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
