import { useState } from "react";

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.lx-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.lx-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.lx-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.lx-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;display:inline-flex;align-items:center;gap:6px}
.lx-btn:hover{background:#ff8c3a}
.lx-btn.full{width:100%;justify-content:center}
.lx-btn.outline{background:transparent;border:1px solid var(--border);color:var(--t2)}
.lx-btn.outline:hover{border-color:${BRAND};color:${BRAND}}
`;

const SAMPLE_TAX = [
  { month:"Jan 2025", revenue:980000, vatCollected:148654, vatPayable:88000, filed:true },
  { month:"Feb 2025", revenue:1120000, vatCollected:170169, vatPayable:102000, filed:true },
  { month:"Mar 2025", revenue:1284000, vatCollected:195051, vatPayable:117000, filed:false },
];

export function TaxTracker({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [activeMonth, setActiveMonth] = useState(2);
  const [showExport, setShowExport] = useState(false);
  const month = SAMPLE_TAX[activeMonth];
  const totalVAT = SAMPLE_TAX.reduce((s, m) => s + m.vatPayable, 0);

  return (
    <>
      <style>{BASE_CSS + `
        .tax-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px}
        .tra-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)}
        .tra-row:last-child{border-bottom:none}
        .month-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
        .month-tab{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--t2);font-family:inherit;transition:all .15s}
        .month-tab.active{background:${BRAND};color:#fff;border-color:${BRAND}}
        .filed-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px}
        .filed-badge.yes{background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.2)}
        .filed-badge.no{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2)}
        .export-modal{background:var(--inp);border:1px solid var(--border);border-radius:12px;padding:16px;margin-top:12px}
      `}</style>
      <div className={`lx-root ${theme}`}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:18, fontWeight:800, color:BRAND }}>Tax & TRA Compliance</div>
          <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>VAT tracking and TRA-ready exports</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
          {[
            { label:"2025 VAT Payable", value:fmt(totalVAT), color:"#ef4444" },
            { label:"Filed Months", value:`${SAMPLE_TAX.filter(m=>m.filed).length}/${SAMPLE_TAX.length}`, color:"#22c55e" },
            { label:"Next Deadline", value:"20 Apr", color:BRAND },
          ].map(s => (
            <div className="tax-card" key={s.label}>
              <div style={{ fontSize:9, fontWeight:700, color:"var(--t2)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:15, fontWeight:800, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="month-tabs">
          {SAMPLE_TAX.map((m, i) => (
            <button key={m.month} className={`month-tab ${activeMonth===i?"active":""}`}
              onClick={() => setActiveMonth(i)}>{m.month}</button>
          ))}
        </div>

        <div className="tax-card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"var(--t)" }}>{month.month}</div>
            <span className={`filed-badge ${month.filed?"yes":"no"}`}>
              {month.filed ? "✓ Filed" : "⚠️ Pending"}
            </span>
          </div>
          <div className="tra-row">
            <span style={{ fontSize:12, color:"var(--t2)", fontWeight:600 }}>Total Revenue</span>
            <span style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{fmt(month.revenue)}</span>
          </div>
          <div className="tra-row">
            <span style={{ fontSize:12, color:"var(--t2)", fontWeight:600 }}>VAT Collected (18%)</span>
            <span style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{fmt(month.vatCollected)}</span>
          </div>
          <div className="tra-row">
            <span style={{ fontSize:12, color:"var(--t2)", fontWeight:600 }}>VAT Payable to TRA</span>
            <span style={{ fontSize:14, fontWeight:800, color:"#ef4444" }}>{fmt(month.vatPayable)}</span>
          </div>

          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="lx-btn" style={{ flex:1, justifyContent:"center" }}
              onClick={() => setShowExport(!showExport)}>
              📊 Export TRA Report
            </button>
            {!month.filed && (
              <button className="lx-btn outline" style={{ flex:1, justifyContent:"center" }}>
                ✓ Mark as Filed
              </button>
            )}
          </div>

          {showExport && (
            <div className="export-modal">
              <div style={{ fontSize:11, fontWeight:700, color:BRAND, textTransform:"uppercase", letterSpacing:".6px", marginBottom:10 }}>Export Options</div>
              {[
                { label:"TRA ETIMS Format", desc:"Ready to upload to TRA portal", icon:"🏛️" },
                { label:"PDF Summary", desc:"Print-ready tax summary", icon:"📄" },
                { label:"Excel Breakdown", desc:"Full transaction-level detail", icon:"📊" },
              ].map(opt => (
                <div key={opt.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:18 }}>{opt.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"var(--t)" }}>{opt.label}</div>
                    <div style={{ fontSize:11, color:"var(--t2)" }}>{opt.desc}</div>
                  </div>
                  <button className="lx-btn" style={{ fontSize:11, padding:"6px 12px" }}>Export</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background:"rgba(59,130,246,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"12px 14px", marginTop:4 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#3b82f6", marginBottom:4 }}>💡 Tax tip</div>
          <div style={{ fontSize:11, color:"var(--t2)", lineHeight:1.5 }}>
            Register with TRA for a TIN number if you haven't already — it's free, takes 1 day,
            and unlocks access to government SME loans and formal supplier accounts.
          </div>
        </div>
      </div>
    </>
  );
}