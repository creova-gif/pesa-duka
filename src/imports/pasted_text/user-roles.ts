import { useState } from "react";

// ─── UserRoleSystem ───────────────────────────────────────────────────────────
// Owner creates employee accounts with specific role-based permissions.
// Employees log in and only see what their role allows.
// Owner sees full activity log per employee.
//
// ROLES:
//   owner    → everything, no restrictions
//   manager  → all operations, no financials/settings/staff management
//   cashier  → POS + inventory check only, no reports/settings/customers/staff
//   viewer   → read-only dashboard only (for silent investors / partners)
//
// EMPLOYEE TRACKING (per employee, logged automatically):
//   - Transactions: every sale they process
//   - Clock in/out (with actual times)
//   - Voids & discounts (flagged if excessive)
//   - Login sessions
//   - Pages visited

const BRAND = "#E56B0A";
const fmt = n => "TSh " + Number(n).toLocaleString("en-TZ");

// ── Role definitions ─────────────────────────────────────────────────────────
export const ROLES = {
  owner: {
    label: "Owner / Admin",
    labelSw: "Mmiliki",
    color: BRAND,
    bg: "rgba(229,107,10,.1)",
    border: "rgba(229,107,10,.3)",
    permissions: {
      dashboard: true, pos: true, inventory: true, cashbook: true,
      invoices: true, mobile_money: true, customers: true, staff: true,
      tax: true, reports: true, settings: true, akili: true,
      credit: true, formalize: true, government: true, skills: true,
      user_management: true, view_all_staff_activity: true,
      delete_transactions: true, apply_discounts: true,
      void_transactions: true, export_data: true, change_prices: true,
    },
  },
  manager: {
    label: "Manager",
    labelSw: "Msimamizi",
    color: "#3b82f6",
    bg: "rgba(59,130,246,.1)",
    border: "rgba(59,130,246,.3)",
    permissions: {
      dashboard: true, pos: true, inventory: true, cashbook: true,
      invoices: true, customers: true, skills: true,
      staff: false, tax: false, reports: false, settings: false,
      akili: false, credit: false, formalize: false, government: false,
      mobile_money: false, user_management: false,
      view_all_staff_activity: false, delete_transactions: false,
      apply_discounts: true, void_transactions: true,
      export_data: false, change_prices: false,
    },
  },
  cashier: {
    label: "Cashier",
    labelSw: "Mkashia",
    color: "#22c55e",
    bg: "rgba(34,197,94,.1)",
    border: "rgba(34,197,94,.3)",
    permissions: {
      dashboard: true, pos: true, inventory: true,
      cashbook: false, invoices: false, mobile_money: false,
      customers: false, staff: false, tax: false, reports: false,
      settings: false, akili: false, credit: false, formalize: false,
      government: false, user_management: false,
      view_all_staff_activity: false, delete_transactions: false,
      apply_discounts: false, void_transactions: false,
      export_data: false, change_prices: false,
    },
  },
  viewer: {
    label: "Viewer / Partner",
    labelSw: "Mshirika",
    color: "#a855f7",
    bg: "rgba(168,85,247,.1)",
    border: "rgba(168,85,247,.3)",
    permissions: {
      dashboard: true, pos: false, inventory: false, cashbook: false,
      invoices: false, mobile_money: false, customers: false, staff: false,
      tax: false, reports: true, settings: false, akili: false,
      credit: false, formalize: false, government: false,
      user_management: false, view_all_staff_activity: false,
      delete_transactions: false, apply_discounts: false,
      void_transactions: false, export_data: false, change_prices: false,
    },
  },
};

// ── Sample employees ──────────────────────────────────────────────────────────
const INIT_EMPLOYEES = [
  {
    id: "emp-001", name: "Juma Bakari", phone: "+255 712 334 556",
    role: "cashier", avatar: "JB", color: "#3b82f6",
    pin: "1234", active: true, createdAt: "2025-01-15",
    lastLogin: "2025-03-14T07:02:11Z", clockedIn: true, clockInTime: "07:02",
    stats: { todaySales: 54200, todayTxns: 11, weekSales: 287400, voids: 1, discounts: 2, avgSaleTime: "2m 14s" },
    recentActivity: [
      { time: "09:14", action: "Sale", detail: "Unga × 3 = TSh 10,500", type: "sale" },
      { time: "08:47", action: "Sale", detail: "Mafuta × 2 = TSh 8,400", type: "sale" },
      { time: "08:30", action: "Void", detail: "INV-234 voided (reason: wrong item)", type: "void" },
      { time: "08:12", action: "Discount", detail: "10% on TSh 45,000 = TSh 4,500 off", type: "discount" },
      { time: "07:02", action: "Clock In", detail: "Logged in from POS terminal", type: "login" },
    ],
  },
  {
    id: "emp-002", name: "Fatuma Ali", phone: "+255 754 889 001",
    role: "cashier", avatar: "FA", color: "#22c55e",
    pin: "5678", active: true, createdAt: "2025-01-15",
    lastLogin: "2025-03-14T15:03:44Z", clockedIn: true, clockInTime: "15:03",
    stats: { todaySales: 43100, todayTxns: 9, weekSales: 224200, voids: 0, discounts: 0, avgSaleTime: "1m 58s" },
    recentActivity: [
      { time: "15:44", action: "Sale", detail: "Sukari × 5 = TSh 14,000", type: "sale" },
      { time: "15:22", action: "Sale", detail: "Soda × 2 = TSh 3,000", type: "sale" },
      { time: "15:03", action: "Clock In", detail: "Logged in from mobile app", type: "login" },
    ],
  },
  {
    id: "emp-003", name: "Hassan Mwenda", phone: "+255 699 887 001",
    role: "manager", avatar: "HM", color: "#f59e0b",
    pin: "9012", active: true, createdAt: "2025-02-01",
    lastLogin: "2025-03-14T08:00:22Z", clockedIn: false, clockInTime: null,
    stats: { todaySales: 87300, todayTxns: 14, weekSales: 412000, voids: 2, discounts: 5, avgSaleTime: "3m 02s" },
    recentActivity: [
      { time: "11:30", action: "Clock Out", detail: "Left for lunch", type: "logout" },
      { time: "09:45", action: "Discount", detail: "15% applied (loyal customer)", type: "discount" },
      { time: "08:00", action: "Clock In", detail: "Morning shift", type: "login" },
    ],
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
.ur-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.ur-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.ur-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}

.ur-tabs{display:flex;gap:3px;background:var(--inp);border-radius:11px;padding:3px;margin-bottom:16px}
.ur-tab{flex:1;padding:8px 5px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;font-family:inherit;background:transparent;color:var(--t2);transition:all .15s;text-align:center}
.ur-tab.active{background:${BRAND};color:#fff}

.emp-card{background:var(--card);border:1px solid var(--border);border-radius:14px;margin-bottom:9px;overflow:hidden;cursor:pointer;transition:border-color .15s}
.emp-card:hover,.emp-card.exp{border-color:${BRAND}}
.emp-header{padding:13px 15px;display:flex;align-items:center;gap:11px}
.emp-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0;position:relative}
.emp-online{position:absolute;bottom:0;right:0;width:11px;height:11px;border-radius:50%;border:2px solid var(--card)}
.emp-body{padding:0 15px 15px}
.emp-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}
.emp-stat-box{background:var(--inp);border-radius:8px;padding:8px 10px}
.emp-stat-l{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--t2);margin-bottom:2px}
.emp-stat-v{font-size:13px;font-weight:800;color:var(--t)}
.emp-alert{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:9px;padding:8px 11px;margin-bottom:10px;font-size:11px;color:#ef4444;font-weight:600}

.act-row{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--border)}
.act-row:last-child{border-bottom:none}
.act-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.act-time{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--t2);min-width:38px;flex-shrink:0}
.act-action{font-size:11px;font-weight:700;flex-shrink:0;min-width:55px}
.act-detail{font-size:11px;color:var(--t2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.role-badge{display:inline-flex;align-items:center;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;border:1px solid}

.perm-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px}
.perm-row{display:flex;align-items:center;gap:7px;font-size:11px;padding:4px 0}
.perm-check{width:16px;height:16px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;font-weight:700}

.add-form{background:var(--card);border:1px solid rgba(229,107,10,.3);border-radius:14px;padding:16px;margin-bottom:12px}
.inp{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;color:var(--t);font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .15s}
.inp:focus{border-color:${BRAND}}
.sel{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13px;color:var(--t);font-family:inherit;outline:none;appearance:none}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:${BRAND};margin-bottom:5px;display:block}
.btn-primary{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:10px 18px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s}
.btn-primary:hover{background:#ff8c3a}
.btn-outline{background:var(--inp);color:var(--t2);border:1px solid var(--border);border-radius:9px;padding:10px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit}

.login-screen{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center}
.pin-display{display:flex;gap:10px;justify-content:center;margin:16px 0}
.pin-dot{width:16px;height:16px;border-radius:50%;border:2px solid var(--border);transition:background .15s}
.pin-dot.filled{background:${BRAND};border-color:${BRAND}}
.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:220px;margin:0 auto}
.keypad-btn{background:var(--inp);border:1px solid var(--border);border-radius:11px;padding:14px;font-size:18px;font-weight:700;cursor:pointer;border:none;font-family:inherit;color:var(--t);transition:background .15s}
.keypad-btn:hover{background:var(--border)}

.emp-view{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:15px;margin-bottom:10px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;cursor:pointer;border:none;background:transparent;font-family:inherit;width:100%;transition:background .15s;text-align:left}
.nav-item:hover{background:var(--inp)}
.nav-item.active{background:rgba(229,107,10,.1)}
.nav-item.locked{opacity:.4;cursor:not-allowed}
`;

export default function UserRoleSystem({ theme = "dark" }) {
  const [tab, setTab]           = useState("team");
  const [employees, setEmployees] = useState(INIT_EMPLOYEES);
  const [expanded, setExpanded] = useState(null);
  const [addingEmp, setAddingEmp] = useState(false);
  const [newEmp, setNewEmp]     = useState({ name:"", phone:"", role:"cashier", pin:"" });
  const [previewRole, setPreviewRole] = useState("cashier");
  const [loginEmp, setLoginEmp] = useState(null);
  const [pin, setPin]           = useState("");
  const [loggedInAs, setLoggedInAs] = useState(null);

  const NAV_PAGES = [
    { id:"dashboard", label:"Dashboard", icon:"🌅" },
    { id:"pos",       label:"Point of Sale", icon:"🛒" },
    { id:"inventory", label:"Inventory", icon:"📦" },
    { id:"cashbook",  label:"Cashbook", icon:"📒" },
    { id:"invoices",  label:"Invoices", icon:"📋" },
    { id:"customers", label:"Customers", icon:"👥" },
    { id:"staff",     label:"Staff Mgmt", icon:"👷" },
    { id:"tax",       label:"Tax / TRA", icon:"🏛️" },
    { id:"reports",   label:"Reports", icon:"📊" },
    { id:"settings",  label:"Settings", icon:"⚙️" },
    { id:"akili",     label:"Akili AI", icon:"🧠" },
  ];

  const addEmployee = () => {
    if (!newEmp.name || !newEmp.pin) return;
    const initials = newEmp.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
    const colors = ["#3b82f6","#22c55e","#a855f7","#f59e0b","#ef4444","#06b6d4"];
    setEmployees(prev => [...prev, {
      id: `emp-${Date.now()}`,
      name: newEmp.name, phone: newEmp.phone,
      role: newEmp.role, avatar: initials,
      color: colors[prev.length % colors.length],
      pin: newEmp.pin, active: true,
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: null, clockedIn: false, clockInTime: null,
      stats: { todaySales:0, todayTxns:0, weekSales:0, voids:0, discounts:0, avgSaleTime:"—" },
      recentActivity: [],
    }]);
    setNewEmp({ name:"", phone:"", role:"cashier", pin:"" });
    setAddingEmp(false);
  };

  const handlePinInput = (digit) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === loginEmp?.pin) {
        setLoggedInAs(loginEmp);
        setLoginEmp(null);
        setPin("");
      } else {
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const rolePerms = ROLES[previewRole]?.permissions || {};
  const teamAlert = employees.filter(e => e.stats.voids > 0 || e.stats.discounts > 2);

  return (
    <>
      <style>{css}</style>
      <div className={`ur-root ${theme}`}>

        {/* Employee login modal (simulated) */}
        {loginEmp && (
          <div style={{ marginBottom:16 }}>
            <div className="login-screen">
              <div style={{ width:56, height:56, borderRadius:"50%", background:loginEmp.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#fff", margin:"0 auto 12px" }}>
                {loginEmp.avatar}
              </div>
              <div style={{ fontSize:16, fontWeight:800, color:"var(--t)" }}>{loginEmp.name}</div>
              <div style={{ fontSize:11, color:"var(--t2)", marginTop:3 }}>
                <span className="role-badge" style={{ background:ROLES[loginEmp.role].bg, borderColor:ROLES[loginEmp.role].border, color:ROLES[loginEmp.role].color }}>
                  {ROLES[loginEmp.role].label}
                </span>
              </div>
              <div style={{ fontSize:12, color:"var(--t2)", margin:"14px 0 4px" }}>Enter your PIN</div>
              <div className="pin-display">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`}
                    style={{ background: pin.length === 4 && pin !== loginEmp.pin ? "#ef4444" : undefined,
                             borderColor: pin.length === 4 && pin !== loginEmp.pin ? "#ef4444" : undefined }} />
                ))}
              </div>
              <div className="keypad">
                {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i) => (
                  <button key={i} className="keypad-btn"
                    style={{ visibility: k === "" ? "hidden" : "visible" }}
                    onClick={() => k === "⌫" ? setPin(p => p.slice(0,-1)) : handlePinInput(String(k))}>
                    {k}
                  </button>
                ))}
              </div>
              <button className="btn-outline" style={{ marginTop:12, fontSize:11 }} onClick={() => { setLoginEmp(null); setPin(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Logged in as employee — show their restricted view */}
        {loggedInAs && (
          <div style={{ marginBottom:16 }}>
            <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:11, padding:"10px 14px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:12, color:"#22c55e", fontWeight:700 }}>
                ✓ Logged in as {loggedInAs.name} ({ROLES[loggedInAs.role].label})
              </div>
              <button className="btn-outline" style={{ fontSize:10, padding:"4px 10px" }} onClick={() => setLoggedInAs(null)}>Log Out</button>
            </div>
            <div className="emp-view">
              <div style={{ fontSize:12, fontWeight:700, color:"var(--t)", marginBottom:10 }}>
                Navigation — {loggedInAs.name}'s view
              </div>
              <div style={{ fontSize:10, color:"var(--t2)", marginBottom:12, lineHeight:1.5 }}>
                Locked pages are hidden from this employee. They cannot access settings, financials, or staff data.
              </div>
              {NAV_PAGES.map(p => {
                const allowed = ROLES[loggedInAs.role].permissions[p.id];
                return (
                  <button key={p.id}
                    className={`nav-item ${!allowed ? "locked" : ""}`}
                    disabled={!allowed}>
                    <span style={{ fontSize:16 }}>{p.icon}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"var(--t)" }}>{p.label}</span>
                    <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700,
                      color: allowed ? "#22c55e" : "var(--t3)" }}>
                      {allowed ? "✓ Accessible" : "🔒 Hidden"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Header */}
        {!loginEmp && !loggedInAs && (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"var(--t)" }}>
                  Team <span style={{ color:BRAND }}>Management</span>
                </div>
                <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
                  {employees.length} employees · {employees.filter(e=>e.clockedIn).length} on shift now
                </div>
              </div>
              <button className="btn-primary" style={{ fontSize:11 }} onClick={() => setAddingEmp(true)}>
                + Add Employee
              </button>
            </div>

            {teamAlert.length > 0 && (
              <div className="emp-alert">
                ⚠️ {teamAlert.map(e=>e.name.split(" ")[0]).join(", ")} — unusual voids or discounts today. Review activity log.
              </div>
            )}

            <div className="ur-tabs">
              <button className={`ur-tab ${tab==="team"?"active":""}`} onClick={() => setTab("team")}>👥 Team</button>
              <button className={`ur-tab ${tab==="permissions"?"active":""}`} onClick={() => setTab("permissions")}>🔐 Permissions</button>
              <button className={`ur-tab ${tab==="simulate"?"active":""}`} onClick={() => setTab("simulate")}>👁 Preview Login</button>
            </div>
          </>
        )}

        {/* ── TEAM TAB ── */}
        {tab === "team" && !loginEmp && !loggedInAs && (
          <>
            {addingEmp && (
              <div className="add-form">
                <div style={{ fontSize:13, fontWeight:800, color:"var(--t)", marginBottom:14 }}>Add New Employee</div>
                <div className="r2">
                  <div><label className="lbl">Full Name</label><input className="inp" value={newEmp.name} onChange={e => setNewEmp(p=>({...p,name:e.target.value}))} placeholder="e.g. Juma Bakari" /></div>
                  <div><label className="lbl">Phone</label><input className="inp" value={newEmp.phone} onChange={e => setNewEmp(p=>({...p,phone:e.target.value}))} placeholder="+255 7XX XXX XXX" /></div>
                </div>
                <div className="r2">
                  <div>
                    <label className="lbl">Role</label>
                    <select className="sel" value={newEmp.role} onChange={e => setNewEmp(p=>({...p,role:e.target.value}))}>
                      {Object.entries(ROLES).filter(([k])=>k!=="owner").map(([k,v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">4-Digit PIN</label>
                    <input className="inp" type="password" maxLength={4} value={newEmp.pin}
                      onChange={e => setNewEmp(p=>({...p,pin:e.target.value.replace(/\D/g,"")}))}
                      placeholder="e.g. 1234" />
                  </div>
                </div>
                <div style={{ background:"rgba(59,130,246,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:9, padding:"9px 12px", marginBottom:12, fontSize:11, color:"var(--t2)", lineHeight:1.5 }}>
                  <span style={{ fontWeight:700, color:"#3b82f6" }}>🔐 Role: {ROLES[newEmp.role]?.label}</span> — {
                    newEmp.role==="cashier" ? "Can only access POS, inventory check, and their own dashboard. Cannot see any financial data, staff info, or settings." :
                    newEmp.role==="manager" ? "Can manage sales, inventory, invoices, and customers. Cannot access financials, tax, AI tools, or settings." :
                    "Read-only dashboard access. Cannot perform any operations."
                  }
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn-primary" onClick={addEmployee}>✓ Create Account</button>
                  <button className="btn-outline" onClick={() => setAddingEmp(false)}>Cancel</button>
                </div>
              </div>
            )}

            {employees.map(emp => {
              const role = ROLES[emp.role];
              const isExp = expanded === emp.id;
              const hasAlert = emp.stats.voids > 0 || emp.stats.discounts > 2;
              return (
                <div key={emp.id} className={`emp-card ${isExp?"exp":""}`}
                  onClick={() => setExpanded(isExp?null:emp.id)}>
                  <div className="emp-header">
                    <div className="emp-avatar" style={{ background:emp.color }}>
                      {emp.avatar}
                      <div className="emp-online" style={{ background:emp.clockedIn?"#22c55e":"var(--t3)" }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <span style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{emp.name}</span>
                        {hasAlert && <span style={{ fontSize:10, color:"#ef4444", fontWeight:700 }}>⚠️</span>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                        <span className="role-badge" style={{ background:role.bg, borderColor:role.border, color:role.color }}>
                          {role.label}
                        </span>
                        <span style={{ fontSize:10, color:"var(--t2)" }}>{emp.phone}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:"var(--t)" }}>{fmt(emp.stats.todaySales)}</div>
                      <div style={{ fontSize:10, color: emp.clockedIn?"#22c55e":"var(--t3)", marginTop:2, fontWeight:600 }}>
                        {emp.clockedIn ? `On shift · ${emp.clockInTime}` : "Off shift"}
                      </div>
                    </div>
                  </div>

                  {isExp && (
                    <div className="emp-body" onClick={e => e.stopPropagation()}>
                      {hasAlert && (
                        <div className="emp-alert">
                          {emp.stats.voids > 0 && `${emp.stats.voids} void(s) today. `}
                          {emp.stats.discounts > 2 && `${emp.stats.discounts} discounts today — review if authorised.`}
                        </div>
                      )}
                      <div className="emp-stat-grid">
                        {[
                          ["Today Sales", fmt(emp.stats.todaySales), "var(--t)"],
                          ["Transactions", emp.stats.todayTxns, "var(--t)"],
                          ["Week Sales", fmt(emp.stats.weekSales), BRAND],
                          ["Voids", emp.stats.voids, emp.stats.voids>0?"#ef4444":"#22c55e"],
                          ["Discounts", emp.stats.discounts, emp.stats.discounts>2?"#ef4444":"var(--t)"],
                          ["Avg Sale Time", emp.stats.avgSaleTime, "var(--t)"],
                        ].map(([l,v,c]) => (
                          <div className="emp-stat-box" key={l}>
                            <div className="emp-stat-l">{l}</div>
                            <div className="emp-stat-v" style={{ color:c, fontSize:11 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize:10, fontWeight:700, color:BRAND, textTransform:"uppercase", letterSpacing:".7px", marginBottom:8 }}>
                        Today's Activity Log
                      </div>
                      <div style={{ background:"var(--inp)", borderRadius:10, padding:"4px 12px", marginBottom:12 }}>
                        {emp.recentActivity.length === 0
                          ? <div style={{ fontSize:11, color:"var(--t2)", padding:"8px 0" }}>No activity yet today</div>
                          : emp.recentActivity.map((a, i) => (
                            <div key={i} className="act-row">
                              <div className="act-dot" style={{ background:
                                a.type==="sale"?"#22c55e":a.type==="void"?"#ef4444":
                                a.type==="discount"?"#f59e0b":a.type==="login"?"#3b82f6":"var(--t3)" }} />
                              <span className="act-time">{a.time}</span>
                              <span className="act-action" style={{ color:
                                a.type==="sale"?"#22c55e":a.type==="void"?"#ef4444":
                                a.type==="discount"?"#f59e0b":"var(--t2)" }}>
                                {a.action}
                              </span>
                              <span className="act-detail">{a.detail}</span>
                            </div>
                          ))
                        }
                      </div>

                      <div style={{ display:"flex", gap:7 }}>
                        <button className="btn-primary" style={{ fontSize:11, padding:"7px 13px" }}
                          onClick={() => setLoginEmp(emp)}>
                          👁 Preview Login
                        </button>
                        <button className="btn-outline" style={{ fontSize:11 }}>✏️ Edit Role</button>
                        <button className="btn-outline" style={{ fontSize:11, color:"#ef4444" }}
                          onClick={() => setEmployees(prev => prev.map(e => e.id===emp.id?{...e,active:!e.active}:e))}>
                          {emp.active?"Deactivate":"Activate"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── PERMISSIONS TAB ── */}
        {tab === "permissions" && (
          <>
            <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              {Object.entries(ROLES).map(([k,v]) => (
                <button key={k} onClick={() => setPreviewRole(k)}
                  style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                           border:`1px solid ${previewRole===k?v.color:"var(--border)"}`,
                           background:previewRole===k?v.bg:"var(--card)",
                           color:previewRole===k?v.color:"var(--t2)", fontFamily:"inherit" }}>
                  {v.label}
                </button>
              ))}
            </div>

            <div style={{ background:"var(--card)", border:`1px solid ${ROLES[previewRole].border}`, borderRadius:14, padding:16, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:ROLES[previewRole].bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  {previewRole==="owner"?"👑":previewRole==="manager"?"👔":previewRole==="cashier"?"🛒":"👁"}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:"var(--t)" }}>{ROLES[previewRole].label}</div>
                  <div style={{ fontSize:11, color:"var(--t2)", marginTop:1 }}>
                    {Object.values(ROLES[previewRole].permissions).filter(Boolean).length} / {Object.keys(ROLES[previewRole].permissions).length} permissions granted
                  </div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                {Object.entries(ROLES[previewRole].permissions).map(([perm, allowed]) => (
                  <div key={perm} className="perm-row">
                    <div className="perm-check"
                      style={{ background:allowed?"rgba(34,197,94,.1)":"rgba(239,68,68,.08)",
                               color:allowed?"#22c55e":"#ef4444",
                               border:`1px solid ${allowed?"rgba(34,197,94,.25)":"rgba(239,68,68,.15)"}` }}>
                      {allowed?"✓":"✗"}
                    </div>
                    <span style={{ fontSize:11, color:allowed?"var(--t)":"var(--t3)", textDecoration:allowed?"none":"line-through" }}>
                      {perm.replace(/_/g," ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── SIMULATE TAB ── */}
        {tab === "simulate" && (
          <>
            <div style={{ fontSize:12, color:"var(--t2)", marginBottom:14, lineHeight:1.6 }}>
              Tap an employee to simulate their login and see exactly what they see when they open the app.
            </div>
            {employees.map(emp => (
              <div key={emp.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 14px", marginBottom:7, display:"flex", alignItems:"center", gap:11, cursor:"pointer" }}
                onClick={() => setLoginEmp(emp)}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:emp.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0 }}>{emp.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--t)" }}>{emp.name}</div>
                  <span className="role-badge" style={{ background:ROLES[emp.role].bg, borderColor:ROLES[emp.role].border, color:ROLES[emp.role].color, marginTop:4, display:"inline-flex" }}>
                    {ROLES[emp.role].label}
                  </span>
                </div>
                <button className="btn-primary" style={{ fontSize:11, padding:"7px 13px" }}>
                  👁 Preview
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
