import { useState } from "react";

// ─── MobileMoneyLedger ────────────────────────────────────────────────────────
// THE core differentiator from the spec:
// "Auto-reconcile mobile money transactions from all 4 Tanzanian wallets
//  (Vodacom M-Pesa, Airtel Money, Mixx by Yas, HaloPesa) into accounting ledgers"
//
// Automatic wallet sync is retired. This paste does not call a payment provider.

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

const WALLET_CONFIG = {
  mpesa:  { name: "M-Pesa",      color: "#22c55e", icon: "📱", provider: "Vodacom" },
  airtel: { name: "Airtel Money", color: "#ef4444", icon: "📲", provider: "Airtel" },
  mixx:   { name: "Mixx by Yas",  color: "#3b82f6", icon: "💳", provider: "Yas (Tigo)" },
  halo:   { name: "HaloPesa",    color: "#f59e0b", icon: "🟡", provider: "Halotel" },
  crdb:   { name: "CRDB Bank",   color: "#7c3aed", icon: "🏦", provider: "CRDB" },
};

// Sample ledger rows for this archived paste. Not a live payment feed.
const SAMPLE_TRANSACTIONS = [
  { id: "CP-001", externalId: "MPE240314-8821", provider: "mpesa", amount: 45000, phone: "+255712334556", reference: "INV-2025-041", timestamp: "2025-03-14T09:14:22Z", status: "completed", reconciled: true, ledgerMatch: "Sales - Duka" },
  { id: "CP-002", externalId: "AIR240314-3341", provider: "airtel", amount: 8500, phone: "+255754889001", reference: "WALK-IN-001", timestamp: "2025-03-14T09:47:11Z", status: "completed", reconciled: true, ledgerMatch: "Sales - Duka" },
  { id: "CP-003", externalId: "MPE240314-9102", provider: "mpesa", amount: 22000, phone: "+255699334556", reference: "INV-2025-044", timestamp: "2025-03-14T11:22:08Z", status: "completed", reconciled: false, ledgerMatch: null },
  { id: "CP-004", externalId: "TIG240314-4421", provider: "mixx", amount: 15000, phone: "+255765112334", reference: "RENT-MAR", timestamp: "2025-03-14T12:10:45Z", status: "completed", reconciled: false, ledgerMatch: null },
  { id: "CP-005", externalId: "MPE240314-9998", provider: "mpesa", amount: 3500, phone: "+255713556009", reference: null, timestamp: "2025-03-14T13:44:02Z", status: "completed", reconciled: false, ledgerMatch: null },
  { id: "CP-006", externalId: "HAL240314-1122", provider: "halo", amount: 67000, phone: "+255744123456", reference: "INV-2025-043", timestamp: "2025-03-14T14:55:30Z", status: "completed", reconciled: false, ledgerMatch: null },
  { id: "CP-007", externalId: "MPE240314-0011", provider: "mpesa", amount: 120000, phone: "+255712445667", reference: "STOCK-PAY-001", timestamp: "2025-03-14T15:30:18Z", status: "pending", reconciled: false, ledgerMatch: null },
];

const LEDGER_ACCOUNTS = [
  "Sales — Retail",
  "Sales — Wholesale",
  "Rent Expense",
  "Stock Purchase",
  "Staff Salary",
  "Utilities",
  "Loan Repayment",
  "Other Income",
  "Other Expense",
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
.ml-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.ml-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.ml-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}

.ml-wallet-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:16px}
@media(max-width:560px){.ml-wallet-grid{grid-template-columns:repeat(3,1fr)}}
.ml-wallet{background:var(--card);border:1.5px solid var(--border);border-radius:11px;padding:10px;text-align:center;cursor:pointer;transition:all .15s}
.ml-wallet.active{border-color:var(--walletColor)}
.ml-wallet.connected{background:rgba(34,197,94,.04)}
.ml-wallet-icon{font-size:18px;margin-bottom:3px}
.ml-wallet-name{font-size:9px;font-weight:700;color:var(--t2)}
.ml-wallet-status{font-size:8px;font-weight:700;margin-top:3px}

.ml-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
@media(max-width:500px){.ml-summary-grid{grid-template-columns:1fr 1fr}}
.ml-stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 12px}
.ml-stat-l{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--t2);margin-bottom:4px}
.ml-stat-v{font-size:15px;font-weight:800;color:var(--t)}

.ml-txn-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:7px;transition:border-color .15s}
.ml-txn-card.unreconciled{border-left:3px solid #f59e0b;border-radius:0 12px 12px 0}
.ml-txn-card.reconciled{border-left:3px solid #22c55e;border-radius:0 12px 12px 0}
.ml-txn-card.pending{border-left:3px solid var(--t3);border-radius:0 12px 12px 0}
.ml-txn-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.ml-provider-badge{display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:3px 9px;font-size:10px;font-weight:800;border:1px solid}
.ml-txn-ref{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--t2)}
.ml-txn-amount{font-size:15px;font-weight:800}
.ml-txn-meta{font-size:10px;color:var(--t2);margin-top:3px}
.ml-match-row{display:flex;gap:8px;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)}
.ml-match-select{flex:1;background:var(--inp);border:1.5px solid var(--border);border-radius:8px;padding:7px 10px;font-size:12px;color:var(--t);font-family:inherit;outline:none;appearance:none;transition:border-color .15s}
.ml-match-select:focus{border-color:${BRAND}}
.ml-match-btn{background:${BRAND};color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap}
.ml-auto-btn{background:var(--inp);color:var(--t2);border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit}
.ml-reconciled-badge{background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.25);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800}
.ml-pending-badge{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.25);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800}

.ml-fee-note{background:rgba(229,107,10,.06);border:1px solid rgba(229,107,10,.2);border-radius:10px;padding:11px 14px;margin-bottom:14px;font-size:11px;color:var(--t2);line-height:1.5}
.ml-api-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px}
.ml-code{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--t2);background:var(--inp);border-radius:8px;padding:10px 12px;line-height:1.7;overflow-x:auto;white-space:pre}
.ml-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:${BRAND};margin-bottom:8px}
`;

export default function MobileMoneyLedger({ theme = "dark" }) {
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedLedger, setSelectedLedger] = useState({});
  const [activeWallet, setActiveWallet] = useState(null);
  const [view, setView] = useState("transactions");

  const unreconciled = transactions.filter(t => !t.reconciled && t.status === "completed");
  const reconciled   = transactions.filter(t => t.reconciled);
  const pending      = transactions.filter(t => t.status === "pending");
  const totalInflow  = transactions.filter(t => t.reconciled || t.status === "completed").reduce((s, t) => s + t.amount, 0);

  const reconcile = (txnId) => {
    const account = selectedLedger[txnId];
    if (!account) return;
    setTransactions(prev => prev.map(t =>
      t.id === txnId ? { ...t, reconciled: true, ledgerMatch: account } : t
    ));
  };

  const autoReconcile = () => {
    setTransactions(prev => prev.map(t => {
      if (t.reconciled || t.status === "pending") return t;
      const account = t.reference?.startsWith("INV") ? "Sales — Retail" :
                      t.reference?.startsWith("RENT") ? "Rent Expense" :
                      t.reference?.startsWith("STOCK") ? "Stock Purchase" : "Sales — Retail";
      return { ...t, reconciled: true, ledgerMatch: account };
    }));
  };

  const filtered = transactions.filter(t => {
    if (activeFilter === "unreconciled") return !t.reconciled && t.status === "completed";
    if (activeFilter === "reconciled") return t.reconciled;
    if (activeFilter === "pending") return t.status === "pending";
    if (activeWallet) return t.provider === activeWallet;
    return true;
  });

  return (
    <>
      <style>{css}</style>
      <div className={`ml-root ${theme}`}>
        {/* Header */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t)" }}>
            Mobile Money <span style={{ color: BRAND }}>Ledger</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
            Automatic wallet sync is not available.
          </div>
        </div>

        {/* Wallet grid */}
        <div className="ml-wallet-grid">
          {Object.entries(WALLET_CONFIG).map(([key, w]) => (
            <div key={key}
              className={`ml-wallet ${activeWallet === key ? "active" : ""} connected`}
              style={{ "--walletColor": w.color }}
              onClick={() => setActiveWallet(activeWallet === key ? null : key)}>
              <div className="ml-wallet-icon">{w.icon}</div>
              <div className="ml-wallet-name">{w.name}</div>
              <div className="ml-wallet-status" style={{ color: "#f59e0b" }}>Not available</div>
            </div>
          ))}
        </div>

        <div className="ml-fee-note" role="status">
          Not available. This screen does not contact a payment provider and will not mark a payment successful.
        </div>

        {/* Summary */}
        <div className="ml-summary-grid">
          {[
            ["Today's Inflow", fmt(totalInflow), BRAND],
            ["Unreconciled", unreconciled.length + " txns", "#f59e0b"],
            ["Reconciled", reconciled.length + " txns", "#22c55e"],
            ["Pending", pending.length + " txns", "var(--t2)"],
          ].map(([l, v, c]) => (
            <div className="ml-stat" key={l}>
              <div className="ml-stat-l">{l}</div>
              <div className="ml-stat-v" style={{ color: c, fontSize: 13 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
          {[["all","All"],["unreconciled","Unreconciled"],["reconciled","Reconciled"],["pending","Pending"]].map(([k,l]) => (
            <button key={k} onClick={() => { setActiveFilter(k); setActiveWallet(null); }}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                       border:"1px solid var(--border)", background:activeFilter===k?"#f59e0b":"var(--card)",
                       color:activeFilter===k?"#fff":"var(--t2)", fontFamily:"inherit" }}>
              {l}
            </button>
          ))}
          {unreconciled.length > 0 && (
            <button onClick={autoReconcile}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                       border:"1px solid rgba(34,197,94,.3)", background:"rgba(34,197,94,.08)",
                       color:"#22c55e", fontFamily:"inherit", marginLeft:"auto" }}>
              ⚡ Auto-Reconcile All
            </button>
          )}
        </div>

        {/* Transaction list */}
        {filtered.map(txn => {
          const wallet = WALLET_CONFIG[txn.provider];
          const time = new Date(txn.timestamp).toLocaleTimeString("en-TZ", { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={txn.id}
              className={`ml-txn-card ${txn.reconciled ? "reconciled" : txn.status === "pending" ? "pending" : "unreconciled"}`}>
              <div className="ml-txn-top">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{wallet.icon}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="ml-provider-badge"
                        style={{ background: `${wallet.color}12`, borderColor: `${wallet.color}25`, color: wallet.color }}>
                        {wallet.name}
                      </span>
                      {txn.reconciled
                        ? <span className="ml-reconciled-badge">✓ {txn.ledgerMatch}</span>
                        : txn.status === "pending"
                        ? <span className="ml-pending-badge">⏳ Pending</span>
                        : <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>⚠️ Needs matching</span>}
                    </div>
                    <div className="ml-txn-ref">{txn.externalId} · {txn.phone} · {time}</div>
                    {txn.reference && (
                      <div className="ml-txn-meta">Ref: {txn.reference}</div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="ml-txn-amount" style={{ color: txn.reconciled ? "#22c55e" : "var(--t)" }}>
                    {fmt(txn.amount)}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--t2)", marginTop: 2 }}>
                    Fee: {fmt(Math.round(txn.amount * 0.015))}
                  </div>
                </div>
              </div>

              {!txn.reconciled && txn.status === "completed" && (
                <div className="ml-match-row">
                  <select
                    className="ml-match-select"
                    value={selectedLedger[txn.id] || ""}
                    onChange={e => setSelectedLedger(prev => ({ ...prev, [txn.id]: e.target.value }))}>
                    <option value="">Assign to account...</option>
                    {LEDGER_ACCOUNTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                  <button className="ml-match-btn" onClick={() => reconcile(txn.id)}
                    disabled={!selectedLedger[txn.id]}>
                    ✓ Match
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--t2)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            All transactions reconciled!
          </div>
        )}

        <div className="ml-api-card" style={{ marginTop: 16 }} role="status">
          <div className="ml-lbl">Wallet sync</div>
          <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>
            Not available. No payment is sent or confirmed from this screen.
          </div>
        </div>
      </div>
    </>
  );
}
