import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="notfound">
      <div>
        <div className="notfound-code">4<span className="acid">0</span>4</div>
        <div className="notfound-h">Sayfa bulunamadı.</div>
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--paper-3)", marginTop: 16, marginBottom: 28 }}>
          Aradığın sayfa mevcut değil veya taşındı.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Ana sayfaya dön</button>
      </div>
    </div>
  );
}
