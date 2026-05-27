import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, useToastStore } from "../store";
import { Icon } from "../components/Icons";
import api from "../api";

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function AuthSide() {
  return (
    <div className="auth-side">
      <div className="auth-side-deco" />
      <div className="auth-side-content" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 28 }}>
          Kuruş<span style={{ color: "var(--acid)" }}>.</span>
        </div>
      </div>
      <div className="auth-side-content" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="auth-side-tag">— AI · FİNANS · 2026</div>
        <div className="auth-side-headline">
          Her kuruş <span className="acid">akıllıca</span> yerinde.
        </div>
        <div className="auth-side-demo" style={{ maxWidth: 380 }}>
          <div className="auth-side-demo-label">
            <span style={{ width: 6, height: 6, background: "var(--ai)", display: "inline-block" }} />
            Otomatik kategorize
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--paper)" }}>
            "Migros 285₺"
          </div>
          <div className="auth-side-demo-row">
            <span className="auth-side-demo-arrow">→</span>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 22, color: "var(--acid)" }}>
              Market & Yemek
            </span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--paper-4)", textTransform: "uppercase" }}>
              AI · %97
            </span>
          </div>
        </div>
      </div>
      <div className="auth-side-content row-between" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--paper-4)" }}>
        <span>© 2026 Kuruş — YMH354</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToastStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const emailErr = touched.email && !isValidEmail(email) ? "Geçerli bir e-posta girin." : null;
  const pwErr = touched.pw && password.length < 8 ? "Şifre en az 8 karakter olmalıdır." : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, pw: true });
    if (!isValidEmail(email) || password.length < 8) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      toast.add("Hoş geldin, " + data.user.name + "!", "success");
      navigate("/app/dashboard");
    } catch (err) {
      toast.add(err.response?.data?.error || "Giriş başarısız.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthSide />
      <div className="auth-form-side">
        <div className="auth-form anim-rise">
          <div className="eyebrow" style={{ marginBottom: 14 }}>— Giriş · 01</div>
          <h1 className="auth-h1">Tekrar <span style={{ color: "var(--acid)" }}>hoş geldin.</span></h1>
          <p className="auth-sub">Hesabına giriş yap ve harcamalarına devam et.</p>

          <form className="stack-4" onSubmit={handleSubmit}>
            <div className="field">
              <div className="field-label"><span>E-posta</span></div>
              <div className="input-icon-wrap">
                <span className="ii"><Icon name="mail" size={14} /></span>
                <input
                  type="email"
                  className={`input${emailErr ? " has-error" : ""}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  placeholder="you@example.com"
                />
              </div>
              {emailErr && <div className="field-error"><Icon name="alert" size={11} /> {emailErr}</div>}
            </div>

            <div className="field">
              <div className="field-label"><span>Şifre</span></div>
              <div className="input-icon-wrap">
                <span className="ii"><Icon name="lock" size={14} /></span>
                <input
                  type={show ? "text" : "password"}
                  className={`input${pwErr ? " has-error" : ""}`}
                  style={{ paddingRight: 38 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, pw: true }))}
                />
                <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--paper-3)" }}>
                  <Icon name={show ? "eyeOff" : "eye"} size={14} />
                </button>
              </div>
              {pwErr && <div className="field-error"><Icon name="alert" size={11} /> {pwErr}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Giriş yapılıyor…" : <>{" Giriş yap"} <Icon name="arrowRight" size={14} /></>}
            </button>
          </form>

          <div className="auth-foot">
            Hesabın yok mu?{" "}
            <Link to="/register" className="auth-link">Hesap oluştur →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
