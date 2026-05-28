import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "../components/Icons";
import { useToastStore } from "../store";
import api from "../api";

const CAT_LABELS = { food: "Market & Yemek", transport: "Ulaşım", shopping: "Alışveriş", bills: "Faturalar", entertain: "Eğlence", health: "Sağlık", other: "Diğer" };
const CAT_COLORS = { food: "var(--cat-food)", transport: "var(--cat-transport)", shopping: "var(--cat-shopping)", bills: "var(--cat-bills)", entertain: "var(--cat-entertain)", health: "var(--cat-health)", other: "var(--cat-other)" };
const CAT_GLYPHS = { food: "🛒", transport: "🚌", shopping: "🛍", bills: "⚡", entertain: "🎬", health: "💊", other: "•" };
const CATEGORIES = ["food", "transport", "shopping", "bills", "entertain", "health", "other"];

function fmtTL(n) { return (n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function ConfirmDialog({ title, body, onConfirm, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="icon-btn is-ghost" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body" style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--paper-2)", lineHeight: 1.6 }}>{body}</div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-danger" onClick={onConfirm}>Evet, sil</button>
        </div>
      </div>
    </div>
  );
}

function NewExpenseModal({ onClose, onSaved }) {
  const toast = useToastStore();
  const qc = useQueryClient();
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualCat, setManualCat] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleDescBlur() {
    if (!merchant || merchant.length < 2) return;
    setAiLoading(true);
    try {
      const { data } = await api.post("/ai/categorize", { merchant, description });
      setAiPrediction(data);
      if (!manualCat) setManualCat(data.category);
    } catch {
      // AI başarısız olsa bile devam et
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    if (!merchant || !amount) return;
    setSaving(true);
    try {
      await api.post("/transactions", {
        merchant,
        description,
        amount: parseFloat(amount.replace(",", ".")),
        category: manualCat || undefined,
        date,
      });
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.add("Harcama eklendi!", "success");
      onSaved();
    } catch (err) {
      toast.add(err.response?.data?.error || "Eklenemedi.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Yeni harcama</div>
          <button className="icon-btn is-ghost" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="stack-4">
            <div>
              <div className="field-label" style={{ marginBottom: 4 }}>Tutar</div>
              <div className="amount-row">
                <span className="amount-currency">₺</span>
                <input
                  className="amount-input"
                  placeholder="0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                  inputMode="decimal"
                  autoFocus
                />
              </div>
            </div>

            <div className="field">
              <div className="field-label"><span>İşyeri / Merchant</span></div>
              <input
                className="input"
                placeholder="Migros, Starbucks, Netflix…"
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                onBlur={handleDescBlur}
              />
            </div>

            <div className="field">
              <div className="field-label"><span>Açıklama (isteğe bağlı)</span></div>
              <input
                className="input"
                placeholder="Haftalık alışveriş, iş yemeği…"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>
                <span>Kategori</span>
                {aiLoading && (
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "var(--ai)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.18em" }}>
                    <span className="typing-dots"><span /><span /><span /></span>
                    AI kategorize ediyor…
                  </span>
                )}
                {aiPrediction && !aiLoading && (
                  <span style={{ color: "var(--ai)", fontFamily: "var(--font-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.18em" }}>
                    AI önerisi · %{Math.round(aiPrediction.confidence * 100)}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {CATEGORIES.map(c => {
                  const active = manualCat === c;
                  const aiSuggested = aiPrediction?.category === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setManualCat(c)}
                      className={`cat-chip ${c}`}
                      style={{
                        background: active ? `color-mix(in srgb, var(--cat-${c}) 20%, var(--ink-2))` : "var(--ink-3)",
                        borderColor: active ? `var(--cat-${c})` : (aiSuggested ? "var(--ai)" : "var(--line-2)"),
                        color: active ? "var(--paper)" : "var(--paper-2)",
                        cursor: "pointer",
                        transition: "all 140ms",
                      }}
                    >
                      <span className="dot" />
                      {CAT_LABELS[c]}
                      {aiSuggested && <span style={{ marginLeft: 4, color: "var(--ai)", fontSize: 9 }}>● AI</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <div className="field-label"><span>Tarih</span></div>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!amount || !merchant || saving}>
            <Icon name="check" size={13} /> {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ tx, onClose, onDelete }) {
  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 22, paddingBottom: "0.04em" }}>İşlem Detayı</div>
          <button className="icon-btn is-ghost" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 44, color: "var(--paper)", paddingBottom: "0.04em", marginBottom: 4 }}>
            −₺{fmtTL(tx.amount)}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper-4)", marginBottom: 22 }}>
            {new Date(tx.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["İşyeri", tx.merchant],
              ["Açıklama", tx.description || "—"],
              ["Tarih", new Date(tx.date).toLocaleDateString("tr-TR")],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--paper-4)", marginBottom: 4 }}>{l}</div>
                <div style={{ color: "var(--paper-2)", fontSize: 13 }}>{v}</div>
              </div>
            ))}
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--paper-4)", marginBottom: 6 }}>Kategori</div>
              <span className={`cat-chip ${tx.category}${tx.categorySource === "ai" ? " is-ai" : ""}`}>
                <span className="dot" />
                {CAT_LABELS[tx.category] || tx.category}
                {tx.categorySource === "ai" && tx.aiConfidence && (
                  <span style={{ marginLeft: 4, color: "var(--ai)", fontSize: 9 }}>AI · %{Math.round(tx.aiConfidence * 100)}</span>
                )}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 32, paddingTop: 22, borderTop: "1px solid var(--line-2)" }}>
            <button className="btn btn-danger" style={{ width: "100%", justifyContent: "center" }} onClick={() => onDelete(tx)}>
              <Icon name="trash" size={13} /> Bu harcamayı sil
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TransactionsPage() {
  const toast = useToastStore();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [detailTx, setDetailTx] = useState(null);
  const [confirmTx, setConfirmTx] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => api.get("/transactions?limit=100").then(r => r.data),
    staleTime: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.add("Harcama silindi.", "info");
      setConfirmTx(null);
      setDetailTx(null);
    },
    onError: () => toast.add("Silinemedi.", "error"),
  });

  const txs = data?.items || [];

  const filtered = useMemo(() => {
    let rows = txs;
    if (filter !== "all") rows = rows.filter(r => r.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(r =>
        r.merchant.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [txs, filter, query]);

  const total = filtered.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">
            İşlemler <span style={{ color: "var(--acid)" }}>—</span>{" "}
            <span style={{ color: "var(--paper-3)" }}>Tümü</span>
          </div>
          <div className="topbar-meta">
            <span className="lbl">TOPLAM</span><span>{txs.length} kayıt</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Icon name="plus" size={13} /> Yeni harcama
          </button>
        </div>
      </div>

      <div className="page">
        <div className="row" style={{ gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
            <span className="ii"><Icon name="search" size={14} /></span>
            <input
              className="input"
              placeholder="İşyeri veya açıklama ara…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select className="input" style={{ width: "auto", minWidth: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Tüm kategoriler</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 14, fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--paper-4)" }}>
          <span><span style={{ color: "var(--paper-3)" }}>Gösterilen</span> <span style={{ color: "var(--paper)" }}>{filtered.length}</span> kayıt</span>
          <span style={{ color: "var(--line-3)" }}>/</span>
          <span><span style={{ color: "var(--paper-3)" }}>Toplam</span> <span style={{ color: "var(--paper)" }}>₺{total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span></span>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--paper-4)" }}>Yükleniyor…</div>
          ) : (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>İşyeri</th>
                  <th>Kategori</th>
                  <th>Tarih</th>
                  <th style={{ textAlign: "right" }}>Tutar</th>
                  <th style={{ width: 50 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr key={tx._id} onClick={() => setDetailTx(tx)} style={{ cursor: "pointer" }}>
                    <td className="tx-row-num">{String(filtered.length - i).padStart(2, "0")}</td>
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
                    <td style={{ whiteSpace: "nowrap", color: "var(--paper-2)" }}>
                      {new Date(tx.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="tx-amount">−₺{fmtTL(tx.amount)}</span>
                    </td>
                    <td>
                      <button className="icon-btn is-ghost" style={{ marginLeft: "auto" }} onClick={e => { e.stopPropagation(); setDetailTx(tx); }}>
                        <Icon name="more" size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--paper-4)" }}>
                      {txs.length === 0 ? (
                        <div>
                          <div style={{ marginBottom: 12 }}>Henüz hiç harcama yok.</div>
                          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
                            <Icon name="plus" size={12} /> İlk harcamayı ekle
                          </button>
                        </div>
                      ) : "Sonuç bulunamadı."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showNew && <NewExpenseModal onClose={() => setShowNew(false)} onSaved={() => setShowNew(false)} />}

      {detailTx && (
        <DetailDrawer
          tx={detailTx}
          onClose={() => setDetailTx(null)}
          onDelete={(tx) => { setConfirmTx(tx); setDetailTx(null); }}
        />
      )}

      {confirmTx && (
        <ConfirmDialog
          title="Bu harcamayı silmek istediğine emin misin?"
          body={`"${confirmTx.merchant}${confirmTx.description ? " — " + confirmTx.description : ""} · ₺${fmtTL(confirmTx.amount)}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          onConfirm={() => deleteMut.mutate(confirmTx._id)}
          onClose={() => setConfirmTx(null)}
        />
      )}
    </>
  );
}
