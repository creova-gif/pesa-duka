import { useState } from "react";

// ─── FormalizationHub ─────────────────────────────────────────────────────────
// Guided in-app business registration workflow
// Connects informal duka owners to BRELA, TRA (TIN), NIDA, NSSF
// This is the government's #1 measurable impact metric: formalization rate

const BRAND = "#E56B0A";

interface StepField {
  key: string;
  label: string;
  placeholder: string;
  type: string;
  options?: string[];
}

interface Step {
  id: string;
  title: string;
  subtitle: string;
  agency: string;
  agencyColor: string;
  required: boolean;
  description: string;
  fields: StepField[];
  action: string;
  actionColor: string;
  tip: string;
  docLink: string;
  fee: string;
  duration: string;
}

const STEPS: Step[] = [
  {
    id: "nida",
    title: "NIDA National ID",
    subtitle: "Verify your identity first",
    agency: "NIDA",
    agencyColor: "#3b82f6",
    required: true,
    description: "Your NIDA number (NIN) is required for all business registration in Tanzania. It links your business to your national identity.",
    fields: [
      { key: "nin", label: "National ID Number (NIN)", placeholder: "19XXXXXXXXXXXXXXXXX", type: "text" },
      { key: "dob", label: "Date of Birth", placeholder: "DD/MM/YYYY", type: "date" },
      { key: "fullName", label: "Full Name (as on NIDA card)", placeholder: "First Middle Last", type: "text" },
    ],
    action: "Verify with NIDA →",
    actionColor: "#3b82f6",
    tip: "You can get your NIN via USSD: *152*00# on Vodacom or Airtel. Or visit nida.go.tz",
    docLink: "https://www.nida.go.tz",
    fee: "Free",
    duration: "Immediate",
  },
  {
    id: "tin",
    title: "TIN Number (TRA)",
    subtitle: "Tax Identification Number",
    agency: "TRA",
    agencyColor: "#ef4444",
    required: true,
    description: "Your TIN enables you to file tax returns, issue EFD receipts, and access government contracts. Required for BRELA registration.",
    fields: [
      { key: "tin", label: "TIN Number (if already have one)", placeholder: "123-456-789", type: "text" },
    ],
    action: "Apply for TIN at TRA →",
    actionColor: "#ef4444",
    tip: "Apply online at efiling.tra.go.tz or visit your nearest TRA office. Takes 1–3 business days.",
    docLink: "https://www.tra.go.tz",
    fee: "Free",
    duration: "1–3 days",
  },
  {
    id: "brela",
    title: "BRELA Business Registration",
    subtitle: "Official business name registration",
    agency: "BRELA",
    agencyColor: BRAND,
    required: true,
    description: "Register your business name with the Business Registrations and Licensing Agency. This makes your business a legal entity and protects your business name across Tanzania.",
    fields: [
      { key: "bizName1", label: "Preferred Business Name", placeholder: "e.g. Duka la Mwanga", type: "text" },
      { key: "bizName2", label: "Alternative Name (in case taken)", placeholder: "e.g. Mwanga General Store", type: "text" },
      { key: "bizType", label: "Business Type", placeholder: "", type: "select", options: ["Sole Proprietorship", "Partnership", "Private Company (Ltd)"] },
      { key: "bizActivity", label: "Main Business Activity", placeholder: "e.g. Retail trade - general goods", type: "text" },
      { key: "bizAddress", label: "Business Address", placeholder: "Ward, Street, Region", type: "text" },
    ],
    action: "Register on BRELA ORS →",
    actionColor: BRAND,
    tip: "Name search on BRELA ORS is free. Registration fees: sole proprietorship TZS 22,600, company from TZS 82,000.",
    docLink: "https://ors.brela.go.tz",
    fee: "From TSh 22,600",
    duration: "24–48 hours",
  },
  {
    id: "nssf",
    title: "NSSF Registration",
    subtitle: "National Social Security Fund",
    agency: "NSSF",
    agencyColor: "#22c55e",
    required: false,
    description: "Register your employees for NSSF contributions. Required if you have staff. Employer contributes 10%, employee 10% of gross salary.",
    fields: [
      { key: "empCount", label: "Number of Employees", placeholder: "0", type: "number" },
    ],
    action: "Register at NSSF →",
    actionColor: "#22c55e",
    tip: "Registration is free. NSSF contributions protect your staff with pension and medical benefits — it also increases your credit score.",
    docLink: "https://www.nssf.or.tz",
    fee: "Free registration",
    duration: "Same day",
  },
  {
    id: "municipal",
    title: "Business Licence",
    subtitle: "Municipal / Local Government",
    agency: "Municipal Council",
    agencyColor: "#a855f7",
    required: true,
    description: "Obtain your trading licence from your local Municipal Council. Required annually. Fees depend on your business type and location.",
    fields: [
      { key: "ward", label: "Ward / Mtaa", placeholder: "e.g. Kariakoo Ward", type: "text" },
      { key: "district", label: "District Council", placeholder: "e.g. Ilala Municipal Council", type: "text" },
    ],
    action: "Apply at Municipal Council →",
    actionColor: "#a855f7",
    tip: "Bring: BRELA certificate, TIN certificate, NIN card, 2 passport photos. Renewed annually.",
    docLink: "https://business.go.tz",
    fee: "TZS 50,000–200,000",
    duration: "Same day",
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.fh-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.fh-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.fh-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}

.fh-hero{background:linear-gradient(135deg,#0a1a0f,#0f1a10);border:1px solid rgba(34,197,94,.2);border-radius:16px;padding:20px;margin-bottom:16px;position:relative;overflow:hidden}
.fh-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(34,197,94,.08),transparent 60%)}
.fh-progress-track{height:6px;background:rgba(255,255,255,.1);border-radius:3px;margin-top:14px;overflow:hidden;position:relative}
.fh-progress-fill{height:100%;background:#22c55e;border-radius:3px;transition:width .5s}
.fh-step-dots{display:flex;gap:8px;margin-top:10px}
.fh-dot{width:8px;height:8px;border-radius:50%;transition:all .2s}
.fh-dot.done{background:#22c55e}
.fh-dot.active{background:${BRAND};width:20px;border-radius:4px}
.fh-dot.pending{background:rgba(255,255,255,.2)}

.fh-step-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:12px}
.fh-step-header{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;cursor:pointer}
.fh-step-number{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0}
.fh-step-header-text{flex:1}
.fh-step-title{font-size:14px;font-weight:800;color:var(--t)}
.fh-step-sub{font-size:11px;color:var(--t2);margin-top:1px}
.fh-step-meta{display:flex;align-items:center;gap:8px;flex-shrink:0}
.fh-agency-badge{font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;border:1px solid}
.fh-status-icon{font-size:16px}

.fh-step-body{padding:18px}
.fh-desc{font-size:12px;color:var(--t2);line-height:1.6;margin-bottom:14px}
.fh-field{margin-bottom:12px}
.fh-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:${BRAND};margin-bottom:6px;display:block}
.fh-input{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;color:var(--t);font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .15s}
.fh-input:focus{border-color:${BRAND}}
.fh-select{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;color:var(--t);font-family:inherit;outline:none;appearance:none;transition:border-color .15s}
.fh-tip{background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.2);border-radius:10px;padding:10px 13px;margin-bottom:14px;font-size:11px;color:var(--t2);line-height:1.5}
.fh-fee-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.fh-fee-box{background:var(--inp);border-radius:9px;padding:9px 12px}
.fh-fee-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--t2);margin-bottom:3px}
.fh-fee-value{font-size:13px;font-weight:800;color:var(--t)}
.fh-actions{display:flex;gap:8px}
.fh-btn-primary{flex:1;border:none;border-radius:9px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;color:#fff}
.fh-btn-primary:hover{opacity:.9}
.fh-btn-done{background:#22c55e;color:#fff;border:none;border-radius:9px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
.fh-btn-skip{background:var(--inp);color:var(--t2);border:1px solid var(--border);border-radius:9px;padding:10px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit}

.fh-complete{background:linear-gradient(135deg,#0a1a0f,#0f2010);border:1px solid rgba(34,197,94,.3);border-radius:16px;padding:24px;text-align:center}
.fh-score-ring{width:80px;height:80px;margin:0 auto 14px;position:relative}
`;

export default function FormalizationHub({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [openStep, setOpenStep] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});

  const completedCount = Object.values(completed).filter(Boolean).length;
  const requiredCount = STEPS.filter(s => s.required).length;
  const requiredDone = STEPS.filter(s => s.required && completed[s.id]).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  const markDone = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: true }));
    const nextIdx = STEPS.findIndex(s => s.id === id) + 1;
    if (nextIdx < STEPS.length) setOpenStep(nextIdx);
  };

  const updateField = (stepId: string, key: string, value: string) => {
    setFormData(prev => ({ ...prev, [`${stepId}_${key}`]: value }));
  };

  const allRequiredDone = requiredDone === requiredCount;

  return (
    <>
      <style>{css}</style>
      <div className={`fh-root ${theme}`}>
        {/* Hero */}
        <div className="fh-hero">
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>
              Business Formalisation
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
              {allRequiredDone ? "✅ You're fully registered!" : `${completedCount} of ${STEPS.length} steps complete`}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 3 }}>
              {allRequiredDone
                ? "Your business is legally registered in Tanzania."
                : `${requiredDone}/${requiredCount} required steps done · ${STEPS.length - completedCount} remaining`}
            </div>
            <div className="fh-progress-track">
              <div className="fh-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="fh-step-dots">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`fh-dot ${completed[s.id] ? "done" : openStep === i ? "active" : "pending"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const isOpen = openStep === idx;
          const isDone = completed[step.id];
          return (
            <div key={step.id} className="fh-step-card">
              <div className="fh-step-header" onClick={() => setOpenStep(isOpen ? -1 : idx)}>
                <div className="fh-step-number"
                  style={{ background: isDone ? "rgba(34,197,94,.12)" : `rgba(${step.agencyColor === "#ef4444" ? "239,68,68" : step.agencyColor === "#3b82f6" ? "59,130,246" : "229,107,10"},.12)`, color: isDone ? "#22c55e" : step.agencyColor }}>
                  {isDone ? "✓" : idx + 1}
                </div>
                <div className="fh-step-header-text">
                  <div className="fh-step-title" style={{ color: isDone ? "#22c55e" : "var(--t)" }}>{step.title}</div>
                  <div className="fh-step-sub">{step.subtitle}</div>
                </div>
                <div className="fh-step-meta">
                  <span className="fh-agency-badge"
                    style={{ background: `${step.agencyColor}15`, borderColor: `${step.agencyColor}30`, color: step.agencyColor }}>
                    {step.agency}
                  </span>
                  {!step.required && (
                    <span style={{ fontSize: 9, color: "var(--t3)", fontWeight: 600 }}>Optional</span>
                  )}
                  <span className="fh-status-icon">{isDone ? "✅" : isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {isOpen && (
                <div className="fh-step-body">
                  <div className="fh-desc">{step.description}</div>

                  <div className="fh-fee-row">
                    <div className="fh-fee-box">
                      <div className="fh-fee-label">Fee</div>
                      <div className="fh-fee-value">{step.fee}</div>
                    </div>
                    <div className="fh-fee-box">
                      <div className="fh-fee-label">Processing Time</div>
                      <div className="fh-fee-value">{step.duration}</div>
                    </div>
                  </div>

                  {step.fields.map(field => (
                    <div className="fh-field" key={field.key}>
                      <label className="fh-label">{field.label}</label>
                      {field.type === "select" ? (
                        <select className="fh-select"
                          value={formData[`${step.id}_${field.key}`] || ""}
                          onChange={e => updateField(step.id, field.key, e.target.value)}>
                          <option value="">Select...</option>
                          {field.options?.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          className="fh-input"
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[`${step.id}_${field.key}`] || ""}
                          onChange={e => updateField(step.id, field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}

                  <div className="fh-tip">💡 {step.tip}</div>

                  <div className="fh-actions">
                    <button
                      className="fh-btn-primary"
                      style={{ background: step.actionColor }}
                      onClick={() => window.open(step.docLink, "_blank")}>
                      {step.action}
                    </button>
                    <button className="fh-btn-done" onClick={() => markDone(step.id)}>
                      ✓ Mark Done
                    </button>
                    {!step.required && (
                      <button className="fh-btn-skip" onClick={() => setOpenStep(idx + 1)}>
                        Skip
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Completion card */}
        {allRequiredDone && (
          <div className="fh-complete">
            <div style={{ fontSize: 40, marginBottom: 12, position: "relative" }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#22c55e", position: "relative" }}>
              Biashara Yako ni Rasmi!
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 6, lineHeight: 1.6, position: "relative" }}>
              Your business is now legally registered. This unlocks access to government loans,
              formal supplier accounts, and your Credit Score has improved by +12 points.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
              <button style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                📊 View Credit Score
              </button>
              <button style={{ background: "transparent", border: "1px solid rgba(34,197,94,.3)", color: "#22c55e", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                📤 Share Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
