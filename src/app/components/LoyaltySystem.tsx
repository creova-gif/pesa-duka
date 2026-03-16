import { useState } from "react";

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.lx-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.lx-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.lx-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.lx-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s;display:inline-flex;align-items:center;gap:6px}
.lx-btn:hover{background:#ff8c3a}
.lx-btn.full{width:100%;justify-content:center}
.lx-btn.outline{background:transparent;border:1px solid var(--border);color:var(--t2)}
.lx-btn.outline:hover{border-color:${BRAND};color:${BRAND}}
.lx-inp{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;color:var(--t);font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .15s}
.lx-inp:focus{border-color:${BRAND}}
.lx-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${BRAND};margin-bottom:8px}
`;

const SAMPLE_MEMBERS = [
  { id:1, name:"Mama Ntilie", phone:"+255 712 445 667", stamps:9, required:10, totalVisits:34, totalSpend:284000, tier:"Gold" as const, lastVisit:"Today" },
  { id:2, name:"Baba Watoto", phone:"+255 754 889 001", stamps:4, required:10, totalVisits:12, totalSpend:98000, tier:"Silver" as const, lastVisit:"2 days ago" },
  { id:3, name:"Shangazi Rose", phone:"+255 699 334 556", stamps:10, required:10, totalVisits:28, totalSpend:213000, tier:"Gold" as const, lastVisit:"Yesterday" },
  { id:4, name:"Ndugu Hassan", phone:"+255 765 112 334", stamps:2, required:10, totalVisits:5, totalSpend:41000, tier:"Bronze" as const, lastVisit:"5 days ago" },
];

const TIER_COLORS = {
  Bronze: { bg:"rgba(180,116,46,.12)", b:"rgba(180,116,46,.3)", t:"#b4742e" },
  Silver: { bg:"rgba(180,180,190,.12)", b:"rgba(180,180,190,.3)", t:"#a0a0b0" },
  Gold:   { bg:"rgba(229,175,10,.12)", b:"rgba(229,175,10,.3)", t:"#e5af0a" },
};

export function LoyaltySystem({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [members, setMembers] = useState(SAMPLE_MEMBERS);
  const [selected, setSelected] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const addStamp = (id: number) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      const newStamps = m.stamps >= m.required ? 0 : m.stamps + 1;
      return { ...m, stamps: newStamps, totalVisits: m.totalVisits + 1 };
    }));
  };

  const redeemReward = (id: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, stamps: 0 } : m));
  };

  const addMember = () => {
    if (!newName) return;
    setMembers(prev => [...prev, {
      id: Date.now(), name: newName, phone: newPhone,
      stamps: 0, required: 10, totalVisits: 0, totalSpend: 0, tier: "Bronze" as const, lastVisit: "—"
    }]);
    setNewName(""); setNewPhone(""); setAddingNew(false);
  };

  return (
    <>
      <style>{BASE_CSS + `
        .ly-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .ly-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
        .ly-stat{background:var(--card);border:1px solid var(--border);border-radius:11px;padding:11px 13px}
        .ly-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:8px;cursor:pointer;transition:border-color .15s}
        .ly-card:hover,.ly-card.sel{border-color:${BRAND}}
        .ly-stamps{display:flex;gap:4px;margin:10px 0;flex-wrap:wrap}
        .ly-stamp{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s}
        .ly-stamp.filled{background:${BRAND};color:#fff}
        .ly-stamp.empty{background:var(--inp);border:1.5px dashed var(--border);color:var(--t3)}
        .ly-reward-card{background:linear-gradient(135deg,#1a1200,#2a1800);border:1px solid rgba(229,175,10,.3);border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:8px}
        .new-member-form{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:8px}
      `}</style>
      <div className={`lx-root ${theme}`}>
        <div className="ly-header">
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>Loyalty <span style={{ color:BRAND }}>Program</span></div>
            <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>{members.length} members</div>
          </div>
          <button className="lx-btn" onClick={() => setAddingNew(!addingNew)}>
            {addingNew ? "Cancel" : "+ Add Member"}
          </button>
        </div>

        <div className="ly-summary">
          {[
            { label:"Total Members", value:members.length },
            { label:"Gold Members", value:members.filter(m=>m.tier==="Gold").length },
            { label:"Ready to Redeem", value:members.filter(m=>m.stamps>=m.required).length },
          ].map(s => (
            <div className="ly-stat" key={s.label}>
              <div style={{ fontSize:9, fontWeight:700, color:"var(--t2)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {addingNew && (
          <div className="new-member-form">
            <div className="lx-lbl">New Member</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
              <input className="lx-inp" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} />
              <input className="lx-inp" placeholder="Phone Number" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            </div>
            <button className="lx-btn full" onClick={addMember}>Add to Loyalty Program</button>
          </div>
        )}

        {members.filter(m => m.stamps >= m.required).map(m => (
          <div className="ly-reward-card" key={`r-${m.id}`}>
            <div style={{ fontSize:24 }}>🎁</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#e5af0a" }}>{m.name} has a reward ready!</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>10 stamps completed · Tap to redeem</div>
            </div>
            <button className="lx-btn" style={{ background:"#e5af0a", flexShrink:0 }}
              onClick={() => redeemReward(m.id)}>Redeem</button>
          </div>
        ))}

        {members.map(m => {
          const tc = TIER_COLORS[m.tier];
          const isSel = selected === m.id;
          return (
            <div key={m.id} className={`ly-card ${isSel ? "sel" : ""}`} onClick={() => setSelected(isSel ? null : m.id)}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:"var(--t)", display:"flex", alignItems:"center", gap:6 }}>
                    {m.name}
                    <span style={{ fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20, background:tc.bg, border:`1px solid ${tc.b}`, color:tc.t }}>
                      {m.tier}
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
                    {m.phone} · Last visit: {m.lastVisit}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:BRAND }}>{m.stamps}/{m.required}</div>
                  <div style={{ fontSize:10, color:"var(--t2)" }}>stamps</div>
                </div>
              </div>
              <div className="ly-stamps">
                {Array.from({ length: m.required }).map((_, i) => (
                  <div key={i} className={`ly-stamp ${i < m.stamps ? "filled" : "empty"}`}>
                    {i < m.stamps ? "★" : "○"}
                  </div>
                ))}
              </div>
              {isSel && (
                <div onClick={e => e.stopPropagation()}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--t2)", marginBottom:10 }}>
                    <span>{m.totalVisits} visits · {fmt(m.totalSpend)} spent</span>
                    <span>{m.required - m.stamps} stamps to reward</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="lx-btn" style={{ flex:1, justifyContent:"center" }} onClick={() => addStamp(m.id)}>
                      + Add Stamp
                    </button>
                    {m.stamps >= m.required && (
                      <button className="lx-btn" style={{ flex:1, justifyContent:"center", background:"#e5af0a" }}
                        onClick={() => redeemReward(m.id)}>
                        🎁 Redeem
                      </button>
                    )}
                    <button className="lx-btn outline" style={{ flex:1, justifyContent:"center" }}>
                      💬 WA
                    </button>
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
