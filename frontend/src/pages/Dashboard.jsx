import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "../components/Icons";
import { LineChart, Donut, Sparkline } from "../components/Charts";
import api from "../api";

const CAT_LABELS = { food: "Market & Yemek", transport: "Ulaşım", shopping: "Alışveriş", bills: "Faturalar", entertain: "Eğlence", health: "Sağlık", other: "Diğer" };
const CAT_COLORS = { food: "var(--cat-food)", transport: "var(--cat-transport)", shopping: "var(--cat-shopping)", bills: "var(--cat-bills)", entertain: "var(--cat-entertain)", health: "var(--cat-health)", other: "var(--cat-other)" };
const CAT_GLYPHS = { food: "🛒", transport: "🚌", shopping: "🛍", bills: "⚡", entertain: "🎬", health: "💊", other: "•" };

function fmtTL(n) { return (n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

function KPICell({ label, value, delta, deltaDir, foot, spark }) {
  return (
    <div className="kpi-cell">
      <div className="kpi-label">
        <span>{label}</span>
        {delta != null && (
          <span className={`delta ${deltaDir}`}>{Math.abs(delta)}%</span>
        )}
      </div>
      <div className="kpi-num">
        <span className="currency">₺</span>
        <span>{fmtTL(value)}</span>
      </div>
      {foot && <div className="kpi-meta"><span>{foot}</span></div>}
      {spark && <div className="kpi-spark"><Sparkline data={spark} color="var(--acid)" height={30} /></div>}
    </div>
  );
}

function SkeletonDash() {
  return (
    <div className="page">
      <div style={{ height: 120, background: "var(--ink-2)", marginBottom: 28, animation: "pulse 1.5s ease infinite" }} />
      <div style={{ height: 80, background: "var(--ink-2)", marginBottom: 28 }} />
      <div style={{ height: 300, background: "var(--ink-2)" }} />
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/stats/dashboard").then(r => r.data),
    staleTime: 60_000,
  });

  if (isLoading) return <SkeletonDash />;
  if (isError) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 28, color: "var(--coral)", marginBottom: 12 }}>Bağlantı hatası.</div>
      <div style={{ color: "var(--paper-3)", marginBottom: 20 }}>Veriler yüklenemedi. Backend çalışıyor mu?</div>
    </div>
  );

  const { kpi, dailyTrend, categoryBreakdown, recentTransactions } = data;

  const lineData = dailyTrend.map(d => d.amount);
  const xLabels = dailyTrend.map((d, i) => {
    if (i === 0 || i === 6 || i === 13 || i === 20 || i === 29) {
      return new Date(d.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    }
    return "";
  });

  const donutSegs = categoryBreakdown.map(c => ({
    label: CAT_LABELS[c.category] || c.category,
    value: c.total,
    color: CAT_COLORS[c.category] || "var(--paper-3)",
    category: c.category,
    pct: c.pct,
  }));

  const sparkDummy = [600, 800, 750, 1000, 1200, 900, 1100];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">
            Finansal <span style={{ color: "var(--acid)" }}>Panel.</span>
          </div>
          <div className="topbar-meta">
            <span className="lbl">AY</span><span>{new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}</span>
            <span className="sep">/</span>
            <span className="lbl">İŞLEM</span><span>{kpi.txCount}</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => navigate("/app/transactions")}>
            <Icon name="plus" size={13} /> Yeni harcama
          </button>
        </div>
      </div>

      <div className="page">
        <div className="grid grid-4 grid-divided" style={{ marginBottom: 28 }}>
          <KPICell label="Bu ay toplam" value={kpi.totalSpent} delta={null} foot={`${kpi.txCount} işlem`} spark={sparkDummy} />
          <KPICell label="Ortalama işlem" value={kpi.avgTx} foot="işlem başına" spark={sparkDummy} />
          <div className="kpi-cell">
            <div className="kpi-label"><span>En çok kategori</span></div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--paper)", paddingBottom: "0.04em" }}>
              {CAT_LABELS[kpi.topCategory] || kpi.topCategory}
            </div>
            <div className="kpi-meta" style={{ marginTop: 14 }}>
              <span style={{ width: 8, height: 8, background: CAT_COLORS[kpi.topCategory] || "var(--paper-3)", display: "inline-block" }} />
              <span>{kpi.topCategory}</span>
            </div>
          </div>
          <div className="kpi-cell">
            <div className="kpi-label"><span>AI ASISTAN</span></div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 28, lineHeight: 1.1, color: "var(--ai)", paddingBottom: "0.04em" }}>Aktif</div>
            <div className="kpi-meta" style={{ marginTop: 14 }}><span style={{ color: "var(--ai)" }}>Gemini 2.5 Flash</span></div>
          </div>
        </div>

        <div className="insight" style={{ marginBottom: 28 }}>
          <div className="insight-head">
            <div className="insight-label">Kuruş AI</div>
            <div className="insight-meta">Aylık özet</div>
          </div>
          <div className="insight-body">
            Bu ay toplam <b>₺{fmtTL(kpi.totalSpent)}</b> harcadın.{" "}
            {kpi.txCount > 0 && <>En çok harcama <span className="hi-neg">{CAT_LABELS[kpi.topCategory] || kpi.topCategory}</span> kategorisinde.</>}
          </div>
        </div>

        <div className="grid grid-23" style={{ gap: 24, marginBottom: 28 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title"><span className="card-no">07</span>Son 30 Gün</div>
                <div className="card-sub">Günlük harcama trendi</div>
              </div>
            </div>
            {lineData.every(v => v === 0) ? (
              <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--paper-4)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                Henüz işlem yok.
              </div>
            ) : (
              <LineChart data={lineData} height={260} xLabels={xLabels} yFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title"><span className="card-no">08</span>Kategoriler</div>
                <div className="card-sub">Bu ay dağılım</div>
              </div>
            </div>
            {donutSegs.length === 0 ? (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--paper-4)", fontFamily: "var(--font-mono)", fontSize: 11 }}>Henüz işlem yok.</div>
            ) : (
              <>
                <Donut segments={donutSegs} size={180} thickness={12} centerLabel={`${(kpi.totalSpent / 1000).toFixed(1)}K`} centerSub="₺ Toplam" />
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {donutSegs.slice(0, 5).map(s => (
                    <div key={s.category} className="row-between" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, background: s.color, display: "inline-block" }} />
                        <span style={{ color: "var(--paper-2)" }}>{s.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ color: "var(--paper)" }}>₺{fmtTL(s.value)}</span>
                        <span className="dim2" style={{ width: 30, textAlign: "right" }}>%{s.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-head" style={{ padding: "18px 22px 14px", marginBottom: 0 }}>
            <div>
              <div className="card-title"><span className="card-no">09</span>Son İşlemler</div>
              <div className="card-sub">En yeni 5 harcama</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate("/app/transactions")}>
              Tümü <Icon name="arrowRight" size={11} />
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--paper-4)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              Henüz işlem yok. <button className="btn btn-sm btn-primary" style={{ marginLeft: 12 }} onClick={() => navigate("/app/transactions")}>İlk harcamayı ekle</button>
            </div>
          ) : (
            <table className="tx-table">
              <tbody>
                {recentTransactions.map((tx, i) => (
                  <tr key={tx._id}>
                    <td className="tx-row-num">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <div className="tx-merchant">
                        <div className="tx-glyph" style={{ color: CAT_COLORS[tx.category] || "var(--paper-2)" }}>
                          {CAT_GLYPHS[tx.category] || "•"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--paper)" }}>{tx.merchant}</div>
                          <div style={{ color: "var(--paper-4)", fontSize: 10.5, marginTop: 2 }}>{tx.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`cat-chip ${tx.category}${tx.categorySource === "ai" ? " is-ai" : ""}`}>
                        <span className="dot" />
                        {CAT_LABELS[tx.category] || tx.category}
                        {tx.categorySource === "ai" && tx.aiConfidence && (
                          <span style={{ marginLeft: 4, color: "var(--ai)", fontSize: 9 }}>%{Math.round(tx.aiConfidence * 100)}</span>
                        )}
                      </span>
                    </td>
                    <td style={{ color: "var(--paper-3)", fontSize: 11, whiteSpace: "nowrap" }}>
                      {new Date(tx.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="tx-amount">−₺{(tx.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
