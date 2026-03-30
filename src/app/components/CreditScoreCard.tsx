import { useState, useMemo } from "react";
import { useTransactions, useCustomers } from "../hooks/useData";

// ─── CreditScoreCard ─────────────────────────────────────────────────────────
// Shows owner their business credit score based on transaction history,
// what's dragging it down, and what they need to do to qualify for a loan.
// This is the #1 retention hook and upgrade driver — keep it always visible.

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

const DEFAULT_DATA = {
  score: 68,
  maxScore: 100,
  tier: "Developing" as "Emerging" | "Developing" | "Established" | "Trusted",
  monthsActive: 5,
  totalTransactions: 847,
  avgMonthlySales: 1240000,
  consistency: 72,
  debtRepaymentRate: 61,
  recordKeepingScore: 80,
  uniqueCustomers: 134,
  loanEligibility: {
    eligible: false,
    requiredScore: 75,
    maxLoanAmount: 0,
    message: "You need 75+ to unlock working capital. You're 7 points away.",
  },
  factors: [
    { label: "Sales consistency", score: 72, max: 100, impact: "medium" as const, tip: "Sell every day — even slow days matter. Days with zero sales hurt your score." },
    { label: "Debt repayment rate", score: 61, max: 100, impact: "high" as const, tip: "Collect credit from customers faster. Your current 61% repayment rate is the biggest drag on your score." },
    { label: "Record keeping", score: 80, max: 100, impact: "low" as const, tip: "Complete the end-of-day close every evening. You're already doing well here." },
    { label: "Transaction volume", score: 847, max: 1000, impact: "low" as const, tip: "You're close to 1,000 lifetime transactions — a key lender milestone." },
    { label: "Customer base", score: 134, max: 200, impact: "medium" as const, tip: "Growing to 200 unique customers strengthens your score." },
  ],
  lenders: [
    { name: "CRDB SME Loan", minScore: 75, maxAmount: 5000000, term: "6–24 months", rate: "18% p.a." },
    { name: "NMB Biashara", minScore: 70, maxAmount: 3000000, term: "3–12 months", rate: "20% p.a." },
    { name: "Pesapal Credit", minScore: 65, maxAmount: 1500000, term: "1–6 months", rate: "24% p.a." },
  ],
};

const TIER_COLORS = {
  Emerging:    { color: "#ef4444", bg: "rgba(239,68,68,.1)",    border: "rgba(239,68,68,.25)" },
  Developing:  { color: "#f59e0b", bg: "rgba(245,158,11,.1)",   border: "rgba(245,158,11,.25)" },
  Established: { color: BRAND,     bg: "rgba(229,107,10,.1)",   border: "rgba(229,107,10,.25)" },
  Trusted:     { color: "#22c55e", bg: "rgba(34,197,94,.1)",    border: "rgba(34,197,94,.25)" },
};

const IMPACT_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.cs-root{font-family:'Plus Jakarta Sans',sans-serif}
.cs-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.cs-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.cs-hero{background:linear-gradient(135deg,#0a0f1e 0%,#0f1a10 100%);border-radius:16px;padding:24px;margin-bottom:16px;position:relative;overflow:hidden}
.cs-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 50%,rgba(229,107,10,.12) 0%,transparent 60%)}
.cs-hero-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;position:relative}
.cs-hero-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.8px}
.cs-hero-title{font-size:14px;font-weight:800;color:#fff;margin-top:3px}
.cs-score-ring{position:relative;width:100px;height:100px;flex-shrink:0}
.cs-ring-svg{transform:rotate(-90deg)}
.cs-ring-bg{fill:none;stroke:rgba(255,255,255,.08)}
.cs-ring-fill{fill:none;stroke-linecap:round;transition:stroke-dashoffset .8s ease}
.cs-ring-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cs-ring-num{font-size:24px;font-weight:800;color:#fff;line-height:1}
.cs-ring-denom{font-size:11px;color:rgba(255,255,255,.4);margin-top:1px}
.cs-tier-badge{display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:800;border:1px solid;margin-bottom:12px}
.cs-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;position:relative}
.cs-mini-stat{background:rgba(255,255,255,.05);border-radius:10px;padding:10px}
.cs-mini-lbl{font-size:9px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.cs-mini-val{font-size:14px;font-weight:800;color:#fff}
.cs-section{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px}
.cs-sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${BRAND};margin-bottom:14px}
.cs-factor{margin-bottom:14px}
.cs-factor:last-child{margin-bottom:0}
.cs-factor-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.cs-factor-label{font-size:13px;font-weight:600;color:var(--t)}
.cs-factor-right{display:flex;align-items:center;gap:8px}
.cs-impact{font-size:10px;font-weight:700;padding:2px 7px;border-radius:8px}
.cs-factor-val{font-size:12px;font-weight:700;color:var(--t2)}
.cs-bar{height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:4px}
.cs-bar-fill{height:100%;border-radius:3px;transition:width .5s}
.cs-tip{font-size:11px;color:var(--t2);line-height:1.4;margin-top:3px;display:none}
.cs-factor.open .cs-tip{display:block}
.cs-lender{background:var(--inp);border-radius:11px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.cs-lender:last-child{margin-bottom:0}
.cs-lender-name{font-size:13px;font-weight:700;color:var(--t)}
.cs-lender-detail{font-size:11px;color:var(--t2);margin-top:2px}
.cs-lender-amount{text-align:right;flex-shrink:0}
.cs-lender-max{font-size:13px;font-weight:800;color:${BRAND}}
.cs-lender-locked{font-size:11px;color:var(--t3)}
.cs-eligibility-bar{background:var(--inp);border-radius:12px;padding:14px 16px;margin-bottom:12px}
.cs-elig-row{display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px}
.cs-elig-track{height:8px;background:var(--border);border-radius:4px;overflow:hidden;position:relative}
.cs-elig-fill{height:100%;border-radius:4px;transition:width .6s;background:${BRAND}}
.cs-elig-marker{position:absolute;top:-2px;height:12px;width:2px;background:#22c55e;border-radius:1px}
.cs-elig-msg{font-size:12px;color:var(--t2);margin-top:8px;line-height:1.5}
.cs-unlock-card{background:linear-gradient(135deg,#1a1200,#2a1800 60%,#1a1d27);border:1px solid rgba(229,107,10,.25);border-radius:14px;padding:20px;text-align:center;position:relative;overflow:hidden}
.cs-unlock-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(229,107,10,.15),transparent 60%)}
.cs-unlock-btn{background:${BRAND};color:#fff;border:none;border-radius:10px;padding:11px 24px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;margin-top:14px;position:relative;transition:background .15s}
.cs-unlock-btn:hover{background:#ff8c3a}
`;

export default function CreditScoreCard({ data: externalData, theme = "dark" }: { data?: typeof DEFAULT_DATA; theme?: "dark" | "light" }) {
  const [openFactor, setOpenFactor] = useState<number | null>(null);
  const { data: transactions = [] } = useTransactions();
  const { data: customers = [] } = useCustomers();

  const computedData = useMemo(() => {
    if (transactions.length === 0) return null;

    const now = new Date();
    const firstTxDate = transactions.reduce((min, t) => {
      const d = new Date(t.date);
      return d < min ? d : min;
    }, now);
    const monthsActive = Math.max(1, Math.round((now.getTime() - firstTxDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));

    const incomeTransactions = transactions.filter(t => t.type === "income");
    const totalTransactions = transactions.length;
    const avgMonthlySales = incomeTransactions.reduce((s, t) => s + t.amount, 0) / Math.max(1, monthsActive);

    const uniqueCustomers = customers.length || new Set(incomeTransactions.map(t => t.customer).filter(Boolean)).size;

    const recentIncome = incomeTransactions.filter(t => {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return new Date(t.date) >= thirtyDaysAgo;
    });
    const consistency = recentIncome.length > 0 ? Math.min(100, Math.round((recentIncome.length / 30) * 100) * 3) : 0;

    const creditTransactions = transactions.filter(t => t.paymentMethod === "Credit");
    const creditAmount = creditTransactions.reduce((s, t) => s + t.amount, 0);
    const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
    const debtRepaymentRate = creditAmount > 0 ? Math.round(((totalIncome - creditAmount) / totalIncome) * 100) : 80;

    const recordKeepingScore = Math.min(100, Math.round((totalTransactions / Math.max(1, monthsActive)) * 3));

    const score = Math.min(100, Math.max(0,
      Math.round(
        (Math.min(100, consistency) * 0.3) +
        (Math.min(100, debtRepaymentRate) * 0.3) +
        (Math.min(100, recordKeepingScore) * 0.2) +
        (Math.min(100, (totalTransactions / 1000) * 100) * 0.1) +
        (Math.min(100, (uniqueCustomers / 200) * 100) * 0.1)
      )
    ));

    const tier: typeof DEFAULT_DATA.tier =
      score >= 85 ? "Trusted" : score >= 70 ? "Established" : score >= 55 ? "Developing" : "Emerging";

    const eligible = score >= 75;
    const maxLoanAmount = eligible ? Math.round(avgMonthlySales * 3) : 0;

    return {
      ...DEFAULT_DATA,
      score,
      tier,
      monthsActive,
      totalTransactions,
      avgMonthlySales: Math.round(avgMonthlySales),
      consistency: Math.min(100, consistency),
      debtRepaymentRate: Math.min(100, Math.max(0, debtRepaymentRate)),
      recordKeepingScore: Math.min(100, recordKeepingScore),
      uniqueCustomers,
      loanEligibility: {
        eligible,
        requiredScore: 75,
        maxLoanAmount,
        message: eligible
          ? `Congratulations! You qualify for up to ${fmt(maxLoanAmount)} in working capital.`
          : `You need 75+ to unlock working capital. You're ${75 - score} points away.`,
      },
      factors: [
        { label: "Sales consistency", score: Math.min(100, consistency), max: 100, impact: "medium" as const, tip: "Sell every day — even slow days matter. Days with zero sales hurt your score." },
        { label: "Debt repayment rate", score: Math.min(100, Math.max(0, debtRepaymentRate)), max: 100, impact: "high" as const, tip: "Collect credit from customers faster. High outstanding credit drags your score down." },
        { label: "Record keeping", score: Math.min(100, recordKeepingScore), max: 100, impact: "low" as const, tip: "Keep recording every sale. Consistent daily records are a key lender requirement." },
        { label: "Transaction volume", score: Math.min(totalTransactions, 1000), max: 1000, impact: "low" as const, tip: `You have ${totalTransactions} lifetime transactions. Reaching 1,000 is a key lender milestone.` },
        { label: "Customer base", score: Math.min(uniqueCustomers, 200), max: 200, impact: "medium" as const, tip: "Growing to 200 unique customers strengthens your score significantly." },
      ],
    };
  }, [transactions, customers]);

  const data = externalData || computedData || DEFAULT_DATA;
  const tc = TIER_COLORS[data.tier];
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (data.score / data.maxScore) * circumference;
  const scoreColor = data.score >= 75 ? "#22c55e" : data.score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{css}</style>
      <div className={`cs-root ${theme}`}>
        {/* Hero */}
        <div className="cs-hero">
          <div className="cs-hero-top">
            <div>
              <div className="cs-hero-label">Business Credit Score</div>
              <div className="cs-hero-title">Your loan readiness today</div>
            </div>
            <div className="cs-score-ring">
              <svg className="cs-ring-svg" width="100" height="100" viewBox="0 0 100 100">
                <circle className="cs-ring-bg" cx="50" cy="50" r="40" strokeWidth="8" />
                <circle
                  className="cs-ring-fill"
                  cx="50" cy="50" r="40" strokeWidth="8"
                  stroke={scoreColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="cs-ring-text">
                <div className="cs-ring-num" style={{ color: scoreColor }}>{data.score}</div>
                <div className="cs-ring-denom">/{data.maxScore}</div>
              </div>
            </div>
          </div>
          <div className="cs-tier-badge" style={{ background: tc.bg, borderColor: tc.border, color: tc.color }}>
            ● {data.tier} Business
          </div>
          <div className="cs-stats-grid">
            {[
              { label: "Months Active", value: data.monthsActive },
              { label: "Transactions", value: data.totalTransactions.toLocaleString() },
              { label: "Avg Monthly", value: "TSh " + Math.round(data.avgMonthlySales / 1000) + "K" },
            ].map(s => (
              <div className="cs-mini-stat" key={s.label}>
                <div className="cs-mini-lbl">{s.label}</div>
                <div className="cs-mini-val">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Loan eligibility bar */}
        <div className="cs-section">
          <div className="cs-sec-title">Loan Eligibility</div>
          <div className="cs-eligibility-bar">
            <div className="cs-elig-row">
              <span style={{ color: "var(--t)", fontWeight: 700 }}>Your score: {data.score}</span>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>Threshold: {data.loanEligibility.requiredScore}</span>
            </div>
            <div className="cs-elig-track">
              <div className="cs-elig-fill" style={{ width: `${data.score}%` }} />
              <div className="cs-elig-marker" style={{ left: `${data.loanEligibility.requiredScore}%` }} />
            </div>
            <div className="cs-elig-msg">{data.loanEligibility.message}</div>
          </div>

          {/* Lenders */}
          {data.lenders.map(l => {
            const unlocked = data.score >= l.minScore;
            return (
              <div className="cs-lender" key={l.name}
                style={unlocked ? { borderLeft: `3px solid ${BRAND}` } : {}}>
                <div>
                  <div className="cs-lender-name">{unlocked ? "✅ " : "🔒 "}{l.name}</div>
                  <div className="cs-lender-detail">{l.term} · {l.rate} · Min score: {l.minScore}</div>
                </div>
                <div className="cs-lender-amount">
                  {unlocked ? (
                    <div className="cs-lender-max">{fmt(l.maxAmount)}</div>
                  ) : (
                    <div className="cs-lender-locked">Score {l.minScore}+ needed</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score factors */}
        <div className="cs-section">
          <div className="cs-sec-title">What's affecting your score</div>
          {data.factors.map((f, i) => {
            const pct = Math.round((f.score / f.max) * 100);
            const barColor = pct >= 80 ? "#22c55e" : pct >= 60 ? BRAND : "#ef4444";
            return (
              <div
                key={f.label}
                className={`cs-factor ${openFactor === i ? "open" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setOpenFactor(openFactor === i ? null : i)}
              >
                <div className="cs-factor-top">
                  <span className="cs-factor-label">{f.label}</span>
                  <div className="cs-factor-right">
                    <span className="cs-impact"
                      style={{ background: `${IMPACT_COLORS[f.impact]}18`, color: IMPACT_COLORS[f.impact] }}>
                      {f.impact} impact
                    </span>
                    <span className="cs-factor-val">{pct}%</span>
                  </div>
                </div>
                <div className="cs-bar">
                  <div className="cs-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <div className="cs-tip">💡 {f.tip}</div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {!data.loanEligibility.eligible && (
          <div className="cs-unlock-card">
            <div style={{ fontSize: 28, position: "relative" }}>🎯</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 8, position: "relative" }}>
              {data.loanEligibility.requiredScore - data.score} points to your first loan
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 6, position: "relative", lineHeight: 1.5 }}>
              Collect overdue debts faster and complete your end-of-day close every day.
              Those two actions will get you to {data.loanEligibility.requiredScore} within 30 days.
            </div>
            <button className="cs-unlock-btn" onClick={() => {
              // Show all factor tips when user wants to see their action plan
              setOpenFactor(openFactor === null ? 0 : null);
            }}>See my action plan →</button>
          </div>
        )}
      </div>
    </>
  );
}