import { useNavigate } from "react-router";

interface Props {
  feature: string;
  featureSw?: string;
  plan: "growth" | "business";
  compact?: boolean;
}

const PLAN_PRICES = {
  growth: "TSh 7,500/mo",
  business: "TSh 30,000/mo",
};

const PLAN_LABELS = {
  growth: "Growth — Ukuaji",
  business: "Business — Biashara",
};

const PLAN_COLORS = {
  growth: "#E56B0A",
  business: "#7c3aed",
};

export default function UpgradeNudge({ feature, featureSw, plan, compact = false }: Props) {
  const navigate = useNavigate();
  const color = PLAN_COLORS[plan];

  if (compact) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `rgba(${plan === "growth" ? "229,107,10" : "124,58,237"},.08)`, border: `1px solid rgba(${plan === "growth" ? "229,107,10" : "124,58,237"},.25)`, borderRadius: "8px", padding: "6px 12px" }}>
        <span style={{ fontSize: "12px", color, fontWeight: 700 }}>🔒 {PLAN_LABELS[plan]}</span>
        <button onClick={() => navigate("/#pricing")} style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", border: "none", background: color, color: "#fff", cursor: "pointer" }}>Upgrade</button>
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(135deg, rgba(${plan === "growth" ? "229,107,10" : "124,58,237"},.06) 0%, transparent 100%)`, border: `1px solid rgba(${plan === "growth" ? "229,107,10" : "124,58,237"},.2)`, borderRadius: "14px", padding: "20px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "28px", marginBottom: "12px" }}>🔒</div>
      <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>{feature}</div>
      {featureSw && <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "16px", fontStyle: "italic" }}>{featureSw}</div>}
      <div style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
        This feature is available on the <strong style={{ color }}>{PLAN_LABELS[plan]}</strong> plan — {PLAN_PRICES[plan]}. Less than a cup of tea per day.
      </div>
      <button
        onClick={() => { window.scrollTo(0, 0); navigate("/"); setTimeout(() => { const el = document.getElementById("pricing"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 200); }}
        style={{ fontSize: "13px", fontWeight: 700, padding: "10px 24px", borderRadius: "10px", border: "none", background: color, color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
      >
        Upgrade to {PLAN_LABELS[plan]} →
      </button>
      <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "10px" }}>No contract · Cancel anytime</div>
    </div>
  );
}
