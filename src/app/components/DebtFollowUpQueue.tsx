import { useState } from "react";
import { Send, Phone, AlertCircle } from "lucide-react";
import { getProfile } from "../hooks/useBusinessProfile";

// ─── DebtFollowUpQueue ────────────────────────────────────────────────────────
// Proactive debt collection workflow with credit scoring + WhatsApp reminders
// Props:
//   theme     — "dark" | "light"

const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

const SAMPLE_CUSTOMERS = [
  { id: 1, name: "Juma Ally", phone: "+255 712 334 556", debt: 87000, lastPurchase: "2025-03-07", lastPayment: "2025-02-20", totalSpend: 480000, paymentHistory: [1, 1, 0, 1, 0, 1, 1, 0, 1, 0], creditLimit: 100000 },
  { id: 2, name: "Fatuma Salim", phone: "+255 754 221 889", debt: 34500, lastPurchase: "2025-03-11", lastPayment: "2025-03-01", totalSpend: 210000, paymentHistory: [1, 1, 1, 0, 1, 1, 1, 1, 0, 1], creditLimit: 50000 },
  { id: 3, name: "Hassan Mwenda", phone: "+255 699 447 112", debt: 156000, lastPurchase: "2025-03-05", lastPayment: "2025-02-10", totalSpend: 890000, paymentHistory: [0, 1, 0, 0, 1, 0, 1, 0, 1, 0], creditLimit: 120000 },
  { id: 4, name: "Amina Rashid", phone: "+255 765 887 334", debt: 12000, lastPurchase: "2025-03-13", lastPayment: "2025-03-10", totalSpend: 95000, paymentHistory: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1], creditLimit: 30000 },
  { id: 5, name: "Bakari Issa", phone: "+255 713 556 009", debt: 220000, lastPurchase: "2025-02-28", lastPayment: "2025-01-15", totalSpend: 1200000, paymentHistory: [0, 0, 1, 0, 0, 1, 0, 0, 0, 1], creditLimit: 150000 },
  { id: 6, name: "Zainab Mkuki", phone: "+255 744 123 456", debt: 0, lastPurchase: "2025-03-12", lastPayment: "2025-03-12", totalSpend: 340000, paymentHistory: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], creditLimit: 60000 },
];

interface Customer {
  id: number;
  name: string;
  phone: string;
  debt: number;
  lastPurchase: string;
  lastPayment: string;
  totalSpend: number;
  paymentHistory: number[];
  creditLimit: number;
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function creditScore(customer: Customer) {
  const ratio = customer.paymentHistory.filter(Boolean).length / customer.paymentHistory.length;
  const utilizationPct = customer.debt / customer.creditLimit;
  if (ratio >= 0.8 && utilizationPct < 0.5) return "green";
  if (ratio >= 0.6 && utilizationPct < 0.8) return "amber";
  return "red";
}

function scoreLabel(c: Customer) {
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
.debt-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.debt-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.debt-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.debt-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:10px;transition:all .15s;cursor:pointer}
.debt-card:hover{border-color:var(--primary)}
.debt-card.urgent{border-left:3px solid #ef4444;border-radius:0 14px 14px 0}
.debt-card.warning{border-left:3px solid #f59e0b;border-radius:0 14px 14px 0}
.debt-header{display:flex;align-items:center;gap:12px}
.debt-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0}
.debt-name{font-size:14px;font-weight:800;color:var(--t)}
.debt-phone{font-size:11px;color:var(--t2);margin-top:2px}
.debt-amount{font-size:16px;font-weight:800;color:#ef4444;text-align:right}
.debt-days{font-size:10px;color:var(--t2);text-align:right;margin-top:2px}
.debt-row{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)}
.debt-label{font-size:11px;color:var(--t2)}
.debt-value{font-size:12px;font-weight:700;color:var(--t)}
.debt-credit-score{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:800}
.debt-actions{display:flex;gap:6px;margin-top:10px}
.debt-btn{flex:1;border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px}
.debt-btn:hover{opacity:.9;transform:translateY(-1px)}
.debt-btn-whatsapp{background:#25d366;color:#fff}
.debt-btn-call{background:var(--primary);color:#fff}
.debt-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.debt-stat{background:var(--card);border:1px solid var(--border);border-radius:11px;padding:10px 12px;text-align:center}
.debt-stat-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t2);margin-bottom:4px}
.debt-stat-value{font-size:15px;font-weight:800}
.debt-sort{display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap}
.debt-sort-btn{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--t2);font-family:inherit;transition:all .15s}
.debt-sort-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
.debt-sort-btn:hover{border-color:var(--primary)}
`;

const AVATAR_COLORS = ["#E56B0A", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#f59e0b"];

const SORT_OPTIONS = ["Highest Debt", "Most Overdue", "Worst Credit"];
const FILTER_OPTIONS = ["All", "Overdue", "High Risk", "Good Payers"];

interface DebtFollowUpQueueProps {
  customers?: Customer[];
  theme?: "dark" | "light";
}

function buildWhatsAppLink(phone: string, customerName: string, debt: number, businessName: string): string {
  const firstName = customerName.split(" ")[0];
  const fmtDebt = "TSh " + Number(debt).toLocaleString("en-TZ");
  const msg = `Habari ${firstName}! Unakumbusha kulipa deni lako la ${fmtDebt} kwa ${businessName}. Tafadhali lipa ukiweza. Asante sana! 🙏\n\nHi ${firstName}! A reminder to pay your outstanding balance of ${fmtDebt} at ${businessName}. Please pay at your earliest convenience. Thank you!`;
  const cleanPhone = phone.replace(/[\s\-()]/g, "");
  return `https://wa.me/${cleanPhone.startsWith("+") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export default function DebtFollowUpQueue({ customers = SAMPLE_CUSTOMERS, theme = "dark" }: DebtFollowUpQueueProps) {
  const businessProfile = getProfile();
  const [expanded, setExpanded] = useState<number | null>(null);
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
      const rank: Record<string, number> = { red: 0, amber: 1, green: 2 };
      return rank[creditScore(a)] - rank[creditScore(b)];
    }
    return 0;
  });

  return (
    <>
      <style>{css}</style>
      <div className={`debt-root ${theme}`}>
        <div className="debt-header">
          <div className="dq-title">Debt <span>Follow-Up</span></div>
        </div>

        {/* Summary stats */}
        <div className="debt-stats">
          <div className="debt-stat">
            <div className="debt-stat-label">Total Outstanding</div>
            <div className="debt-stat-value red">{fmt(totalDebt)}</div>
          </div>
          <div className="debt-stat">
            <div className="debt-stat-label">Overdue (7+ days)</div>
            <div className="debt-stat-value amber">{overdueCount} customers</div>
          </div>
          <div className="debt-stat">
            <div className="debt-stat-label">High Risk</div>
            <div className="debt-stat-value red">{highRisk} customers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="debt-sort">
          {FILTER_OPTIONS.map(f => (
            <button key={f} className={`debt-sort-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="debt-sort-btn" onClick={cycleSort}>Sort: {sort} ↕</button>
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
              <div key={c.id} className={`debt-card ${isExpanded ? "expanded" : ""}`}
                onClick={() => setExpanded(isExpanded ? null : c.id)}>
                <div className="debt-header">
                  <div className="debt-avatar"
                    style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                    {c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="debt-name">{c.name}</div>
                </div>

                <div className="debt-row">
                  <div className="debt-label">Phone</div>
                  <div className="debt-value">{c.phone}</div>
                </div>

                <div className="debt-row">
                  <div className="debt-label">Last Purchase</div>
                  <div className="debt-value">{daysSince(c.lastPurchase)}d ago</div>
                </div>

                <div className="debt-row">
                  <div className="debt-label">Debt</div>
                  <div className={`debt-value ${c.debt === 0 ? "zero" : ""}`}>
                    {c.debt === 0 ? "Clear ✓" : fmt(c.debt)}
                  </div>
                </div>

                <div className="debt-row">
                  <div className="debt-label">Days Overdue</div>
                  <div className="debt-value">{daysOverdue}d</div>
                </div>

                <div className="debt-row">
                  <div className="debt-label">Credit Score</div>
                  <div className="debt-credit-score"
                    style={{ background: sc.bg, borderColor: sc.border, color: sc.text }}>
                    ● {scoreLabel(c)}
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
                      {c.debt > 0 && (
                        <a
                          href={buildWhatsAppLink(c.phone, c.name, c.debt, businessProfile.businessName || "our shop")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dq-action-btn wa"
                          style={{ textDecoration: "none" }}
                          onClick={e => e.stopPropagation()}
                        >
                          💬 WhatsApp Reminder
                        </a>
                      )}
                      <a
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        className="dq-action-btn"
                        style={{ textDecoration: "none" }}
                        onClick={e => e.stopPropagation()}
                      >
                        📞 Call
                      </a>
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
                        💬 "Habari {c.name.split(" ")[0]}, kumbuka deni lako la {fmt(c.debt)} kwa {businessProfile.businessName || "duka letu"}.
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