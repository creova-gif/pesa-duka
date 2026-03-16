import { useState } from "react";

// ─── InvoiceManager (Full System) ────────────────────────────────────────────
// Tabs: All Invoices | Create | Client History | Overdue
// Full lifecycle: Draft → Sent → Paid/Overdue + payment recording

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

const STATUS_CONFIG = {
  draft:   { label:"Draft",   color:"var(--t2)", bg:"var(--inp)",              border:"var(--border)" },
  sent:    { label:"Sent",    color:"#3b82f6",   bg:"rgba(59,130,246,.1)",     border:"rgba(59,130,246,.25)" },
  paid:    { label:"Paid",    color:"#22c55e",   bg:"rgba(34,197,94,.1)",      border:"rgba(34,197,94,.25)" },
  overdue: { label:"Overdue", color:"#ef4444",   bg:"rgba(239,68,68,.1)",      border:"rgba(239,68,68,.25)" },
  partial: { label:"Partial", color:"#f59e0b",   bg:"rgba(245,158,11,.1)",     border:"rgba(245,158,11,.25)" },
};

const INIT_INVOICES = [
  { id:"INV-2025-041", type:"invoice", client:"Mama Ntilie Restaurant", phone:"+255 712 998 776", date:"2025-03-01", due:"2025-03-15", status:"overdue", subtotal:87500, vat:15750, total:103250, paid:0, items:[{desc:"Unga wa Sembe 2kg",qty:25,price:3500},{desc:"Mafuta ya Kupikia 1L",qty:10,price:4200}], notes:"Malipo ndani ya siku 14" },
  { id:"INV-2025-042", type:"invoice", client:"Karibu Lodge", phone:"+255 754 334 567", date:"2025-03-05", due:"2025-03-19", status:"paid", subtotal:145000, vat:26100, total:171100, paid:171100, items:[{desc:"Sukari 1kg",qty:30,price:2800},{desc:"Unga wa Sembe 2kg",qty:20,price:3500}], notes:"" },
  { id:"INV-2025-043", type:"proforma", client:"Bora Catering Co.", phone:"+255 699 887 001", date:"2025-03-10", due:"2025-03-24", status:"sent", subtotal:220000, vat:39600, total:259600, paid:0, items:[{desc:"Mixed Grocery Bundle",qty:1,price:220000}], notes:"Quote valid for 14 days" },
  { id:"INV-2025-044", type:"invoice", client:"Mama Ntilie Restaurant", phone:"+255 712 998 776", date:"2025-03-12", due:"2025-03-26", status:"partial", subtotal:67000, vat:12060, total:79060, paid:40000, items:[{desc:"Cooking oil 1L",qty:10,price:4200},{desc:"Tomatoes (crate)",qty:5,price:8000}], notes:"" },
  { id:"INV-2025-045", type:"invoice", client:"Sunset Bar & Grill", phone:"+255 765 223 445", date:"2025-03-14", due:"2025-03-28", status:"draft", subtotal:54000, vat:9720, total:63720, paid:0, items:[{desc:"Soda crates",qty:3,price:18000}], notes:"Draft" },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.inv-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.inv-root.dark {--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.inv-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.inv-tabs{display:flex;gap:4px;margin-bottom:16px;background:var(--inp);border-radius:11px;padding:3px}
.inv-tab{flex:1;padding:7px 5px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:none;font-family:inherit;background:transparent;color:var(--t2);transition:all .15s;text-align:center}
.inv-tab.active{background:${BRAND};color:#fff}
.inv-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${BRAND};margin-bottom:8px}
.inv-stat{background:var(--card);border:1px solid var(--border);border-radius:11px;padding:11px 13px}
.inv-card{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:14px;margin-bottom:8px;cursor:pointer;transition:all .15s}
.inv-card:hover{border-color:rgba(229,107,10,.4)}
.inv-card.exp{border-color:${BRAND}}
.inv-badge{display:inline-flex;align-items:center;border-radius:20px;padding:3px 9px;font-size:9px;font-weight:800;border:1px solid}
.inv-expand{padding-top:12px;margin-top:12px;border-top:1px solid var(--border)}
.inv-line-row{display:flex;justify-content:space-between;font-size:11px;color:var(--t2);padding:5px 0;border-bottom:1px solid var(--border)}
.inv-line-row:last-child{border-bottom:none}
.inv-inp{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:8px;padding:8px 11px;font-size:13px;color:var(--t);font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .15s}
.inv-inp:focus{border-color:${BRAND}}
.inv-field{margin-bottom:12px}
.inv-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.inv-item-row{display:grid;grid-template-columns:1fr 44px 80px 22px;gap:7px;align-items:center;margin-bottom:7px}
.inv-preview{background:var(--inp);border:1px dashed var(--border);border-radius:11px;padding:16px;margin-bottom:12px;font-family:'Courier New',monospace;font-size:11px;line-height:1.85;color:var(--t2)}
.inv-btn{background:${BRAND};color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;display:inline-flex;align-items:center;gap:5px}
.inv-btn:hover{background:#ff8c3a}
.inv-btn.out{background:transparent;border:1px solid var(--border);color:var(--t2)}
.inv-btn.out:hover{border-color:${BRAND};color:${BRAND}}
.inv-btn.grn{background:#22c55e}
.inv-pay-row{display:flex;align-items:center;justify-content:space-between;background:var(--inp);border-radius:10px;padding:10px 13px;margin-bottom:7px}
.inv-progress{height:5px;background:var(--border);border-radius:3px;margin-top:6px;overflow:hidden}
.inv-progress-fill{height:100%;border-radius:3px;background:${BRAND}}
.inv-client-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:8px}
`;

export default function InvoiceManager({ theme = "dark" }) {
  const [tab, setTab] = useState("list");
  const [invoices, setInvoices] = useState(INIT_INVOICES);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [invType, setInvType] = useState("invoice");
  const [client, setClient] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState([{ desc:"", qty:1, price:0 }]);
  const [notes, setNotes] = useState("Malipo ndani ya siku 14 / Payment within 14 days");
  const [dueDate, setDueDate] = useState("");
  const [paymentModal, setPaymentModal] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const vat = Math.round(subtotal * 0.18);
  const total = subtotal + vat;

  const totalOwed = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + (i.total - i.paid), 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  const filtered = invoices.filter(inv =>
    statusFilter === "all" || inv.status === statusFilter
  );

  const recordPayment = () => {
    if (!paymentModal || !payAmount) return;
    const amount = Number(payAmount);
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== paymentModal.id) return inv;
      const newPaid = inv.paid + amount;
      const newStatus = newPaid >= inv.total ? "paid" : newPaid > 0 ? "partial" : inv.status;
      return { ...inv, paid: newPaid, status: newStatus };
    }));
    setPaymentModal(null);
    setPayAmount("");
  };

  const addItem = () => setItems(prev => [...prev, { desc:"", qty:1, price:0 }]);
  const removeItem = (i) => setItems(prev => prev.filter((_,idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(prev => prev.map((item,idx) =>
    idx === i ? { ...item, [field]: field === "desc" ? val : Number(val) } : item
  ));

  const createInvoice = () => {
    if (!client || subtotal === 0) return;
    const newInv = {
      id: `INV-2025-${String(invoices.length + 46).padStart(3,"0")}`,
      type: invType, client, phone: clientPhone,
      date: new Date().toISOString().split("T")[0],
      due: dueDate,
      status: "draft",
      subtotal, vat, total, paid: 0,
      items: [...items], notes,
    };
    setInvoices(prev => [newInv, ...prev]);
    setTab("list");
    setClient(""); setItems([{ desc:"", qty:1, price:0 }]);
  };

  const clients = [...new Set(invoices.map(i => i.client))];

  return (
    <>
      <style>{css}</style>
      <div className={`inv-root ${theme}`}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>
              Invoice <span style={{ color:BRAND }}>Manager</span>
            </div>
            <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>
              {invoices.length} invoices · {fmt(totalOwed)} outstanding
            </div>
          </div>
          <button className="inv-btn" onClick={() => setTab("create")}>+ New Invoice</button>
        </div>

        {/* Tabs */}
        <div className="inv-tabs">
          {[["list","📋 All Invoices"],["create","✏️ Create"],["clients","👤 Clients"],["overdue","⚠️ Overdue"]].map(([k,l]) => (
            <button key={k} className={`inv-tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* ── LIST ── */}
        {tab === "list" && (
          <>
            {/* Summary */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
              {[
                ["Outstanding", fmt(totalOwed), "#ef4444"],
                ["Collected", fmt(totalPaid), "#22c55e"],
                ["Overdue", `${overdueCount} invoices`, "#ef4444"],
                ["This Month", fmt(invoices.filter(i=>i.date.startsWith("2025-03")).reduce((s,i)=>s+i.total,0)), BRAND],
              ].map(([l,v,c]) => (
                <div className="inv-stat" key={l}>
                  <div style={{ fontSize:9, fontWeight:700, color:"var(--t2)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:c }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display:"flex", gap:5, marginBottom:14, flexWrap:"wrap" }}>
              {["all","draft","sent","paid","overdue","partial"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding:"4px 11px", borderRadius:20, fontSize:10, fontWeight:700, cursor:"pointer", border:"1px solid var(--border)", background:statusFilter===s?BRAND:"var(--card)", color:statusFilter===s?"#fff":"var(--t2)", fontFamily:"inherit" }}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>

            {/* Invoice list */}
            {filtered.map(inv => {
              const sc = STATUS_CONFIG[inv.status];
              const isExp = expanded === inv.id;
              const paidPct = Math.round((inv.paid / inv.total) * 100);
              const remaining = inv.total - inv.paid;
              return (
                <div key={inv.id} className={`inv-card ${isExp ? "exp" : ""}`}
                  onClick={() => setExpanded(isExp ? null : inv.id)}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                        <span style={{ fontSize:12, fontWeight:800, color:"var(--t)" }}>{inv.id}</span>
                        <span className="inv-badge" style={{ background:sc.bg, borderColor:sc.border, color:sc.color }}>{sc.label}</span>
                        <span style={{ fontSize:9, fontWeight:700, color:"var(--t3)", background:"var(--inp)", padding:"2px 6px", borderRadius:6 }}>
                          {inv.type === "proforma" ? "Proforma" : "Invoice"}
                        </span>
                      </div>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--t)" }}>{inv.client}</div>
                      <div style={{ fontSize:10, color:"var(--t2)", marginTop:1 }}>
                        Due: {inv.due || "—"}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:"var(--t)" }}>{fmt(inv.total)}</div>
                      {inv.status !== "paid" && remaining > 0 && (
                        <div style={{ fontSize:10, color:"#ef4444", marginTop:1 }}>Owes {fmt(remaining)}</div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for partial */}
                  {(inv.status === "partial" || inv.status === "paid") && (
                    <div className="inv-progress" style={{ marginTop:8 }}>
                      <div className="inv-progress-fill" style={{ width:`${paidPct}%`, background: inv.status === "paid" ? "#22c55e" : BRAND }} />
                    </div>
                  )}

                  {isExp && (
                    <div className="inv-expand" onClick={e => e.stopPropagation()}>
                      {/* Line items */}
                      {inv.items.map((item, i) => (
                        <div className="inv-line-row" key={i}>
                          <span>{item.desc} × {item.qty}</span>
                          <span style={{ fontWeight:700, color:"var(--t)" }}>{fmt(item.qty * item.price)}</span>
                        </div>
                      ))}
                      <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", marginTop:2 }}>
                        <span style={{ fontSize:11, color:"var(--t2)" }}>Subtotal / VAT (18%)</span>
                        <span style={{ fontSize:11, color:"var(--t2)" }}>{fmt(inv.subtotal)} + {fmt(inv.vat)}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderTop:"1px solid var(--border)" }}>
                        <span style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>Total</span>
                        <span style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{fmt(inv.total)}</span>
                      </div>
                      {inv.paid > 0 && (
                        <div style={{ display:"flex", justifyContent:"space-between", padding:"5px 0" }}>
                          <span style={{ fontSize:11, color:"#22c55e", fontWeight:600 }}>Paid</span>
                          <span style={{ fontSize:11, color:"#22c55e", fontWeight:700 }}>{fmt(inv.paid)}</span>
                        </div>
                      )}
                      {/* Actions */}
                      <div style={{ display:"flex", gap:7, marginTop:12, flexWrap:"wrap" }}>
                        {inv.status !== "paid" && (
                          <button className="inv-btn grn" style={{ fontSize:11, padding:"6px 12px" }}
                            onClick={() => { setPaymentModal(inv); setPayAmount(String(inv.total - inv.paid)); }}>
                            💵 Record Payment
                          </button>
                        )}
                        <button className="inv-btn" style={{ fontSize:11, padding:"6px 12px" }}>💬 Send WhatsApp</button>
                        <button className="inv-btn out" style={{ fontSize:11, padding:"6px 12px" }}>📄 PDF</button>
                        {inv.status === "draft" && (
                          <button className="inv-btn" style={{ fontSize:11, padding:"6px 12px", background:"#3b82f6" }}
                            onClick={() => setInvoices(prev => prev.map(i => i.id === inv.id ? {...i, status:"sent"} : i))}>
                            📤 Mark Sent
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── CREATE ── */}
        {tab === "create" && (
          <>
            {/* Type toggle */}
            <div style={{ display:"flex", background:"var(--inp)", borderRadius:9, overflow:"hidden", marginBottom:14 }}>
              {[["invoice","📄 Tax Invoice"],["proforma","📋 Proforma"],["receipt","🧾 Receipt"]].map(([k,l]) => (
                <button key={k} onClick={() => setInvType(k)}
                  style={{ flex:1, padding:"9px", fontSize:11, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit",
                           background:invType===k?BRAND:"transparent", color:invType===k?"#fff":"var(--t2)", transition:"all .15s" }}>
                  {l}
                </button>
              ))}
            </div>

            <div className="inv-row2" style={{ marginBottom:12 }}>
              <div className="inv-field">
                <div className="inv-lbl">Client Name</div>
                <input className="inv-inp" value={client} onChange={e => setClient(e.target.value)} placeholder="Business or person name" list="clientList" />
                <datalist id="clientList">{clients.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="inv-field">
                <div className="inv-lbl">Phone</div>
                <input className="inv-inp" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+255 7XX XXX XXX" />
              </div>
            </div>
            <div className="inv-row2" style={{ marginBottom:14 }}>
              <div>
                <div className="inv-lbl">Due Date</div>
                <input type="date" className="inv-inp" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <div className="inv-lbl">Notes</div>
                <input className="inv-inp" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="inv-lbl">Line Items</div>
            {items.map((item, i) => (
              <div className="inv-item-row" key={i}>
                <input className="inv-inp" value={item.desc} placeholder="Item description" onChange={e => updateItem(i,"desc",e.target.value)} />
                <input className="inv-inp" type="number" value={item.qty} style={{ textAlign:"center" }} onChange={e => updateItem(i,"qty",e.target.value)} />
                <input className="inv-inp" type="number" value={item.price} onChange={e => updateItem(i,"price",e.target.value)} />
                <button onClick={() => removeItem(i)} style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:18, padding:0 }}>×</button>
              </div>
            ))}
            <button className="inv-btn out" style={{ marginBottom:14, fontSize:11 }} onClick={addItem}>+ Add Line</button>

            {/* Live preview */}
            <div className="inv-preview">
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, color:"var(--t)", textAlign:"center", marginBottom:3 }}>DUKA LA MWANGA</div>
              <div style={{ textAlign:"center", marginBottom:8 }}>Kariakoo, Dar es Salaam · TIN: 123-456-789-T</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span>{invType === "proforma" ? "PROFORMA QUOTE" : invType === "receipt" ? "RECEIPT" : "TAX INVOICE"}</span>
                <span>INV-2025-046</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span>To: {client || "—"}</span>
                <span>{new Date().toLocaleDateString("en-TZ")}</span>
              </div>
              <hr style={{ border:"none", borderTop:"1px dashed var(--border)", margin:"6px 0" }} />
              {items.filter(i => i.desc).map((item, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>{item.desc} ×{item.qty}</span>
                  <span>{fmt(item.qty * item.price)}</span>
                </div>
              ))}
              <hr style={{ border:"none", borderTop:"1px dashed var(--border)", margin:"6px 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between" }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between" }}><span>VAT 18%</span><span>{fmt(vat)}</span></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, color:"var(--t)", fontSize:13 }}>
                <span>TOTAL</span><span>{fmt(total)}</span>
              </div>
              {notes && <><hr style={{ border:"none", borderTop:"1px dashed var(--border)", margin:"6px 0" }} /><div style={{ textAlign:"center" }}>{notes}</div></>}
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button className="inv-btn" style={{ flex:1, justifyContent:"center" }} onClick={createInvoice}>💾 Save Invoice</button>
              <button className="inv-btn out" style={{ flex:1, justifyContent:"center" }}>💬 Save + Send WA</button>
            </div>
          </>
        )}

        {/* ── CLIENTS ── */}
        {tab === "clients" && clients.map(clientName => {
          const clientInvs = invoices.filter(i => i.client === clientName);
          const total = clientInvs.reduce((s,i) => s + i.total, 0);
          const owed  = clientInvs.filter(i => i.status !== "paid").reduce((s,i) => s + (i.total - i.paid), 0);
          const paid  = clientInvs.filter(i => i.status === "paid").reduce((s,i) => s + i.total, 0);
          return (
            <div key={clientName} className="inv-client-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:"var(--t)" }}>{clientName}</div>
                  <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
                    {clientInvs.length} invoices · {clientInvs[0]?.phone}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  {owed > 0 && <div style={{ fontSize:13, fontWeight:800, color:"#ef4444" }}>{fmt(owed)} owed</div>}
                  <div style={{ fontSize:11, color:"#22c55e", marginTop:1 }}>
                    {fmt(paid)} collected
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:7 }}>
                <button className="inv-btn" style={{ fontSize:11, padding:"6px 12px" }}>+ New Invoice</button>
                <button className="inv-btn out" style={{ fontSize:11, padding:"6px 12px" }}>View History</button>
                {owed > 0 && <button className="inv-btn" style={{ fontSize:11, padding:"6px 12px", background:"#22c55e" }}>💵 Record Payment</button>}
              </div>
            </div>
          );
        })}

        {/* ── OVERDUE ── */}
        {tab === "overdue" && (
          <>
            {invoices.filter(i => i.status === "overdue" || i.status === "partial").length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px", color:"var(--t2)" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🎉</div>
                <div>No overdue invoices!</div>
              </div>
            ) : invoices.filter(i => i.status === "overdue" || i.status === "partial").map(inv => {
              const sc = STATUS_CONFIG[inv.status];
              const remaining = inv.total - inv.paid;
              return (
                <div key={inv.id} className="inv-pay-row">
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:12, fontWeight:800, color:"var(--t)" }}>{inv.client}</span>
                      <span className="inv-badge" style={{ background:sc.bg, borderColor:sc.border, color:sc.color }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize:10, color:"var(--t2)", marginTop:2 }}>{inv.id} · Due {inv.due}</div>
                    {inv.status === "partial" && (
                      <div className="inv-progress" style={{ marginTop:5, maxWidth:120 }}>
                        <div className="inv-progress-fill" style={{ width:`${Math.round((inv.paid/inv.total)*100)}%` }} />
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#ef4444" }}>{fmt(remaining)}</div>
                    <div style={{ display:"flex", gap:5, marginTop:5, justifyContent:"flex-end" }}>
                      <button className="inv-btn" style={{ fontSize:10, padding:"5px 9px" }}
                        onClick={() => { setPaymentModal(inv); setPayAmount(String(remaining)); }}>
                        💵 Pay
                      </button>
                      <button className="inv-btn out" style={{ fontSize:10, padding:"5px 9px" }}>💬 WA</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Payment Modal */}
        {paymentModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:20, width:"100%", maxWidth:380 }}>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--t)", marginBottom:3 }}>Record Payment</div>
              <div style={{ fontSize:12, color:"var(--t2)", marginBottom:14 }}>{paymentModal.client} · {paymentModal.id}</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:12 }}>
                <span style={{ color:"var(--t2)" }}>Outstanding</span>
                <span style={{ fontWeight:800, color:"#ef4444" }}>{fmt(paymentModal.total - paymentModal.paid)}</span>
              </div>
              <div className="inv-lbl">Amount Paid</div>
              <input className="inv-inp" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ marginBottom:12, fontSize:16, fontWeight:800 }} />
              <div style={{ display:"flex", gap:8 }}>
                <button className="inv-btn out" style={{ flex:1, justifyContent:"center" }} onClick={() => setPaymentModal(null)}>Cancel</button>
                <button className="inv-btn grn" style={{ flex:1, justifyContent:"center" }} onClick={recordPayment}>✓ Confirm Payment</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
