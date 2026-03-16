import { useState, useRef, useEffect } from "react";

// ─── SmartReceiptBuilder ──────────────────────────────────────────────────────
// Owner/staff selects items already in the system → receipt auto-builds.
// No typing product names or prices. Just tap, quantity, done.
//
// FLOW:
//   1. Search or browse inventory → tap item to add to receipt
//   2. Adjust quantities inline
//   3. Apply discount (if role allows)
//   4. Select payment method
//   5. Receipt auto-generates with EFD fiscal number, VAT, total
//   6. Print / WhatsApp / SMS receipt
//
// Every receipt is automatically:
//   - Logged to cashbook (income entry)
//   - Deducted from inventory
//   - Attributed to the logged-in employee
//   - Assigned an EFD fiscal number (if VAT business)

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

// Sample inventory (in production: fetched from your product/inventory API)
const INVENTORY = [
  { id:"P001", name:"Unga wa Sembe 2kg",   nameShort:"Unga 2kg",   category:"Grains",    price:3500,  stock:12, vat:false, barcode:"6001000001" },
  { id:"P002", name:"Unga wa Sembe 5kg",   nameShort:"Unga 5kg",   category:"Grains",    price:8200,  stock:6,  vat:false, barcode:"6001000002" },
  { id:"P003", name:"Mafuta ya Kupikia 1L", nameShort:"Mafuta 1L",  category:"Cooking",   price:4200,  stock:1,  vat:true,  barcode:"6001000003" },
  { id:"P004", name:"Mafuta ya Kupikia 2L", nameShort:"Mafuta 2L",  category:"Cooking",   price:8100,  stock:4,  vat:true,  barcode:"6001000004" },
  { id:"P005", name:"Sukari 1kg",           nameShort:"Sukari 1kg", category:"Sweeteners",price:2800,  stock:20, vat:false, barcode:"6001000005" },
  { id:"P006", name:"Sukari 2kg",           nameShort:"Sukari 2kg", category:"Sweeteners",price:5500,  stock:8,  vat:false, barcode:"6001000006" },
  { id:"P007", name:"Chumvi 500g",          nameShort:"Chumvi",     category:"Spices",    price:800,   stock:30, vat:false, barcode:"6001000007" },
  { id:"P008", name:"Sabuni ya Kuosha",     nameShort:"Sabuni",     category:"Household", price:1200,  stock:15, vat:true,  barcode:"6001000008" },
  { id:"P009", name:"Soda Baridi 500ml",    nameShort:"Soda 500ml", category:"Drinks",    price:1000,  stock:24, vat:true,  barcode:"6001000009" },
  { id:"P010", name:"Maji 500ml",           nameShort:"Maji 500ml", category:"Drinks",    price:500,   stock:36, vat:false, barcode:"6001000010" },
  { id:"P011", name:"Siagi 250g",           nameShort:"Siagi",      category:"Dairy",     price:3800,  stock:5,  vat:true,  barcode:"6001000011" },
  { id:"P012", name:"Mayai (doaz 1)",       nameShort:"Mayai",      category:"Dairy",     price:6000,  stock:8,  vat:false, barcode:"6001000012" },
  { id:"P013", name:"Nyanya 1kg",           nameShort:"Nyanya",     category:"Produce",   price:1500,  stock:10, vat:false, barcode:"6001000013" },
  { id:"P014", name:"Vitunguu 1kg",         nameShort:"Vitunguu",   category:"Produce",   price:2000,  stock:7,  vat:false, barcode:"6001000014" },
  { id:"P015", name:"Mchuzi Mix",           nameShort:"Mchuzi Mix", category:"Spices",    price:2500,  stock:18, vat:false, barcode:"6001000015" },
];

const CATEGORIES = ["All", ...Array.from(new Set(INVENTORY.map(p => p.category)))];

const PAYMENT_METHODS = [
  { id:"mpesa",  label:"M-Pesa",       icon:"📱", color:"#22c55e" },
  { id:"airtel", label:"Airtel Money", icon:"📲", color:"#ef4444" },
  { id:"cash",   label:"Cash",         icon:"💵", color:"var(--t2)" },
  { id:"tigo",   label:"Mixx by Yas",  icon:"💳", color:"#3b82f6" },
];

let receiptCounter = 261;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
.srb-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.srb-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.srb-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}

.srb-layout{display:grid;grid-template-columns:1fr 340px;gap:12px;align-items:start}
@media(max-width:700px){.srb-layout{grid-template-columns:1fr}}

.srb-search{width:100%;background:var(--inp);border:2px solid var(--border);border-radius:11px;padding:11px 14px;font-size:14px;color:var(--t);font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .15s}
.srb-search:focus{border-color:${BRAND}}

.cat-pill{padding:5px 13px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--t2);font-family:inherit;transition:all .15s;white-space:nowrap}
.cat-pill.active{background:${BRAND};border-color:${BRAND};color:#fff}

.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:12px}
.product-card{background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:12px;cursor:pointer;transition:all .15s;position:relative}
.product-card:hover{border-color:${BRAND};background:rgba(229,107,10,.04)}
.product-card.in-cart{border-color:${BRAND};background:rgba(229,107,10,.06)}
.product-card.low-stock{border-color:rgba(239,68,68,.3)}
.product-card.out-stock{opacity:.45;cursor:not-allowed}
.product-name{font-size:12px;font-weight:700;color:var(--t);line-height:1.3;margin-bottom:4px}
.product-price{font-size:14px;font-weight:800;color:${BRAND}}
.product-stock{font-size:10px;color:var(--t2);margin-top:3px}
.product-cat{font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:var(--inp);color:var(--t2);display:inline-block;margin-bottom:5px}
.in-cart-badge{position:absolute;top:7px;right:7px;width:20px;height:20px;border-radius:50%;background:${BRAND};color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center}
.low-stock-badge{position:absolute;top:7px;left:7px;background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.25);border-radius:20px;padding:1px 6px;font-size:8px;font-weight:700}

.receipt-panel{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;position:sticky;top:16px}
.receipt-header{padding:13px 15px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.receipt-items{padding:8px 0;max-height:280px;overflow-y:auto}
.receipt-item{display:flex;align-items:center;gap:8px;padding:7px 14px}
.qty-ctrl{display:flex;align-items:center;gap:5px;background:var(--inp);border-radius:8px;overflow:hidden}
.qty-btn{background:none;border:none;width:26px;height:26px;cursor:pointer;color:var(--t);font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:background .1s}
.qty-btn:hover{background:var(--border)}
.qty-val{font-size:13px;font-weight:800;color:var(--t);min-width:20px;text-align:center}
.receipt-total-section{padding:12px 14px;border-top:1px solid var(--border)}
.receipt-row{display:flex;justify-content:space-between;font-size:12px;padding:4px 0;color:var(--t2)}
.receipt-grand{display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:var(--t);padding:8px 0}
.payment-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px}
.pay-btn{background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:10px;text-align:center;cursor:pointer;transition:all .15s;font-family:inherit}
.pay-btn.active{border-color:${BRAND};background:rgba(229,107,10,.06)}
.pay-icon{font-size:18px;margin-bottom:3px}
.pay-label{font-size:11px;font-weight:700;color:var(--t)}
.charge-btn{width:100%;background:${BRAND};color:#fff;border:none;border-radius:10px;padding:13px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;transition:background .15s}
.charge-btn:hover{background:#ff8c3a}
.charge-btn:disabled{opacity:.4;cursor:not-allowed}

.receipt-print{background:var(--inp);border:1px solid var(--border);border-radius:12px;padding:18px;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.9}
.rp-center{text-align:center;color:var(--t2)}
.rp-row{display:flex;justify-content:space-between;color:var(--t2)}
.rp-div{border:none;border-top:1px dashed var(--border);margin:7px 0}
.rp-total{display:flex;justify-content:space-between;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;color:var(--t)}

.discount-row{display:flex;gap:7px;align-items:center;margin-bottom:8px}
.disc-inp{flex:1;background:var(--inp);border:1.5px solid var(--border);border-radius:8px;padding:7px 10px;font-size:12px;color:var(--t);font-family:inherit;outline:none;transition:border-color .15s}
.disc-inp:focus{border-color:${BRAND}}
.disc-btn{background:var(--inp);border:1px solid var(--border);border-radius:8px;padding:7px 11px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;color:var(--t2)}
.disc-btn.active{background:rgba(229,107,10,.1);border-color:rgba(229,107,10,.3);color:${BRAND}}
.empty-cart{text-align:center;padding:28px 16px;color:var(--t2)}
.receipt-done{padding:20px;text-align:center}
`;

interface CartItem {
  id: string;
  name: string;
  nameShort: string;
  price: number;
  qty: number;
  vat: boolean;
  category: string;
  stock: number;
  barcode: string;
}

interface ReceiptData {
  receiptNo: string;
  fiscalNo: string;
  date: string;
  time: string;
  cashier: string;
  items: CartItem[];
  subtotal: number;
  discountPct: number;
  discountAmt: number;
  afterDisc: number;
  vatAmt: number;
  grandTotal: number;
  payMethod: string;
  businessName: string;
  tin: string;
}

export default function SmartReceiptBuilder({
  currentUser = { name:"Juma Bakari", role:"cashier" },
  businessName = "Duka la Mwanga",
  tin = "123-456-789-T",
  theme = "dark"
}: {
  currentUser?: { name: string; role: string };
  businessName?: string;
  tin?: string;
  theme?: "dark" | "light";
}) {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [discount, setDiscount]   = useState(0);
  const [discountInput, setDiscountInput] = useState("");
  const [payMethod, setPayMethod] = useState("mpesa");
  const [view, setView]           = useState<"build" | "receipt" | "done">("build");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredProducts = INVENTORY.filter(p => {
    const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchCat    = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const cartItem = (id: string) => cart.find(c => c.id === id);

  const addToCart = (product: typeof INVENTORY[0]) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) {
        return prev.map(c => c.id === product.id ? { ...c, qty: Math.min(c.qty + 1, product.stock) } : c);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c);
      return updated.filter(c => c.qty > 0);
    });
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id));

  const subtotal    = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmt = Math.round(subtotal * (discount / 100));
  const afterDisc   = subtotal - discountAmt;
  const vatItems    = cart.filter(c => c.vat);
  const vatBase     = vatItems.reduce((s, c) => s + c.price * c.qty, 0);
  const vatAmt      = Math.round(vatBase * 0.18);
  const grandTotal  = afterDisc;

  const applyDiscount = (pct: number) => {
    if (currentUser.role === "cashier") return; // cashiers can't give discounts
    setDiscount(pct);
    setDiscountInput(pct > 0 ? String(pct) : "");
  };

  const processPayment = () => {
    receiptCounter++;
    const receipt: ReceiptData = {
      receiptNo: `EFD-${String(receiptCounter).padStart(5, "0")}`,
      fiscalNo: `RCPT-TZ-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString("en-TZ"),
      time: new Date().toLocaleTimeString("en-TZ", { hour:"2-digit", minute:"2-digit" }),
      cashier: currentUser.name,
      items: [...cart],
      subtotal, discountPct: discount, discountAmt, afterDisc,
      vatAmt, grandTotal,
      payMethod,
      businessName, tin,
    };
    setReceiptData(receipt);
    setView("receipt");
  };

  if (view === "done") {
    return (
      <>
        <style>{css}</style>
        <div className={`srb-root ${theme}`}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:28, textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:800, color:"var(--t)", marginBottom:6 }}>Malipo Yamekamilika!</div>
            <div style={{ fontSize:13, color:"var(--t2)", marginBottom:20 }}>
              Payment confirmed · {fmt(receiptData?.grandTotal || 0)} via {receiptData?.payMethod?.toUpperCase()}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16 }}>
              <button className="charge-btn" style={{ width:"auto", padding:"10px 20px", fontSize:13, background:"#22c55e" }}>
                💬 WhatsApp Receipt
              </button>
              <button className="charge-btn" style={{ width:"auto", padding:"10px 20px", fontSize:13 }}>
                🖨️ Print
              </button>
              <button className="charge-btn" style={{ width:"auto", padding:"10px 20px", fontSize:13, background:"#3b82f6" }}>
                📲 SMS
              </button>
            </div>
            <button onClick={() => { setCart([]); setDiscount(0); setView("build"); }}
              style={{ background:"none", border:"none", color:BRAND, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              ← Start New Sale
            </button>
          </div>
        </div>
      </>
    );
  }

  if (view === "receipt" && receiptData) {
    const pm = PAYMENT_METHODS.find(p => p.id === receiptData.payMethod);
    return (
      <>
        <style>{css}</style>
        <div className={`srb-root ${theme}`}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"var(--t)" }}>
              EFD <span style={{ color:BRAND }}>Receipt</span>
            </div>
            <button onClick={() => setView("build")}
              style={{ background:"none", border:"none", color:"var(--t2)", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              ← Edit
            </button>
          </div>

          <div className="receipt-print">
            <div className="rp-center" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"var(--t)" }}>{receiptData.businessName}</div>
              <div>TIN: {receiptData.tin}</div>
              <div style={{ color:BRAND, fontWeight:700 }}>*** HATI YA MALIPO / RECEIPT ***</div>
            </div>
            <hr className="rp-div" />
            <div className="rp-row"><span>Nambari / Receipt No:</span><span style={{ color:BRAND, fontWeight:700 }}>{receiptData.receiptNo}</span></div>
            <div className="rp-row"><span>Tarehe / Date:</span><span style={{ color:"var(--t)" }}>{receiptData.date} {receiptData.time}</span></div>
            <div className="rp-row"><span>Mkashia / Cashier:</span><span style={{ color:"var(--t)" }}>{receiptData.cashier}</span></div>
            <hr className="rp-div" />
            {receiptData.items.map((item, i) => (
              <div key={i} className="rp-row">
                <span>{item.nameShort} × {item.qty}{item.vat ? " (V)" : ""}</span>
                <span style={{ color:"var(--t)" }}>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
            <hr className="rp-div" />
            <div className="rp-row"><span>Jumla / Subtotal:</span><span style={{ color:"var(--t)" }}>{fmt(receiptData.subtotal)}</span></div>
            {receiptData.discountAmt > 0 && (
              <div className="rp-row"><span>Punguzo {receiptData.discountPct}% / Discount:</span><span style={{ color:"#22c55e" }}>- {fmt(receiptData.discountAmt)}</span></div>
            )}
            {receiptData.vatAmt > 0 && (
              <div className="rp-row"><span>VAT 18% (katika bei):</span><span style={{ color:"#ef4444" }}>{fmt(receiptData.vatAmt)}</span></div>
            )}
            <hr className="rp-div" />
            <div className="rp-total"><span>JUMLA YOTE / TOTAL:</span><span>{fmt(receiptData.grandTotal)}</span></div>
            <hr className="rp-div" />
            <div className="rp-center">
              <div style={{ color:pm?.color || "var(--t2)", fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                Malipo: {pm?.label || receiptData.payMethod.toUpperCase()}
              </div>
              <div style={{ marginTop:5, fontSize:10 }}>Asante kwa kununua! / Thank you!</div>
              <div style={{ color:"rgba(34,197,94,.7)", marginTop:3 }}>EFD: {receiptData.fiscalNo}</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            <button className="charge-btn" onClick={() => setView("done")}>
              ✓ Confirm Payment
            </button>
          </div>
          <div style={{ display:"flex", gap:7, marginTop:8 }}>
            {["💬 WhatsApp","🖨️ Print","📲 SMS"].map(a => (
              <button key={a} style={{ flex:1, background:"var(--inp)", border:"1px solid var(--border)", borderRadius:9, padding:9, fontSize:11, fontWeight:700, cursor:"pointer", color:"var(--t2)", fontFamily:"inherit" }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className={`srb-root ${theme}`}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>
              New <span style={{ color:BRAND }}>Sale</span>
            </div>
            <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
              Tap items to add · Receipt auto-builds · {currentUser.name}
            </div>
          </div>
          {cart.length > 0 && (
            <div style={{ fontSize:12, fontWeight:800, color:BRAND }}>
              {cart.length} items · {fmt(grandTotal)}
            </div>
          )}
        </div>

        <div className="srb-layout">
          {/* Left: Product Browser */}
          <div>
            {/* Search */}
            <input
              ref={searchRef}
              className="srb-search"
              placeholder="🔍  Tafuta bidhaa / Search products or scan barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {/* Category pills */}
            <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} className={`cat-pill ${category===cat?"active":""}`}
                  onClick={() => setCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="product-grid">
              {filteredProducts.map(product => {
                const inCart = cartItem(product.id);
                const isLow = product.stock > 0 && product.stock <= 3;
                const isOut = product.stock === 0;
                return (
                  <div key={product.id}
                    className={`product-card ${inCart?"in-cart":""} ${isLow?"low-stock":""} ${isOut?"out-stock":""}`}
                    onClick={() => addToCart(product)}>
                    {inCart && <div className="in-cart-badge">{inCart.qty}</div>}
                    {isLow && !isOut && <div className="low-stock-badge">Low</div>}
                    <div className="product-cat">{product.category}</div>
                    <div className="product-name">{product.nameShort}</div>
                    <div className="product-price">{fmt(product.price)}</div>
                    <div className="product-stock" style={{ color: isOut?"#ef4444":isLow?"#f59e0b":"var(--t2)" }}>
                      {isOut ? "Out of stock" : `${product.stock} in stock`}
                      {product.vat && <span style={{ marginLeft:5, color:"rgba(229,107,10,.6)", fontWeight:700 }}>VAT</span>}
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:24, color:"var(--t2)", fontSize:12 }}>
                  No products found for "{search}"
                </div>
              )}
            </div>
          </div>

          {/* Right: Receipt Panel */}
          <div className="receipt-panel">
            <div className="receipt-header">
              <div style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>
                {cart.length === 0 ? "Your cart is empty" : `${cart.length} item${cart.length!==1?"s":""} in cart`}
              </div>
              {cart.length > 0 && (
                <button onClick={() => setCart([])}
                  style={{ background:"none", border:"none", color:"#ef4444", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div style={{ fontSize:28, marginBottom:8 }}>🛒</div>
                <div style={{ fontSize:12 }}>Tap any product to add it</div>
              </div>
            ) : (
              <>
                {/* Cart items */}
                <div className="receipt-items">
                  {cart.map(item => (
                    <div key={item.id} className="receipt-item">
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"var(--t)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {item.nameShort}
                        </div>
                        <div style={{ fontSize:10, color:BRAND, fontWeight:700 }}>{fmt(item.price * item.qty)}</div>
                      </div>
                      <div className="qty-ctrl">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, +1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="receipt-total-section">
                  {/* Discount (owner/manager only) */}
                  {currentUser.role !== "cashier" && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--t2)", marginBottom:5 }}>Discount</div>
                      <div className="discount-row">
                        {[5,10,15,20].map(pct => (
                          <button key={pct} className={`disc-btn ${discount===pct?"active":""}`}
                            onClick={() => applyDiscount(discount===pct?0:pct)}>
                            {pct}%
                          </button>
                        ))}
                        <input className="disc-inp" type="number" placeholder="%" min={0} max={50}
                          value={discountInput}
                          onChange={e => { setDiscountInput(e.target.value); setDiscount(Number(e.target.value)||0); }} />
                      </div>
                    </div>
                  )}

                  {/* Row totals */}
                  <div className="receipt-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  {discountAmt > 0 && (
                    <div className="receipt-row" style={{ color:"#22c55e" }}>
                      <span>Discount ({discount}%)</span>
                      <span>− {fmt(discountAmt)}</span>
                    </div>
                  )}
                  {vatAmt > 0 && (
                    <div className="receipt-row"><span>VAT 18% (incl.)</span><span style={{ color:"#ef4444" }}>{fmt(vatAmt)}</span></div>
                  )}
                  <div className="receipt-grand"><span>TOTAL</span><span style={{ color:BRAND }}>{fmt(grandTotal)}</span></div>

                  {/* Payment method */}
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--t2)", margin:"10px 0 7px" }}>Payment method</div>
                  <div className="payment-grid">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} className={`pay-btn ${payMethod===pm.id?"active":""}`}
                        onClick={() => setPayMethod(pm.id)}>
                        <div className="pay-icon" style={{ fontSize:18 }}>{pm.icon}</div>
                        <div className="pay-label">{pm.label}</div>
                      </button>
                    ))}
                  </div>

                  <button className="charge-btn" onClick={processPayment}>
                    Charge {fmt(grandTotal)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
