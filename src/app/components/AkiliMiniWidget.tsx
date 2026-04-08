import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const AKILI_COLOR = "#7c3aed";

interface Insight {
  icon: string;
  title: string;
  titleSw: string;
  body: string;
  bodySw: string;
  level: "high" | "medium" | "low";
  action: string;
  route: string;
}

function getInsights(txCount: number, productCount: number, avgDailySales: number): Insight[] {
  const base: Insight[] = [
    {
      icon: "📊",
      title: "Your Akili AI advisor is ready",
      titleSw: "Akili yako iko tayari",
      body: "Go to Business Tools → Akili to ask about your best-selling products, debt collection, loan eligibility, and next week's revenue forecast.",
      bodySw: "Nenda Business Tools → Akili kwa ushauri wa biashara yako kwa Kiswahili.",
      level: "medium",
      action: "Open Akili →",
      route: "/tools",
    },
    {
      icon: "💡",
      title: "Ask Akili: \"What should I stock this Saturday?\"",
      titleSw: "Uliza: \"Nistofishe nini Jumamosi?\"",
      body: "Akili knows your weekend sales patterns and can recommend exactly how much of each product to stock before your peak day.",
      bodySw: "Akili inajua mwenendo wa Jumamosi na inaweza kukushauri.",
      level: "low",
      action: "Ask Akili →",
      route: "/tools",
    },
  ];

  if (txCount > 0 && avgDailySales > 0) {
    base.unshift({
      icon: "🧮",
      title: `Akili projection: your weekly total`,
      titleSw: "Utabiri wa wiki ijayo",
      body: `Based on your transaction history, Akili predicts your next 7 days. Go to Business Tools → Predictions to see the full forecast.`,
      bodySw: `Kulingana na historia yako, Akili imetabiri mauzo ya wiki ijayo.`,
      level: "high",
      action: "See Forecast →",
      route: "/tools",
    });
  }

  return base;
}

interface Props {
  txCount: number;
  productCount: number;
  avgDailySales: number;
  ownerName?: string;
}

export default function AkiliMiniWidget({ txCount, productCount, avgDailySales, ownerName }: Props) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [lang, setLang] = useState<"en" | "sw">("en");
  const insights = getInsights(txCount, productCount, avgDailySales);
  const insight = insights[idx % insights.length];

  const isDismissed = localStorage.getItem("akili_widget_dismissed") === "true";
  const [dismissed, setDismissed] = useState(isDismissed);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => i + 1), 8000);
    return () => clearInterval(t);
  }, []);

  if (dismissed) return null;

  return (
    <div style={{
      background: `linear-gradient(135deg, #1e0d3a 0%, #160e2a 100%)`,
      border: `1px solid rgba(124,58,237,.3)`,
      borderLeft: `3px solid ${AKILI_COLOR}`,
      borderRadius: "14px",
      padding: "16px 18px",
      marginBottom: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      <button
        onClick={() => { localStorage.setItem("akili_widget_dismissed", "true"); setDismissed(true); }}
        style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "rgba(255,255,255,.25)", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
        title="Dismiss"
      >×</button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", paddingRight: "20px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${AKILI_COLOR}, #5b21b6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🧠</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: AKILI_COLOR, textTransform: "uppercase", letterSpacing: ".6px" }}>Akili AI</div>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
            <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
              {["en", "sw"].map(l => (
                <button key={l} onClick={() => setLang(l as "en" | "sw")} style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "6px", border: "1px solid rgba(255,255,255,.15)", background: lang === l ? AKILI_COLOR : "transparent", color: lang === l ? "#fff" : "rgba(255,255,255,.4)", cursor: "pointer" }}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#f0f2ff", lineHeight: 1.3, marginBottom: "6px" }}>
            {insight.icon} {lang === "en" ? insight.title : insight.titleSw}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(240,242,255,.55)", lineHeight: 1.5, marginBottom: "12px" }}>
            {lang === "en" ? insight.body : insight.bodySw}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => navigate(insight.route)}
              style={{ fontSize: "12px", fontWeight: 700, padding: "7px 14px", borderRadius: "8px", border: "none", background: AKILI_COLOR, color: "#fff", cursor: "pointer" }}
            >
              {insight.action}
            </button>
            <div style={{ display: "flex", gap: "4px" }}>
              {insights.slice(0, 3).map((_, i) => (
                <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === idx % insights.length ? AKILI_COLOR : "rgba(255,255,255,.2)", cursor: "pointer", transition: "background .3s" }} onClick={() => setIdx(i)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
