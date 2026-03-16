import { useState } from "react";

// ─── MorningBriefing ────────────────────────────────────────────────────────
// Drop onto Dashboard — auto-shows on first open of the day.
// Props:
//   data        — business summary object (see DEFAULT_DATA)
//   onDismiss   — callback when user closes the card
//   onSetTarget — callback(number) when daily target is confirmed
//   theme       — "dark" | "light"

const BRAND = "#E56B0A";

const DEFAULT_DATA = {
  ownerName: "Amina",
  yesterdaySales: 187400,
  yesterdayTransactions: 34,
  topProduct: { name: "Unga wa Sembe 2kg", units: 18 },
  overdueDebts: [
    { name: "Juma Ally", amount: 45000, days: 7 },
    { name: "Fatuma Salim", amount: 28000, days: 3 },
    { name: "Hassan Mwenda", amount: 12500, days: 5 },
  ],
  lowStockItems: ["Mafuta ya Kupikia 1L", "Sabuni Ariel 500g"],
  weeklyAvgSales: 162000,
  suggestedTarget: 195000,
};

function fmt(n) {
  return "TSh " + Number(n).toLocaleString("en-TZ");
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Habari za asubuhi";
  if (h < 17) return "Habari za mchana";
  return "Habari za jioni";
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.mb-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.mb-root.dark{--bg:#1a1d27;--bg2:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.mb-root.light{--bg:#fff;--bg2:#f4f5f9;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.mb-card{background:var(--bg);border:1px solid var(--border);border-radius:20px;overflow:hidden}
.mb-hero{background:linear-gradient(135deg,#1a1200 0%,#2a1800 60%,#1a1d27 100%);padding:24px;position:relative}
.mb-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(229,107,10,.18) 0%,transparent 70%)}
.mb-greeting{font-size:13px;font-weight:600;color:rgba(229,107,10,.8);margin-bottom:4px;position:relative}
.mb-name{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.4px;position:relative}
.mb-date{font-size:12px;color:rgba(255,255,255,.4);margin-top:4px;position:relative}
.mb-hero-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;position:relative}
.mb-stat{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px}
.mb-stat-label{font-size:11px;font-weight:600;color:rgba(255,255,255,.4);margin-bottom:4px;text-transform:uppercase;letter-spacing:.6px}
.mb-stat-value{font-size:18px;font-weight:800;color:#fff}
.mb-stat-sub{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px}
.mb-trend{font-size:11px;font-weight:700;padding:2px 7px;border-radius:8px;margin-top:4px;display:inline-block}
.mb-trend.up{background:rgba(34,197,94,.15);color:#22c55e}
.mb-trend.down{background:rgba(239,68,68,.15);color:#ef4444}
.mb-body{padding:20px}
.mb-section{margin-bottom:20px}
.mb-section:last-child{margin-bottom:0}
.mb-section-title{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND};margin-bottom:12px}
.mb-target-wrap{background:var(--bg2);border-radius:12px;padding:16px}
.mb-target-label{font-size:13px;color:var(--t2);margin-bottom:8px}
.mb-target-input-row{display:flex;gap:8px;align-items:center}
.mb-target-prefix{font-size:14px;font-weight:700;color:var(--t2)}
.mb-target-input{flex:1;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:15px;font-weight:800;color:var(--t);font-family:inherit;outline:none;transition:border-color .15s}
.mb-target-input:focus{border-color:${BRAND}}
.mb-target-set-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .15s}
.mb-target-set-btn:hover{background:#ff8c3a}
.mb-progress-track{height:6px;background:var(--border);border-radius:3px;margin-top:10px;overflow:hidden}
.mb-progress-fill{height:100%;background:${BRAND};border-radius:3px;transition:width .4s}
.mb-progress-label{display:flex;justify-content:space-between;font-size:11px;color:var(--t2);margin-top:5px}
.mb-debt-list{display:flex;flex-direction:column;gap:8px}
.mb-debt-item{display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border-radius:10px;padding:10px 14px}
.mb-debt-name{font-size:13px;font-weight:700;color:var(--t)}
.mb-debt-days{font-size:11px;color:var(--t2);margin-top:1px}
.mb-debt-amount{font-size:13px;font-weight:800;color:#ef4444}
.mb-debt-wa{background:none;border:1px solid rgba(34,197,94,.3);color:#22c55e;border-radius:7px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;margin-left:8px}
.mb-debt-wa:hover{background:rgba(34,197,94,.1)}
.mb-stock-chips{display:flex;flex-wrap:wrap;gap:8px}
.mb-stock-chip{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);color:#f59e0b;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:600}
.mb-top-product{display:flex;align-items:center;gap:12px;background:var(--bg2);border-radius:10px;padding:12px 14px}
.mb-top-icon{width:40px;height:40px;border-radius:10px;background:rgba(229,107,10,.12);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.mb-top-name{font-size:13px;font-weight:700;color:var(--t)}
.mb-top-sub{font-size:11px;color:var(--t2);margin-top:2px}
.mb-actions{display:flex;gap:8px;margin-top:20px}
.mb-btn-primary{flex:1;background:${BRAND};color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s}
.mb-btn-primary:hover{background:#ff8c3a}
.mb-btn-secondary{background:var(--bg2);color:var(--t2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
.mb-btn-secondary:hover{border-color:${BRAND};color:${BRAND}}
.mb-dismissed{display:none}
`;

export default function MorningBriefing({ data = DEFAULT_DATA, onDismiss, onSetTarget, theme = "dark" }) {
  const [target, setTarget] = useState(data.suggestedTarget);
  const [targetSet, setTargetSet] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const todaySoFar = 0;
  const pct = target > 0 ? Math.min(100, Math.round((todaySoFar / target) * 100)) : 0;
  const vsAvg = Math.round(((data.yesterdaySales - data.weeklyAvgSales) / data.weeklyAvgSales) * 100);
  const totalDebt = data.overdueDebts.reduce((s, d) => s + d.amount, 0);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleSetTarget = () => {
    setTargetSet(true);
    onSetTarget?.(target);
  };

  if (dismissed) return null;

  const today = new Date().toLocaleDateString("en-TZ", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{css}</style>
      <div className={`mb-root ${theme}`}>
        <div className="mb-card">
          {/* Hero */}
          <div className="mb-hero">
            <div className="mb-greeting">{getGreeting()} 👋</div>
            <div className="mb-name">{data.ownerName}</div>
            <div className="mb-date">{today}</div>
            <div className="mb-hero-stats">
              <div className="mb-stat">
                <div className="mb-stat-label">Yesterday's Sales</div>
                <div className="mb-stat-value" style={{ fontSize: 15 }}>{fmt(data.yesterdaySales)}</div>
                <div className={`mb-trend ${vsAvg >= 0 ? "up" : "down"}`}>
                  {vsAvg >= 0 ? "↑" : "↓"} {Math.abs(vsAvg)}% vs avg
                </div>
              </div>
              <div className="mb-stat">
                <div className="mb-stat-label">Transactions</div>
                <div className="mb-stat-value">{data.yesterdayTransactions}</div>
                <div className="mb-stat-sub">Top: {data.topProduct.name.split(" ")[0]}</div>
              </div>
            </div>
          </div>

          <div className="mb-body">
            {/* Daily Target */}
            <div className="mb-section">
              <div className="mb-section-title">Today's Target</div>
              <div className="mb-target-wrap">
                <div className="mb-target-label">
                  {targetSet ? "Target locked in. Let's hit it 💪" : `Suggested: ${fmt(data.suggestedTarget)} — adjust if needed`}
                </div>
                <div className="mb-target-input-row">
                  <span className="mb-target-prefix">TSh</span>
                  <input
                    className="mb-target-input"
                    type="number"
                    value={target}
                    onChange={e => setTarget(Number(e.target.value))}
                    disabled={targetSet}
                  />
                  {!targetSet && (
                    <button className="mb-target-set-btn" onClick={handleSetTarget}>Set Target</button>
                  )}
                </div>
                <div className="mb-progress-track">
                  <div className="mb-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="mb-progress-label">
                  <span>TSh 0 so far</span>
                  <span>{fmt(target)} goal</span>
                </div>
              </div>
            </div>

            {/* Top Product Yesterday */}
            <div className="mb-section">
              <div className="mb-section-title">Yesterday's Best Seller</div>
              <div className="mb-top-product">
                <div className="mb-top-icon">⭐</div>
                <div>
                  <div className="mb-top-name">{data.topProduct.name}</div>
                  <div className="mb-top-sub">{data.topProduct.units} units sold · keep it stocked</div>
                </div>
              </div>
            </div>

            {/* Overdue Debts */}
            {data.overdueDebts.length > 0 && (
              <div className="mb-section">
                <div className="mb-section-title">
                  Overdue Debts — {fmt(totalDebt)} total
                </div>
                <div className="mb-debt-list">
                  {data.overdueDebts.map((d) => (
                    <div className="mb-debt-item" key={d.name}>
                      <div>
                        <div className="mb-debt-name">{d.name}</div>
                        <div className="mb-debt-days">{d.days} days overdue</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="mb-debt-amount">{fmt(d.amount)}</span>
                        <button className="mb-debt-wa" title="Send WhatsApp reminder">💬</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock */}
            {data.lowStockItems.length > 0 && (
              <div className="mb-section">
                <div className="mb-section-title">Restock Today</div>
                <div className="mb-stock-chips">
                  {data.lowStockItems.map(item => (
                    <span className="mb-stock-chip" key={item}>⚠️ {item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mb-actions">
              <button className="mb-btn-primary" onClick={handleDismiss}>
                🚀 Start Selling
              </button>
              <button className="mb-btn-secondary" onClick={handleDismiss}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
