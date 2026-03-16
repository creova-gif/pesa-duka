import { useState } from "react";

// ─── POS Speed Pack ──────────────────────────────────────────────────────────
// Three exports:
//   QuickSaleModal   — floating 2-tap sale (product → qty → confirm)
//   SplitPaymentModal — split a sale between M-Pesa + Cash (or any 2 methods)
//   RepeatLastOrder  — banner to re-run the previous transaction

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Unga wa Sembe 2kg", price: 3500, emoji: "🌾" },
  { id: 2, name: "Mafuta 1L", price: 4200, emoji: "🛢️" },
  { id: 3, name: "Sukari 1kg", price: 2800, emoji: "🍬" },
  { id: 4, name: "Sabuni Ariel", price: 1500, emoji: "🧴" },
  { id: 5, name: "Coke 500ml", price: 1000, emoji: "🥤" },
  { id: 6, name: "Mkate Boflo", price: 500, emoji: "🍞" },
];

const METHODS = ["M-Pesa", "Airtel Money", "Tigo Pesa", "Cash"];
const METHOD_ICONS: Record<string, string> = { "M-Pesa": "📱", "Airtel Money": "📲", "Tigo Pesa": "💳", "Cash": "💵" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.ps-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.ps-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.ps-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.ps-modal{background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;max-width:420px;margin:0 auto}
.ps-hdr{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.ps-title{font-size:15px;font-weight:800;color:var(--t)}
.ps-x{background:none;border:none;color:var(--t2);font-size:18px;cursor:pointer;padding:2px}
.ps-body{padding:20px}
.ps-search{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;font-size:14px;color:var(--t);font-family:inherit;outline:none;box-sizing:border-box;margin-bottom:14px;transition:border-color .15s}
.ps-search:focus{border-color:${BRAND}}
.ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:220px;overflow-y:auto;margin-bottom:14px}
.ps-product{background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:10px;cursor:pointer;transition:all .15s;text-align:center}
.ps-product:hover{border-color:${BRAND};background:rgba(229,107,10,.06)}
.ps-product.selected{border-color:${BRAND};background:rgba(229,107,10,.1)}
.ps-product-emoji{font-size:22px;margin-bottom:4px}
.ps-product-name{font-size:11px;font-weight:700;color:var(--t);line-height:1.3}
.ps-product-price{font-size:12px;font-weight:600;color:${BRAND};margin-top:2px}
.ps-qty-row{display:flex;align-items:center;gap:12px;background:var(--inp);border-radius:12px;padding:12px 16px;margin-bottom:14px}
.ps-qty-label{font-size:13px;color:var(--t2);flex:1}
.ps-qty-btn{width:32px;height:32px;border-radius:8px;background:var(--border);border:none;color:var(--t);font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;font-family:inherit}
.ps-qty-btn:hover{background:${BRAND};color:#fff}
.ps-qty-val{font-size:18px;font-weight:800;color:var(--t);min-width:28px;text-align:center}
.ps-total-bar{background:rgba(229,107,10,.08);border:1px solid rgba(229,107,10,.2);border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.ps-total-label{font-size:13px;color:var(--t2);font-weight:600}
.ps-total-value{font-size:18px;font-weight:800;color:${BRAND}}
.ps-method-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.ps-method{background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:10px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .15s}
.ps-method:hover{border-color:${BRAND}}
.ps-method.selected{border-color:${BRAND};background:rgba(229,107,10,.08)}
.ps-method-icon{font-size:18px}
.ps-method-name{font-size:12px;font-weight:700;color:var(--t)}
.ps-confirm-btn{width:100%;background:${BRAND};color:#fff;border:none;border-radius:10px;padding:12px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s}
.ps-confirm-btn:hover{background:#ff8c3a}
.ps-confirm-btn:disabled{opacity:.4;cursor:not-allowed}
.ps-success{text-align:center;padding:24px}
.ps-success-icon{font-size:44px;margin-bottom:12px}
.ps-success-title{font-size:16px;font-weight:800;color:#22c55e}
.ps-success-sub{font-size:13px;color:var(--t2);margin-top:4px}

.sp-label{font-size:11px;font-weight:700;color:var(--t2);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px}
.sp-method-row{display:flex;gap:8px;margin-bottom:12px}
.sp-method-btn{flex:1;padding:8px;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;font-size:12px;font-weight:700;color:var(--t2);cursor:pointer;font-family:inherit;transition:all .15s;text-align:center}
.sp-method-btn.sel{border-color:${BRAND};color:${BRAND};background:rgba(229,107,10,.08)}
.sp-amount-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.sp-amount-box{background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:12px}
.sp-amount-box:focus-within{border-color:${BRAND}}
.sp-amount-method{font-size:11px;font-weight:700;color:var(--t2);margin-bottom:6px}
.sp-amount-inp{width:100%;background:none;border:none;font-size:16px;font-weight:800;color:var(--t);font-family:inherit;outline:none}
.sp-split-bar{height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin:12px 0;display:flex}
.sp-split-fill-a{background:${BRAND};transition:width .2s;border-radius:4px 0 0 4px}
.sp-split-fill-b{background:#3b82f6;transition:width .2s;border-radius:0 4px 4px 0}
.sp-split-legend{display:flex;justify-content:space-between;font-size:11px;color:var(--t2);margin-bottom:14px}

.rlo-banner{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box}
.rlo-icon{width:38px;height:38px;border-radius:10px;background:rgba(229,107,10,.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.rlo-info{flex:1;min-width:0}
.rlo-title{font-size:13px;font-weight:700;color:var(--t)}
.rlo-sub{font-size:11px;color:var(--t2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rlo-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .15s;flex-shrink:0}
.rlo-btn:hover{background:#ff8c3a}
.rlo-dismiss{background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px;padding:2px;flex-shrink:0}
`;

interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

// ─── QuickSaleModal ──────────────────────────────────────────────────────────
interface QuickSaleModalProps {
  products?: Product[];
  onComplete?: (data: any) => void;
  onClose?: () => void;
  theme?: "dark" | "light";
}

export function QuickSaleModal({ products = SAMPLE_PRODUCTS, onComplete, onClose, theme = "dark" }: QuickSaleModalProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState("M-Pesa");
  const [done, setDone] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const total = selected ? selected.price * qty : 0;

  const handleConfirm = () => {
    setDone(true);
    setTimeout(() => { onComplete?.({ product: selected, qty, total, method }); }, 1400);
  };

  return (
    <>
      <style>{css}</style>
      <div className={`ps-root ${theme}`}>
        <div className="ps-modal">
          <div className="ps-hdr">
            <span className="ps-title">⚡ Quick Sale</span>
            <button className="ps-x" onClick={onClose}>✕</button>
          </div>
          <div className="ps-body">
            {done ? (
              <div className="ps-success">
                <div className="ps-success-icon">✅</div>
                <div className="ps-success-title">Sale Recorded!</div>
                <div className="ps-success-sub">{fmt(total)} via {method}</div>
              </div>
            ) : (
              <>
                <input className="ps-search" placeholder="Search product..." value={query}
                  onChange={e => setQuery(e.target.value)} autoFocus />
                <div className="ps-grid">
                  {filtered.map(p => (
                    <div key={p.id} className={`ps-product ${selected?.id === p.id ? "selected" : ""}`}
                      onClick={() => { setSelected(p); setQty(1); }}>
                      <div className="ps-product-emoji">{p.emoji}</div>
                      <div className="ps-product-name">{p.name}</div>
                      <div className="ps-product-price">{fmt(p.price)}</div>
                    </div>
                  ))}
                </div>
                {selected && (
                  <>
                    <div className="ps-qty-row">
                      <span className="ps-qty-label">{selected.name}</span>
                      <button className="ps-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                      <span className="ps-qty-val">{qty}</span>
                      <button className="ps-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                    </div>
                    <div className="ps-total-bar">
                      <span className="ps-total-label">Total</span>
                      <span className="ps-total-value">{fmt(total)}</span>
                    </div>
                    <div className="ps-method-grid">
                      {METHODS.map(m => (
                        <div key={m} className={`ps-method ${method === m ? "selected" : ""}`}
                          onClick={() => setMethod(m)}>
                          <span className="ps-method-icon">{METHOD_ICONS[m]}</span>
                          <span className="ps-method-name">{m}</span>
                        </div>
                      ))}
                    </div>
                    <button className="ps-confirm-btn" onClick={handleConfirm}>
                      Confirm Sale — {fmt(total)}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SplitPaymentModal ───────────────────────────────────────────────────────
interface SplitPaymentModalProps {
  totalAmount?: number;
  onComplete?: (data: any) => void;
  onClose?: () => void;
  theme?: "dark" | "light";
}

export function SplitPaymentModal({ totalAmount = 45000, onComplete, onClose, theme = "dark" }: SplitPaymentModalProps) {
  const [methodA, setMethodA] = useState("M-Pesa");
  const [methodB, setMethodB] = useState("Cash");
  const [amountA, setAmountA] = useState(Math.round(totalAmount / 2));
  const [done, setDone] = useState(false);

  const amountB = totalAmount - amountA;
  const pctA = Math.round((amountA / totalAmount) * 100);
  const pctB = 100 - pctA;

  const handleConfirm = () => {
    setDone(true);
    setTimeout(() => onComplete?.({ methodA, amountA, methodB, amountB }), 1400);
  };

  return (
    <>
      <style>{css}</style>
      <div className={`ps-root ${theme}`}>
        <div className="ps-modal">
          <div className="ps-hdr">
            <span className="ps-title">✂️ Split Payment</span>
            <button className="ps-x" onClick={onClose}>✕</button>
          </div>
          <div className="ps-body">
            {done ? (
              <div className="ps-success">
                <div className="ps-success-icon">✅</div>
                <div className="ps-success-title">Split Payment Done!</div>
                <div className="ps-success-sub">
                  {fmt(amountA)} via {methodA} + {fmt(amountB)} via {methodB}
                </div>
              </div>
            ) : (
              <>
                <div className="ps-total-bar" style={{ marginBottom: 16 }}>
                  <span className="ps-total-label">Total Bill</span>
                  <span className="ps-total-value">{fmt(totalAmount)}</span>
                </div>

                <div className="sp-label">First Payment Method</div>
                <div className="sp-method-row">
                  {METHODS.map(m => (
                    <button key={m} className={`sp-method-btn ${methodA === m ? "sel" : ""}`}
                      onClick={() => { setMethodA(m); if (m === methodB) setMethodB(METHODS.find(x => x !== m)!); }}>
                      {METHOD_ICONS[m]} {m}
                    </button>
                  ))}
                </div>

                <div className="sp-label">Second Payment Method</div>
                <div className="sp-method-row">
                  {METHODS.filter(m => m !== methodA).map(m => (
                    <button key={m} className={`sp-method-btn ${methodB === m ? "sel" : ""}`}
                      onClick={() => setMethodB(m)}>
                      {METHOD_ICONS[m]} {m}
                    </button>
                  ))}
                </div>

                <div className="sp-label">Split Amount</div>
                <div className="sp-amount-row">
                  <div className="sp-amount-box">
                    <div className="sp-amount-method">{METHOD_ICONS[methodA]} {methodA}</div>
                    <input className="sp-amount-inp" type="number" min="0" max={totalAmount}
                      value={amountA}
                      onChange={e => setAmountA(Math.min(totalAmount, Math.max(0, Number(e.target.value))))} />
                  </div>
                  <div className="sp-amount-box">
                    <div className="sp-amount-method">{METHOD_ICONS[methodB]} {methodB}</div>
                    <input className="sp-amount-inp" type="number" readOnly value={amountB} />
                  </div>
                </div>

                <div className="sp-split-bar">
                  <div className="sp-split-fill-a" style={{ width: `${pctA}%` }} />
                  <div className="sp-split-fill-b" style={{ width: `${pctB}%` }} />
                </div>
                <div className="sp-split-legend">
                  <span style={{ color: BRAND }}>{pctA}% {methodA}</span>
                  <span style={{ color: "#3b82f6" }}>{pctB}% {methodB}</span>
                </div>

                <button className="ps-confirm-btn" onClick={handleConfirm}
                  disabled={amountA <= 0 || amountB <= 0}>
                  Confirm Split — {fmt(totalAmount)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── RepeatLastOrder ─────────────────────────────────────────────────────────
interface RepeatLastOrderProps {
  lastOrder?: {
    items: Array<{ name: string; qty: number }>;
    total: number;
    customer?: string;
    method: string;
  };
  onRepeat?: (order: any) => void;
  onDismiss?: () => void;
  theme?: "dark" | "light";
}

export function RepeatLastOrder({
  lastOrder = {
    items: [
      { name: "Unga wa Sembe 2kg", qty: 2 },
      { name: "Mafuta 1L", qty: 1 },
      { name: "Sukari 1kg", qty: 3 },
    ],
    total: 24300,
    customer: "Mama Ntilie",
    method: "M-Pesa",
  },
  onRepeat,
  onDismiss,
  theme = "dark",
}: RepeatLastOrderProps) {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);

  if (!visible) return null;

  const handleRepeat = () => {
    setDone(true);
    setTimeout(() => { onRepeat?.(lastOrder); setVisible(false); }, 1200);
  };

  const summary = lastOrder.items.map(i => `${i.qty}× ${i.name.split(" ")[0]}`).join(", ");

  return (
    <>
      <style>{css}</style>
      <div className={`ps-root ${theme}`}>
        <div className="rlo-banner">
          <div className="rlo-icon">{done ? "✅" : "🔁"}</div>
          <div className="rlo-info">
            <div className="rlo-title">
              {done ? "Order repeated!" : `Repeat last order? — ${fmt(lastOrder.total)}`}
            </div>
            <div className="rlo-sub">
              {done ? `Added to cart via ${lastOrder.method}` : `${lastOrder.customer || "Walk-in"} · ${summary}`}
            </div>
          </div>
          {!done && (
            <>
              <button className="rlo-btn" onClick={handleRepeat}>Repeat</button>
              <button className="rlo-dismiss" onClick={() => { setVisible(false); onDismiss?.(); }}>✕</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
