import { useState, useEffect } from "react";
import { ROLES } from "../components/UserRoleSystem";

// ─── Team Management Page ─────────────────────────────────────────────────────
// Owner creates employee accounts with specific role-based permissions.
// Employees log in and only see what their role allows.
// Owner sees full activity log per employee.

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

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

interface Employee {
  id: string;
  name: string;
  phone: string;
  role: keyof typeof ROLES;
  avatar: string;
  color: string;
  pin: string;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
  clockedIn: boolean;
  clockInTime: string | null;
  stats: {
    todaySales: number;
    todayTxns: number;
    weekSales: number;
    voids: number;
    discounts: number;
    avgSaleTime: string;
  };
  recentActivity: Array<{
    time: string;
    action: string;
    detail: string;
    type: string;
  }>;
}

export function Team() {
  const [tab, setTab]           = useState("team");
  const [employees, setEmployees] = useState<Employee[]>(INIT_EMPLOYEES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addingEmp, setAddingEmp] = useState(false);
  const [newEmp, setNewEmp]     = useState({ name:"", phone:"", role:"cashier" as keyof typeof ROLES, pin:"" });
  const [previewRole, setPreviewRole] = useState<keyof typeof ROLES>("cashier");
  const [loginEmp, setLoginEmp] = useState<Employee | null>(null);
  const [pin, setPin]           = useState("");
  const [loggedInAs, setLoggedInAs] = useState<Employee | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

  const handlePinInput = (digit: string) => {
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
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Employee login modal (simulated) */}
      {loginEmp && (
        <div className="mb-4">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg" style={{ background: loginEmp.color }}>
              {loginEmp.avatar}
            </div>
            <div className="text-base font-bold mb-1">{loginEmp.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border" style={{ 
                background: ROLES[loginEmp.role].bg, 
                borderColor: ROLES[loginEmp.role].border, 
                color: ROLES[loginEmp.role].color 
              }}>
                {ROLES[loginEmp.role].label}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-3 mb-1">Enter your PIN</div>
            <div className="flex gap-2.5 justify-center my-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-4 h-4 rounded-full border-2 transition-all" style={{ 
                  background: pin.length > i ? (pin.length === 4 && pin !== loginEmp.pin ? "#ef4444" : BRAND) : "transparent",
                  borderColor: pin.length === 4 && pin !== loginEmp.pin ? "#ef4444" : "var(--border)"
                }} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
              {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i) => (
                <button key={i} className="bg-muted border border-border rounded-xl p-3.5 text-lg font-bold hover:bg-muted/80 transition-colors disabled:opacity-0"
                  disabled={k === ""}
                  onClick={() => k === "⌫" ? setPin(p => p.slice(0,-1)) : handlePinInput(String(k))}>
                  {k}
                </button>
              ))}
            </div>
            <button className="mt-3 px-4 py-2 bg-muted border border-border rounded-lg text-xs font-semibold hover:bg-muted/80 transition-colors" onClick={() => { setLoginEmp(null); setPin(""); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Logged in as employee — show their restricted view */}
      {loggedInAs && (
        <div className="mb-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3.5 py-2.5 mb-3 flex items-center justify-between">
            <div className="text-xs text-green-600 font-bold">
              ✓ Logged in as {loggedInAs.name} ({ROLES[loggedInAs.role].label})
            </div>
            <button className="text-xs px-2.5 py-1 bg-muted border border-border rounded hover:bg-muted/80 transition-colors font-semibold" onClick={() => setLoggedInAs(null)}>Log Out</button>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="text-sm font-bold mb-2.5">
              Navigation — {loggedInAs.name}'s view
            </div>
            <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Locked pages are hidden from this employee. They cannot access settings, financials, or staff data.
            </div>
            {NAV_PAGES.map(p => {
              const allowed = ROLES[loggedInAs.role].permissions[p.id as keyof typeof ROLES[keyof typeof ROLES]['permissions']];
              return (
                <button key={p.id}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors mb-1 text-left ${!allowed ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"}`}
                  disabled={!allowed}>
                  <span className="text-base">{p.icon}</span>
                  <span className="text-sm font-semibold">{p.label}</span>
                  <span className="ml-auto text-xs font-bold" style={{ color: allowed ? "#22c55e" : "var(--muted-foreground)" }}>
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
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h1 className="text-xl font-bold">
                Team <span style={{ color: BRAND }}>Management</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {employees.length} employees · {employees.filter(e=>e.clockedIn).length} on shift now
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: BRAND }} onClick={() => setAddingEmp(true)}>
              + Add Employee
            </button>
          </div>

          {teamAlert.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 mb-3 text-xs text-red-600 font-semibold">
              ⚠️ {teamAlert.map(e=>e.name.split(" ")[0]).join(", ")} — unusual voids or discounts today. Review activity log.
            </div>
          )}

          <div className="flex gap-0.5 bg-muted rounded-xl p-0.5 mb-4">
            <button className={`flex-1 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${tab==="team"?"text-white":"text-muted-foreground"}`} style={{ background: tab==="team"?BRAND:"transparent" }} onClick={() => setTab("team")}>👥 Team</button>
            <button className={`flex-1 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${tab==="permissions"?"text-white":"text-muted-foreground"}`} style={{ background: tab==="permissions"?BRAND:"transparent" }} onClick={() => setTab("permissions")}>🔐 Permissions</button>
            <button className={`flex-1 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${tab==="simulate"?"text-white":"text-muted-foreground"}`} style={{ background: tab==="simulate"?BRAND:"transparent" }} onClick={() => setTab("simulate")}>👁 Preview Login</button>
          </div>
        </>
      )}

      {/* ── TEAM TAB ── */}
      {tab === "team" && !loginEmp && !loggedInAs && (
        <>
          {addingEmp && (
            <div className="bg-card border rounded-2xl p-4 mb-3" style={{ borderColor: "rgba(229,107,10,.3)" }}>
              <div className="text-sm font-bold mb-3.5">Add New Employee</div>
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: BRAND }}>Full Name</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" value={newEmp.name} onChange={e => setNewEmp(p=>({...p,name:e.target.value}))} placeholder="e.g. Juma Bakari" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: BRAND }}>Phone</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" value={newEmp.phone} onChange={e => setNewEmp(p=>({...p,phone:e.target.value}))} placeholder="+255 7XX XXX XXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: BRAND }}>Role</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none" value={newEmp.role} onChange={e => setNewEmp(p=>({...p,role:e.target.value as keyof typeof ROLES}))}>
                    {Object.entries(ROLES).filter(([k])=>k!=="owner").map(([k,v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: BRAND }}>4-Digit PIN</label>
                  <input className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors" type="password" maxLength={4} value={newEmp.pin}
                    onChange={e => setNewEmp(p=>({...p,pin:e.target.value.replace(/\D/g,"")}))}
                    placeholder="e.g. 1234" />
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2.5 mb-3 text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-blue-600">🔐 Role: {ROLES[newEmp.role]?.label}</span> — {
                  newEmp.role==="cashier" ? "Can only access POS, inventory check, and their own dashboard. Cannot see any financial data, staff info, or settings." :
                  newEmp.role==="manager" ? "Can manage sales, inventory, invoices, and customers. Cannot access financials, tax, AI tools, or settings." :
                  "Read-only dashboard access. Cannot perform any operations."
                }
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: BRAND }} onClick={addEmployee}>✓ Create Account</button>
                <button className="px-3.5 py-2 bg-muted border border-border rounded-lg text-xs font-semibold hover:bg-muted/80 transition-colors" onClick={() => setAddingEmp(false)}>Cancel</button>
              </div>
            </div>
          )}

          {employees.map(emp => {
            const role = ROLES[emp.role];
            const isExp = expanded === emp.id;
            const hasAlert = emp.stats.voids > 0 || emp.stats.discounts > 2;
            return (
              <div key={emp.id} className={`bg-card border border-border rounded-2xl mb-2.5 overflow-hidden cursor-pointer transition-colors hover:border-primary ${isExp?"border-primary":""}`}
                onClick={() => setExpanded(isExp?null:emp.id)}>
                <div className="p-3.5 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: emp.color }}>
                    {emp.avatar}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card" style={{ background: emp.clockedIn?"#22c55e":"var(--muted)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">{emp.name}</span>
                      {hasAlert && <span className="text-xs text-red-500 font-bold">⚠️</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border" style={{ background: role.bg, borderColor: role.border, color: role.color }}>
                        {role.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{emp.phone}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold">{fmt(emp.stats.todaySales)}</div>
                    <div className="text-[10px] font-semibold mt-0.5" style={{ color: emp.clockedIn?"#22c55e":"var(--muted-foreground)" }}>
                      {emp.clockedIn ? `On shift · ${emp.clockInTime}` : "Off shift"}
                    </div>
                  </div>
                </div>

                {isExp && (
                  <div className="px-3.5 pb-3.5" onClick={e => e.stopPropagation()}>
                    {hasAlert && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3 text-xs text-red-600 font-semibold">
                        {emp.stats.voids > 0 && `${emp.stats.voids} void(s) today. `}
                        {emp.stats.discounts > 2 && `${emp.stats.discounts} discounts today — review if authorised.`}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[
                        ["Today Sales", fmt(emp.stats.todaySales), "var(--foreground)"],
                        ["Transactions", emp.stats.todayTxns, "var(--foreground)"],
                        ["Week Sales", fmt(emp.stats.weekSales), BRAND],
                        ["Voids", emp.stats.voids, emp.stats.voids>0?"#ef4444":"#22c55e"],
                        ["Discounts", emp.stats.discounts, emp.stats.discounts>2?"#ef4444":"var(--foreground)"],
                        ["Avg Sale Time", emp.stats.avgSaleTime, "var(--foreground)"],
                      ].map(([l,v,c]) => (
                        <div className="bg-muted rounded-lg px-2.5 py-2" key={String(l)}>
                          <div className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{l}</div>
                          <div className="text-xs font-bold" style={{ color: String(c) }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: BRAND }}>
                      Today's Activity Log
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-1 mb-3">
                      {emp.recentActivity.length === 0
                        ? <div className="text-xs text-muted-foreground py-2">No activity yet today</div>
                        : emp.recentActivity.map((a, i) => (
                          <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-border last:border-0">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:
                              a.type==="sale"?"#22c55e":a.type==="void"?"#ef4444":
                              a.type==="discount"?"#f59e0b":a.type==="login"?"#3b82f6":"var(--muted)" }} />
                            <span className="font-mono text-[10px] text-muted-foreground min-w-[38px] flex-shrink-0">{a.time}</span>
                            <span className="text-xs font-bold flex-shrink-0 min-w-[55px]" style={{ color:
                              a.type==="sale"?"#22c55e":a.type==="void"?"#ef4444":
                              a.type==="discount"?"#f59e0b":"var(--muted-foreground)" }}>
                              {a.action}
                            </span>
                            <span className="text-xs text-muted-foreground flex-1 truncate">{a.detail}</span>
                          </div>
                        ))
                      }
                    </div>

                    <div className="flex gap-1.5">
                      <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: BRAND }}
                        onClick={() => setLoginEmp(emp)}>
                        👁 Preview Login
                      </button>
                      <button className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-semibold hover:bg-muted/80 transition-colors">✏️ Edit Role</button>
                      <button className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-semibold hover:bg-muted/80 transition-colors text-red-500"
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
          <div className="flex gap-1.5 mb-3.5 flex-wrap">
            {Object.entries(ROLES).map(([k,v]) => (
              <button key={k} onClick={() => setPreviewRole(k as keyof typeof ROLES)}
                className="px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all"
                style={{ 
                  borderColor: previewRole===k?v.color:"var(--border)",
                  background: previewRole===k?v.bg:"var(--card)",
                  color: previewRole===k?v.color:"var(--muted-foreground)"
                }}>
                {v.label}
              </button>
            ))}
          </div>

          <div className="bg-card border rounded-2xl p-4 mb-3" style={{ borderColor: ROLES[previewRole].border }}>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: ROLES[previewRole].bg }}>
                {previewRole==="owner"?"👑":previewRole==="manager"?"👔":previewRole==="cashier"?"🛒":"👁"}
              </div>
              <div>
                <div className="text-sm font-bold">{ROLES[previewRole].label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {Object.values(ROLES[previewRole].permissions).filter(Boolean).length} / {Object.keys(ROLES[previewRole].permissions).length} permissions granted
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {Object.entries(ROLES[previewRole].permissions).map(([perm, allowed]) => (
                <div key={perm} className="flex items-center gap-1.5 py-1">
                  <div className="w-4 h-4 rounded border flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ 
                      background: allowed?"rgba(34,197,94,.1)":"rgba(239,68,68,.08)",
                      color: allowed?"#22c55e":"#ef4444",
                      borderColor: allowed?"rgba(34,197,94,.25)":"rgba(239,68,68,.15)"
                    }}>
                    {allowed?"✓":"✗"}
                  </div>
                  <span className="text-xs" style={{ color: allowed?"var(--foreground)":"var(--muted-foreground)", textDecoration: allowed?"none":"line-through" }}>
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
          <div className="text-xs text-muted-foreground mb-3.5 leading-relaxed">
            Tap an employee to simulate their login and see exactly what they see when they open the app.
          </div>
          {employees.map(emp => (
            <div key={emp.id} className="bg-card border border-border rounded-xl px-3.5 py-3 mb-1.5 flex items-center gap-3 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setLoginEmp(emp)}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: emp.color }}>{emp.avatar}</div>
              <div className="flex-1">
                <div className="text-sm font-bold">{emp.name}</div>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border mt-1" style={{ background: ROLES[emp.role].bg, borderColor: ROLES[emp.role].border, color: ROLES[emp.role].color }}>
                  {ROLES[emp.role].label}
                </span>
              </div>
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: BRAND }}>
                👁 Preview
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
