import { useState } from "react";

// ─── CREOVA SME OS — Main App Shell ──────────────────────────────────────────
// The complete navigation + routing + tier gating layer
// Wires all 20+ components together into one cohesive application
//
// USAGE:
//   import App from './App';
//   <App />
//
// TIER GATING:
//   checkAccess(feature, tier) returns true/false
//   All locked features show upgrade prompt instead of content
//
// ROUTE MAP:
//   / → Dashboard (MorningBriefing)
//   /pos → POS (POSSpeedPack)
//   /inventory → Inventory (OpsFeaturePack.StockOrderModal)
//   /cashbook → CashbookDashboard
//   /invoices → InvoiceManager
//   /mobile-money → MobileMoneyLedger [Growth+]
//   /customers → DebtFollowUpQueue
//   /staff → StaffManagement
//   /tax → TRACompliance + CompleteTaxDashboard
//   /akili → AkiliYaBiashara [Growth+]
//   /credit → CreditScoreCard
//   /formalize → FormalizationHub
//   /government → GovernmentDataDashboard
//   /skills → BusinessSkillsAcademy
//   /settings → SettingsPage
//   /eod → EndOfDayClose

import MorningBriefing from "./MorningBriefing";
import { QuickSaleModal, SplitPaymentModal, RepeatLastOrder } from "./POSSpeedPack";
import { StockOrderModal, StaffTracker, InvoiceGenerator } from "./OpsFeaturePack";
import { CashbookDashboard } from "./RemainingFeatures";
import InvoiceManager from "./InvoiceManager";
import MobileMoneyLedger from "./MobileMoneyLedger";
import DebtFollowUpQueue from "./DebtFollowUpQueue";
import StaffManagement from "./StaffManagement";
import TRACompliance from "./TRACompliance";
import { CompleteTaxDashboard, EFDZReport, USSDInterface, TierGating } from "./MissingFeatures";
import AkiliYaBiashara from "./AkiliYaBiashara";
import CreditScoreCard from "./CreditScoreCard";
import FormalizationHub from "./FormalizationHub";
import { GovernmentDataDashboard, ImpactReportingSuite, MicrofinanceCreditBridge } from "./GovernmentFeatures";
import BusinessSkillsAcademy from "./BusinessSkillsAcademy";
import SettingsPage from "./SettingsPage";
import NotificationCenter from "./NotificationCenter";
import OfflineStateUI from "./OfflineStateUI";
import EndOfDayClose from "./EndOfDayClose";
import WeeklyAIDigest from "./WeeklyAIDigest";
import { LoyaltySystem, TaxTracker } from "./LoyaltyAndTax";
import { KRAeTIMSInvoice, TANQRDisplay, PDPAConsentManager } from "./RemainingFeatures";
import { GovernmentDataDashboard as GovData } from "./GovernmentFeatures";

const BRAND = "#E56B0A";

// ── Tier access control ────────────────────────────────────────────────────────
const TIERS = { free:0, growth:1, business:2, enterprise:3 };

const FEATURE_REQUIREMENTS = {
  // Free tier (0) — everyone gets this
  pos:             0, inventory:        0, cashbook:     0,
  customers:       0, formalize:        0, settings:     0,
  notifications:   0, offline:          0, skills:       0,
  eod:             0, tan_qr:           0,
  // Growth tier (1)
  mobile_money:    1, akili_insights:   1, invoices:     1,
  debt_queue:      1, staff:            1, ussd:         1,
  loyalty:         1, weekly_digest:    1, efd_z_report: 1,
  // Business tier (2)
  tax_full:        2, tra_compliance:   2, akili_chat:   2,
  akili_predict:   2, credit_score:     2, etims_kenya:  2,
  government_data: 2, credit_bridge:    2, impact_report:2,
  // Enterprise tier (3)
  api_access:      3, custom_reports:   3, white_label:  3,
};

export function checkAccess(feature, tier = "free") {
  const tierLevel = TIERS[tier] ?? 0;
  const required  = FEATURE_REQUIREMENTS[feature] ?? 0;
  return tierLevel >= required;
}

// ── Navigation items ──────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    group: "Daily Operations",
    items: [
      { id:"dashboard",    icon:"🌅", label:"Dashboard",    labelSw:"Dashibodi",       tier:"free" },
      { id:"pos",          icon:"🛒", label:"Point of Sale", labelSw:"Mauzo",           tier:"free" },
      { id:"inventory",    icon:"📦", label:"Inventory",    labelSw:"Hisa",            tier:"free" },
      { id:"cashbook",     icon:"📒", label:"Cashbook",     labelSw:"Daftari la Pesa", tier:"free" },
      { id:"eod",          icon:"🌙", label:"End of Day",   labelSw:"Mwisho wa Siku",  tier:"free" },
    ],
  },
  {
    group: "Finance & Payments",
    items: [
      { id:"invoices",     icon:"📋", label:"Invoices",     labelSw:"Ankara",          tier:"growth" },
      { id:"mobile_money", icon:"📱", label:"Mobile Money", labelSw:"Pesa ya Simu",    tier:"growth" },
      { id:"tan_qr",       icon:"⬛", label:"TAN-QR Pay",   labelSw:"Lipa na QR",      tier:"free" },
      { id:"etims",        icon:"🇰🇪", label:"KRA eTIMS",   labelSw:"Kenya eTIMS",     tier:"business" },
    ],
  },
  {
    group: "Compliance & Tax",
    items: [
      { id:"tax",          icon:"🏛️", label:"TRA / Tax",   labelSw:"Kodi TRA",        tier:"business" },
      { id:"formalize",    icon:"📜", label:"Formalise",    labelSw:"Rasimisha",       tier:"free" },
      { id:"efd_z",        icon:"🧾", label:"EFD Z-Report", labelSw:"Ripoti ya EFD",   tier:"growth" },
      { id:"ussd",         icon:"📟", label:"USSD Mode",    labelSw:"Simu ya Kawaida", tier:"growth" },
    ],
  },
  {
    group: "People & AI",
    items: [
      { id:"customers",    icon:"👥", label:"Customers",    labelSw:"Wateja",          tier:"growth" },
      { id:"staff",        icon:"👷", label:"Staff",        labelSw:"Wafanyakazi",     tier:"growth" },
      { id:"akili",        icon:"🧠", label:"Akili AI",     labelSw:"Akili ya Biashara",tier:"growth" },
      { id:"credit",       icon:"💳", label:"Credit Score", labelSw:"Alama ya Mkopo",  tier:"business" },
    ],
  },
  {
    group: "Growth & Government",
    items: [
      { id:"government",   icon:"📊", label:"Gov Data",     labelSw:"Data ya Serikali",tier:"business" },
      { id:"skills",       icon:"📚", label:"Skills Academy",labelSw:"Shule ya Biashara",tier:"free" },
      { id:"loyalty",      icon:"⭐", label:"Loyalty",      labelSw:"Uaminifu",        tier:"growth" },
      { id:"impact",       icon:"🌍", label:"Impact Report", labelSw:"Ripoti ya Athari",tier:"business" },
    ],
  },
];

// ── Upgrade gate component ─────────────────────────────────────────────────────
function UpgradeGate({ feature, currentTier, onUpgrade }) {
  const required = Object.entries(TIERS).find(([k]) => TIERS[k] === FEATURE_REQUIREMENTS[feature])?.[0] || "growth";
  const PRICES = { growth:"TSh 7,500/mo", business:"TSh 30,000/mo", enterprise:"Custom" };

  return (
    <div style={{ padding:24, textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>🔒</div>
      <div style={{ fontSize:16, fontWeight:800, color:"var(--t)", marginBottom:6 }}>
        {required.charAt(0).toUpperCase() + required.slice(1)} plan required
      </div>
      <div style={{ fontSize:12, color:"var(--t2)", marginBottom:20, lineHeight:1.6 }}>
        Upgrade to {required} ({PRICES[required]}) to unlock this feature.
      </div>
      <button
        onClick={() => onUpgrade?.(required)}
        style={{ background:BRAND, color:"#fff", border:"none", borderRadius:10, padding:"11px 28px",
                 fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
        ✨ Upgrade to {required.charAt(0).toUpperCase() + required.slice(1)}
      </button>
    </div>
  );
}

// ── Page renderer ──────────────────────────────────────────────────────────────
function PageContent({ page, tier, onUpgrade, theme }) {
  const featureMap = {
    dashboard:   "pos",         pos:         "pos",
    inventory:   "inventory",   cashbook:    "cashbook",
    eod:         "eod",         invoices:    "invoices",
    mobile_money:"mobile_money", tan_qr:     "tan_qr",
    etims:       "etims_kenya", tax:         "tax_full",
    formalize:   "formalize",   efd_z:       "efd_z_report",
    ussd:        "ussd",        customers:   "debt_queue",
    staff:       "staff",       akili:       "akili_insights",
    credit:      "credit_score", government:  "government_data",
    skills:      "skills",      loyalty:     "loyalty",
    impact:      "impact_report", settings:  "settings",
  };

  const feature = featureMap[page];
  if (feature && !checkAccess(feature, tier)) {
    return <UpgradeGate feature={feature} currentTier={tier} onUpgrade={onUpgrade} />;
  }

  switch(page) {
    case "dashboard":    return <MorningBriefing theme={theme} />;
    case "pos":          return <QuickSaleModal theme={theme} onClose={() => {}} />;
    case "inventory":    return <StockOrderModal theme={theme} onClose={() => {}} />;
    case "cashbook":     return <CashbookDashboard theme={theme} />;
    case "eod":          return <EndOfDayClose theme={theme} onClose={() => {}} />;
    case "invoices":     return <InvoiceManager theme={theme} />;
    case "mobile_money": return <MobileMoneyLedger theme={theme} />;
    case "tan_qr":       return <TANQRDisplay theme={theme} />;
    case "etims":        return <KRAeTIMSInvoice theme={theme} />;
    case "tax":          return <TRACompliance theme={theme} />;
    case "formalize":    return <FormalizationHub theme={theme} />;
    case "efd_z":        return <EFDZReport theme={theme} />;
    case "ussd":         return <USSDInterface theme={theme} />;
    case "customers":    return <DebtFollowUpQueue theme={theme} />;
    case "staff":        return <StaffManagement theme={theme} />;
    case "akili":        return <AkiliYaBiashara theme={theme} />;
    case "credit":       return <CreditScoreCard theme={theme} />;
    case "government":   return <GovernmentDataDashboard theme={theme} />;
    case "skills":       return <BusinessSkillsAcademy theme={theme} />;
    case "loyalty":      return <LoyaltySystem theme={theme} />;
    case "impact":       return <ImpactReportingSuite theme={theme} />;
    case "settings":     return <SettingsPage theme={theme} />;
    case "pdpa":         return <PDPAConsentManager theme={theme} />;
    case "credit_bridge":return <MicrofinanceCreditBridge theme={theme} />;
    default:             return <MorningBriefing theme={theme} />;
  }
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [tier, setTier] = useState("free"); // "free"|"growth"|"business"|"enterprise"
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("both");
  const [navOpen, setNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const TIER_COLORS = { free:"var(--t2)", growth:"#22c55e", business:BRAND, enterprise:"#7c3aed" };
  const TIER_LABELS = { free:"Free", growth:"Growth", business:"Business", enterprise:"Enterprise" };

  const currentNavItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === page);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .app { font-family:'Plus Jakarta Sans',sans-serif; display:flex; flex-direction:column; min-height:100vh; }
    .app.dark  { --bg:#0f1117; --card:#1a1d27; --inp:#22263a; --border:#2e3347; --t:#f0f2ff; --t2:#7c85a8; --t3:#4a5170; background:var(--bg); }
    .app.light { --bg:#f4f5f9; --card:#fff;    --inp:#f8f9fc; --border:#e2e5ef; --t:#1a1d2e; --t2:#5b6380; --t3:#9ba3bf; background:var(--bg); }

    /* Header */
    .app-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--card); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:50; }
    .app-logo   { font-size:17px; font-weight:800; color:var(--t); }
    .app-logo span { color:${BRAND}; }
    .app-header-right { display:flex; align-items:center; gap:10px; }
    .tier-badge { font-size:10px; font-weight:800; padding:3px 10px; border-radius:20px; cursor:pointer; border:1px solid; }
    .header-btn { width:34px; height:34px; border-radius:9px; background:var(--inp); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; position:relative; }
    .notif-dot  { position:absolute; top:6px; right:6px; width:7px; height:7px; border-radius:50%; background:#ef4444; border:2px solid var(--card); }

    /* Bottom nav */
    .bottom-nav { display:flex; background:var(--card); border-top:1px solid var(--border); padding:8px 0 4px; position:sticky; bottom:0; z-index:50; }
    .bottom-nav-item { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:4px 2px; border:none; background:transparent; font-family:inherit; transition:opacity .15s; }
    .bottom-nav-item .bn-icon  { font-size:19px; }
    .bottom-nav-item .bn-label { font-size:9px; font-weight:700; color:var(--t2); white-space:nowrap; }
    .bottom-nav-item.active .bn-label { color:${BRAND}; }
    .bottom-nav-item.active .bn-icon  { filter:drop-shadow(0 0 4px ${BRAND}40); }

    /* Sidebar */
    .sidebar-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:100; }
    .sidebar { position:fixed; left:0; top:0; bottom:0; width:260px; background:var(--card); border-right:1px solid var(--border); z-index:101; overflow-y:auto; padding:16px 12px; animation:slideIn .2s ease; }
    @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
    .sidebar-group-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:var(--t3); padding:12px 8px 6px; }
    .sidebar-item { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:9px; cursor:pointer; border:none; background:transparent; font-family:inherit; width:100%; transition:background .15s; text-align:left; }
    .sidebar-item:hover { background:var(--inp); }
    .sidebar-item.active { background:rgba(229,107,10,.12); }
    .sidebar-item .si-icon  { font-size:16px; width:24px; text-align:center; flex-shrink:0; }
    .sidebar-item .si-label { font-size:12px; font-weight:600; color:var(--t); flex:1; }
    .sidebar-item .si-tier  { font-size:9px; font-weight:700; padding:1px 7px; border-radius:20px; }
    .locked-overlay { position:absolute; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:10; pointer-events:none; border-radius:inherit; }

    /* Page content */
    .page-wrap { flex:1; overflow-y:auto; padding:16px; padding-bottom:80px; }
    .page-header { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
    .page-title  { font-size:16px; font-weight:800; color:var(--t); }

    /* Offline banner */
    .offline-banner { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.2); border-radius:9px; padding:8px 14px; margin-bottom:12px; font-size:11px; color:#ef4444; font-weight:600; display:flex; align-items:center; gap:8px; }
  `;

  const BOTTOM_NAV = [
    { id:"dashboard", icon:"🌅", label:"Home" },
    { id:"pos",       icon:"🛒", label:"POS" },
    { id:"cashbook",  icon:"📒", label:"Books" },
    { id:"akili",     icon:"🧠", label:"Akili" },
    { id:"settings",  icon:"⚙️", label:"Settings" },
  ];

  const TIER_COLORS_FULL = {
    free:       {bg:"rgba(124,131,168,.1)",border:"rgba(124,131,168,.3)",color:"var(--t2)"},
    growth:     {bg:"rgba(34,197,94,.1)",border:"rgba(34,197,94,.3)",color:"#22c55e"},
    business:   {bg:`rgba(229,107,10,.1)`,border:`rgba(229,107,10,.3)`,color:BRAND},
    enterprise: {bg:"rgba(124,58,237,.1)",border:"rgba(124,58,237,.3)",color:"#7c3aed"},
  };
  const tc = TIER_COLORS_FULL[tier];

  return (
    <>
      <style>{css}</style>
      <div className={`app ${theme}`}>

        {/* Sidebar overlay */}
        {navOpen && (
          <>
            <div className="sidebar-overlay" onClick={() => setNavOpen(false)} />
            <div className="sidebar">
              {/* Sidebar header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>
                <div style={{fontSize:16,fontWeight:800,color:"var(--t)"}}>CREOVA <span style={{color:BRAND}}>SME OS</span></div>
                <button onClick={() => setNavOpen(false)} style={{background:"none",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:20,padding:0}}>×</button>
              </div>
              {/* Tier selector */}
              <div style={{background:"var(--inp)",borderRadius:10,padding:"9px 12px",marginBottom:12}}>
                <div style={{fontSize:9,fontWeight:700,color:"var(--t2)",textTransform:"uppercase",letterSpacing:".7px",marginBottom:7}}>Current Plan</div>
                <div style={{display:"flex",gap:4}}>
                  {["free","growth","business","enterprise"].map(t => {
                    const c = TIER_COLORS_FULL[t];
                    return (
                      <button key={t} onClick={() => {setTier(t);setNavOpen(false);}}
                        style={{flex:1,padding:"5px 2px",borderRadius:7,border:`1px solid ${tier===t?c.border:"var(--border)"}`,background:tier===t?c.bg:"transparent",color:tier===t?c.color:"var(--t2)",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Nav groups */}
              {NAV_GROUPS.map(group => (
                <div key={group.group}>
                  <div className="sidebar-group-label">{group.group}</div>
                  {group.items.map(item => {
                    const featureKey = Object.entries({
                      pos:"pos",inventory:"inventory",cashbook:"cashbook",eod:"eod",
                      invoices:"invoices",mobile_money:"mobile_money",tan_qr:"tan_qr",
                      etims:"etims_kenya",tax:"tax_full",formalize:"formalize",
                      efd_z:"efd_z_report",ussd:"ussd",customers:"debt_queue",
                      staff:"staff",akili:"akili_insights",credit:"credit_score",
                      government:"government_data",skills:"skills",loyalty:"loyalty",
                      impact:"impact_report",settings:"settings",
                    }).find(([k]) => k === item.id)?.[1] || "pos";
                    const locked = !checkAccess(featureKey, tier);
                    const TIER_REQ = { free:"Free",growth:"Growth",business:"Business",enterprise:"Enterprise" };
                    return (
                      <button key={item.id} className={`sidebar-item ${page===item.id?"active":""}`}
                        onClick={() => { setPage(item.id); setNavOpen(false); }}>
                        <span className="si-icon">{item.icon}</span>
                        <span className="si-label">{item.label}</span>
                        {locked && (
                          <span className="si-tier"
                            style={{background:"rgba(239,68,68,.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,.2)"}}>
                            🔒 {TIER_REQ[item.tier]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Header */}
        <header className="app-header">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={() => setNavOpen(true)}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"var(--t)",padding:0,lineHeight:1}}>
              ☰
            </button>
            <div className="app-logo">CREOVA <span>SME OS</span></div>
          </div>
          <div className="app-header-right">
            <span className="tier-badge"
              style={{background:tc.bg,borderColor:tc.border,color:tc.color}}
              onClick={() => setNavOpen(true)}>
              {TIER_LABELS[tier]}
            </span>
            <button className="header-btn" onClick={() => setTheme(t => t==="dark"?"light":"dark")}>
              {theme==="dark"?"☀️":"🌙"}
            </button>
            <button className="header-btn" onClick={() => setNotifOpen(!notifOpen)} style={{position:"relative"}}>
              🔔
              <div className="notif-dot" />
            </button>
          </div>
        </header>

        {/* Offline banner (demo) */}
        {false && (
          <div style={{padding:"0 16px 0"}}>
            <div className="offline-banner">
              📡 Working offline · 3 transactions queued · Will sync when connected
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="page-wrap">
          <PageContent page={page} tier={tier} onUpgrade={setTier} theme={theme} />
        </main>

        {/* Bottom nav */}
        <nav className="bottom-nav">
          {BOTTOM_NAV.map(item => {
            const isLocked = item.id === "akili" && !checkAccess("akili_insights", tier);
            return (
              <button key={item.id} className={`bottom-nav-item ${page===item.id?"active":""}`}
                onClick={() => setPage(item.id)}>
                <span className="bn-icon">{item.icon}{isLocked?"🔒":""}</span>
                <span className="bn-label" style={{color:page===item.id?BRAND:undefined}}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
