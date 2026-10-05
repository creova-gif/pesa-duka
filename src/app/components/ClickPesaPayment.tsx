import { useState } from "react";

// ─── Payment modal (disabled) ─────────────────────────────────────────────────
// Payments are intentionally disabled in the client (CRE-107).
//
// The previous implementation called the ClickPesa API directly from the
// browser with production credentials embedded in the bundle and collected
// raw card data (PAN/CVV/expiry) in React state. Both are unsafe.
//
// Payments must be implemented through a server-side integration that holds
// the provider credentials, creates the payment, and confirms it via a signed
// webhook. See SECURITY.md. Do NOT re-add provider keys or card fields here.

const BRAND = "#E56B0A";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.cp-root{font-family:'Plus Jakarta Sans',sans-serif}
.cp-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.cp-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}

.cp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeIn .2s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

.cp-modal{background:var(--card);border-radius:16px;width:90%;max-width:420px;max-height:85vh;overflow:hidden;animation:slideUp .25s;box-shadow:0 20px 60px rgba(0,0,0,.4)}
@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}

.cp-header{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.cp-title{font-size:16px;font-weight:800;color:var(--t)}
.cp-close{background:none;border:none;font-size:24px;color:var(--t2);cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:background .15s}
.cp-close:hover{background:var(--inp)}

.cp-content{padding:20px;max-height:calc(85vh - 70px);overflow-y:auto}

.cp-amount-display{background:linear-gradient(135deg,${BRAND},#ff8c3a);border-radius:14px;padding:20px;text-align:center;margin-bottom:20px}
.cp-amount-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px}
.cp-amount-value{font-size:32px;font-weight:800;color:#fff}

.cp-method-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px}
.cp-method-btn{background:var(--inp);border:2px solid var(--border);border-radius:12px;padding:16px 12px;text-align:center;cursor:pointer;transition:all .15s;font-family:inherit}
.cp-method-btn:hover{border-color:${BRAND};background:rgba(229,107,10,.04)}
.cp-method-btn.active{border-color:${BRAND};background:rgba(229,107,10,.08)}
.cp-method-icon{font-size:28px;margin-bottom:8px}
.cp-method-name{font-size:13px;font-weight:700;color:var(--t);margin-bottom:2px}
.cp-method-desc{font-size:10px;color:var(--t2)}

.cp-input-group{margin-bottom:16px}
.cp-label{font-size:12px;font-weight:700;color:var(--t);margin-bottom:7px;display:block}
.cp-input{width:100%;background:var(--inp);border:2px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--t);font-family:inherit;outline:none;transition:border-color .15s;box-sizing:border-box}
.cp-input:focus{border-color:${BRAND}}
.cp-input::placeholder{color:var(--t3)}

.cp-card-grid{display:grid;grid-template-columns:2fr 1fr;gap:10px}

.cp-pay-btn{width:100%;background:${BRAND};color:#fff;border:none;border-radius:12px;padding:15px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s;margin-top:10px}
.cp-pay-btn:hover{background:#ff8c3a}
.cp-pay-btn:disabled{opacity:.5;cursor:not-allowed}

.cp-status{text-align:center;padding:30px 20px}
.cp-status-icon{font-size:56px;margin-bottom:16px}
.cp-status-title{font-size:18px;font-weight:800;color:var(--t);margin-bottom:8px}
.cp-status-msg{font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:20px}

.cp-spinner{border:3px solid var(--border);border-top-color:${BRAND};border-radius:50%;width:48px;height:48px;animation:spin 1s linear infinite;margin:0 auto 20px}
@keyframes spin{to{transform:rotate(360deg)}}

.cp-info{background:var(--inp);border-radius:10px;padding:12px 14px;font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:16px}
.cp-info-icon{display:inline-block;margin-right:6px}
`;

interface ClickPesaPaymentProps {
  amount: number;
  receiptNo: string;
  customerPhone?: string;
  /** Kept for caller compatibility. Never invoked while payments are disabled. */
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  theme?: "dark" | "light";
}

type PaymentMethod = "mobile" | "card";

export default function ClickPesaPayment({
  amount,
  receiptNo,
  onCancel,
  theme = "dark"
}: ClickPesaPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("mobile");

  const methods = [
    { id: "mobile" as const, name: "Mobile Money", icon: "📱", desc: "M-Pesa · Airtel · Tigo · Halopesa" },
    { id: "card" as const, name: "Card", icon: "💎", desc: "Visa/Mastercard" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className={`cp-root ${theme}`}>
        <div className="cp-overlay" onClick={onCancel}>
          <div className="cp-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="cp-header">
              <div className="cp-title">💳 Payment</div>
              <button className="cp-close" onClick={onCancel} aria-label="Close">×</button>
            </div>

            <div className="cp-content">
              <div className="cp-amount-display">
                <div className="cp-amount-label">Kiasi cha Kulipa · {receiptNo}</div>
                <div className="cp-amount-value">
                  TSh {amount.toLocaleString("en-TZ")}
                </div>
              </div>

              <div className="cp-method-grid">
                {methods.map(m => (
                  <button
                    key={m.id}
                    className={`cp-method-btn ${selectedMethod === m.id ? "active" : ""}`}
                    onClick={() => setSelectedMethod(m.id)}
                  >
                    <div className="cp-method-icon">{m.icon}</div>
                    <div className="cp-method-name">{m.name}</div>
                    <div className="cp-method-desc">{m.desc}</div>
                  </button>
                ))}
              </div>

              <div className="cp-info" role="status">
                <span className="cp-info-icon">⚠️</span>
                {selectedMethod === "card"
                  ? "Card payments are unavailable. Card details are not collected in this app."
                  : "Payments not configured. Mobile money payments require a server-side integration and are disabled."}
              </div>

              <button className="cp-pay-btn" disabled>
                🔒 Payments unavailable
              </button>
              <button
                className="cp-pay-btn"
                style={{ background: "var(--t3)", marginTop: 8 }}
                onClick={onCancel}
              >
                Ghairi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
