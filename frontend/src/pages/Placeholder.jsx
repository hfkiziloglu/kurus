import { Icon } from "../components/Icons";

const CONFIG = {
  budget: {
    title: "Bütçe",
    sub: "Kategori bazlı limitler",
    icon: "pie",
    color: "var(--acid)",
    desc: "Kategori bazlı bütçe limitleri ve AI destekli ay sonu tahminleri yakında geliyor.",
  },
  chat: {
    title: "AI Asistan",
    sub: "Doğal dilde soru sor",
    icon: "message",
    color: "var(--ai)",
    desc: "Doğal dilde finansal soru sor. \"Geçen ay kahveye ne kadar harcadım?\" — yakında geliyor.",
  },
  admin: {
    title: "Yönetim",
    sub: "Platform istatistikleri",
    icon: "grid",
    color: "var(--coral)",
    desc: "Platform genelindeki kullanıcı, işlem ve AI kullanım istatistikleri yakında geliyor.",
  },
};

export default function PlaceholderPage({ page }) {
  const cfg = CONFIG[page] || CONFIG.budget;
  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">
            {cfg.title}{" "}
            <span style={{ color: cfg.color }}>—</span>{" "}
            <span style={{ color: "var(--paper-3)" }}>{cfg.sub}</span>
          </div>
        </div>
      </div>
      <div className="page">
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: 400, textAlign: "center", gap: 24,
        }}>
          <div style={{
            width: 80, height: 80, background: "var(--ink-2)", border: "1px solid var(--line-2)",
            display: "grid", placeItems: "center", color: cfg.color,
          }}>
            <Icon name={cfg.icon} size={32} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 40, color: "var(--paper)", lineHeight: 1, marginBottom: 12, paddingBottom: "0.04em" }}>
              Yakında.
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--paper-3)", maxWidth: 400, lineHeight: 1.6 }}>
              {cfg.desc}
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--paper-4)",
            border: "1px solid var(--line-2)", padding: "8px 16px",
          }}>
            — yapım aşamasında —
          </div>
        </div>
      </div>
    </>
  );
}
