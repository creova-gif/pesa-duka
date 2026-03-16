import { useState } from "react";

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");
const fmtK = n => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? Math.round(n/1000)+"K" : n;

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.gov-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.gov-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.gov-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.gov-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${BRAND};margin-bottom:8px}
.gov-card{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:14px 16px;margin-bottom:10px}
.gov-stat{background:var(--card);border:1px solid var(--border);border-radius:11px;padding:11px 13px}
.gov-stat-l{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--t2);margin-bottom:4px}
.gov-stat-v{font-size:16px;font-weight:800;color:var(--t)}
.gov-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;display:inline-flex;align-items:center;gap:5px}
.gov-btn:hover{background:#ff8c3a}
.gov-btn.out{background:transparent;border:1px solid var(--border);color:var(--t2)}
.gov-btn.out:hover{border-color:${BRAND};color:${BRAND}}
.gov-btn.grn{background:#22c55e}
.gov-progress{height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:5px}
.gov-progress-fill{height:100%;border-radius:3px;transition:width .4s}
.gov-bar-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.gov-bar-label{font-size:11px;font-weight:600;color:var(--t2);min-width:80px}
.gov-bar-track{flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden}
.gov-bar-fill{height:100%;border-radius:4px;transition:width .4s}
.gov-bar-val{font-size:11px;font-weight:800;color:var(--t);min-width:30px;text-align:right}
.gov-map-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px}
.gov-map-cell{background:var(--inp);border-radius:8px;padding:8px 6px;text-align:center}
.gov-map-cell-label{font-size:9px;color:var(--t2);font-weight:600;margin-bottom:3px}
.gov-map-cell-val{font-size:13px;font-weight:800;color:var(--t)}
.gov-sdg-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
.gov-sdg-row:last-child{border-bottom:none}
.gov-sdg-badge{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0}
.gov-timeline-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
.gov-timeline-row:last-child{border-bottom:none}
.gov-timeline-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.gov-packet-section{background:var(--inp);border-radius:11px;padding:13px 15px;margin-bottom:10px}
.gov-packet-title{font-size:12px;font-weight:800;color:var(--t);margin-bottom:8px;display:flex;align-items:center;gap:7px}
.gov-packet-item{display:flex;align-items:center;justify-content:space-between;font-size:11px;padding:5px 0;border-bottom:1px solid var(--border)}
.gov-packet-item:last-child{border-bottom:none}
.gov-lender-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:13px 15px;margin-bottom:8px;display:flex;align-items:center;gap:12px}
.gov-lender-logo{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0}
`;

// ── GovernmentDataDashboard ──────────────────────────────────────────────────
// Anonymised aggregate SME data for SIDO, TIC, and policy researchers
const GOV_DATA = {
  totalShops: 847,
  activeShops: 734,
  totalRevenue: 1284000000,
  avgMonthlyRevenue: 1240000,
  totalTaxPaid: 228000000,
  totalEmployment: 2341,
  formalizationRate: 68,
  digitalPaymentAdoption: 82,
  avgCreditScore: 71,
  regions: [
    { name:"Kariakoo", shops:312, revenue:480000000, employment:934 },
    { name:"Kinondoni", shops:198, revenue:298000000, employment:594 },
    { name:"Ilala", shops:167, revenue:251000000, employment:501 },
    { name:"Temeke", shops:170, revenue:255000000, employment:312 },
  ],
  sectors: [
    { name:"Retail Dukas", pct:54, count:458 },
    { name:"Agro-dealers", pct:24, count:203 },
    { name:"Pharmacies", pct:12, count:102 },
    { name:"Food/Beverage", pct:10, count:84 },
  ],
  trend: [920, 1020, 1140, 1240, 1284],
};

export function GovernmentDataDashboard({ theme = "dark" }) {
  const [view, setView] = useState("overview");

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className={`gov-root ${theme}`}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>
              Dar SME <span style={{ color:BRAND }}>Data Portal</span>
            </div>
            <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
              For SIDO · TIC · CRDB · Policy researchers · Anonymised & aggregated
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <span style={{ fontSize:9, fontWeight:800, padding:"3px 9px", borderRadius:20, background:"rgba(34,197,94,.1)", color:"#22c55e", border:"1px solid rgba(34,197,94,.25)" }}>
              🔒 Anonymised
            </span>
          </div>
        </div>

        <div style={{ display:"flex", gap:5, marginBottom:14, flexWrap:"wrap" }}>
          {[["overview","Overview"],["regions","By Region"],["sectors","By Sector"],["impact","Impact"]].map(([k,l]) => (
            <button key={k} onClick={() => setView(k)}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer", border:"1px solid var(--border)", background:view===k?BRAND:"var(--card)", color:view===k?"#fff":"var(--t2)", fontFamily:"inherit" }}>
              {l}
            </button>
          ))}
        </div>

        {view === "overview" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:12 }}>
              {[
                ["Active Shops", GOV_DATA.activeShops + " / " + GOV_DATA.totalShops, "#22c55e"],
                ["Total Revenue (6mo)", fmt(GOV_DATA.totalRevenue), BRAND],
                ["Tax Collected (6mo)", fmt(GOV_DATA.totalTaxPaid), "#ef4444"],
                ["Jobs Supported", GOV_DATA.totalEmployment.toLocaleString(), "#3b82f6"],
              ].map(([l,v,c]) => (
                <div className="gov-stat" key={l}>
                  <div className="gov-stat-l">{l}</div>
                  <div className="gov-stat-v" style={{ color:c, fontSize:13 }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="gov-card">
              <div className="gov-lbl">Key Metrics</div>
              {[
                ["Formalisation Rate", GOV_DATA.formalizationRate, "#22c55e"],
                ["Digital Payment Adoption", GOV_DATA.digitalPaymentAdoption, BRAND],
                ["Avg Credit Score", GOV_DATA.avgCreditScore, "#f59e0b"],
                ["Monthly Growth Rate", 4.2, "#3b82f6"],
              ].map(([l,v,c]) => (
                <div className="gov-bar-row" key={l}>
                  <span className="gov-bar-label">{l}</span>
                  <div className="gov-bar-track">
                    <div className="gov-bar-fill" style={{ width:`${v}%`, background:c }} />
                  </div>
                  <span className="gov-bar-val">{v}%</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              <button className="gov-btn" style={{ flex:1, justifyContent:"center" }}>📊 Export for SIDO</button>
              <button className="gov-btn out" style={{ flex:1, justifyContent:"center" }}>📤 API Access</button>
            </div>
          </>
        )}

        {view === "regions" && (
          <>
            <div className="gov-lbl">Activity by Region — Dar es Salaam</div>
            {GOV_DATA.regions.map(r => (
              <div className="gov-card" key={r.name} style={{ padding:"12px 14px", marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{r.name}</div>
                  <div style={{ fontSize:11, color:"var(--t2)" }}>{r.shops} shops</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[["Revenue",fmt(r.revenue),"var(--t)"],["Employment",r.employment+" jobs","#22c55e"],["Shops",r.shops,"var(--brand)"]].map(([l,v,c]) => (
                    <div key={l} style={{ background:"var(--inp)", borderRadius:8, padding:"8px 9px" }}>
                      <div style={{ fontSize:8, fontWeight:700, color:"var(--t2)", textTransform:"uppercase", letterSpacing:".4px", marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:11, fontWeight:800, color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {view === "sectors" && (
          <>
            <div className="gov-lbl">Sector Breakdown</div>
            {GOV_DATA.sectors.map(s => (
              <div className="gov-bar-row" key={s.name}>
                <span style={{ fontSize:11, fontWeight:600, color:"var(--t2)", minWidth:100 }}>{s.name}</span>
                <div className="gov-bar-track">
                  <div className="gov-bar-fill" style={{ width:`${s.pct}%`, background:BRAND }} />
                </div>
                <span style={{ fontSize:11, fontWeight:800, color:"var(--t)", minWidth:70, textAlign:"right" }}>
                  {s.count} ({s.pct}%)
                </span>
              </div>
            ))}
          </>
        )}

        {view === "impact" && (
          <>
            <div className="gov-lbl">SDG Alignment</div>
            {[
              { sdg:"SDG 8", title:"Decent Work & Economic Growth", color:"#dc2626", metric:"2,341 jobs supported · 4.2% monthly growth" },
              { sdg:"SDG 1", title:"No Poverty", color:"#dc2626", metric:"68% of enrolled businesses now formalised" },
              { sdg:"SDG 10", title:"Reduced Inequalities", color:"#dc2626", metric:"54% women-owned businesses in platform" },
              { sdg:"SDG 17", title:"Partnerships for Goals", color:"#0369a1", metric:"SIDO + CRDB + TRA integrations active" },
            ].map(item => (
              <div className="gov-sdg-row" key={item.sdg}>
                <div className="gov-sdg-badge" style={{ background:item.color }}>{item.sdg}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--t)" }}>{item.title}</div>
                  <div style={{ fontSize:10, color:"var(--t2)", marginTop:1 }}>{item.metric}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

// ── ImpactReportingSuite ─────────────────────────────────────────────────────
// Auto-generated impact reports for SIDO, VC pitch, World Bank evaluation
export function ImpactReportingSuite({ theme = "dark" }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportType, setReportType] = useState("sido");

  const REPORT_TYPES = [
    { key:"sido", label:"SIDO Report", color:"#22c55e", desc:"For SIDO SME programme evaluation" },
    { key:"vc", label:"VC Pitch Pack", color:BRAND, desc:"For investor due diligence" },
    { key:"wb", label:"World Bank", color:"#3b82f6", desc:"SDG impact measurement format" },
    { key:"crdb", label:"CRDB Loan Pack", color:"#a855f7", desc:"Lender evaluation package" },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2000);
  };

  const IMPACT_METRICS = [
    { label:"Shops Digitised", value:"847", delta:"+124 this quarter", color:"#22c55e" },
    { label:"Jobs Supported", value:"2,341", delta:"+341 from platform adoption", color:"#3b82f6" },
    { label:"Tax Revenue Enabled", value:fmt(228000000), delta:"Collected via EFD receipts", color:"#ef4444" },
    { label:"Businesses Formalised", value:"576 / 847", delta:"68% formalisation rate", color:BRAND },
    { label:"Credit Access Unlocked", value:"213 businesses", delta:"Via credit score threshold", color:"#a855f7" },
    { label:"Women-Owned Businesses", value:"457 (54%)", delta:"Above national 51% average", color:"#f59e0b" },
  ];

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className={`gov-root ${theme}`}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>
            Impact <span style={{ color:BRAND }}>Reporting</span>
          </div>
          <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
            Auto-generated reports for government, investors, and development partners
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
          {REPORT_TYPES.map(rt => (
            <div key={rt.key}
              onClick={() => setReportType(rt.key)}
              style={{ background:"var(--card)", border:`1.5px solid ${reportType===rt.key?rt.color:"var(--border)"}`, borderRadius:12, padding:"11px 13px", cursor:"pointer", transition:"all .15s", background:reportType===rt.key?`${rt.color}08`:"var(--card)" }}>
              <div style={{ fontSize:12, fontWeight:800, color:reportType===rt.key?rt.color:"var(--t)" }}>{rt.label}</div>
              <div style={{ fontSize:10, color:"var(--t2)", marginTop:2 }}>{rt.desc}</div>
            </div>
          ))}
        </div>

        <div className="gov-card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>
              {REPORT_TYPES.find(r=>r.key===reportType)?.label} — Q1 2025
            </div>
            <button className="gov-btn" style={{ fontSize:11 }} onClick={handleGenerate} disabled={generating}>
              {generating ? "⏳ Generating…" : generated ? "↻ Regenerate" : "✨ Generate Report"}
            </button>
          </div>

          {!generated && !generating && (
            <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.6 }}>
              This report will include all impact metrics, business formalisation data, tax contributions,
              employment figures, and SDG alignment — formatted for {REPORT_TYPES.find(r=>r.key===reportType)?.desc.toLowerCase()}.
            </div>
          )}

          {generating && (
            <div style={{ display:"flex", alignItems:"center", gap:10, color:"var(--t2)", fontSize:12 }}>
              <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⏳</span>
              Aggregating data from 847 shops across Dar es Salaam…
            </div>
          )}

          {generated && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {IMPACT_METRICS.map(m => (
                  <div key={m.label} style={{ background:"var(--inp)", borderRadius:9, padding:"9px 11px" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"var(--t2)", textTransform:"uppercase", letterSpacing:".4px", marginBottom:3 }}>{m.label}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:m.color }}>{m.value}</div>
                    <div style={{ fontSize:10, color:"var(--t2)", marginTop:2 }}>{m.delta}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:10, padding:"11px 13px", marginBottom:12, fontSize:11, color:"var(--t2)", lineHeight:1.5 }}>
                ✅ Report generated · Includes executive summary, data appendix, and SDG alignment matrix
              </div>
              <div style={{ display:"flex", gap:7 }}>
                <button className="gov-btn" style={{ flex:1, justifyContent:"center" }}>📄 Download PDF</button>
                <button className="gov-btn out" style={{ flex:1, justifyContent:"center" }}>📧 Email to Partner</button>
                <button className="gov-btn out" style={{ flex:1, justifyContent:"center" }}>📊 Excel</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── MicrofinanceCreditBridge ─────────────────────────────────────────────────
// Lender-ready financial package for CRDB, NMB, SIDO loan programs
const LENDERS = [
  { name:"CRDB SME Loan", logo:"CR", color:"#dc2626", minScore:75, maxAmount:5000000, term:"6–24 months", rate:"18% p.a.", status:"eligible", requirements:["TIN + BRELA cert","6 months EFD receipts","Credit score 75+","Business plan"] },
  { name:"NMB Biashara", logo:"NM", color:"#1d4ed8", minScore:70, maxAmount:3000000, term:"3–12 months", rate:"20% p.a.", status:"eligible", requirements:["TIN certificate","3 months P&L","Credit score 70+","NSSF registration"] },
  { name:"SIDO Business Loan", logo:"SD", color:"#22c55e", minScore:60, maxAmount:2000000, term:"1–24 months", rate:"10% p.a.", status:"eligible", requirements:["SIDO registration","Business plan","Credit score 60+","2 guarantors"] },
  { name:"Pesapal Credit", logo:"PP", color:BRAND, minScore:65, maxAmount:1500000, term:"1–6 months", rate:"24% p.a.", status:"eligible", requirements:["6 months platform usage","Credit score 65+","Mobile money history"] },
];

export function MicrofinanceCreditBridge({ creditScore = 68, theme = "dark" }) {
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [packageReady, setPackageReady] = useState(false);

  const eligible = LENDERS.filter(l => creditScore >= l.minScore);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setPackageReady(true); }, 2200);
  };

  const PACKAGE_CONTENTS = [
    { section:"Business Profile", items:["Business name + BRELA registration", "TIN number + VAT status", "NIDA verification", "Location + ward details"] },
    { section:"6-Month Financials", items:["Monthly revenue trend", "Gross profit & margin", "Expense breakdown", "Cash flow projection"] },
    { section:"EFD Compliance", items:["1,357 EFD receipts issued", "100% EFD compliance rate", "Zero major audit violations", "TRA filing status: 5/6 months filed"] },
    { section:"Credit Profile", items:[`Credit score: ${creditScore}/100`, "Payment history (10 months)", "Customer debt repayment rate: 61%", "Credit utilisation trend"] },
  ];

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className={`gov-root ${theme}`}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>
            Credit <span style={{ color:BRAND }}>Bridge</span>
          </div>
          <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
            Generate a lender-ready financial package for any loan application
          </div>
        </div>

        {/* Eligibility summary */}
        <div style={{ background:"var(--card)", border:`1px solid rgba(34,197,94,.25)`, borderRadius:13, padding:16, marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>Your Eligibility</div>
            <span style={{ fontSize:11, fontWeight:800, color:"#22c55e", background:"rgba(34,197,94,.1)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(34,197,94,.25)" }}>
              {eligible.length} programs available
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <div style={{ width:50, height:50, borderRadius:"50%", background:`${creditScore>=75?"rgba(34,197,94,.1)":"rgba(245,158,11,.1)"}`, border:`2px solid ${creditScore>=75?"#22c55e":"#f59e0b"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:15, fontWeight:800, color:creditScore>=75?"#22c55e":"#f59e0b" }}>{creditScore}</span>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--t)" }}>Credit Score: {creditScore}/100</div>
              <div style={{ fontSize:10, color:"var(--t2)", marginTop:2 }}>
                {creditScore >= 75 ? "Excellent — all major programs available" : `${75-creditScore} points to unlock CRDB's largest loan`}
              </div>
            </div>
          </div>
        </div>

        {/* Lender list */}
        <div className="gov-lbl">Available Loan Programs</div>
        {LENDERS.map(l => {
          const isEligible = creditScore >= l.minScore;
          return (
            <div key={l.name} className="gov-lender-card"
              style={{ borderColor: selected===l.name?l.color:"var(--border)", cursor:"pointer", background:selected===l.name?`${l.color}06`:"var(--card)" }}
              onClick={() => setSelected(selected===l.name?null:l.name)}>
              <div className="gov-lender-logo" style={{ background:l.color }}>{l.logo}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{l.name}</span>
                  {isEligible
                    ? <span style={{ fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, background:"rgba(34,197,94,.1)", color:"#22c55e", border:"1px solid rgba(34,197,94,.2)" }}>Eligible</span>
                    : <span style={{ fontSize:9, color:"var(--t3)", fontWeight:600 }}>Need score {l.minScore}</span>}
                </div>
                <div style={{ fontSize:10, color:"var(--t2)", marginTop:2 }}>
                  Up to {fmt(l.maxAmount)} · {l.term} · {l.rate}
                </div>
              </div>
              {isEligible && <button className="gov-btn" style={{ fontSize:10, padding:"6px 12px", flexShrink:0 }}>Apply</button>}
            </div>
          );
        })}

        {/* Package generator */}
        <div className="gov-card" style={{ marginTop:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>Loan Application Package</div>
              <div style={{ fontSize:10, color:"var(--t2)", marginTop:2 }}>Auto-compile all documents lenders need</div>
            </div>
            <button className="gov-btn" style={{ fontSize:11 }} onClick={handleGenerate} disabled={generating}>
              {generating ? "⏳ Compiling…" : packageReady ? "↻ Refresh" : "📦 Generate Package"}
            </button>
          </div>

          {generating && (
            <div style={{ fontSize:11, color:"var(--t2)", lineHeight:1.5 }}>
              Compiling your 6-month financial history, EFD records, TIN status, and credit profile…
            </div>
          )}

          {packageReady && (
            <>
              {PACKAGE_CONTENTS.map(section => (
                <div className="gov-packet-section" key={section.section}>
                  <div className="gov-packet-title">
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }}></span>
                    {section.section}
                  </div>
                  {section.items.map(item => (
                    <div className="gov-packet-item" key={item}>
                      <span style={{ color:"var(--t2)" }}>{item}</span>
                      <span style={{ color:"#22c55e", fontWeight:700 }}>✓</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display:"flex", gap:7, marginTop:4 }}>
                <button className="gov-btn" style={{ flex:1, justifyContent:"center" }}>📄 Download Full Package</button>
                <button className="gov-btn out" style={{ flex:1, justifyContent:"center" }}>📧 Email to CRDB</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
