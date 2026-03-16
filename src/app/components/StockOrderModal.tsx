import { useState } from "react";

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

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
.ops-btn:disabled{opacity:0.5;cursor:not-allowed}
.ops-btn.full{width:100%;justify-content:center}
.ops-btn.outline{background:transparent;border:1px solid var(--border);color:var(--t2)}
.ops-btn.outline:hover{border-color:${BRAND};color:${BRAND}}
`;

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

interface StockOrderModalProps {
  onClose: () => void;
  onSubmit?: (order: any) => void;
  theme?: "dark" | "light";
}

export function StockOrderModal({ onClose, onSubmit, theme = "dark" }: StockOrderModalProps) {
  const [supplierId, setSupplierId] = useState(1);
  const [orderItems, setOrderItems] = useState<Record<string, string>>({});
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const supplier = SAMPLE_SUPPLIERS.find(s => s.id === supplierId)!;
  const totalItems = Object.values(orderItems).reduce((s, q) => s + (Number(q) || 0), 0);
  const totalCost = supplier.items.reduce((s, item) => {
    return s + (Number(orderItems[item.sku] || 0) * item.price);
  }, 0);

  const handleSubmit = () => {
    setSubmitted(true);
    const order = {
      supplier: supplier.name,
      items: supplier.items.filter(i => (orderItems[i.sku] || 0) > 0).map(i => ({
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
