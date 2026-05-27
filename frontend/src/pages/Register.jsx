import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, useToastStore } from "../store";
import { Icon } from "../components/Icons";
import api from "../api";

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function pwScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function PasswordStrength({ pw }) {
  const score = pwScore(pw);
  return (
    <div className="pw-strength">
      {[0, 1, 2, 3].map(i => {
        let cls = "";
        if (i < score) cls = score <= 1 ? "weak" : score <= 2 ? "medium" : "strong";
        return <span key={i} className={`pw-strength-seg ${cls}`} />;
      })}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToastStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const nameErr  = touched.name    && !name.trim()          ? "Ad zorunludur."                   : null;
  const emailErr = touched.email   && !isValidEmail(email)  ? "Geçerli bir e-posta girin."       : null;
  const pwErr    = touched.pw      && password.length < 8   ? "Şifre en az 8 karakter olmalıdır." : null;
  const confirmErr = touched.confirm && password !== confirm ? "Şifreler eşleşmiyor."            : null;
  const pwOk     = touched.pw && password.length >= 8 && pwScore(password) >= 3 ? "Güçlü şifre." : null;

  const hasError = !!(nameErr || emailErr || pwErr || confirmErr || !name || !email || !password || !confirm);

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, pw: true, confirm: true });
    if (hasError) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      login(data.token, data.user);
      toast.add("Hesabın oluşturuldu!", "success");
      navigate("/app/dashboard");
    } catch (err) {
      toast.add(err.response?.data?.error || "Kayıt başarısız.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="auth-side-deco" />
        <div className="auth-side-content" style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 28 }}>
            Kuruş<span style={{ color: "var(--acid)" }}>.</span>
          </div>
        </div>
        <div className="auth-side-content" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="auth-side-tag">— AI · FİNANS · 2026</div>
          <div className="auth-side-headline">
            Hesabını <span className="acid">oluştur.</span>
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--paper-3)", lineHeight: 1.6 }}>
            30 saniyede başla. Kredi kartı gerekmez.
          </div>
        </div>
        <div className="auth-side-content" style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--paper-4)" }}>
          © 2026 Kuruş — YMH354
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form anim-rise">
          <div className="eyebrow" style={{ marginBottom: 14 }}>— Kayıt · 02</div>
          <h1 className="auth-h1">Hesabını <span style={{ color: "var(--acid)" }}>oluştur.</span></h1>
          <p className="auth-sub">30 saniyede başla. Kredi kartı gerekmez.</p>

          <form className="stack-4" onSubmit={handleSubmit}>
            <div className="field">
              <div className="field-label"><span>Ad Soyad</span></div>
              <div className="input-icon-wrap">
                <span className="ii"><Icon name="user" size={14} /></span>
                <input
                  type="text"
                  className={`input${nameErr ? " has-error" : ""}`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  placeholder="Ahmet Yılmaz"
                />
              </div>
              {nameErr && <div className="field-error"><Icon name="alert" size={11} /> {nameErr}</div>}
            </div>

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

            <div>
              <div className="field">
                <div className="field-label"><span>Şifre</span></div>
                <div className="input-icon-wrap">
                  <span className="ii"><Icon name="lock" size={14} /></span>
                  <input
                    type={show ? "text" : "password"}
                    className={`input${pwErr ? " has-error" : ""}${pwOk ? " has-ok" : ""}`}
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
                {pwOk && <div className="field-success"><Icon name="check" size={11} /> {pwOk}</div>}
              </div>
              <div style={{ marginTop: 8 }}><PasswordStrength pw={password} /></div>
            </div>

            <div className="field">
              <div className="field-label"><span>Şifre Tekrar</span></div>
              <div className="input-icon-wrap">
                <span className="ii"><Icon name="lock" size={14} /></span>
                <input
                  type={show ? "text" : "password"}
                  className={`input${confirmErr ? " has-error" : ""}`}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                />
              </div>
              {confirmErr && <div className="field-error"><Icon name="alert" size={11} /> {confirmErr}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Hesap oluşturuluyor…" : <>{" Hesap oluştur"} <Icon name="arrowRight" size={14} /></>}
            </button>
          </form>

          <div className="auth-foot">
            Zaten hesabın var mı?{" "}
            <Link to="/login" className="auth-link">Giriş yap →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
