import { useState } from "react";

// ─── EndOfDayClose ───────────────────────────────────────────────────────────
// 4-step guided modal: Cash Count → Reconcile → Restock List → Summary
// Props:
//   posTotal      — number: total from POS today
//   transactions  — array of today's transactions
//   lowStockItems — array of { name, stock, threshold }
//   onComplete    — callback(summary) when day is closed
//   onClose       — callback when modal dismissed without completing
//   theme         — "dark" | "light"

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

const SAMPLE_LOW_STOCK = [
  { name: "Unga wa Sembe 2kg", stock: 2, threshold: 10, supplier: "Kariakoo Wholesalers" },
  { name: "Mafuta ya Kupikia 1L", stock: 1, threshold: 5, supplier: "Kariakoo Wholesalers" },
  { name: "Sabuni Ariel 500g", stock: 0, threshold: 8, supplier: "Pia Distributors" },
  { name: "Sukari 1kg", stock: 4, threshold: 12, supplier: "TANESCO Supplies" },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.eod-overlay{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.eod-overlay.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.eod-overlay.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.eod-modal{background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;max-width:520px;margin:0 auto}
.eod-hdr{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.eod-title{font-size:16px;font-weight:800;color:var(--t)}
.eod-close-btn{background:none;border:none;color:var(--t2);font-size:18px;cursor:pointer;padding:4px;border-radius:6px;transition:color .15s}
.eod-close-btn:hover{color:var(--t)}
.eod-steps{display:flex;padding:16px 24px;gap:0;border-bottom:1px solid var(--border)}
.eod-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative}
.eod-step:not(:last-child)::after{content:'';position:absolute;top:13px;left:50%;width:100%;height:1.5px;background:var(--border);z-index:0}
.eod-step-dot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;position:relative;z-index:1;transition:all .2s}
.eod-step-dot.done{background:#22c55e;color:#fff}
.eod-step-dot.active{background:${BRAND};color:#fff}
.eod-step-dot.pending{background:var(--border);color:var(--t2)}
.eod-step-label{font-size:10px;font-weight:600;color:var(--t2);text-align:center}
.eod-step.active .eod-step-label{color:${BRAND}}
.eod-step.done .eod-step-label{color:#22c55e}
.eod-body{padding:24px}
.eod-section-title{font-size:18px;font-weight:800;color:var(--t);margin-bottom:4px}
.eod-section-sub{font-size:13px;color:var(--t2);margin-bottom:20px}
.eod-denom-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.eod-denom{background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:10px;transition:border-color .15s}
.eod-denom:focus-within{border-color:${BRAND}}
.eod-denom-label{font-size:12px;font-weight:700;color:var(--t2);min-width:60px}
.eod-denom-x{font-size:12px;color:var(--t2)}
.eod-denom-input{flex:1;background:none;border:none;font-size:14px;font-weight:700;color:var(--t);font-family:inherit;outline:none;text-align:right;width:40px}
.eod-denom-total{font-size:12px;font-weight:600;color:${BRAND};min-width:60px;text-align:right}
.eod-cash-total{background:var(--inp);border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.eod-cash-total-label{font-size:13px;color:var(--t2);font-weight:600}
.eod-cash-total-value{font-size:20px;font-weight:800;color:var(--t)}
.eod-recon-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)}
.eod-recon-row:last-child{border-bottom:none}
.eod-recon-label{font-size:13px;font-weight:600;color:var(--t2)}
.eod-recon-value{font-size:14px;font-weight:800;color:var(--t)}
.eod-diff-card{border-radius:12px;padding:14px 16px;margin-top:16px;display:flex;align-items:center;gap:12px}
.eod-diff-card.ok{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25)}
.eod-diff-card.warn{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25)}
.eod-diff-icon{font-size:22px}
.eod-diff-title{font-size:14px;font-weight:700}
.eod-diff-card.ok .eod-diff-title{color:#22c55e}
.eod-diff-card.warn .eod-diff-title{color:#ef4444}
.eod-diff-sub{font-size:12px;color:var(--t2);margin-top:2px}
.eod-note-input{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px;color:var(--t);font-family:inherit;outline:none;resize:none;margin-top:10px;transition:border-color .15s;box-sizing:border-box}
.eod-note-input:focus{border-color:${BRAND}}
.eod-restock-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.eod-restock-item:last-child{border-bottom:none}
.eod-restock-check{width:18px;height:18px;accent-color:${BRAND};cursor:pointer;flex-shrink:0}
.eod-restock-name{flex:1;font-size:13px;font-weight:600;color:var(--t)}
.eod-restock-stock{font-size:11px;color:#ef4444;font-weight:600}
.eod-restock-supplier{font-size:11px;color:var(--t2)}
.eod-restock-qty{width:50px;background:var(--inp);border:1.5px solid var(--border);border-radius:8px;padding:5px 8px;font-size:13px;font-weight:700;color:var(--t);font-family:inherit;outline:none;text-align:center;transition:border-color .15s}
.eod-restock-qty:focus{border-color:${BRAND}}
.eod-wa-btn{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);color:#22c55e;border-radius:8px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap}
.eod-wa-btn:hover{background:rgba(34,197,94,.2)}
.eod-summary-stat{background:var(--inp);border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.eod-summary-stat:last-child{margin-bottom:0}
.eod-sum-label{font-size:12px;color:var(--t2);font-weight:600}
.eod-sum-value{font-size:15px;font-weight:800;color:var(--t)}
.eod-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:8px}
.eod-btn-next{flex:1;background:${BRAND};color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s}
.eod-btn-next:hover{background:#ff8c3a}
.eod-btn-back{background:var(--inp);color:var(--t2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
.eod-btn-back:hover{border-color:${BRAND};color:${BRAND}}
.eod-complete{text-align:center;padding:32px 24px}
.eod-complete-icon{font-size:52px;margin-bottom:16px}
.eod-complete-title{font-size:20px;font-weight:800;color:var(--t);margin-bottom:8px}
.eod-complete-sub{font-size:13px;color:var(--t2);line-height:1.6}
`;

const DENOMINATIONS = [
  { label: "50,000", value: 50000 },
  { label: "20,000", value: 20000 },
  { label: "10,000", value: 10000 },
  { label: "5,000", value: 5000 },
  { label: "2,000", value: 2000 },
  { label: "1,000", value: 1000 },
  { label: "500", value: 500 },
  { label: "Coins", value: 1 },
];

export default function EndOfDayClose({
  posTotal = 312800,
  transactions = [],
  lowStockItems = SAMPLE_LOW_STOCK,
  onComplete,
  onClose,
  theme = "dark",
}) {
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState({});
  const [note, setNote] = useState("");
  const [restockChecked, setRestockChecked] = useState(
    Object.fromEntries(lowStockItems.map(i => [i.name, true]))
  );
  const [restockQty, setRestockQty] = useState(
    Object.fromEntries(lowStockItems.map(i => [i.name, i.threshold * 2]))
  );
  const [completed, setCompleted] = useState(false);

  const cashTotal = DENOMINATIONS.reduce((s, d) => {
    const cnt = Number(counts[d.label] || 0);
    return s + cnt * (d.value === 1 ? cnt : d.value);
  }, 0);

  const actualCash = DENOMINATIONS.reduce((s, d) => {
    const cnt = Number(counts[d.label] || 0);
    return s + cnt * d.value;
  }, 0);

  const diff = actualCash - posTotal;
  const steps = ["Cash Count", "Reconcile", "Restock", "Summary"];

  const handleComplete = () => {
    setCompleted(true);
    onComplete?.({ cashTotal: actualCash, posTotal, diff, note, restockChecked, restockQty });
  };

  if (completed) return (
    <>
      <style>{css}</style>
      <div className={`eod-overlay ${theme}`}>
        <div className="eod-modal">
          <div className="eod-complete">
            <div className="eod-complete-icon">🌙</div>
            <div className="eod-complete-title">Day Closed Successfully</div>
            <div className="eod-complete-sub">
              Great work today, {fmt(posTotal)} in sales.<br />
              Your records are saved. Lala salama! 🌟
            </div>
            <button className="eod-btn-next" style={{ marginTop: 24, width: "100%" }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className={`eod-overlay ${theme}`}>
        <div className="eod-modal">
          {/* Header */}
          <div className="eod-hdr">
            <span className="eod-title">🌙 End of Day Close</span>
            <button className="eod-close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Steps */}
          <div className="eod-steps">
            {steps.map((s, i) => (
              <div key={s} className={`eod-step ${i < step ? "done" : i === step ? "active" : ""}`}>
                <div className={`eod-step-dot ${i < step ? "done" : i === step ? "active" : "pending"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="eod-step-label">{s}</span>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="eod-body">
            {/* STEP 0: Cash Count */}
            {step === 0 && (
              <>
                <div className="eod-section-title">Count your cash drawer</div>
                <div className="eod-section-sub">Enter the number of notes/coins in each denomination</div>
                <div className="eod-denom-grid">
                  {DENOMINATIONS.map(d => {
                    const cnt = Number(counts[d.label] || 0);
                    const sub = d.value === 1 ? cnt : cnt * d.value;
                    return (
                      <div className="eod-denom" key={d.label}>
                        <span className="eod-denom-label">TSh {d.label}</span>
                        <span className="eod-denom-x">×</span>
                        <input
                          className="eod-denom-input"
                          type="number"
                          min="0"
                          value={counts[d.label] || ""}
                          placeholder="0"
                          onChange={e => setCounts({ ...counts, [d.label]: e.target.value })}
                        />
                        <span className="eod-denom-total">
                          {sub > 0 ? (sub >= 1000 ? Math.round(sub / 1000) + "K" : sub) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="eod-cash-total">
                  <span className="eod-cash-total-label">Cash in Drawer</span>
                  <span className="eod-cash-total-value">{fmt(actualCash)}</span>
                </div>
              </>
            )}

            {/* STEP 1: Reconcile */}
            {step === 1 && (
              <>
                <div className="eod-section-title">Reconcile</div>
                <div className="eod-section-sub">Compare your cash count against today's POS total</div>
                <div className="eod-recon-row">
                  <span className="eod-recon-label">POS Total (recorded sales)</span>
                  <span className="eod-recon-value">{fmt(posTotal)}</span>
                </div>
                <div className="eod-recon-row">
                  <span className="eod-recon-label">Cash in Drawer (counted)</span>
                  <span className="eod-recon-value">{fmt(actualCash)}</span>
                </div>
                <div className="eod-recon-row">
                  <span className="eod-recon-label">Difference</span>
                  <span className="eod-recon-value" style={{ color: diff === 0 ? "#22c55e" : diff > 0 ? "#22c55e" : "#ef4444" }}>
                    {diff > 0 ? "+" : ""}{fmt(diff)}
                  </span>
                </div>
                <div className={`eod-diff-card ${Math.abs(diff) < 5000 ? "ok" : "warn"}`}>
                  <span className="eod-diff-icon">{Math.abs(diff) < 5000 ? "✅" : "⚠️"}</span>
                  <div>
                    <div className="eod-diff-title">
                      {diff === 0 ? "Perfect match!" : Math.abs(diff) < 5000 ? "Within acceptable range" : "Significant discrepancy"}
                    </div>
                    <div className="eod-diff-sub">
                      {diff === 0 ? "Cash matches POS exactly. Great job!" :
                       diff > 0 ? `TSh ${fmt(Math.abs(diff))} over — check for unrecorded expenses` :
                       `TSh ${fmt(Math.abs(diff))} short — check for unrecorded sales`}
                    </div>
                  </div>
                </div>
                {Math.abs(diff) >= 5000 && (
                  <textarea
                    className="eod-note-input"
                    rows={3}
                    placeholder="Add a note explaining the discrepancy (optional)..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                )}
              </>
            )}

            {/* STEP 2: Restock List */}
            {step === 2 && (
              <>
                <div className="eod-section-title">Tomorrow's Restock</div>
                <div className="eod-section-sub">Check items to order and set quantities. Send to supplier via WhatsApp.</div>
                {lowStockItems.map(item => (
                  <div className="eod-restock-item" key={item.name}>
                    <input
                      type="checkbox"
                      className="eod-restock-check"
                      checked={!!restockChecked[item.name]}
                      onChange={e => setRestockChecked({ ...restockChecked, [item.name]: e.target.checked })}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="eod-restock-name">{item.name}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                        <span className="eod-restock-stock">{item.stock} left</span>
                        <span className="eod-restock-supplier">{item.supplier}</span>
                      </div>
                    </div>
                    <input
                      className="eod-restock-qty"
                      type="number"
                      min="1"
                      value={restockQty[item.name] || ""}
                      onChange={e => setRestockQty({ ...restockQty, [item.name]: e.target.value })}
                      disabled={!restockChecked[item.name]}
                    />
                    <button className="eod-wa-btn" disabled={!restockChecked[item.name]}>💬 WA</button>
                  </div>
                ))}
                <div style={{ marginTop: 16, fontSize: 12, color: "var(--t2)" }}>
                  {Object.values(restockChecked).filter(Boolean).length} items selected for reorder
                </div>
              </>
            )}

            {/* STEP 3: Summary */}
            {step === 3 && (
              <>
                <div className="eod-section-title">Day Summary</div>
                <div className="eod-section-sub">Your business stats for today</div>
                {[
                  { label: "Total Sales (POS)", value: fmt(posTotal), color: "#22c55e" },
                  { label: "Cash in Drawer", value: fmt(actualCash) },
                  { label: "Variance", value: (diff >= 0 ? "+" : "") + fmt(diff), color: Math.abs(diff) < 5000 ? "#22c55e" : "#ef4444" },
                  { label: "Items to Restock", value: Object.values(restockChecked).filter(Boolean).length + " products" },
                  { label: "Date Closed", value: new Date().toLocaleDateString("en-TZ", { weekday: "short", day: "numeric", month: "short" }) },
                ].map(row => (
                  <div className="eod-summary-stat" key={row.label}>
                    <span className="eod-sum-label">{row.label}</span>
                    <span className="eod-sum-value" style={row.color ? { color: row.color } : {}}>{row.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="eod-footer">
            {step > 0 && (
              <button className="eod-btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            {step < 3 ? (
              <button className="eod-btn-next" onClick={() => setStep(s => s + 1)}>
                {step === 2 ? "Review Summary →" : "Next →"}
              </button>
            ) : (
              <button className="eod-btn-next" style={{ background: "#22c55e" }} onClick={handleComplete}>
                ✓ Close the Day
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
