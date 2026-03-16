import { useState } from "react";

// ─── WeeklyAIDigest ──────────────────────────────────────────────────────────
// AI-generated weekly business summary card.
// In production: call your /api/weekly-digest endpoint which sends business data
// to your AI backend. For now ships with a simulated generation flow.
// Props:
//   weekData  — business stats for the week (see SAMPLE_WEEK)
//   isPro     — boolean: false shows upgrade prompt instead of full digest
//   theme     — "dark" | "light"

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

const SAMPLE_WEEK = {
  weekLabel: "March 8–14, 2025",
  totalSales: 1284000,
  totalTransactions: 218,
  avgDailySales: 183429,
  topProduct: { name: "Unga wa Sembe 2kg", units: 124, revenue: 434000 },
  worstDay: { day: "Monday", sales: 98000 },
  bestDay: { day: "Saturday", sales: 287000 },
  newCustomers: 7,
  debtCollected: 145000,
  newDebt: 87000,
  expensesTotal: 312000,
  grossProfit: 972000,
  prevWeekSales: 1102000,
  lowStockCount: 4,
  paymentSplit: { mpesa: 58, cash: 31, airtel: 11 },
};

// Pre-built AI digest sections (in prod replace with real API call)
function buildDigest(d: typeof SAMPLE_WEEK) {
  const growthPct = Math.round(((d.totalSales - d.prevWeekSales) / d.prevWeekSales) * 100);
  const profitMargin = Math.round((d.grossProfit / d.totalSales) * 100);
  const netDebt = d.newDebt - d.debtCollected;

  return [
    {
      type: "highlight",
      icon: growthPct >= 0 ? "📈" : "📉",
      title: growthPct >= 0 ? `Strong week — up ${growthPct}%` : `Slower week — down ${Math.abs(growthPct)}%`,
      body: `You recorded ${fmt(d.totalSales)} in sales across ${d.totalTransactions} transactions — ${growthPct >= 0 ? "your best week in a month" : "below your recent average"}. ${d.bestDay.day} was your peak day at ${fmt(d.bestDay.sales)}.`,
      color: growthPct >= 0 ? "#22c55e" : "#ef4444",
    },
    {
      type: "insight",
      icon: "⭐",
      title: `${d.topProduct.name} driving revenue`,
      body: `Your best seller moved ${d.topProduct.units} units this week, bringing in ${fmt(d.topProduct.revenue)} — ${Math.round((d.topProduct.revenue / d.totalSales) * 100)}% of total sales. Make sure you have enough stock going into next week.`,
      color: BRAND,
    },
    {
      type: "insight",
      icon: "💰",
      title: `${profitMargin}% gross margin`,
      body: `After ${fmt(d.expensesTotal)} in expenses, you kept ${fmt(d.grossProfit)} — a ${profitMargin}% margin. ${profitMargin >= 70 ? "This is healthy for a retail duka." : "This is below the 70% target — review your highest expenses."}`,
      color: profitMargin >= 70 ? "#22c55e" : "#f59e0b",
    },
    {
      type: netDebt > 0 ? "warning" : "positive",
      icon: netDebt > 0 ? "⚠️" : "✅",
      title: netDebt > 0 ? `Credit risk: ${fmt(netDebt)} net new debt` : `Good credit week — net debt reduced`,
      body: netDebt > 0
        ? `You collected ${fmt(d.debtCollected)} but issued ${fmt(d.newDebt)} in new credit — ${fmt(netDebt)} net increase. Consider tightening credit limits for repeat defaulters.`
        : `You collected ${fmt(d.debtCollected)} and issued ${fmt(d.newDebt)} — reducing your overall debt book. Keep following up on the remaining balances.`,
      color: netDebt > 0 ? "#f59e0b" : "#22c55e",
    },
    {
      type: "action",
      icon: "🎯",
      title: "One thing to do this week",
      body: d.lowStockCount > 0
        ? `You have ${d.lowStockCount} products running low. Reorder before the weekend rush — your ${d.bestDay.day} peak means you'll need full shelves by Friday.`
        : `Your stock levels look healthy. Focus on following up the ${Math.round(d.newDebt / 20000)} customers with overdue balances — a WhatsApp message on Tuesday morning gets the best response rate.`,
      color: "#3b82f6",
    },
  ];
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.wd-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.wd-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.wd-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.wd-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.wd-title{font-size:20px;font-weight:800;color:var(--t);letter-spacing:-.3px}
.wd-title span{color:${BRAND}}
.wd-period{font-size:12px;color:var(--t2);margin-top:2px}
.wd-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
@media(max-width:600px){.wd-stats-row{grid-template-columns:1fr 1fr}}
.wd-stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
.wd-stat-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t2);margin-bottom:5px}
.wd-stat-val{font-size:15px;font-weight:800;color:var(--t)}
.wd-payment-bar{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:20px}
.wd-pay-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t2);margin-bottom:10px}
.wd-bar{height:10px;border-radius:5px;overflow:hidden;display:flex;margin-bottom:8px}
.wd-bar-seg{height:100%;transition:width .4s}
.wd-bar-legend{display:flex;gap:14px}
.wd-bar-item{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--t2)}
.wd-bar-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.wd-generate-area{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px}
.wd-gen-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.wd-gen-title{font-size:14px;font-weight:800;color:var(--t);display:flex;align-items:center;gap:8px}
.wd-gen-badge{background:rgba(229,107,10,.12);color:${BRAND};border:1px solid rgba(229,107,10,.25);border-radius:20px;padding:3px 9px;font-size:10px;font-weight:800}
.wd-gen-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:background .15s}
.wd-gen-btn:hover{background:#ff8c3a}
.wd-gen-btn:disabled{opacity:.5;cursor:not-allowed}
.wd-generating{display:flex;align-items:center;gap:10px;padding:16px 0;color:var(--t2);font-size:13px}
.wd-spin{display:inline-block;animation:wdspin 1s linear infinite}
@keyframes wdspin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.wd-digest-list{display:flex;flex-direction:column;gap:12px}
.wd-insight-card{border-radius:12px;padding:14px 16px;border:1px solid;animation:wdfade .3s ease}
@keyframes wdfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.wd-insight-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:6px}
.wd-insight-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.wd-insight-title{font-size:13px;font-weight:800;line-height:1.3}
.wd-insight-body{font-size:12px;line-height:1.6;color:var(--t2);margin-top:4px}
.wd-upgrade-card{background:linear-gradient(135deg,#1a1200 0%,#2a1800 100%);border:1px solid rgba(229,107,10,.25);border-radius:16px;padding:24px;text-align:center;position:relative;overflow:hidden}
.wd-upgrade-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(229,107,10,.15) 0%,transparent 65%)}
.wd-upgrade-icon{font-size:36px;margin-bottom:12px;position:relative}
.wd-upgrade-title{font-size:16px;font-weight:800;color:#fff;margin-bottom:6px;position:relative}
.wd-upgrade-sub{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:16px;line-height:1.5;position:relative}
.wd-upgrade-btn{background:${BRAND};color:#fff;border:none;border-radius:10px;padding:12px 24px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;position:relative}
.wd-upgrade-btn:hover{background:#ff8c3a}
.wd-preview-blurred{filter:blur(4px);pointer-events:none;opacity:.4;margin-top:12px;position:relative}
`;

interface WeeklyAIDigestProps {
  weekData?: typeof SAMPLE_WEEK;
  isPro?: boolean;
  theme?: "dark" | "light";
}

export default function WeeklyAIDigest({ weekData = SAMPLE_WEEK, isPro = true, theme = "dark" }: WeeklyAIDigestProps) {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const digest = buildDigest(weekData);
  const growthPct = Math.round(((weekData.totalSales - weekData.prevWeekSales) / weekData.prevWeekSales) * 100);

  const handleGenerate = () => {
    setGenerating(true);
    setVisibleCount(0);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= digest.length) clearInterval(interval);
      }, 280);
    }, 1800);
  };

  return (
    <>
      <style>{css}</style>
      <div className={`wd-root ${theme}`}>
        <div className="wd-header">
          <div>
            <div className="wd-title">Weekly <span>AI Digest</span></div>
            <div className="wd-period">📅 {weekData.weekLabel}</div>
          </div>
          {isPro && (
            <span className="wd-gen-badge">✨ PRO</span>
          )}
        </div>

        {/* Stats row */}
        <div className="wd-stats-row">
          {[
            { label: "Total Sales", value: fmt(weekData.totalSales), color: growthPct >= 0 ? "#22c55e" : "#ef4444" },
            { label: "Transactions", value: weekData.totalTransactions.toString() },
            { label: "Gross Profit", value: fmt(weekData.grossProfit) },
            { label: "New Customers", value: `+${weekData.newCustomers}` },
          ].map(s => (
            <div className="wd-stat" key={s.label}>
              <div className="wd-stat-lbl">{s.label}</div>
              <div className="wd-stat-val" style={s.color ? { color: s.color } : {}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Payment method bar */}
        <div className="wd-payment-bar">
          <div className="wd-pay-title">Payment Methods</div>
          <div className="wd-bar">
            <div className="wd-bar-seg" style={{ width: `${weekData.paymentSplit.mpesa}%`, background: "#22c55e" }} />
            <div className="wd-bar-seg" style={{ width: `${weekData.paymentSplit.cash}%`, background: BRAND }} />
            <div className="wd-bar-seg" style={{ width: `${weekData.paymentSplit.airtel}%`, background: "#3b82f6" }} />
          </div>
          <div className="wd-bar-legend">
            <span className="wd-bar-item"><span className="wd-bar-dot" style={{ background: "#22c55e" }} />M-Pesa {weekData.paymentSplit.mpesa}%</span>
            <span className="wd-bar-item"><span className="wd-bar-dot" style={{ background: BRAND }} />Cash {weekData.paymentSplit.cash}%</span>
            <span className="wd-bar-item"><span className="wd-bar-dot" style={{ background: "#3b82f6" }} />Airtel {weekData.paymentSplit.airtel}%</span>
          </div>
        </div>

        {/* AI Digest section */}
        {!isPro ? (
          <div className="wd-upgrade-card">
            <div className="wd-upgrade-icon">🤖</div>
            <div className="wd-upgrade-title">AI Weekly Digest</div>
            <div className="wd-upgrade-sub">
              Get a personalised AI-written analysis of your week — what went well, what to watch, and one action to take. Upgrade to Pro to unlock.
            </div>
            <button className="wd-upgrade-btn">✨ Upgrade to Pro — TSh 30,000/mo</button>
            <div className="wd-preview-blurred">
              {digest.slice(0, 2).map((d, i) => (
                <div key={i} className="wd-insight-card" style={{
                  background: `${d.color}10`, borderColor: `${d.color}25`, marginBottom: 10
                }}>
                  <div className="wd-insight-top">
                    <span className="wd-insight-icon">{d.icon}</span>
                    <span className="wd-insight-title" style={{ color: d.color }}>{d.title}</span>
                  </div>
                  <div className="wd-insight-body">{d.body}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="wd-generate-area">
            <div className="wd-gen-header">
              <div className="wd-gen-title">
                🤖 AI Analysis
                {generated && <span className="wd-gen-badge">Generated</span>}
              </div>
              <button
                className="wd-gen-btn"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <><span className="wd-spin">⚙️</span> Analysing…</>
                ) : generated ? (
                  "↻ Regenerate"
                ) : (
                  "✨ Generate Digest"
                )}
              </button>
            </div>

            {!generated && !generating && (
              <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
                Tap "Generate Digest" and your AI business advisor will analyse this week's data — sales trends, profit health, credit risk, and one specific action for next week.
              </div>
            )}

            {generating && (
              <div className="wd-generating">
                <span className="wd-spin" style={{ fontSize: 20 }}>🔄</span>
                Analysing {weekData.totalTransactions} transactions from this week…
              </div>
            )}

            {generated && (
              <div className="wd-digest-list">
                {digest.slice(0, visibleCount).map((d, i) => (
                  <div key={i} className="wd-insight-card"
                    style={{ background: `${d.color}08`, borderColor: `${d.color}20`, animationDelay: `${i * 0.1}s` }}>
                    <div className="wd-insight-top">
                      <span className="wd-insight-icon">{d.icon}</span>
                      <span className="wd-insight-title" style={{ color: d.color }}>{d.title}</span>
                    </div>
                    <div className="wd-insight-body">{d.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
