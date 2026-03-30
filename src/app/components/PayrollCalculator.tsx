import { useState, useMemo } from "react";

const BRAND = "#E56B0A";
const fmt = (n: number) => "TSh " + Math.round(n).toLocaleString("en-TZ");

// Tanzania Payroll Rates (2024–2025)
const NSSF_EMPLOYEE = 0.10;
const NSSF_EMPLOYER = 0.10;
const NHIF_EMPLOYEE = 0.03;
const NHIF_EMPLOYER = 0.03;
const SDL_RATE = 0.04; // Skills Development Levy — employer only
const WCF_RATE = 0.005; // Workers Compensation Fund — approximate

// Tanzania PAYE Brackets (Monthly — TSh)
function calculatePAYE(grossMonthly: number): number {
  const taxableIncome = grossMonthly - (grossMonthly * NSSF_EMPLOYEE); // NSSF deducted before PAYE
  if (taxableIncome <= 270_000) return 0;
  if (taxableIncome <= 520_000) return (taxableIncome - 270_000) * 0.09;
  if (taxableIncome <= 760_000) return 22_500 + (taxableIncome - 520_000) * 0.20;
  if (taxableIncome <= 1_000_000) return 70_500 + (taxableIncome - 760_000) * 0.25;
  return 130_500 + (taxableIncome - 1_000_000) * 0.30;
}

interface Employee {
  id: string;
  name: string;
  grossSalary: number;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
.pr-root{font-family:'Plus Jakarta Sans',sans-serif}
.pr-root.dark{--card:#1a1d27;--border:#2e3347;--inp:#22263a;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.pr-root.light{--card:#fff;--border:#e2e5ef;--inp:#f8f9fc;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.pr-section{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px}
.pr-input{width:100%;background:var(--inp);border:1.5px solid var(--border);border-radius:9px;padding:10px 13px;font-size:13px;color:var(--t);font-family:inherit;outline:none;transition:border-color .15s;box-sizing:border-box}
.pr-input:focus{border-color:${BRAND}}
.pr-emp-row{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-bottom:10px}
.pr-btn{border:none;border-radius:9px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
.pr-btn-primary{background:${BRAND};color:#fff}
.pr-btn-primary:hover{background:#ff8c3a}
.pr-btn-ghost{background:var(--inp);border:1px solid var(--border);color:var(--t2)}
.pr-btn-ghost:hover{border-color:${BRAND};color:${BRAND}}
.pr-btn-danger{background:transparent;border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:8px 12px;font-size:11px}
.pr-summary{background:var(--inp);border-radius:12px;padding:14px}
.pr-summary-row{display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)}
.pr-summary-row:last-child{border-bottom:none}
.pr-summary-row.total{font-size:13px;font-weight:800;padding-top:10px;border-top:2px solid var(--border)}
.pr-receipt{background:var(--inp);border:1px dashed var(--border);border-radius:12px;padding:16px;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.8}
.pr-receipt-row{display:flex;justify-content:space-between;color:var(--t2)}
.pr-receipt-bold{display:flex;justify-content:space-between;font-weight:700;color:var(--t);font-family:'Plus Jakarta Sans',sans-serif}
.pr-rate-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.pr-rate-card{background:var(--inp);border-radius:10px;padding:10px 12px}
.pr-rate-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t2);margin-bottom:2px}
.pr-rate-val{font-size:13px;font-weight:800}
`;

export default function PayrollCalculator({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "1", name: "", grossSalary: 0 },
  ]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const addEmployee = () => {
    setEmployees(prev => [...prev, { id: Date.now().toString(), name: "", grossSalary: 0 }]);
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const updateEmployee = (id: string, field: keyof Employee, value: string | number) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const payrollData = useMemo(() => {
    return employees
      .filter(e => e.grossSalary > 0)
      .map(emp => {
        const gross = emp.grossSalary;
        const nssfEmployee = Math.round(gross * NSSF_EMPLOYEE);
        const nssfEmployer = Math.round(gross * NSSF_EMPLOYER);
        const nhifEmployee = Math.round(gross * NHIF_EMPLOYEE);
        const nhifEmployer = Math.round(gross * NHIF_EMPLOYER);
        const paye = Math.round(calculatePAYE(gross));
        const sdl = Math.round(gross * SDL_RATE);
        const wcf = Math.round(gross * WCF_RATE);
        const totalDeductions = nssfEmployee + nhifEmployee + paye;
        const netPay = gross - totalDeductions;
        const totalEmployerCost = gross + nssfEmployer + nhifEmployer + sdl + wcf;
        const totalRemittanceTRA = paye + sdl;
        const totalRemittanceNSSF = nssfEmployee + nssfEmployer;
        const totalRemittanceNHIF = nhifEmployee + nhifEmployer;

        return {
          ...emp,
          nssfEmployee, nssfEmployer,
          nhifEmployee, nhifEmployer,
          paye, sdl, wcf,
          totalDeductions,
          netPay,
          totalEmployerCost,
          totalRemittanceTRA,
          totalRemittanceNSSF,
          totalRemittanceNHIF,
        };
      });
  }, [employees]);

  const totals = useMemo(() => ({
    grossTotal: payrollData.reduce((s, e) => s + e.grossSalary, 0),
    netTotal: payrollData.reduce((s, e) => s + e.netPay, 0),
    payeTotalTRA: payrollData.reduce((s, e) => s + e.paye, 0),
    sdlTotalTRA: payrollData.reduce((s, e) => s + e.sdl, 0),
    nssfTotal: payrollData.reduce((s, e) => s + e.nssfEmployee + e.nssfEmployer, 0),
    nhifTotal: payrollData.reduce((s, e) => s + e.nhifEmployee + e.nhifEmployer, 0),
    totalEmployerCost: payrollData.reduce((s, e) => s + e.totalEmployerCost, 0),
    wcfTotal: payrollData.reduce((s, e) => s + e.wcf, 0),
  }), [payrollData]);

  const monthLabel = new Date(month + "-01").toLocaleDateString("en-TZ", { month: "long", year: "numeric" });

  return (
    <>
      <style>{css}</style>
      <div className={`pr-root ${theme}`}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: BRAND, marginBottom: 3 }}>
            NSSF · NHIF · PAYE · SDL
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t)" }}>Payroll Calculator</div>
          <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>Tanzania statutory deductions — accurate rates for {new Date().getFullYear()}</div>
        </div>

        {/* Rate Reference */}
        <div className="pr-section">
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: BRAND, marginBottom: 10 }}>
            Tanzania Statutory Rates
          </div>
          <div className="pr-rate-grid">
            {[
              { label: "NSSF Employee", val: "10% of gross", color: "#3b82f6" },
              { label: "NSSF Employer", val: "10% of gross", color: "#3b82f6" },
              { label: "NHIF Employee", val: "3% of gross", color: "#22c55e" },
              { label: "NHIF Employer", val: "3% of gross", color: "#22c55e" },
              { label: "SDL (Employer)", val: "4% of gross", color: BRAND },
              { label: "WCF (Employer)", val: "~0.5% of gross", color: "#a855f7" },
            ].map(r => (
              <div className="pr-rate-card" key={r.label}>
                <div className="pr-rate-label">{r.label}</div>
                <div className="pr-rate-val" style={{ color: r.color }}>{r.val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(229,107,10,.06)", border: "1px solid rgba(229,107,10,.2)", borderRadius: 9, fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>
            <strong style={{ color: BRAND }}>PAYE Brackets (Monthly):</strong>{" "}
            0–270K: 0% · 270K–520K: 9% · 520K–760K: 20% · 760K–1M: 25% · Above 1M: 30%
            <br /><em>PAYE calculated on gross minus NSSF employee contribution</em>
          </div>
        </div>

        {/* Employee Entry */}
        <div className="pr-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t)" }}>
              Employees ({employees.length})
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="pr-input"
                style={{ width: "auto", fontSize: 12 }}
              />
            </div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".5px", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 6 }}>
            <span>Employee Name</span><span>Gross Monthly Salary (TSh)</span><span></span>
          </div>

          {employees.map(emp => (
            <div className="pr-emp-row" key={emp.id}>
              <input
                className="pr-input"
                placeholder="e.g. Hassan Mwenda"
                value={emp.name}
                onChange={e => updateEmployee(emp.id, "name", e.target.value)}
              />
              <input
                className="pr-input"
                type="number"
                placeholder="e.g. 800000"
                value={emp.grossSalary || ""}
                onChange={e => updateEmployee(emp.id, "grossSalary", Number(e.target.value))}
              />
              <button className="pr-btn pr-btn-danger" onClick={() => removeEmployee(emp.id)} disabled={employees.length === 1}>
                ✕
              </button>
            </div>
          ))}

          <button className="pr-btn pr-btn-ghost" onClick={addEmployee} style={{ marginTop: 4, fontSize: 12 }}>
            + Add Employee
          </button>
        </div>

        {/* Per-Employee Breakdown */}
        {payrollData.length > 0 && (
          <div className="pr-section">
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: BRAND, marginBottom: 12 }}>
              Employee Breakdown
            </div>
            {payrollData.map(emp => (
              <div key={emp.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--t)", marginBottom: 8 }}>
                  {emp.name || "Employee"} — {fmt(emp.grossSalary)} gross
                </div>
                <div className="pr-summary">
                  <div className="pr-summary-row">
                    <span style={{ color: "var(--t2)" }}>Gross Salary</span>
                    <span style={{ color: "var(--t)", fontWeight: 700 }}>{fmt(emp.grossSalary)}</span>
                  </div>
                  <div className="pr-summary-row" style={{ color: "#ef4444" }}>
                    <span>— NSSF (employee 10%)</span>
                    <span>({fmt(emp.nssfEmployee)})</span>
                  </div>
                  <div className="pr-summary-row" style={{ color: "#ef4444" }}>
                    <span>— NHIF (employee 3%)</span>
                    <span>({fmt(emp.nhifEmployee)})</span>
                  </div>
                  <div className="pr-summary-row" style={{ color: "#ef4444" }}>
                    <span>— PAYE (income tax)</span>
                    <span>({fmt(emp.paye)})</span>
                  </div>
                  <div className="pr-summary-row total">
                    <span>Net Pay to Employee</span>
                    <span style={{ color: "#22c55e" }}>{fmt(emp.netPay)}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "TRA (PAYE+SDL)", val: fmt(emp.paye + emp.sdl), color: BRAND, note: "due 7th" },
                    { label: "NSSF Total", val: fmt(emp.nssfEmployee + emp.nssfEmployer), color: "#3b82f6", note: "due 15th" },
                    { label: "NHIF Total", val: fmt(emp.nhifEmployee + emp.nhifEmployer), color: "#22c55e", note: "due 15th" },
                  ].map(r => (
                    <div key={r.label} style={{ background: "var(--inp)", borderRadius: 8, padding: "7px 11px", flex: "1 1 120px" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--t2)", letterSpacing: ".4px" }}>{r.label} · {r.note}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: r.color, marginTop: 2 }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monthly Remittance Summary */}
        {payrollData.length > 0 && (
          <div className="pr-section">
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: BRAND, marginBottom: 12 }}>
              {monthLabel} — Remittance Summary
            </div>
            <div className="pr-receipt">
              <div style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--t)" }}>PAYROLL REMITTANCE SCHEDULE</div>
                <div style={{ fontSize: 10, color: "var(--t2)" }}>{monthLabel} · {payrollData.length} employee{payrollData.length !== 1 ? "s" : ""}</div>
              </div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />
              <div className="pr-receipt-row"><span>Total Gross Payroll:</span><span style={{ color: "var(--t)" }}>{fmt(totals.grossTotal)}</span></div>
              <div className="pr-receipt-row"><span>Total Net Pay (to employees):</span><span style={{ color: "#22c55e" }}>{fmt(totals.netTotal)}</span></div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: BRAND, textTransform: "uppercase", marginBottom: 4 }}>TO REMIT BY 7TH — TRA (tanzra.go.tz)</div>
              <div className="pr-receipt-row"><span>PAYE (income tax):</span><span style={{ color: "var(--t)" }}>{fmt(totals.payeTotalTRA)}</span></div>
              <div className="pr-receipt-row"><span>SDL (4% × gross):</span><span style={{ color: "var(--t)" }}>{fmt(totals.sdlTotalTRA)}</span></div>
              <div className="pr-receipt-bold"><span>TRA TOTAL DUE:</span><span style={{ color: BRAND }}>{fmt(totals.payeTotalTRA + totals.sdlTotalTRA)}</span></div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", marginBottom: 4 }}>TO REMIT BY 15TH — NSSF (nssf.or.tz)</div>
              <div className="pr-receipt-row"><span>Employee NSSF (10%):</span><span style={{ color: "var(--t)" }}>{fmt(totals.nssfTotal / 2)}</span></div>
              <div className="pr-receipt-row"><span>Employer NSSF (10%):</span><span style={{ color: "var(--t)" }}>{fmt(totals.nssfTotal / 2)}</span></div>
              <div className="pr-receipt-bold"><span>NSSF TOTAL DUE:</span><span style={{ color: "#3b82f6" }}>{fmt(totals.nssfTotal)}</span></div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", marginBottom: 4 }}>TO REMIT BY 15TH — NHIF (nhif.or.tz)</div>
              <div className="pr-receipt-bold"><span>NHIF TOTAL DUE:</span><span style={{ color: "#22c55e" }}>{fmt(totals.nhifTotal)}</span></div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />
              <div className="pr-receipt-bold" style={{ fontSize: 13 }}><span>TOTAL EMPLOYER COST:</span><span style={{ color: "var(--t)" }}>{fmt(totals.totalEmployerCost)}</span></div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <a href="https://taxservices.tra.go.tz" target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, background: BRAND, color: "#fff", textDecoration: "none", textAlign: "center", padding: "10px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>
                → File PAYE on TRA Portal
              </a>
              <a href="https://www.nssf.or.tz" target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, background: "#3b82f6", color: "#fff", textDecoration: "none", textAlign: "center", padding: "10px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>
                → NSSF Portal
              </a>
            </div>
          </div>
        )}

        {payrollData.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--t2)", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
            Enter at least one employee's name and gross salary above to generate payroll calculations.
          </div>
        )}
      </div>
    </>
  );
}
