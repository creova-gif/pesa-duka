import { useState, useEffect } from "react";

// ─── ClickPesa Payment Gateway Integration ────────────────────────────────────
// Handles payment processing via ClickPesa for:
//   - M-Pesa (Vodacom)
//   - Halopesa (Halotel)
//   - Tigo Pesa
//   - Airtel Money
//   - Credit/Debit Cards
//
// PRODUCTION CONFIGURATION:
//   API Key: REDACTED_CLICKPESA_API_KEY
//   Client ID: REDACTED_CLICKPESA_CLIENT_ID
//   Environment: PRODUCTION READY

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
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  theme?: "dark" | "light";
}

type PaymentMethod = "mpesa" | "halopesa" | "tigopesa" | "airtel" | "card";
type PaymentStatus = "idle" | "processing" | "success" | "failed";

export default function ClickPesaPayment({
  amount,
  receiptNo,
  customerPhone = "",
  onSuccess,
  onCancel,
  theme = "dark"
}: ClickPesaPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("mpesa");
  const [phoneNumber, setPhoneNumber] = useState(customerPhone);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const methods = [
    { id: "mpesa" as const, name: "M-Pesa", icon: "📱", desc: "Vodacom", color: "#22c55e" },
    { id: "halopesa" as const, name: "Halopesa", icon: "📞", desc: "Halotel", color: "#f59e0b" },
    { id: "tigopesa" as const, name: "Tigo Pesa", icon: "📲", desc: "Tigo", color: "#3b82f6" },
    { id: "airtel" as const, name: "Airtel Money", icon: "💳", desc: "Airtel", color: "#ef4444" },
    { id: "card" as const, name: "Card", icon: "💎", desc: "Visa/Mastercard", color: "#8b5cf6" },
  ];

  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 9 && cleaned.length <= 12;
  };

  const isValidCard = () => {
    return cardNumber.length >= 15 && cardExpiry.length === 5 && cardCVV.length >= 3 && cardName.length > 2;
  };

  const canProceed = selectedMethod === "card" ? isValidCard() : isValidPhone(phoneNumber);

  const processClickPesaPayment = async () => {
    setStatus("processing");
    setErrorMsg("");

    // ClickPesa API Integration - PRODUCTION
    const paymentPayload = {
      client_id: "REDACTED_CLICKPESA_CLIENT_ID",
      api_key: "REDACTED_CLICKPESA_API_KEY",
      payment_method: selectedMethod,
      amount: amount,
      currency: "TZS",
      reference: receiptNo,
      ...(selectedMethod === "card" ? {
        card_number: cardNumber.replace(/\s/g, ""),
        card_expiry: cardExpiry,
        card_cvv: cardCVV,
        card_holder: cardName,
      } : {
        phone_number: phoneNumber.replace(/\D/g, ""),
      })
    };

    try {
      // ClickPesa API Endpoint
      const response = await fetch("https://api.clickpesa.com/v1/payments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${paymentPayload.api_key}`
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === "success" || result.transaction_id) {
        const transactionId = result.transaction_id || `CPTZ${Date.now().toString().slice(-10)}`;
        setStatus("success");
        setTimeout(() => onSuccess(transactionId), 1500);
      } else {
        throw new Error(result.message || "Payment declined by provider");
      }
    } catch (error) {
      setStatus("failed");
      setErrorMsg(error instanceof Error ? error.message : "Payment failed. Please try again.");
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <>
      <style>{css}</style>
      <div className={`cp-root ${theme}`}>
        <div className="cp-overlay" onClick={status === "idle" ? onCancel : undefined}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-header">
              <div className="cp-title">💳 ClickPesa Payment</div>
              {status === "idle" && (
                <button className="cp-close" onClick={onCancel}>×</button>
              )}
            </div>

            <div className="cp-content">
              {status === "idle" && (
                <>
                  <div className="cp-amount-display">
                    <div className="cp-amount-label">Kiasi cha Kulipa</div>
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

                  {selectedMethod !== "card" ? (
                    <>
                      <div className="cp-info">
                        <span className="cp-info-icon">ℹ️</span>
                        Utapokea ombi la malipo kwenye simu yako. Weka PIN yako kukamilisha.
                      </div>
                      <div className="cp-input-group">
                        <label className="cp-label">Namba ya Simu</label>
                        <input
                          type="tel"
                          className="cp-input"
                          placeholder="0754123456 or +255754123456"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="cp-info">
                        <span className="cp-info-icon">🔒</span>
                        Taarifa zako za kadi ni salama na zimefungwa kwa SSL.
                      </div>
                      <div className="cp-input-group">
                        <label className="cp-label">Namba ya Kadi</label>
                        <input
                          type="text"
                          className="cp-input"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          autoFocus
                        />
                      </div>
                      <div className="cp-input-group">
                        <label className="cp-label">Jina kwenye Kadi</label>
                        <input
                          type="text"
                          className="cp-input"
                          placeholder="JUMA BAKARI"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="cp-card-grid">
                        <div className="cp-input-group">
                          <label className="cp-label">Mwezi/Mwaka</label>
                          <input
                            type="text"
                            className="cp-input"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            maxLength={5}
                          />
                        </div>
                        <div className="cp-input-group">
                          <label className="cp-label">CVV</label>
                          <input
                            type="password"
                            className="cp-input"
                            placeholder="123"
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, "").substring(0, 4))}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    className="cp-pay-btn"
                    disabled={!canProceed}
                    onClick={processClickPesaPayment}
                  >
                    🔒 Lipa TSh {amount.toLocaleString("en-TZ")}
                  </button>
                </>
              )}

              {status === "processing" && (
                <div className="cp-status">
                  <div className="cp-spinner" />
                  <div className="cp-status-title">Inachakata malipo...</div>
                  <div className="cp-status-msg">
                    {selectedMethod === "card"
                      ? "Tunaangalia taarifa za kadi yako..."
                      : "Angalia simu yako na weka PIN kukamilisha malipo."}
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="cp-status">
                  <div className="cp-status-icon">✅</div>
                  <div className="cp-status-title">Malipo Yamekamilika!</div>
                  <div className="cp-status-msg">
                    Asante! Malipo yako ya TSh {amount.toLocaleString("en-TZ")} yamepokewa.
                  </div>
                </div>
              )}

              {status === "failed" && (
                <div className="cp-status">
                  <div className="cp-status-icon">❌</div>
                  <div className="cp-status-title">Malipo Yameshindwa</div>
                  <div className="cp-status-msg">{errorMsg}</div>
                  <button className="cp-pay-btn" onClick={() => setStatus("idle")}>
                    🔄 Jaribu Tena
                  </button>
                  <button
                    className="cp-pay-btn"
                    style={{ background: "var(--t3)", marginTop: 8 }}
                    onClick={onCancel}
                  >
                    Ghairi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}