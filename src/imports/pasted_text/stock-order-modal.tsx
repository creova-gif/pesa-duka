import { useState } from "react";

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.ops-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.ops-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.ops-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.ops-card{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.ops-hdr{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.ops-title{font-size:15px;font-weight:800;color:var(--t)}
.ops-body{padding:20px}
.ops-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${BRAND};margin-bottom:10px}
.ops-inp{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;font-weight:500;color:var(--t);font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .15s}
.ops-inp:focus{border-color:${BRAND}}
.ops-select{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;color:var(--t);font-family:inherit;outline:none;appearance:none;transition:border-color .15s}
.ops-select:focus{border-color:${BRAND}}
.ops-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.ops-field{margin-bottom:14px}
.ops-field:last-child{margin-bottom:0}
.ops-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;display:inline-flex;align-items:center;gap:6px}
.ops-btn:hover{background:#ff8c3a}
.ops-btn.full{width:100%;justify-content:center}
.ops-btn.outline{background:transparent;border:1px solid var(--border);color:var(--t2)}
.ops-btn.outline:hover{border-color:${BRAND};color:${BRAND}}
.ops-btn.green{background:#22c55e}
.ops-tag{display:inline-flex;align-items:center;border-radius:20px;padding:3px 9px;font-size:10px;font-weight:800;border:1px solid}
.ops-divider{border:none;border-top:1px solid var(--border);margin:14px 0}
`;

// ─── StockOrderModal ──────────────────────────────────────────────────────────
// Order stock from linked suppliers without leaving the app.
const SAMPLE_SUPPLIERS = [
  { id: 1, name: "Kariakoo Wholesalers", phone: "+255 712 111 222", items: [
    { name: "Unga wa Sembe 2kg", unit: "Bag", price: 2800, sku: "UGA-2KG" },
    { name: "Sukari 1kg", unit: "Pack", price: 2100, sku: "SUK-1KG" },
    { name: "Mafuta ya Kupikia 1L", unit: "Bottle", price: 3400, sku: "MAF-1L" },
  ]},
  { id: 2, name: "Pia Distributors", phone: "+255 754 333 444", items: [
    { name: "Sabuni Ariel 500g", unit: "Pack", price: 1100, sku: "SAB-500" },
    { name: "Coke 500ml (crate)", unit: "Crate/24", price: 18000, sku: "COK-500" },
  ]},
];

export function StockOrderModal({ onClose, onSubmit, theme = "dark" }) {
  const [supplierId, setSupplierId] = useState(1);
  const [orderItems, setOrderItems] = useState({});
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const supplier = SAMPLE_SUPPLIERS.find(s => s.id === supplierId);
  const totalItems = Object.values(orderItems).reduce((s, q) => s + (Number(q) || 0), 0);
  const totalCost = supplier.items.reduce((s, item) => {
    return s + (Number(orderItems[item.sku] || 0) * item.price);
  }, 0);

  const handleSubmit = () => {
    setSubmitted(true);
    const order = {
      supplier: supplier.name,
      items: supplier.items.filter(i => orderItems[i.sku] > 0).map(i => ({
        ...i, qty: orderItems[i.sku]
      })),
      totalCost, deliveryDate, note,
    };
    onSubmit?.(order);
  };

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className={`ops-root ${theme}`}>
        <div className="ops-card">
          <div className="ops-hdr">
            <span className="ops-title">📦 Order Stock</span>
            <button onClick={onClose} style={{ background:"none",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:18 }}>✕</button>
          </div>
          <div className="ops-body">
            {submitted ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:16, fontWeight:800, color:"var(--t)" }}>Order Sent!</div>
                <div style={{ fontSize:12, color:"var(--t2)", marginTop:6, lineHeight:1.6 }}>
                  Your order has been sent to {supplier.name} via WhatsApp.<br/>
                  Stock will auto-update when you confirm delivery.
                </div>
                <button className="ops-btn full" style={{ marginTop:20 }} onClick={onClose}>Done</button>
              </div>
            ) : (
              <>
                <div className="ops-field">
                  <div className="ops-lbl">Supplier</div>
                  <select className="ops-select" value={supplierId}
                    onChange={e => { setSupplierId(Number(e.target.value)); setOrderItems({}); }}>
                    {SAMPLE_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="ops-lbl" style={{ marginBottom:8 }}>Select Items & Quantities</div>
                {supplier.items.map(item => (
                  <div key={item.sku} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"var(--t)" }}>{item.name}</div>
                      <div style={{ fontSize:11, color:"var(--t2)", marginTop:1 }}>
                        {fmt(item.price)} per {item.unit} · {item.sku}
                      </div>
                    </div>
                    <input
                      type="number" min="0" placeholder="0"
                      value={orderItems[item.sku] || ""}
                      onChange={e => setOrderItems({ ...orderItems, [item.sku]: e.target.value })}
                      style={{ width:56, background:"var(--inp)", border:"1.5px solid var(--border)", borderRadius:8, padding:"6px 8px", fontSize:14, fontWeight:700, color:"var(--t)", fontFamily:"inherit", outline:"none", textAlign:"center" }}
                    />
                    <span style={{ fontSize:12, color:BRAND, fontWeight:700, minWidth:60, textAlign:"right" }}>
                      {orderItems[item.sku] ? fmt(Number(orderItems[item.sku]) * item.price) : "—"}
                    </span>
                  </div>
                ))}

                <div style={{ display:"flex",justifyContent:"space-between",padding:"12px 0",marginBottom:14 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--t2)" }}>
                    {totalItems} units
                  </span>
                  <span style={{ fontSize:16, fontWeight:800, color:BRAND }}>
                    {totalCost > 0 ? fmt(totalCost) : "TSh 0"}
                  </span>
                </div>

                <div className="ops-row">
                  <div>
                    <div className="ops-lbl">Expected Delivery</div>
                    <input type="date" className="ops-inp" value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)} />
                  </div>
                  <div>
                    <div className="ops-lbl">Note</div>
                    <input type="text" className="ops-inp" placeholder="Optional..." value={note}
                      onChange={e => setNote(e.target.value)} />
                  </div>
                </div>

                <div style={{ display:"flex",gap:8,marginTop:4 }}>
                  <button className="ops-btn outline" onClick={onClose}>Cancel</button>
                  <button className="ops-btn" style={{ flex:1, justifyContent:"center" }}
                    disabled={totalItems === 0}
                    onClick={handleSubmit}>
                    💬 Send to {supplier.name}
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

// ─── StaffTracker ─────────────────────────────────────────────────────────────
// Per-staff sales performance, shift log, and loss alerts
const SAMPLE_STAFF = [
  { id: 1, name: "Amina Hassan", role: "Owner", avatar: "AH", color: BRAND,
    todaySales: 87400, txns: 16, shift: "07:00–15:00", discounts: 0, voids: 0 },
  { id: 2, name: "Juma Bakari", role: "Cashier", avatar: "JB", color: "#3b82f6",
    todaySales: 54200, txns: 11, shift: "07:00–15:00", discounts: 2, voids: 1 },
  { id: 3, name: "Fatuma Ali", role: "Cashier", avatar: "FA", color: "#22c55e",
    todaySales: 43100, txns: 9, shift: "15:00–22:00", discounts: 0, voids: 0 },
];

export function StaffTracker({ theme = "dark" }) {
  const [expanded, setExpanded] = useState(null);
  const totalSales = SAMPLE_STAFF.reduce((s, st) => s + st.todaySales, 0);
  const alerts = SAMPLE_STAFF.filter(s => s.voids > 0 || s.discounts > 1);

  return (
    <>
      <style>{BASE_CSS + `
        .st-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:8px;cursor:pointer;transition:border-color .15s}
        .st-card:hover{border-color:rgba(229,107,10,.4)}
        .st-card.exp{border-color:${BRAND}}
        .st-top{display:flex;align-items:center;gap:12px}
        .st-ava{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0}
        .st-bar{height:5px;background:var(--border);border-radius:3px;margin-top:8px;overflow:hidden}
        .st-bar-fill{height:100%;border-radius:3px}
        .st-exp{padding-top:12px;margin-top:12px;border-top:1px solid var(--border)}
        .st-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .st-detail{background:var(--inp);border-radius:9px;padding:9px}
        .alert-banner{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:#ef4444;font-weight:600}
      `}</style>
      <div className={`ops-root ${theme}`}>
        <div style={{ marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>Staff <span style={{ color:BRAND }}>Performance</span></div>
            <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>Today · {fmt(totalSales)} total</div>
          </div>
          <button className="ops-btn">+ Add Staff</button>
        </div>

        {alerts.length > 0 && (
          <div className="alert-banner">
            ⚠️ {alerts.length} staff member{alerts.length > 1 ? "s" : ""} with voids or excessive discounts today — review below
          </div>
        )}

        {SAMPLE_STAFF.map(staff => {
          const sharePct = Math.round((staff.todaySales / totalSales) * 100);
          const isExp = expanded === staff.id;
          const hasAlert = staff.voids > 0 || staff.discounts > 1;
          return (
            <div key={staff.id} className={`st-card ${isExp ? "exp" : ""}`}
              onClick={() => setExpanded(isExp ? null : staff.id)}
              style={hasAlert ? { borderColor: "rgba(239,68,68,.4)" } : {}}>
              <div className="st-top">
                <div className="st-ava" style={{ background: staff.color }}>{staff.avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{staff.name}</span>
                    {hasAlert && <span style={{ fontSize:10, color:"#ef4444", fontWeight:700 }}>⚠️ Alert</span>}
                  </div>
                  <div style={{ fontSize:11, color:"var(--t2)", marginTop:1 }}>
                    {staff.role} · Shift: {staff.shift}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:"var(--t)" }}>{fmt(staff.todaySales)}</div>
                  <div style={{ fontSize:11, color:"var(--t2)" }}>{staff.txns} txns · {sharePct}%</div>
                </div>
              </div>
              <div className="st-bar">
                <div className="st-bar-fill" style={{ width:`${sharePct}%`, background:staff.color }} />
              </div>
              {isExp && (
                <div className="st-exp" onClick={e => e.stopPropagation()}>
                  <div className="st-detail-grid">
                    {[
                      { label:"Sales", value:fmt(staff.todaySales) },
                      { label:"Transactions", value:staff.txns },
                      { label:"Avg per Txn", value:fmt(Math.round(staff.todaySales/staff.txns)) },
                      { label:"Voids", value:staff.voids, alert:staff.voids > 0 },
                      { label:"Discounts", value:staff.discounts, alert:staff.discounts > 1 },
                      { label:"Shift", value:staff.shift },
                    ].map(d => (
                      <div className="st-detail" key={d.label}>
                        <div style={{ fontSize:9, fontWeight:700, color:"var(--t2)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>{d.label}</div>
                        <div style={{ fontSize:13, fontWeight:800, color: d.alert ? "#ef4444" : "var(--t)" }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:7, marginTop:12 }}>
                    <button className="ops-btn outline" style={{ flex:1, justifyContent:"center", fontSize:11 }}>View Full Log</button>
                    {hasAlert && (
                      <button className="ops-btn" style={{ flex:1, justifyContent:"center", fontSize:11, background:"#ef4444" }}>
                        ⚠️ Review Alert
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── InvoiceGenerator ─────────────────────────────────────────────────────────
// Formal PDF invoices and proforma quotes for B2B buyers
export function InvoiceGenerator({ theme = "dark" }) {
  const [type, setType] = useState("invoice");
  const [clientName, setClientName] = useState("Mama Ntilie Restaurant");
  const [clientPhone, setClientPhone] = useState("+255 712 998 776");
  const [items, setItems] = useState([
    { desc: "Unga wa Sembe 2kg", qty: 10, price: 3500 },
    { desc: "Mafuta ya Kupikia 1L", qty: 5, price: 4200 },
  ]);
  const [notes, setNotes] = useState("Malipo ndani ya siku 7 / Payment within 7 days");
  const [generated, setGenerated] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const vat = Math.round(subtotal * 0.18);
  const total = subtotal + vat;
  const invNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 100).padStart(3,"0")}`;

  const addItem = () => setItems([...items, { desc: "", qty: 1, price: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    setItems(updated);
  };

  return (
    <>
      <style>{BASE_CSS + `
        .inv-preview{background:var(--inp);border:1px dashed var(--border);border-radius:12px;padding:20px;margin-top:16px;font-family:'Courier New',monospace;font-size:12px;line-height:1.8;color:var(--t2)}
        .inv-preview-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:var(--t);text-align:center;margin-bottom:4px}
        .inv-preview-sub{text-align:center;font-size:11px;margin-bottom:12px}
        .inv-line{display:flex;justify-content:space-between}
        .inv-hr{border:none;border-top:1px dashed var(--border);margin:8px 0}
        .type-toggle{display:flex;background:var(--inp);border-radius:9px;overflow:hidden;margin-bottom:16px}
        .type-btn{flex:1;padding:9px;font-size:12px;font-weight:700;border:none;cursor:pointer;font-family:inherit;background:transparent;color:var(--t2);transition:all .15s}
        .type-btn.active{background:${BRAND};color:#fff}
        .item-row{display:grid;grid-template-columns:1fr 50px 80px 24px;gap:8px;align-items:center;margin-bottom:8px}
      `}</style>
      <div className={`ops-root ${theme}`}>
        <div style={{ fontSize:18, fontWeight:800, color:"var(--t)", marginBottom:4 }}>
          Invoice <span style={{ color:BRAND }}>Generator</span>
        </div>
        <div style={{ fontSize:12, color:"var(--t2)", marginBottom:16 }}>
          Create formal invoices and proforma quotes for B2B clients
        </div>

        <div className="type-toggle">
          <button className={`type-btn ${type==="invoice"?"active":""}`} onClick={() => setType("invoice")}>📄 Tax Invoice</button>
          <button className={`type-btn ${type==="proforma"?"active":""}`} onClick={() => setType("proforma")}>📋 Proforma Quote</button>
          <button className={`type-btn ${type==="receipt"?"active":""}`} onClick={() => setType("receipt")}>🧾 Receipt</button>
        </div>

        <div className="ops-row">
          <div>
            <div className="ops-lbl">Client Name</div>
            <input className="ops-inp" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div>
            <div className="ops-lbl">Client Phone</div>
            <input className="ops-inp" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
          </div>
        </div>

        <div className="ops-lbl">Line Items</div>
        {items.map((item, i) => (
          <div className="item-row" key={i}>
            <input className="ops-inp" placeholder="Description" value={item.desc}
              onChange={e => updateItem(i, "desc", e.target.value)} />
            <input className="ops-inp" type="number" placeholder="Qty" value={item.qty}
              onChange={e => updateItem(i, "qty", Number(e.target.value))} style={{ textAlign:"center" }} />
            <input className="ops-inp" type="number" placeholder="Price" value={item.price}
              onChange={e => updateItem(i, "price", Number(e.target.value))} />
            <button onClick={() => removeItem(i)}
              style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:16, padding:0 }}>
              ×
            </button>
          </div>
        ))}
        <button className="ops-btn outline" style={{ marginBottom:16 }} onClick={addItem}>+ Add Line</button>

        <div className="ops-field">
          <div className="ops-lbl">Notes / Payment Terms</div>
          <input className="ops-inp" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {/* Preview */}
        <div className="inv-preview">
          <div className="inv-preview-title">DUKA LA MWANGA</div>
          <div className="inv-preview-sub">Kariakoo, Dar es Salaam · +255 712 345 678 · TIN: 123-456-789</div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span>{type === "proforma" ? "PROFORMA QUOTE" : type === "receipt" ? "RECEIPT" : "TAX INVOICE"}</span>
            <span>{invNumber}</span>
          </div>
          <div className="inv-line"><span>To: {clientName}</span><span>{new Date().toLocaleDateString("en-TZ")}</span></div>
          <hr className="inv-hr" />
          {items.map((item, i) => (
            <div className="inv-line" key={i}>
              <span>{item.desc} ×{item.qty}</span>
              <span>{fmt(item.qty * item.price)}</span>
            </div>
          ))}
          <hr className="inv-hr" />
          <div className="inv-line"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="inv-line"><span>VAT 18%</span><span>{fmt(vat)}</span></div>
          <div className="inv-line" style={{ fontWeight:800, color:"var(--t)" }}><span>TOTAL</span><span>{fmt(total)}</span></div>
          <hr className="inv-hr" />
          <div style={{ textAlign:"center", fontSize:11 }}>{notes}</div>
        </div>

        <div style={{ display:"flex", gap:8, marginTop:14 }}>
          <button className="ops-btn" style={{ flex:1, justifyContent:"center" }}
            onClick={() => setGenerated(true)}>
            {generated ? "✅ Exported!" : "⬇️ Export PDF"}
          </button>
          <button className="ops-btn outline" style={{ flex:1, justifyContent:"center" }}>
            💬 Send via WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
