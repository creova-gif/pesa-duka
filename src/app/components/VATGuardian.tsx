import { useMemo } from "react";
import { useTransactions } from "../hooks/useData";
import { getProfile } from "../hooks/useBusinessProfile";

const BRAND = "#E56B0A";
const VAT_RATE = 0.18;
const VAT_THRESHOLD = 100_000_000;
const VAT_WARNING_AT = 85_000_000;
const fmt = (n: number) => "TSh " + Math.round(n).toLocaleString("en-TZ");

function getCurrentMonthLabel() {
  return new Date().toLocaleDateString("en-TZ", { month: "long", year: "numeric", timeZone: "Africa/Dar_es_Salaam" });
}

export default function VATGuardian({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { data: transactions = [] } = useTransactions();
  const profile = getProfile();

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const annualRevenue = useMemo(
    () => transactions
      .filter(t => t.type === "income" && new Date(t.date) >= yearStart)
      .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const monthRevenue = useMemo(
    () => transactions
      .filter(t => t.type === "income" && new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const monthExpenses = useMemo(
    () => transactions
      .filter(t => t.type === "expense" && new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const vatCollected = useMemo(() => monthRevenue * VAT_RATE / (1 + VAT_RATE), [monthRevenue]);
  const inputTaxCredits = useMemo(() => monthExpenses * VAT_RATE / (1 + VAT_RATE), [monthExpenses]);
  const netVATOwing = useMemo(() => Math.max(0, vatCollected - inputTaxCredits), [vatCollected, inputTaxCredits]);

  const thresholdPct = Math.min(100, Math.round((annualRevenue / VAT_THRESHOLD) * 100));
  const isRegistered = profile.tin && profile.tin.length > 5;
  const isNearThreshold = annualRevenue >= VAT_WARNING_AT && !isRegistered;
  const exceedsThreshold = annualRevenue >= VAT_THRESHOLD && !isRegistered;

  const vatDueDay = 20;
  const today = now.getDate();
  const daysUntilDue = vatDueDay - today > 0 ? vatDueDay - today : (new Date(now.getFullYear(), now.getMonth() + 1, vatDueDay).getDate() - today);
  const actualDaysUntilDue = today <= 20 ? 20 - today : 20 + (new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - today);

  const css = `
.vat-root{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.vat-root.dark{--card:#1a1d27;--border:#2e3347;--inp:#22263a;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.vat-root.light{--card:#fff;--border:#e2e5ef;--inp:#f8f9fc;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.vat-card{background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:18px;position:relative;overflow:hidden}
.vat-card.warn{border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.03)}
.vat-card.near{border-color:rgba(245,158,11,.4);background:rgba(245,158,11,.03)}
.vat-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.vat-track{height:10px;background:var(--inp);border-radius:5px;overflow:hidden;margin:10px 0}
.vat-fill{height:100%;border-radius:5px;transition:width .6s}
.vat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px}
.vat-stat{background:var(--inp);border-radius:10px;padding:10px 12px}
.vat-stat-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t2);margin-bottom:4px}
.vat-stat-val{font-size:14px;font-weight:800}
.vat-alert{border-radius:10px;padding:10px 13px;font-size:11px;line-height:1.5;margin-top:10px;font-weight:600}
.vat-btn{border:none;border-radius:9px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;margin-top:10px}
`;

  return (
    <>
      <style>{css}</style>
      <div className={`vat-root ${theme}`}>
        <div className={`vat-card ${exceedsThreshold ? "warn" : isNearThreshold ? "near" : ""}`}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: BRAND, marginBottom: 3 }}>
                VAT Guardian · TRA Compliance
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--t)" }}>
                {isRegistered ? "VAT Registered ✓" : "VAT Threshold Tracker"}
              </div>
              <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>{getCurrentMonthLabel()} · 18% VAT Rate</div>
            </div>
            <div style={{
              background: exceedsThreshold ? "rgba(239,68,68,.15)" : isNearThreshold ? "rgba(245,158,11,.15)" : "rgba(34,197,94,.1)",
              border: `1px solid ${exceedsThreshold ? "rgba(239,68,68,.3)" : isNearThreshold ? "rgba(245,158,11,.3)" : "rgba(34,197,94,.2)"}`,
              borderRadius: 20, padding: "4px 12px", fontSize: 10, fontWeight: 800,
              color: exceedsThreshold ? "#ef4444" : isNearThreshold ? "#f59e0b" : "#22c55e",
            }}>
              {exceedsThreshold ? "⚠️ REGISTER NOW" : isNearThreshold ? "⚠️ APPROACHING" : isRegistered ? "✓ COMPLIANT" : "✓ BELOW THRESHOLD"}
            </div>
          </div>

          {!isRegistered && (
            <>
              <div className="vat-row">
                <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 600 }}>Annual Revenue vs. Registration Threshold</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--t)" }}>{thresholdPct}%</span>
              </div>
              <div className="vat-track">
                <div className="vat-fill" style={{
                  width: `${thresholdPct}%`,
                  background: thresholdPct >= 85 ? "#ef4444" : thresholdPct >= 60 ? "#f59e0b" : "#22c55e"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t2)" }}>
                <span>{fmt(annualRevenue)} this year</span>
                <span>Threshold: {fmt(VAT_THRESHOLD)}/year</span>
              </div>
            </>
          )}

          <div className="vat-grid">
            <div className="vat-stat">
              <div className="vat-stat-lbl">VAT Collected</div>
              <div className="vat-stat-val" style={{ color: "#ef4444", fontSize: 12 }}>{fmt(vatCollected)}</div>
            </div>
            <div className="vat-stat">
              <div className="vat-stat-lbl">Input Tax Credits</div>
              <div className="vat-stat-val" style={{ color: "#22c55e", fontSize: 12 }}>{fmt(inputTaxCredits)}</div>
            </div>
            <div className="vat-stat">
              <div className="vat-stat-lbl">Net VAT Owing</div>
              <div className="vat-stat-val" style={{ color: BRAND, fontSize: 12 }}>{fmt(netVATOwing)}</div>
            </div>
          </div>

          {isRegistered && (
            <div className="vat-alert" style={{
              background: actualDaysUntilDue <= 5 ? "rgba(239,68,68,.08)" : "rgba(59,130,246,.06)",
              border: `1px solid ${actualDaysUntilDue <= 5 ? "rgba(239,68,68,.2)" : "rgba(59,130,246,.2)"}`,
              color: "var(--t2)"
            }}>
              {actualDaysUntilDue <= 5 ? "⚠️" : "📅"} VAT return due <strong>20th of this month</strong> — {actualDaysUntilDue} days remaining.
              Net owing: <strong style={{ color: BRAND }}>{fmt(netVATOwing)}</strong>. File via TRA Online Portal before midnight.
            </div>
          )}

          {exceedsThreshold && (
            <div className="vat-alert" style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#ef4444" }}>
              🚨 Your annual revenue has exceeded TSh 100,000,000. You are legally required to register for VAT with TRA immediately.
              Failure to register = penalties up to TSh 5,000,000. Add your TIN in Settings to confirm registration.
            </div>
          )}

          {isNearThreshold && !exceedsThreshold && (
            <div className="vat-alert" style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", color: "#f59e0b" }}>
              ⚠️ You're {thresholdPct}% toward the VAT registration threshold. At TSh {fmt(VAT_THRESHOLD - annualRevenue)} more in sales,
              you must register with TRA and begin charging 18% VAT. Prepare now — don't get caught.
            </div>
          )}

          {!isRegistered && !isNearThreshold && transactions.length === 0 && (
            <div className="vat-alert" style={{ background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.2)", color: "var(--t2)" }}>
              📊 Start making sales through the POS — your VAT position will be tracked automatically here.
            </div>
          )}

          {isRegistered && netVATOwing > 0 && (
            <button
              className="vat-btn"
              style={{ background: BRAND, color: "#fff", width: "100%" }}
              onClick={() => window.open("https://taxservices.tra.go.tz", "_blank")}
            >
              📡 File VAT Return on TRA Portal →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
