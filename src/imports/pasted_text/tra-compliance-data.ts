import { useState } from "react";

// ─── TRACompliance (Full System) ─────────────────────────────────────────────
// Tanzania-specific tax compliance engine
// Tabs: Overview | VAT Returns | EFD Receipts | Filing Calendar | Audit Log

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

const TIN = "123-456-789-T";
const VAT_RATE = 0.18;

const MONTHLY_DATA = [
  { month:"Oct 2024", revenue:920000, vatCollected:139560, inputVAT:42000, netVAT:97560, filed:true, filedDate:"2024-11-18", efdReceipts:186 },
  { month:"Nov 2024", revenue:1040000, vatCollected:157680, inputVAT:51000, netVAT:106680, filed:true, filedDate:"2024-12-17", efdReceipts:211 },
  { month:"Dec 2024", revenue:1380000, vatCollected:209304, inputVAT:68000, netVAT:141304, filed:true, filedDate:"2025-01-19", efdReceipts:278 },
  { month:"Jan 2025", revenue:980000, vatCollected:148680, inputVAT:44000, netVAT:104680, filed:true, filedDate:"2025-02-18", efdReceipts:197 },
  { month:"Feb 2025", revenue:1120000, vatCollected:169960, inputVAT:52000, netVAT:117960, filed:true, filedDate:"2025-03-17", efdReceipts:224 },
  { month:"Mar 2025", revenue:1284000, vatCollected:194772, inputVAT:58000, netVAT:136772, filed:false, filedDate:null, efdReceipts:261 },
];

const FILING_CALENDAR = [
  { type:"VAT Return", period:"March 2025", due:"2025-04-20", status:"upcoming", daysLeft:37 },
  { type:"PAYE (Staff Tax)", period:"March 2025", due:"2025-04-07", status:"upcoming", daysLeft:24 },
  { type:"SDL (Skills Dev. Levy)", period:"March 2025", due:"2025-04-07", status:"upcoming", daysLeft:24 },
  { type:"Provisional Income Tax", period:"Q1 2025", due:"2025-04-30", status:"upcoming", daysLeft:47 },
  { type:"VAT Return", period:"February 2025", due:"2025-03-20", status:"filed", daysLeft:0 },
  { type:"PAYE (Staff Tax)", period:"February 2025", due:"2025-03-07", status:"filed", daysLeft:0 },
  { type:"Annual Income Tax", period:"Year 2024", due:"2025-06-30", status:"upcoming", daysLeft:108 },
];

const AUDIT_LOG = [
  { date:"2025-03-14", time:"09:14", action:"EFD Receipt Issued", ref:"EFD-00261", amount:45000, status:"ok" },
  { date:"2025-03-14", time:"08:47", action:"EFD Receipt Issued", ref:"EFD-00260", amount:8500, status:"ok" },
  { date:"2025-03-13", time:"16:22", action:"VAT Return Filed", ref:"VAT-FEB-2025", amount:117960, status:"ok" },
  { date:"2025-03-13", time:"11:05", action:"EFD Receipt Voided", ref:"EFD-00258", amount:3200, status:"warn" },
  { date:"2025-03-12", time:"14:18", action:"Credit Note Issued", ref:"CN-00012", amount:12000, status:"warn" },
  { date:"2025-03-10", time:"09:00", action:"Input VAT Purchase Logged", ref:"PUR-00089", amount:15600, status:"ok" },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.tra-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.tra-root.dark {--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.tra-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.tra-tabs{display:flex;gap:4px;margin-bottom:16px;background:var(--inp);border-radius:11px;padding:3px}
.tra-tab{flex:1;padding:7px 5px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:none;font-family:inherit;background:transparent;color:var(--t2);transition:all .15s;text-align:center}
.tra-tab.active{background:${BRAND};color:#fff}
.tra-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${BRAND};margin-bottom:8px}
.tra-stat{background:var(--card);border:1px solid var(--border);border-radius:11px;padding:11px 13px}
.tra-stat-l{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--t2);margin-bottom:4px}
.tra-stat-v{font-size:16px;font-weight:800;color:var(--t)}
.tra-tin-card{background:linear-gradient(135deg,#0a0f1e,#0f1a10);border:1px solid rgba(229,107,10,.2);border-radius:14px;padding:18px;margin-bottom:14px;position:relative;overflow:hidden}
.tra-tin-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(229,107,10,.1),transparent 60%)}
.tra-vat-row{display:grid;grid-template-columns:70px 1fr 1fr 1fr 1fr 80px;gap:6px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)}
.tra-vat-row:last-child{border-bottom:none}
.tra-vat-head{font-size:9px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px}
.tra-badge{display:inline-flex;align-items:center;border-radius:20px;padding:3px 9px;font-size:9px;font-weight:800;border:1px solid}
.tra-filed{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.25);color:#22c55e}
.tra-pending{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.25);color:#ef4444}
.tra-upcoming{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.25);color:#f59e0b}
.tra-cal-row{display:flex;align-items:center;justify-content:space-between;background:var(--inp);border-radius:10px;padding:10px 13px;margin-bottom:7px}
.tra-audit-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);font-size:11px}
.tra-audit-row:last-child{border-bottom:none}
.tra-audit-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.tra-efd-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)}
.tra-efd-row:last-child{border-bottom:none}
.tra-btn{background:${BRAND};color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s}
.tra-btn:hover{background:#ff8c3a}
.tra-btn.out{background:transparent;border:1px solid var(--border);color:var(--t2)}
.tra-btn.out:hover{border-color:${BRAND};color:${BRAND}}
.tra-btn.grn{background:#22c55e}
.tra-progress{height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:6px}
.tra-progress-fill{height:100%;border-radius:3px;transition:width .4s}
`;

export default function TRACompliance({ theme = "dark" }) {
  const [tab, setTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [showExport, setShowExport] = useState(false);

  const totalVATPayable = MONTHLY_DATA.reduce((s, m) => s + m.netVAT, 0);
  const totalRevenue = MONTHLY_DATA.reduce((s, m) => s + m.revenue, 0);
  const filedCount = MONTHLY_DATA.filter(m => m.filed).length;
  const m = MONTHLY_DATA[selectedMonth];
  const upcomingCount = FILING_CALENDAR.filter(c => c.status === "upcoming").length;

  return (
    <>
      <style>{css}</style>
      <div className={`tra-root ${theme}`}>
        {/* Header */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>
            TRA <span style={{ color:BRAND }}>Compliance</span>
          </div>
          <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>
            Tanzania Revenue Authority · EFD + VAT + PAYE
          </div>
        </div>

        {/* Tabs */}
        <div className="tra-tabs">
          {[["overview","Overview"],["vat","VAT Returns"],["efd","EFD Receipts"],["calendar","Calendar"],["audit","Audit Log"]].map(([k,l]) => (
            <button key={k} className={`tra-tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* TIN card */}
            <div className="tra-tin-card">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".8px" }}>Registered Business</div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#fff", marginTop:3 }}>Duka la Mwanga</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:2 }}>TIN: {TIN}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>VAT Registered</div>
                  <span style={{ fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:20, background:"rgba(34,197,94,.15)", color:"#22c55e", border:"1px solid rgba(34,197,94,.3)", marginTop:4, display:"inline-block" }}>✓ Active</span>
                </div>
              </div>
              <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, position:"relative" }}>
                {[
                  ["6-Month Revenue", fmt(totalRevenue)],
                  ["VAT Collected", fmt(MONTHLY_DATA.reduce((s,m)=>s+m.vatCollected,0))],
                  ["Net VAT Payable", fmt(totalVATPayable)],
                ].map(([l,v]) => (
                  <div key={l} style={{ background:"rgba(255,255,255,.06)", borderRadius:9, padding:"9px 10px" }}>
                    <div style={{ fontSize:8, fontWeight:700, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:800, color:"#fff" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
              <div className="tra-stat">
                <div className="tra-stat-l">Returns Filed</div>
                <div className="tra-stat-v" style={{ color:"#22c55e" }}>{filedCount}/{MONTHLY_DATA.length}</div>
              </div>
              <div className="tra-stat">
                <div className="tra-stat-l">Upcoming Deadlines</div>
                <div className="tra-stat-v" style={{ color:"#f59e0b" }}>{upcomingCount}</div>
              </div>
              <div className="tra-stat">
                <div className="tra-stat-l">EFD Receipts</div>
                <div className="tra-stat-v">{MONTHLY_DATA.reduce((s,m)=>s+m.efdReceipts,0)}</div>
              </div>
            </div>

            {/* Compliance score */}
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>Compliance Score</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#22c55e" }}>92 / 100</div>
              </div>
              <div className="tra-progress">
                <div className="tra-progress-fill" style={{ width:"92%", background:"#22c55e" }} />
              </div>
              <div style={{ fontSize:11, color:"var(--t2)", marginTop:7, lineHeight:1.5 }}>
                Outstanding: 1 VAT return pending for March 2025. File before April 20 to stay compliant.
              </div>
            </div>

            {/* Upcoming actions */}
            <div className="tra-lbl">Action Required</div>
            {FILING_CALENDAR.filter(c => c.status === "upcoming").slice(0,3).map((c,i) => (
              <div key={i} className="tra-cal-row">
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--t)" }}>{c.type}</div>
                  <div style={{ fontSize:10, color:"var(--t2)", marginTop:1 }}>{c.period} · Due {c.due}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:"#f59e0b" }}>{c.daysLeft}d left</span>
                  <button className="tra-btn" style={{ fontSize:10, padding:"5px 10px" }}>File Now</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── VAT RETURNS ── */}
        {tab === "vat" && (
          <>
            {/* Month selector */}
            <div style={{ display:"flex", gap:5, marginBottom:14, flexWrap:"wrap" }}>
              {MONTHLY_DATA.map((m,i) => (
                <button key={m.month} onClick={() => setSelectedMonth(i)}
                  style={{ padding:"5px 10px", borderRadius:20, fontSize:10, fontWeight:700, cursor:"pointer", border:"1px solid var(--border)", background:selectedMonth===i?BRAND:"var(--card)", color:selectedMonth===i?"#fff":"var(--t2)", fontFamily:"inherit" }}>
                  {m.month}
                </button>
              ))}
            </div>

            {/* Selected month detail */}
            <div style={{ background:"var(--card)", border:`1px solid ${m.filed ? "rgba(34,197,94,.3)" : "rgba(239,68,68,.3)"}`, borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontSize:15, fontWeight:800, color:"var(--t)" }}>{m.month}</div>
                <span className={`tra-badge ${m.filed ? "tra-filed" : "tra-pending"}`}>
                  {m.filed ? `✓ Filed ${m.filedDate}` : "⚠️ Not Filed"}
                </span>
              </div>
              {[
                ["Total Revenue (excl. VAT)", fmt(m.revenue), "var(--t)"],
                ["Output VAT Collected (18%)", fmt(m.vatCollected), "var(--t)"],
                ["Input VAT (Purchases)", `− ${fmt(m.inputVAT)}`, "#22c55e"],
                ["Net VAT Payable to TRA", fmt(m.netVAT), "#ef4444"],
                ["EFD Receipts Issued", m.efdReceipts + " receipts", "var(--t)"],
              ].map(([l,v,c]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:"var(--t2)" }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:c }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                {!m.filed && <button className="tra-btn grn" style={{ flex:1 }}>✓ File VAT Return</button>}
                <button className="tra-btn out" style={{ flex:1 }} onClick={() => setShowExport(!showExport)}>
                  📊 Export
                </button>
              </div>
              {showExport && (
                <div style={{ marginTop:12, background:"var(--inp)", borderRadius:10, padding:12 }}>
                  {[
                    ["TRA ETIMS Upload File", "Direct upload to tra.go.tz", "🏛️"],
                    ["VAT Return PDF", "Print-ready summary", "📄"],
                    ["Excel Workbook", "Full transaction breakdown", "📊"],
                    ["Accountant Package", "All docs + bank rec", "📦"],
                  ].map(([l,d,ic]) => (
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ fontSize:16 }}>{ic}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--t)" }}>{l}</div>
                        <div style={{ fontSize:10, color:"var(--t2)" }}>{d}</div>
                      </div>
                      <button className="tra-btn" style={{ fontSize:10, padding:"5px 10px" }}>Export</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6-month summary table */}
            <div className="tra-lbl">6-Month Summary</div>
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div className="tra-vat-row" style={{ background:"var(--inp)", borderBottom:"1px solid var(--border)" }}>
                <span className="tra-vat-head">Month</span>
                <span className="tra-vat-head">Revenue</span>
                <span className="tra-vat-head">Output VAT</span>
                <span className="tra-vat-head">Input VAT</span>
                <span className="tra-vat-head">Net Payable</span>
                <span className="tra-vat-head">Status</span>
              </div>
              {[...MONTHLY_DATA].reverse().map((row, i) => (
                <div key={i} className="tra-vat-row" style={{ padding:"9px 0" }}>
                  <span style={{ fontSize:10, fontWeight:700, color:"var(--t)" }}>{row.month.replace(" 20","'")}</span>
                  <span style={{ fontSize:10, color:"var(--t2)" }}>{Math.round(row.revenue/1000)}K</span>
                  <span style={{ fontSize:10, color:"var(--t2)" }}>{Math.round(row.vatCollected/1000)}K</span>
                  <span style={{ fontSize:10, color:"#22c55e" }}>{Math.round(row.inputVAT/1000)}K</span>
                  <span style={{ fontSize:10, fontWeight:700, color:"#ef4444" }}>{Math.round(row.netVAT/1000)}K</span>
                  <span className={`tra-badge ${row.filed ? "tra-filed" : "tra-pending"}`} style={{ fontSize:8 }}>
                    {row.filed ? "Filed" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── EFD RECEIPTS ── */}
        {tab === "efd" && (
          <>
            <div style={{ background:"rgba(59,130,246,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:11, padding:"11px 14px", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#3b82f6", marginBottom:4 }}>What is EFD?</div>
              <div style={{ fontSize:11, color:"var(--t2)", lineHeight:1.5 }}>
                Businesses with annual turnover of TZS 14M+ must issue receipts through Electronic Fiscal Devices.{" "}
                Failure to issue an EFD receipt can lead to penalties up to TZS 4 million. Every sale in your POS generates a fiscalised receipt automatically.
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[
                ["This Month", "261", BRAND],
                ["Voided", "1", "#ef4444"],
                ["Credit Notes", "2", "#f59e0b"],
              ].map(([l,v,c]) => (
                <div className="tra-stat" key={l}>
                  <div className="tra-stat-l">{l}</div>
                  <div className="tra-stat-v" style={{ color:c }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="tra-lbl">Recent EFD Activity</div>
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"4px 14px" }}>
              {AUDIT_LOG.filter(l => l.action.includes("EFD") || l.action.includes("Receipt")).map((entry, i) => (
                <div key={i} className="tra-efd-row">
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"var(--t)" }}>{entry.action}</div>
                    <div style={{ fontSize:10, color:"var(--t2)", marginTop:1 }}>{entry.ref} · {entry.date} {entry.time}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:800, color: entry.status==="warn" ? "#f59e0b" : "var(--t)" }}>
                      {fmt(entry.amount)}
                    </div>
                    {entry.status === "warn" && <div style={{ fontSize:9, color:"#f59e0b", marginTop:1 }}>Review needed</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:14 }}>
              <div className="tra-lbl">EFD Integration Status</div>
              {[
                { label:"POS → EFD Link", status:"Connected", ok:true },
                { label:"TRA Portal Sync", status:"Last sync: Today 09:14", ok:true },
                { label:"Void Approval Required", status:"Enabled", ok:true },
                { label:"Daily Receipt Backup", status:"Active", ok:true },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:"var(--t)" }}>{item.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color: item.ok ? "#22c55e" : "#ef4444" }}>
                    {item.ok ? "✓" : "✗"} {item.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FILING CALENDAR ── */}
        {tab === "calendar" && (
          <>
            <div className="tra-lbl">Upcoming Deadlines</div>
            {FILING_CALENDAR.filter(c => c.status === "upcoming").map((c, i) => {
              const urgent = c.daysLeft <= 14;
              return (
                <div key={i} className="tra-cal-row" style={{ borderLeft:`3px solid ${urgent ? "#ef4444" : "#f59e0b"}`, borderRadius:"0 10px 10px 0" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:800, color:"var(--t)" }}>{c.type}</div>
                    <div style={{ fontSize:10, color:"var(--t2)", marginTop:2 }}>{c.period} · Deadline: {c.due}</div>
                    <div className="tra-progress" style={{ marginTop:6, maxWidth:160 }}>
                      <div className="tra-progress-fill" style={{ width:`${Math.min(100,((90-c.daysLeft)/90)*100)}%`, background: urgent ? "#ef4444" : "#f59e0b" }} />
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:10 }}>
                    <div style={{ fontSize:14, fontWeight:800, color: urgent ? "#ef4444" : "#f59e0b" }}>{c.daysLeft}d</div>
                    <button className="tra-btn" style={{ fontSize:10, padding:"5px 10px", marginTop:5 }}>File</button>
                  </div>
                </div>
              );
            })}

            <div className="tra-lbl" style={{ marginTop:16 }}>Completed</div>
            {FILING_CALENDAR.filter(c => c.status === "filed").map((c, i) => (
              <div key={i} className="tra-cal-row" style={{ opacity:0.7 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--t)" }}>{c.type} — {c.period}</div>
                  <div style={{ fontSize:10, color:"var(--t2)", marginTop:1 }}>Due {c.due}</div>
                </div>
                <span style={{ fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:20, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.2)", color:"#22c55e" }}>✓ Filed</span>
              </div>
            ))}
          </>
        )}

        {/* ── AUDIT LOG ── */}
        {tab === "audit" && (
          <>
            <div style={{ fontSize:11, color:"var(--t2)", marginBottom:14, lineHeight:1.5 }}>
              Complete tamper-proof log of all fiscally relevant actions. TRA requires records to be kept for at least 5 years.
            </div>
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"4px 14px" }}>
              {AUDIT_LOG.map((entry, i) => (
                <div key={i} className="tra-audit-row">
                  <div className="tra-audit-dot" style={{ background: entry.status === "warn" ? "#f59e0b" : entry.status === "error" ? "#ef4444" : "#22c55e" }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--t)" }}>{entry.action}</div>
                    <div style={{ fontSize:10, color:"var(--t2)", marginTop:1 }}>{entry.ref} · {entry.date} {entry.time}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:800, color: entry.status === "warn" ? "#f59e0b" : "var(--t)" }}>{fmt(entry.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, display:"flex", gap:8 }}>
              <button className="tra-btn" style={{ flex:1, justifyContent:"center" }}>⬇️ Export Full Log (5yr)</button>
              <button className="tra-btn out" style={{ flex:1, justifyContent:"center" }}>🔍 Search Log</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
