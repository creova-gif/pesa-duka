import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const STEPS = [
  {
    id: "first_sale",
    icon: "💰",
    title: "Record your first sale",
    titleSw: "Rekodi mauzo yako ya kwanza",
    body: "Tap any sale into the cashbook. Takes 10 seconds. Akili starts learning your shop immediately.",
    bodySw: "Piga mauzo kwenye daftari la fedha. Huchukua sekunde 10.",
    route: "/cashbook",
    cta: "Open Cashbook →",
    color: "#22c55e",
  },
  {
    id: "first_product",
    icon: "📦",
    title: "Add your first product",
    titleSw: "Ongeza bidhaa yako ya kwanza",
    body: "Add even one item to inventory and you'll start getting low-stock alerts before customers find an empty shelf.",
    bodySw: "Ongeza bidhaa moja na utapata tahadhari ya hisa chache.",
    route: "/inventory",
    cta: "Open Inventory →",
    color: "#3b82f6",
  },
  {
    id: "efd_receipt",
    icon: "🏛️",
    title: "Send your first EFD receipt",
    titleSw: "Tuma risiti yako ya kwanza ya EFD",
    body: "TRA-compliant receipts in 4 seconds. If you're already issuing EFDs manually, this alone saves you hours per week.",
    bodySw: "Risiti ya EFD inayofuata sheria za TRA. Huchukua sekunde 4.",
    route: "/pos",
    cta: "Open POS →",
    color: "#E56B0A",
  },
  {
    id: "akili_check",
    icon: "🧠",
    title: "Ask Akili for advice",
    titleSw: "Uliza Akili ushauri",
    body: "Go to Business Tools → Akili. Ask anything: \"Which product makes me the most money?\" in Swahili or English.",
    bodySw: "Nenda Business Tools → Akili. Uliza chochote kwa Kiswahili.",
    route: "/tools",
    cta: "Talk to Akili →",
    color: "#7c3aed",
  },
];

const STORAGE_KEY = "pesa_onboarding_checklist";

function getChecklist(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setChecked(id: string) {
  const current = getChecklist();
  current[id] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

interface Props {
  hasTransactions: boolean;
  hasProducts: boolean;
}

export default function FirstTimeGuide({ hasTransactions, hasProducts }: Props) {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(getChecklist());
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("pesa_guide_dismissed") === "true"
  );
  const [lang, setLang] = useState<"en" | "sw">("en");

  useEffect(() => {
    if (hasTransactions) {
      setChecked("first_sale");
      setChecklist(getChecklist());
    }
    if (hasProducts) {
      setChecked("first_product");
      setChecklist(getChecklist());
    }
  }, [hasTransactions, hasProducts]);

  const allDone = STEPS.every(s => checklist[s.id]);

  if (dismissed || allDone) return null;

  const doneCount = STEPS.filter(s => checklist[s.id]).length;

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1208 0%, #2a1e0a 100%)",
      border: "1px solid rgba(229,107,10,.25)",
      borderRadius: "16px",
      padding: "20px 24px",
      marginBottom: "24px",
      position: "relative",
    }}>
      <button
        onClick={() => { localStorage.setItem("pesa_guide_dismissed", "true"); setDismissed(true); }}
        style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", color: "rgba(250,248,245,.3)", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "4px" }}
        title="Dismiss"
      >×</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingRight: "24px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#E56B0A", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "4px" }}>
            Getting Started · {doneCount}/{STEPS.length} done
          </div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "#FAF8F5" }}>
            {lang === "en" ? "Your first 4 steps to a running shop" : "Hatua 4 za kwanza za duka linalofanya kazi"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setLang("en")} style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,.15)", background: lang === "en" ? "#E56B0A" : "transparent", color: lang === "en" ? "#fff" : "rgba(250,248,245,.5)", cursor: "pointer" }}>EN</button>
          <button onClick={() => setLang("sw")} style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,.15)", background: lang === "sw" ? "#E56B0A" : "transparent", color: lang === "sw" ? "#fff" : "rgba(250,248,245,.5)", cursor: "pointer" }}>SW</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
        {STEPS.map(step => {
          const done = !!checklist[step.id];
          return (
            <div
              key={step.id}
              style={{
                background: done ? "rgba(34,197,94,.08)" : "rgba(255,255,255,.04)",
                border: `1px solid ${done ? "rgba(34,197,94,.25)" : "rgba(255,255,255,.08)"}`,
                borderRadius: "12px",
                padding: "14px",
                opacity: done ? 0.7 : 1,
                transition: "all .2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <div style={{ fontSize: "18px" }}>{done ? "✅" : step.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: done ? "#22c55e" : "#FAF8F5", lineHeight: 1.3, flex: 1 }}>
                  {lang === "en" ? step.title : step.titleSw}
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "rgba(250,248,245,.45)", lineHeight: 1.5, marginBottom: done ? 0 : "10px" }}>
                {lang === "en" ? step.body : step.bodySw}
              </div>
              {!done && (
                <button
                  onClick={() => navigate(step.route)}
                  style={{ fontSize: "11px", fontWeight: 700, padding: "6px 12px", borderRadius: "8px", border: "none", background: step.color, color: "#fff", cursor: "pointer", width: "100%", marginTop: "4px" }}
                >
                  {step.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "16px" }}>
        <div style={{ height: "3px", background: "rgba(255,255,255,.08)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(doneCount / STEPS.length) * 100}%`, background: "#E56B0A", borderRadius: "4px", transition: "width .4s ease" }} />
        </div>
        <div style={{ fontSize: "10px", color: "rgba(250,248,245,.3)", marginTop: "6px", textAlign: "right" }}>
          {doneCount === 0 ? "Start with any step" : doneCount === STEPS.length - 1 ? "Almost there!" : `${STEPS.length - doneCount} steps remaining`}
        </div>
      </div>
    </div>
  );
}
