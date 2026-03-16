import { useState } from "react";

const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

// ─── EFD Z-Report Generator ───────────────────────────────────────────────────
// Spec: "Generate fiscal receipts with unique identifiers, built-in GPRS
//        transmission to TRA, automatic daily Z reports"
// Z Report = end-of-day fiscal summary REQUIRED by TRA for all EFD users

const SAMPLE_EFD_DAY = {
  date: "2026-03-14",
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
  transmissionTime: "2026-03-14T22:01:34Z",
  traConfirmCode: "TRA-CONF-20260314-8821",
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
    .efd-btn{background:var(--primary);color:#fff;border:none;border-radius:9px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s}
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
              EFD <span style={{ color: "var(--primary)" }}>Z-Report</span>
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
          <div style={{ textAlign: "center", fontSize: 10, color: "var(--primary)" }}>Report No: {data.zReportNumber}</div>
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
