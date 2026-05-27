import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icons";

const TICKER_ITEMS = [
  { sym: "USD/TRY", val: "32.84", delta: "+0.12%", dir: "up" },
  { sym: "EUR/TRY", val: "35.61", delta: "-0.08%", dir: "down" },
  { sym: "BIST100", val: "9.842", delta: "+1.24%", dir: "up" },
  { sym: "XAU/TRY", val: "2.841", delta: "+0.34%", dir: "up" },
  { sym: "BTC/TRY", val: "2.1M",  delta: "-1.80%", dir: "down" },
];

const FEATURES = [
  { tag: "AI · 01", h: "Otomatik kategorize", b: "\"Migros 285₺\" yaz — AI markete ait olduğunu bilir, doğru kategoriyi atar. %94 isabet oranı.", icon: "zap" },
  { tag: "AI · 02", h: "Doğal dilde sor", b: "\"Geçen ay kahveye ne kadar?\" — sohbet et, anında veri-temelli cevap al.", icon: "message" },
  { tag: "AI · 03", h: "Aylık özet", b: "Her ay sonunda kişisel bir kart: nereye, neden, ne kadar. Tasarruf önerileri dahil.", icon: "calendar" },
  { tag: "SYS · 04", h: "Akıllı bütçe", b: "Kategori bazlı limitler kur. AI ay sonu tahmini yapar, limit aşımında uyarır.", icon: "pie" },
  { tag: "SYS · 05", h: "Detaylı panel", b: "Grafikler, tablolar, tabular sayılar. CSV ve PDF olarak dışa aktar.", icon: "grid" },
  { tag: "SYS · 06", h: "Özel & güvenli", b: "JWT tabanlı kimlik, bcrypt ile şifre. Verilerin sadece senin, asla satışta değil.", icon: "shield" },
];

const INSIGHT_SEGMENTS = [
  { text: "Bu ay kahveye ", className: "" },
  { text: "₺840 ", className: "" },
  { text: "harcadın — geçen aydan ", className: "" },
  { text: "%62", className: "" },
  { text: " daha fazla.", className: "" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState(0);
  const fullText = INSIGHT_SEGMENTS.reduce((s, seg) => s + seg.text, "");

  useEffect(() => {
    let p = 0;
    const id = setTimeout(() => {
      const iv = setInterval(() => {
        p++;
        setTyped(p);
        if (p >= fullText.length) clearInterval(iv);
      }, 28);
    }, 800);
    return () => clearTimeout(id);
  }, []);

  let used = 0;
  const typedOut = [];
  for (let i = 0; i < INSIGHT_SEGMENTS.length; i++) {
    const seg = INSIGHT_SEGMENTS[i];
    const rem = typed - used;
    if (rem <= 0) break;
    const slice = seg.text.slice(0, rem);
    typedOut.push(<span key={i} style={i === 3 ? { color: "var(--coral)", fontFamily: "var(--font-mono)", fontStyle: "normal", fontSize: "0.78em", padding: "0 3px" } : {}}>{slice}</span>);
    used += seg.text.length;
  }

  const all = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="landing">
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

      <header className="landing-nav anim-rise">
        <div className="landing-nav-brand">Kuruş<span style={{ color: "var(--acid)" }}>.</span></div>
        <nav className="landing-nav-links">
          <a>Özellikler</a>
          <a>Nasıl çalışır</a>
          <a>Manifesto</a>
        </nav>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/login")}>Giriş</button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            Başla <Icon name="arrowRight" size={13} />
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-side">
          <div className="v-label">Sayı 01 · KURUŞ EDITION</div>
        </div>

        <div className="hero-main">
          <div className="hero-meta-bar anim-rise delay-1">
            <div>
              <span className="live">Canlı</span>
              <span className="sep">/</span>
              <span>İstanbul</span>
              <span className="sep">/</span>
              <span>26 May 2026</span>
            </div>
            <div>
              <span>1.284 üye</span>
              <span className="sep">/</span>
              <span style={{ color: "var(--acid)" }}>AI · 001</span>
            </div>
          </div>

          <h1 className="hero-headline">
            <div className="anim-rise-slow delay-2">Her <span style={{ color: "var(--paper-3)" }}>kuruş.</span></div>
            <div className="anim-rise-slow delay-3"><span className="strike-acid">Akıllıca</span></div>
            <div className="anim-rise-slow delay-3">yerinde.</div>
          </h1>

          <div className="hero-sub-row">
            <div className="hero-sub-text">
              Yapay zekâyla harcamalarını otomatik kategorile, soru sor, içgörü al.{" "}
              <b>Hayatına 30 saniyede entegre, sonsuza dek senin.</b>
            </div>
            <div className="hero-sub-stats">
              {[["1.284", "Aktif üye"], ["18,4K", "Bu ay işlem"], ["94,2%", "AI doğruluk"]].map(([v, l]) => (
                <div key={l}>
                  <div className="hero-sub-stat-num">{v}</div>
                  <div className="hero-sub-stat-label">{l}</div>
                </div>
              ))}
            </div>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
                Hesap aç <Icon name="arrowRight" size={14} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate("/login")}>Demoyu gez</button>
            </div>
          </div>
        </div>

        <div className="hero-side" style={{ borderLeft: "1px solid var(--line-1)", borderRight: "none" }} />
      </section>

      <div className="hero-insight-strip">
        <div className="hero-insight-tag">
          <div className="hero-insight-mark">AI</div>
          <div>
            <div className="hero-insight-tag-label">Kuruş AI</div>
            <div className="hero-insight-tag-name">Asistan</div>
          </div>
        </div>
        <div className="hero-insight-typed">
          {typedOut}
          {typed < fullText.length && <span className="typed-cursor" />}
        </div>
        <div className="hero-insight-meter">
          <div className="hero-insight-meter-num">+62%</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--paper-4)", marginBottom: 4 }}>Risk: Yüksek</div>
          <div className="hero-insight-meter-bar">
            <div className="hero-insight-meter-fill" />
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-num">— Bölüm 02 — Yetenekler</div>
          </div>
          <div>
            <div className="section-h2">AI yardımcın <span className="acid">her zaman yanında.</span></div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--paper-3)", marginTop: 16 }}>
              Yedi özellik, tek çatı altında. Bütçeyi anla, alışkanlığı yakala, gelecek ayı tahmin et.
            </div>
          </div>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feat">
              <div className="feat-head">
                <span className="feat-num">0{i + 1}</span>
                <span className="feat-tag">{f.tag}</span>
              </div>
              <div className="feat-h">{f.h}</div>
              <div className="feat-body">{f.b}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-foot">
        <span>© 2026 Kuruş — YMH354 Final</span>
        <span style={{ color: "var(--paper-2)" }}>Made in Istanbul</span>
        <div className="landing-foot-right">
          <a style={{ cursor: "pointer" }}>GitHub</a>
          <a style={{ cursor: "pointer" }}>Gizlilik</a>
          <a style={{ cursor: "pointer" }}>İletişim</a>
        </div>
      </footer>
    </div>
  );
}
