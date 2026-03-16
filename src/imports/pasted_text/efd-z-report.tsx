import { useState } from "react";

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

// ─── EFD Z-Report Generator ───────────────────────────────────────────────────
// Spec: "Generate fiscal receipts with unique identifiers, built-in GPRS
//        transmission to TRA, automatic daily Z reports"
// Z Report = end-of-day fiscal summary REQUIRED by TRA for all EFD users

const SAMPLE_EFD_DAY = {
  date: "2025-03-14",
  deviceSerial: "EFD-TZ-20241122-0047",
  tin: "123-456-789-T",
  businessName: "Duka la Mwanga",
  zReportNumber: "Z-00234",
  totalSales: 312800,
  totalVAT: 47258,
  totalExempt: 0,
  totalReceipts: 34,
  firstReceipt: "EFD-00228",
  lastReceipt: "EFD-00261",
  voidedReceipts: 1,
  voidedAmount: 3200,
  transmitted: true,
  transmissionTime: "2025-03-14T22:01:34Z",
  traConfirmCode: "TRA-CONF-20250314-8821",
};

export function EFDZReport({ theme = "dark", data = SAMPLE_EFD_DAY }) {
  const [generating, setGenerating] = useState(false);
  const [sent, setSent] = useState(data.transmitted);

  const handleTransmit = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setSent(true); }, 2000);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
    .efd-root{font-family:'Plus Jakarta Sans',sans-serif}
    .efd-root.dark{--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
    .efd-root.light{--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
    .efd-receipt{background:var(--inp);border:1px solid var(--border);border-radius:12px;padding:20px;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:2}
    .efd-row{display:flex;justify-content:space-between;color:var(--t2)}
    .efd-divider{border:none;border-top:1px dashed var(--border);margin:8px 0}
    .efd-total-row{display:flex;justify-content:space-between;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--t)}
    .efd-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s}
    .efd-btn:hover{background:#ff8c3a}
    .efd-btn.grn{background:#22c55e}
  `;

  return (
    <>
      <style>{css}</style>
      <div className={`efd-root ${theme}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t)" }}>
              EFD <span style={{ color: BRAND }}>Z-Report</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
              Daily fiscal summary · Required by TRA · {data.date}
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
            background: sent ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)",
            border: `1px solid ${sent ? "rgba(34,197,94,.25)" : "rgba(239,68,68,.25)"}`,
            color: sent ? "#22c55e" : "#ef4444" }}>
            {sent ? "✓ Transmitted to TRA" : "⚠️ Not Transmitted"}
          </span>
        </div>

        <div className="efd-receipt">
          <div style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t)" }}>{data.businessName}</div>
            <div style={{ fontSize: 10, color: "var(--t2)" }}>TIN: {data.tin}</div>
            <div style={{ fontSize: 10, color: "var(--t2)" }}>EFD Serial: {data.deviceSerial}</div>
          </div>
          <hr className="efd-divider" />
          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--t)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            *** Z REPORT — {data.date} ***
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: BRAND }}>Report No: {data.zReportNumber}</div>
          <hr className="efd-divider" />
          <div className="efd-row"><span>Total Receipts Issued:</span><span style={{ color: "var(--t)" }}>{data.totalReceipts}</span></div>
          <div className="efd-row"><span>First Receipt:</span><span style={{ color: "var(--t)" }}>{data.firstReceipt}</span></div>
          <div className="efd-row"><span>Last Receipt:</span><span style={{ color: "var(--t)" }}>{data.lastReceipt}</span></div>
          <div className="efd-row"><span>Voided Receipts:</span><span style={{ color: data.voidedReceipts > 0 ? "#ef4444" : "var(--t)" }}>{data.voidedReceipts} ({fmt(data.voidedAmount)})</span></div>
          <hr className="efd-divider" />
          <div className="efd-row"><span>Gross Sales:</span><span style={{ color: "var(--t)" }}>{fmt(data.totalSales)}</span></div>
          <div className="efd-row"><span>VAT-Exempt Sales:</span><span style={{ color: "var(--t)" }}>{fmt(data.totalExempt)}</span></div>
          <div className="efd-row"><span>VAT (18%) Collected:</span><span style={{ color: "#ef4444", fontWeight: 700 }}>{fmt(data.totalVAT)}</span></div>
          <hr className="efd-divider" />
          <div className="efd-total-row">
            <span>NET SALES:</span>
            <span>{fmt(data.totalSales - data.totalVAT)}</span>
          </div>
          <div className="efd-total-row">
            <span>GROSS INCL. VAT:</span>
            <span>{fmt(data.totalSales)}</span>
          </div>
          {sent && (
            <>
              <hr className="efd-divider" />
              <div style={{ textAlign: "center", fontSize: 10, color: "#22c55e" }}>
                ✓ TRANSMITTED: {new Date(data.transmissionTime).toLocaleString("en-TZ")}
              </div>
              <div style={{ textAlign: "center", fontSize: 9, color: "var(--t2)" }}>
                TRA CONF: {data.traConfirmCode}
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {!sent ? (
            <button className="efd-btn" style={{ flex: 1 }} onClick={handleTransmit} disabled={generating}>
              {generating ? "📡 Transmitting to TRA..." : "📡 Transmit Z-Report to TRA"}
            </button>
          ) : (
            <button className="efd-btn grn" style={{ flex: 1 }}>✓ Z-Report Confirmed</button>
          )}
          <button style={{ background: "var(--inp)", border: "1px solid var(--border)", color: "var(--t2)", borderRadius: 9, padding: "10px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            🖨️ Print
          </button>
        </div>

        <div style={{ marginTop: 12, background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.2)", borderRadius: 10, padding: "10px 13px", fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>
          💡 TRA requires Z-Reports to be transmitted daily before midnight. Failure = penalty up to TZS 4M.
          This app transmits automatically at 11:30pm if not done manually.
        </div>
      </div>
    </>
  );
}

// ─── CompleteTaxDashboard ─────────────────────────────────────────────────────
// Spec: "VAT (18%), SDL (4%), PAYE, and WHT in a unified dashboard"
// Adds SDL and PAYE to the existing TRA compliance component

export function CompleteTaxDashboard({ theme = "dark" }) {
  const [month, setMonth] = useState("Mar 2025");
  const revenue = 1284000;
  const grossSalaries = 420000; // 3 staff
  const vatRate = 0.18, sdlRate = 0.04;
  const vatPayable = Math.round(revenue * vatRate);
  const sdlPayable = Math.round(grossSalaries * sdlRate);
  
  // PAYE brackets (Tanzania 2024/25) - monthly
  const payeBrackets = [
    { from: 0, to: 270000, rate: 0, label: "0% (below threshold)" },
    { from: 270001, to: 520000, rate: 0.08, label: "8%" },
    { from: 520001, to: 760000, rate: 0.20, label: "20%" },
    { from: 760001, to: 1000000, rate: 0.25, label: "25%" },
    { from: 1000001, to: Infinity, rate: 0.30, label: "30%" },
  ];
  const staffSalaries = [
    { name: "Amina Hassan", gross: 180000, role: "Owner" },
    { name: "Juma Bakari", gross: 140000, role: "Cashier" },
    { name: "Fatuma Ali", gross: 100000, role: "Cashier" },
  ];
  const calcPAYE = (gross) => {
    let tax = 0, remaining = gross;
    for (const b of payeBrackets) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, b.to === Infinity ? remaining : b.to - b.from);
      if (gross > b.from) tax += taxable * b.rate;
    }
    return Math.max(0, Math.round(tax));
  };
  const totalPAYE = staffSalaries.reduce((s, st) => s + calcPAYE(st.gross), 0);

  const deadlines = [
    { tax: "VAT (18%)", amount: fmt(vatPayable), due: "20 April 2025", filed: false, urgent: true },
    { tax: "SDL (4%)", amount: fmt(sdlPayable), due: "7 April 2025", filed: false, urgent: true },
    { tax: "PAYE", amount: fmt(totalPAYE), due: "7 April 2025", filed: false, urgent: true },
    { tax: "WHT (5%)", amount: "N/A this month", due: "7 April 2025", filed: true, urgent: false },
    { tax: "Corp. Tax Provisional", amount: "Q1 estimate", due: "30 April 2025", filed: false, urgent: false },
  ];

  const css2 = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .tx-root{font-family:'Plus Jakarta Sans',sans-serif}
    .tx-root.dark{--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
    .tx-root.light{--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
    .tx-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px}
    .tx-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)}
    .tx-row:last-child{border-bottom:none}
    .tx-btn{background:${BRAND};color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit}
  `;

  return (
    <>
      <style>{css2}</style>
      <div className={`tx-root ${theme}`}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t)" }}>
            Full Tax <span style={{ color: BRAND }}>Dashboard</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
            VAT 18% · SDL 4% · PAYE · WHT — Tanzania unified view
          </div>
        </div>

        {/* Summary totals */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[
            ["VAT Payable", fmt(vatPayable), "#ef4444"],
            ["SDL Payable", fmt(sdlPayable), "#f59e0b"],
            ["PAYE Total", fmt(totalPAYE), "#3b82f6"],
            ["WHT Due", "None", "#22c55e"],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Deadlines */}
        <div className="tx-card">
          <div style={{ fontSize: 10, fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10 }}>
            Filing Deadlines — April 2025
          </div>
          {deadlines.map(d => (
            <div className="tx-row" key={d.tax}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t)" }}>{d.tax}</div>
                <div style={{ fontSize: 10, color: "var(--t2)", marginTop: 1 }}>Due: {d.due} · {d.amount}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {d.urgent && !d.filed && (
                  <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700 }}>
                    {d.tax === "VAT (18%)" ? "37d left" : "24d left"}
                  </span>
                )}
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                  background: d.filed ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)",
                  border: `1px solid ${d.filed ? "rgba(34,197,94,.25)" : "rgba(239,68,68,.25)"}`,
                  color: d.filed ? "#22c55e" : "#ef4444" }}>
                  {d.filed ? "✓ Filed" : "Pending"}
                </span>
                {!d.filed && <button className="tx-btn" style={{ fontSize: 10, padding: "4px 10px" }}>File</button>}
              </div>
            </div>
          ))}
        </div>

        {/* PAYE calculator */}
        <div className="tx-card">
          <div style={{ fontSize: 10, fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10 }}>
            PAYE Calculator — Staff ({staffSalaries.length} employees)
          </div>
          {staffSalaries.map(s => {
            const paye = calcPAYE(s.gross);
            const nssf = Math.round(s.gross * 0.1);
            const net = s.gross - paye - nssf;
            return (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t)" }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "var(--t2)", marginTop: 1 }}>{s.role} · Gross: {fmt(s.gross)}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6" }}>PAYE: {fmt(paye)}</div>
                  <div style={{ fontSize: 10, color: "var(--t2)" }}>Net: {fmt(net)}</div>
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontWeight: 700, fontSize: 13, color: "var(--t)" }}>
            <span>Total PAYE to TRA</span>
            <span style={{ color: "#3b82f6" }}>{fmt(totalPAYE)}</span>
          </div>
        </div>

        {/* SDL explanation */}
        <div style={{ background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 10, padding: "11px 13px", fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>💡 What is SDL?</div>
          Skills Development Levy = 4% of gross payroll. Paid to TRA monthly alongside PAYE.
          You owe {fmt(sdlPayable)} this month (4% × {fmt(grossSalaries)}).
          SDL funds national vocational training programs.
        </div>
      </div>
    </>
  );
}

// ─── USSDInterface ────────────────────────────────────────────────────────────
// Spec: "Basic bookkeeping and invoice generation via USSD for feature phone users
//        (58% of TZ still feature phones)"
// Simulates the USSD flow via Africa's Talking

export function USSDInterface({ theme = "dark" }) {
  const [screen, setScreen] = useState("main");
  const [history, setHistory] = useState(["*150*00#"]);
  const [input, setInput] = useState("");

  const SCREENS = {
    main: {
      title: "CREOVA Biashara",
      menu: [
        { key: "1", label: "Rekodi Mauzo (Record Sale)", next: "record_sale" },
        { key: "2", label: "Angalia Hisa (Check Stock)", next: "check_stock" },
        { key: "3", label: "Deni za Wateja (Customer Debts)", next: "debts" },
        { key: "4", label: "Muhtasari wa Leo (Today's Summary)", next: "summary" },
        { key: "0", label: "Toka (Exit)", next: "exit" },
      ],
    },
    record_sale: {
      title: "Rekodi Mauzo",
      prompt: "Ingiza kiasi cha mauzo (TSh):\nEnter sale amount (TSh):",
      type: "input",
      onSubmit: "sale_confirm",
    },
    sale_confirm: {
      title: "Thibitisha Mauzo",
      dynamic: (val) => `Mauzo: TSh ${Number(val).toLocaleString("en-TZ")}\nMalipo:\n1. M-Pesa\n2. Airtel\n3. Tigo\n4. Pesa Taslimu`,
      menu: [
        { key: "1", label: "M-Pesa", next: "sale_done" },
        { key: "2", label: "Airtel Money", next: "sale_done" },
        { key: "3", label: "Tigo Pesa", next: "sale_done" },
        { key: "4", label: "Cash", next: "sale_done" },
      ],
    },
    sale_done: {
      title: "✓ Imehifadhiwa",
      message: "Mauzo yamerekodiwa.\nSale recorded successfully.",
      menu: [{ key: "0", label: "Rudi Mwanzo (Main Menu)", next: "main" }],
    },
    check_stock: {
      title: "Hisa Yako",
      message: "Bidhaa chini ya kiwango:\n\n1. Unga Sembe 2kg — 3 left ⚠️\n2. Mafuta 1L — 1 left ⚠️\n3. Sukari 1kg — 8 left",
      menu: [{ key: "0", label: "Rudi Mwanzo", next: "main" }],
    },
    debts: {
      title: "Deni za Wateja",
      message: "Jumla: TSh 189,500\n\n1. Juma Ally — TSh 87,000\n2. Fatuma Salim — TSh 34,500\n3. Hassan M — TSh 44,000\n\nTuma ukumbusho SMS?",
      menu: [
        { key: "1", label: "Ndio, tuma SMS", next: "sms_sent" },
        { key: "0", label: "Hapana, rudi", next: "main" },
      ],
    },
    sms_sent: {
      title: "✓ SMS Zimetumwa",
      message: "Ukumbusho umetumwa kwa\nwateja 3 wenye madeni.",
      menu: [{ key: "0", label: "Rudi Mwanzo", next: "main" }],
    },
    summary: {
      title: "Muhtasari wa Leo",
      message: "Tarehe: 14 Mar 2025\n\nMauzo Jumla: TSh 312,800\nTransactions: 34\nFaida Ghafi: TSh 237,728\n\nMalipo:\nM-Pesa: 58% | Pesa: 31%\nAirtel: 11%",
      menu: [{ key: "0", label: "Rudi Mwanzo", next: "main" }],
    },
  };

  const current = SCREENS[screen];

  const handleInput = (val) => {
    if (!val) return;
    setHistory(prev => [...prev, val]);
    setInput("");
    if (current.type === "input") {
      setScreen(current.onSubmit);
      return;
    }
    const menuItem = current.menu?.find(m => m.key === val);
    if (menuItem) {
      if (menuItem.next === "exit") { setScreen("main"); setHistory(["*150*00#"]); return; }
      setScreen(menuItem.next);
    }
  };

  const css3 = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
    .us-root{font-family:'Plus Jakarta Sans',sans-serif}
    .us-root.dark{--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
    .us-root.light{--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
    .us-phone{background:#111;border-radius:24px;padding:16px;max-width:280px;margin:0 auto;box-shadow:0 0 0 8px #333,0 0 0 10px #1a1a1a}
    .us-screen{background:#1a2a1a;border-radius:12px;padding:12px;min-height:220px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#00ff41;line-height:1.7;margin-bottom:12px}
    .us-screen-title{font-size:12px;font-weight:700;color:#00ff41;border-bottom:1px solid #003300;padding-bottom:6px;margin-bottom:8px;font-family:'Plus Jakarta Sans',sans-serif}
    .us-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px}
    .us-key{background:#222;color:#eee;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .1s;font-family:'Plus Jakarta Sans',sans-serif}
    .us-key:hover{background:#333}
    .us-key:active{background:#444}
    .us-input-row{display:flex;gap:6px}
    .us-inp{flex:1;background:#222;border:1px solid #444;border-radius:8px;padding:8px;color:#eee;font-family:'IBM Plex Mono',monospace;font-size:13px;outline:none}
    .us-send{background:#00aa22;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;font-family:inherit;font-size:12px}
  `;

  return (
    <>
      <style>{css3}</style>
      <div className={`us-root ${theme}`}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t)" }}>
            USSD <span style={{ color: BRAND }}>Interface</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
            For feature phone users · Dial *150*00# · Africa's Talking integration
          </div>
          <div style={{ marginTop: 6, padding: "8px 12px", background: "rgba(229,107,10,.08)", border: "1px solid rgba(229,107,10,.2)", borderRadius: 8, fontSize: 11, color: "var(--t2)" }}>
            💡 58% of Tanzania still uses feature phones. This USSD interface means CREOVA works for
            <em>every</em> duka owner, not just smartphone users. Via Africa's Talking API.
          </div>
        </div>

        <div className="us-phone">
          <div className="us-screen">
            <div className="us-screen-title">
              {screen === "main" ? "CON" : "END"}: {current.title}
            </div>
            {current.message && <div>{current.message}</div>}
            {current.prompt && <div>{current.prompt}</div>}
            {current.menu && current.menu.map(m => (
              <div key={m.key}>{m.key}. {m.label}</div>
            ))}
          </div>
          {/* Keypad */}
          <div className="us-keypad">
            {["1","2","3","4","5","6","7","8","9","*","0","#"].map(k => (
              <button key={k} className="us-key"
                onClick={() => current.type === "input"
                  ? setInput(prev => prev + k)
                  : handleInput(k)}>
                {k}
              </button>
            ))}
          </div>
          {current.type === "input" && (
            <div className="us-input-row">
              <input className="us-inp" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInput(input)}
                placeholder="Ingiza / Enter..." />
              <button className="us-send" onClick={() => handleInput(input)}>Send</button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 14, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 8 }}>
            Africa's Talking USSD Setup
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "var(--t2)", background: "var(--inp)", borderRadius: 8, padding: "10px 12px", lineHeight: 1.7 }}>
{`// Node.js - Africa's Talking USSD handler
app.post('/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const input = text.split('*');
  const level = input.length;
  
  let response = '';
  if (level === 1) {
    response = 'CON CREOVA Biashara\\n';
    response += '1. Rekodi Mauzo\\n2. Angalia Hisa\\n';
    response += '3. Deni za Wateja\\n4. Muhtasari\\n0. Toka';
  }
  // ... handle deeper levels
  
  res.set('Content-Type', 'text/plain');
  res.send(response); // "CON" = continue, "END" = terminate
});`}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── TierGating ───────────────────────────────────────────────────────────────
// Spec: "Free ($0), Growth ($3–5/mo), Business ($10–15/mo), Enterprise ($50+)"
// Real gating logic — not just upgrade prompts

const TIERS = {
  free: {
    name: "Free", price: 0, currency: "TSh 0/mo",
    limits: { invoices: 25, wallets: 1, locations: 1, users: 1, reports: false, eTIMS: false, ussd: false },
    features: ["25 invoices/month","Basic bookkeeping","1 mobile money wallet","Offline POS","Basic inventory"],
  },
  growth: {
    name: "Growth", price: 3, currency: "TSh 7,500/mo",
    limits: { invoices: Infinity, wallets: 4, locations: 1, users: 2, reports: true, eTIMS: false, ussd: true },
    features: ["Unlimited invoices","All 4 TZ wallets","EFD compliance","Full inventory","USSD mode","SDL + PAYE dashboard"],
  },
  business: {
    name: "Business", price: 12, currency: "TSh 30,000/mo",
    limits: { invoices: Infinity, wallets: 4, locations: 3, users: 5, reports: true, eTIMS: true, ussd: true },
    features: ["Everything in Growth","Kenya eTIMS compliance","Multi-location (3)","5 users","Advanced reports","Credit score reports"],
  },
  enterprise: {
    name: "Enterprise", price: 50, currency: "Custom",
    limits: { invoices: Infinity, wallets: 4, locations: Infinity, users: Infinity, reports: true, eTIMS: true, ussd: true },
    features: ["Everything in Business","API access","Dedicated support","Custom integrations","White-label option"],
  },
};

export function TierGating({ currentTier = "free", onUpgrade, theme = "dark" }) {
  const [selected, setSelected] = useState(currentTier);
  const tier = TIERS[selected];

  const checkAccess = (feature) => {
    const t = TIERS[currentTier];
    if (feature === "wallets_4") return t.limits.wallets >= 4;
    if (feature === "etims") return t.limits.eTIMS;
    if (feature === "ussd") return t.limits.ussd;
    if (feature === "multi_location") return t.limits.locations > 1;
    if (feature === "advanced_reports") return t.limits.reports;
    return true;
  };

  const css4 = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .tg-root{font-family:'Plus Jakarta Sans',sans-serif}
    .tg-root.dark{--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
    .tg-root.light{--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
    .tg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
    @media(max-width:560px){.tg-grid{grid-template-columns:1fr 1fr}}
    .tg-card{background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:13px;cursor:pointer;transition:all .15s}
    .tg-card.active{border-color:${BRAND};background:rgba(229,107,10,.04)}
    .tg-card.current{border-color:#22c55e}
    .tg-feature-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)}
    .tg-feature-row:last-child{border-bottom:none}
    .tg-locked{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:9px;padding:10px 13px;display:flex;align-items:center;gap:10px;margin-top:8px;cursor:pointer}
  `;

  return (
    <>
      <style>{css4}</style>
      <div className={`tg-root ${theme}`}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t)" }}>
            Subscription <span style={{ color: BRAND }}>Tiers</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
            Current plan: <span style={{ color: "#22c55e", fontWeight: 700 }}>{TIERS[currentTier].name}</span>
          </div>
        </div>

        <div className="tg-grid">
          {Object.entries(TIERS).map(([key, t]) => (
            <div key={key}
              className={`tg-card ${selected === key ? "active" : ""} ${currentTier === key ? "current" : ""}`}
              onClick={() => setSelected(key)}>
              <div style={{ fontSize: 12, fontWeight: 800, color: currentTier === key ? "#22c55e" : "var(--t)" }}>
                {t.name}
                {currentTier === key && <span style={{ fontSize: 9, marginLeft: 5 }}>← You</span>}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND, marginTop: 3 }}>{t.currency}</div>
            </div>
          ))}
        </div>

        {/* Feature gating examples */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10 }}>
            Feature Access — {TIERS[currentTier].name} Plan
          </div>
          {[
            { feature: "wallets_4", label: "All 4 TZ Mobile Wallets", lockMsg: "Upgrade to Growth (TSh 7,500/mo)" },
            { feature: "ussd", label: "USSD Feature Phone Mode", lockMsg: "Upgrade to Growth (TSh 7,500/mo)" },
            { feature: "advanced_reports", label: "Advanced Reports & Export", lockMsg: "Upgrade to Growth (TSh 7,500/mo)" },
            { feature: "multi_location", label: "Multi-Location Management", lockMsg: "Upgrade to Business (TSh 30,000/mo)" },
            { feature: "etims", label: "Kenya eTIMS Compliance", lockMsg: "Upgrade to Business (TSh 30,000/mo)" },
          ].map(f => {
            const hasAccess = checkAccess(f.feature);
            return (
              <div className="tg-feature-row" key={f.feature}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t)" }}>{f.label}</span>
                {hasAccess
                  ? <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✓ Included</span>
                  : (
                    <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>
                      🔒 {f.lockMsg.split("(")[0]}
                    </span>
                  )}
              </div>
            );
          })}
        </div>

        {currentTier === "free" && (
          <button style={{ width: "100%", background: BRAND, color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => onUpgrade?.("growth")}>
            ✨ Upgrade to Growth — TSh 7,500/mo
          </button>
        )}
      </div>
    </>
  );
}
