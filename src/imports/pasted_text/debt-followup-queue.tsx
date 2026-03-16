import { useState } from "react";

// ─── DebtFollowUpQueue ───────────────────────────────────────────────────────
// Full page component for the "Customers" section debt workflow.
// Props:
//   customers — array of customer debt records (see SAMPLE)
//   theme     — "dark" | "light"

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

const SAMPLE_CUSTOMERS = [
  { id: 1, name: "Juma Ally", phone: "+255 712 334 556", debt: 87000, lastPurchase: "2025-03-07", lastPayment: "2025-02-20", totalSpend: 480000, paymentHistory: [1, 1, 0, 1, 0, 1, 1, 0, 1, 0], creditLimit: 100000 },
  { id: 2, name: "Fatuma Salim", phone: "+255 754 221 889", debt: 34500, lastPurchase: "2025-03-11", lastPayment: "2025-03-01", totalSpend: 210000, paymentHistory: [1, 1, 1, 0, 1, 1, 1, 1, 0, 1], creditLimit: 50000 },
  { id: 3, name: "Hassan Mwenda", phone: "+255 699 447 112", debt: 156000, lastPurchase: "2025-03-05", lastPayment: "2025-02-10", totalSpend: 890000, paymentHistory: [0, 1, 0, 0, 1, 0, 1, 0, 1, 0], creditLimit: 120000 },
  { id: 4, name: "Amina Rashid", phone: "+255 765 887 334", debt: 12000, lastPurchase: "2025-03-13", lastPayment: "2025-03-10", totalSpend: 95000, paymentHistory: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1], creditLimit: 30000 },
  { id: 5, name: "Bakari Issa", phone: "+255 713 556 009", debt: 220000, lastPurchase: "2025-02-28", lastPayment: "2025-01-15", totalSpend: 1200000, paymentHistory: [0, 0, 1, 0, 0, 1, 0, 0, 0, 1], creditLimit: 150000 },
  { id: 6, name: "Zainab Mkuki", phone: "+255 744 123 456", debt: 0, lastPurchase: "2025-03-12", lastPayment: "2025-03-12", totalSpend: 340000, paymentHistory: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], creditLimit: 60000 },
];

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function creditScore(customer) {
  const ratio = customer.paymentHistory.filter(Boolean).length / customer.paymentHistory.length;
  const utilizationPct = customer.debt / customer.creditLimit;
  if (ratio >= 0.8 && utilizationPct < 0.5) return "green";
  if (ratio >= 0.6 && utilizationPct < 0.8) return "amber";
  return "red";
}

function scoreLabel(c) {
  const s = creditScore(c);
  return { green: "Good Payer", amber: "Watch", red: "High Risk" }[s];
}

const scoreColors = {
  green: { bg: "rgba(34,197,94,.1)", border: "rgba(34,197,94,.25)", text: "#22c55e" },
  amber: { bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.25)", text: "#f59e0b" },
  red: { bg: "rgba(239,68,68,.1)", border: "rgba(239,68,68,.25)", text: "#ef4444" },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.dq-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.dq-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.dq-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.dq-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:gap}
.dq-title{font-size:20px;font-weight:800;color:var(--t);letter-spacing:-.3px}
.dq-title span{color:${BRAND}}
.dq-summary-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.dq-stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px}
.dq-stat-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--t2);margin-bottom:6px}
.dq-stat-value{font-size:18px;font-weight:800;color:var(--t)}
.dq-stat-value.red{color:#ef4444}
.dq-stat-value.amber{color:#f59e0b}
.dq-filter-row{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.dq-filter-btn{padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--t2);font-family:inherit;transition:all .15s}
.dq-filter-btn.active{background:${BRAND};color:#fff;border-color:${BRAND}}
.dq-sort{margin-left:auto;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--t2);font-family:inherit;transition:all .15s}
.dq-list{display:flex;flex-direction:column;gap:10px}
.dq-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;transition:border-color .15s;cursor:pointer}
.dq-card:hover{border-color:rgba(229,107,10,.4)}
.dq-card.expanded{border-color:${BRAND}}
.dq-card-top{display:flex;align-items:center;gap:12px}
.dq-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0}
.dq-info{flex:1;min-width:0}
.dq-name{font-size:14px;font-weight:800;color:var(--t)}
.dq-sub{font-size:11px;color:var(--t2);margin-top:2px}
.dq-right{text-align:right;flex-shrink:0}
.dq-debt{font-size:15px;font-weight:800;color:#ef4444}
.dq-debt.zero{color:#22c55e}
.dq-days{font-size:11px;font-weight:600;margin-top:2px}
.dq-score-badge{display:inline-flex;align-items:center;gap:4px;border-radius:20px;padding:3px 9px;font-size:10px;font-weight:800;border:1px solid}
.dq-expanded{padding-top:14px;margin-top:14px;border-top:1px solid var(--border)}
.dq-history{display:flex;gap:4px;margin-bottom:12px}
.dq-hist-dot{width:20px;height:20px;border-radius:5px;font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:700}
.dq-hist-dot.paid{background:rgba(34,197,94,.15);color:#22c55e}
.dq-hist-dot.miss{background:rgba(239,68,68,.12);color:#ef4444}
.dq-credit-bar{height:6px;background:var(--border);border-radius:3px;margin-bottom:4px;overflow:hidden}
.dq-credit-fill{height:100%;border-radius:3px;transition:width .3s}
.dq-credit-label{display:flex;justify-content:space-between;font-size:11px;color:var(--t2);margin-bottom:12px}
.dq-actions{display:flex;gap:8px;flex-wrap:wrap}
.dq-action-btn{flex:1;min-width:100px;padding:8px 12px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--border);background:var(--inp);color:var(--t2)}
.dq-action-btn:hover{border-color:${BRAND};color:${BRAND}}
.dq-action-btn.wa{background:rgba(34,197,94,.08);border-color:rgba(34,197,94,.25);color:#22c55e}
.dq-action-btn.wa:hover{background:rgba(34,197,94,.15)}
.dq-action-btn.primary{background:${BRAND};border-color:${BRAND};color:#fff}
.dq-action-btn.primary:hover{background:#ff8c3a}
.dq-empty{text-align:center;padding:40px 20px;color:var(--t2);font-size:13px}
.dq-empty-icon{font-size:32px;margin-bottom:8px}
`;

const AVATAR_COLORS = ["#E56B0A", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#f59e0b"];

const SORT_OPTIONS = ["Highest Debt", "Most Overdue", "Worst Credit"];
const FILTER_OPTIONS = ["All", "Overdue", "High Risk", "Good Payers"];

export default function DebtFollowUpQueue({ customers = SAMPLE_CUSTOMERS, theme = "dark" }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Highest Debt");
  const [sortIdx, setSortIdx] = useState(0);

  const cycleSort = () => {
    const next = (sortIdx + 1) % SORT_OPTIONS.length;
    setSortIdx(next);
    setSort(SORT_OPTIONS[next]);
  };

  const debtors = customers.filter(c => c.debt > 0);
  const totalDebt = debtors.reduce((s, c) => s + c.debt, 0);
  const highRisk = debtors.filter(c => creditScore(c) === "red").length;
  const overdueCount = debtors.filter(c => daysSince(c.lastPayment) > 7).length;

  let filtered = customers.filter(c => {
    if (filter === "All") return true;
    if (filter === "Overdue") return c.debt > 0 && daysSince(c.lastPayment) > 7;
    if (filter === "High Risk") return creditScore(c) === "red";
    if (filter === "Good Payers") return creditScore(c) === "green";
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === "Highest Debt") return b.debt - a.debt;
    if (sort === "Most Overdue") return daysSince(a.lastPayment) - daysSince(b.lastPayment) > 0 ? -1 : 1;
    if (sort === "Worst Credit") {
      const rank = { red: 0, amber: 1, green: 2 };
      return rank[creditScore(a)] - rank[creditScore(b)];
    }
    return 0;
  });

  return (
    <>
      <style>{css}</style>
      <div className={`dq-root ${theme}`}>
        <div className="dq-header">
          <div className="dq-title">Debt <span>Follow-Up</span></div>
        </div>

        {/* Summary stats */}
        <div className="dq-summary-row">
          <div className="dq-stat">
            <div className="dq-stat-label">Total Outstanding</div>
            <div className="dq-stat-value red">{fmt(totalDebt)}</div>
          </div>
          <div className="dq-stat">
            <div className="dq-stat-label">Overdue (7+ days)</div>
            <div className="dq-stat-value amber">{overdueCount} customers</div>
          </div>
          <div className="dq-stat">
            <div className="dq-stat-label">High Risk</div>
            <div className="dq-stat-value red">{highRisk} customers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="dq-filter-row">
          {FILTER_OPTIONS.map(f => (
            <button key={f} className={`dq-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="dq-sort" onClick={cycleSort}>Sort: {sort} ↕</button>
        </div>

        {/* List */}
        <div className="dq-list">
          {filtered.length === 0 ? (
            <div className="dq-empty">
              <div className="dq-empty-icon">🎉</div>
              <div>No customers in this category</div>
            </div>
          ) : filtered.map((c, idx) => {
            const score = creditScore(c);
            const sc = scoreColors[score];
            const daysOverdue = daysSince(c.lastPayment);
            const utilizationPct = c.creditLimit > 0 ? Math.min(100, Math.round((c.debt / c.creditLimit) * 100)) : 0;
            const isExpanded = expanded === c.id;

            return (
              <div key={c.id} className={`dq-card ${isExpanded ? "expanded" : ""}`}
                onClick={() => setExpanded(isExpanded ? null : c.id)}>
                <div className="dq-card-top">
                  <div className="dq-avatar"
                    style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                    {c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="dq-info">
                    <div className="dq-name">{c.name}</div>
                    <div className="dq-sub">
                      {c.phone} · Last purchase: {daysSince(c.lastPurchase)}d ago
                    </div>
                  </div>
                  <div className="dq-right">
                    <div className={`dq-debt ${c.debt === 0 ? "zero" : ""}`}>
                      {c.debt === 0 ? "Clear ✓" : fmt(c.debt)}
                    </div>
                    <div>
                      <span className="dq-score-badge"
                        style={{ background: sc.bg, borderColor: sc.border, color: sc.text }}>
                        ● {scoreLabel(c)}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="dq-expanded" onClick={e => e.stopPropagation()}>
                    {/* Payment history dots */}
                    <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 6, fontWeight: 600 }}>
                      Payment history (last 10)
                    </div>
                    <div className="dq-history">
                      {c.paymentHistory.map((p, i) => (
                        <div key={i} className={`dq-hist-dot ${p ? "paid" : "miss"}`}>
                          {p ? "✓" : "✗"}
                        </div>
                      ))}
                    </div>

                    {/* Credit utilization */}
                    {c.debt > 0 && (
                      <>
                        <div className="dq-credit-bar">
                          <div className="dq-credit-fill"
                            style={{
                              width: `${utilizationPct}%`,
                              background: utilizationPct > 80 ? "#ef4444" : utilizationPct > 50 ? "#f59e0b" : "#22c55e"
                            }} />
                        </div>
                        <div className="dq-credit-label">
                          <span>Credit used: {utilizationPct}%</span>
                          <span>Limit: {fmt(c.creditLimit)}</span>
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="dq-actions">
                      <button className="dq-action-btn wa">
                        💬 WhatsApp Reminder
                      </button>
                      <button className="dq-action-btn">
                        📞 Call
                      </button>
                      {c.debt > 0 && (
                        <button className="dq-action-btn primary">
                          💵 Record Payment
                        </button>
                      )}
                    </div>

                    {/* Quick reminder message preview */}
                    {c.debt > 0 && (
                      <div style={{
                        marginTop: 10, background: "var(--inp)", borderRadius: 9,
                        padding: "10px 12px", fontSize: 12, color: "var(--t2)",
                        fontStyle: "italic", lineHeight: 1.5
                      }}>
                        💬 "Habari {c.name.split(" ")[0]}, kumbuka deni lako la {fmt(c.debt)} kwa Duka letu.
                        Tafadhali lipa ukiweza. Asante sana! 🙏"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
