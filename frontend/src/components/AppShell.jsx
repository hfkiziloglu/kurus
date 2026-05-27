import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { Sidebar } from "./Sidebar";

const TICKER_ITEMS = [
  { sym: "USD/TRY", val: "32.84", delta: "+0.12%", dir: "up" },
  { sym: "EUR/TRY", val: "35.61", delta: "-0.08%", dir: "down" },
  { sym: "BIST100", val: "9.842", delta: "+1.24%", dir: "up" },
  { sym: "XAU/TRY", val: "2.841", delta: "+0.34%", dir: "up" },
  { sym: "BTC/TRY", val: "2.1M",  delta: "-1.80%", dir: "down" },
  { sym: "ETH/TRY", val: "112K",  delta: "+0.44%", dir: "up" },
];

function LiveTicker() {
  const all = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-tag">LIVE</div>
      <div className="ticker-track">
        {all.map((it, i) => (
          <span key={i} className={`ticker-item ${it.dir}`}>
            <span className="sym">{it.sym}</span>
            <span className="val">{it.val}</span>
            <span className="delta">{it.delta}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ShellRail() {
  return (
    <div className="shell-rail">
      <div className="rail-mark">K</div>
      <div className="rail-vlabel">FINANCIAL · TERMINAL</div>
      <div className="rail-spacer" />
      <div className="rail-meta">v2.0<br />2026</div>
    </div>
  );
}

export function AppShell() {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div>
      <LiveTicker />
      <div className="shell">
        <ShellRail />
        <Sidebar />
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
