import { useMemo } from "react";
import { getProfile } from "../hooks/useBusinessProfile";

const BRAND = "#E56B0A";

interface Deadline {
  id: string;
  title: string;
  titleSw: string;
  dayOfMonth: number;
  description: string;
  category: "daily" | "weekly" | "monthly" | "annual";
  urgency: "critical" | "high" | "medium" | "low";
  link?: string;
  icon: string;
  requiresTIN?: boolean;
  requiresStaff?: boolean;
}

const DEADLINES: Deadline[] = [
  {
    id: "efd-zreport",
    title: "EFD Z-Report Transmission",
    titleSw: "Kutuma Ripoti ya Z kwa TRA",
    dayOfMonth: 0,
    description: "Transmit daily Z-Report to TRA via GPRS before midnight. Failure = TSh 4M penalty.",
    category: "daily",
    urgency: "critical",
    icon: "📡",
    requiresTIN: true,
  },
  {
    id: "paye",
    title: "PAYE & SDL Remittance to TRA",
    titleSw: "Kulipa PAYE na SDL TRA",
    dayOfMonth: 7,
    description: "Pay As You Earn + Skills Development Levy (4%) due by 7th of following month.",
    category: "monthly",
    urgency: "critical",
    icon: "💰",
    requiresStaff: true,
    link: "https://taxservices.tra.go.tz",
  },
  {
    id: "nssf",
    title: "NSSF Contributions",
    titleSw: "Michango ya NSSF",
    dayOfMonth: 15,
    description: "Employee (10%) + Employer (10%) = 20% of gross salary. Pay via NSSF portal.",
    category: "monthly",
    urgency: "high",
    icon: "🛡️",
    requiresStaff: true,
    link: "https://www.nssf.or.tz",
  },
  {
    id: "nhif",
    title: "NHIF Contributions",
    titleSw: "Michango ya NHIF",
    dayOfMonth: 15,
    description: "Employee 3% + Employer 3% of gross salary for health insurance coverage.",
    category: "monthly",
    urgency: "high",
    icon: "🏥",
    requiresStaff: true,
    link: "https://www.nhif.or.tz",
  },
  {
    id: "vat-return",
    title: "VAT Return Filing",
    titleSw: "Faili Kodi ya Ongezeko la Thamani",
    dayOfMonth: 20,
    description: "File monthly VAT return on TRA portal. Net VAT = collected (18%) minus input tax credits.",
    category: "monthly",
    urgency: "critical",
    icon: "📋",
    requiresTIN: true,
    link: "https://taxservices.tra.go.tz",
  },
  {
    id: "income-tax",
    title: "Annual Income Tax Return",
    titleSw: "Faili Kodi ya Mapato ya Mwaka",
    dayOfMonth: 30,
    description: "File annual income tax return within 6 months of fiscal year end. Pay estimated tax quarterly.",
    category: "annual",
    urgency: "medium",
    icon: "📊",
    link: "https://taxservices.tra.go.tz",
  },
  {
    id: "wcf",
    title: "WCF Premium Payment",
    titleSw: "Malipo ya Bima ya WCF",
    dayOfMonth: 31,
    description: "Workers Compensation Fund annual premium. Computed based on industry risk category.",
    category: "annual",
    urgency: "low",
    icon: "🦺",
    requiresStaff: true,
    link: "https://www.wcf.or.tz",
  },
];

function getDaysUntil(dayOfMonth: number): number {
  const now = new Date();
  const today = now.getDate();
  if (dayOfMonth === 0) return 0; // daily = due today
  if (today <= dayOfMonth) return dayOfMonth - today;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  return Math.ceil((nextMonth.getTime() - now.getTime()) / 86400000);
}

function getUrgencyColor(urgency: string, daysUntil: number): string {
  if (daysUntil <= 2) return "#ef4444";
  if (daysUntil <= 7) return "#f59e0b";
  if (urgency === "critical") return BRAND;
  if (urgency === "high") return "#3b82f6";
  return "#6b7280";
}

export default function TRAComplianceCalendar({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const profile = getProfile();
  const hasStaff = true;

  const deadlines = useMemo(() => {
    return DEADLINES
      .filter(d => {
        if (d.requiresTIN && !profile.tin) return false;
        return true;
      })
      .map(d => ({
        ...d,
        daysUntil: getDaysUntil(d.dayOfMonth),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [profile.tin, hasStaff]);

  const overdue = deadlines.filter(d => d.daysUntil === 0 && d.category !== "daily");
  const urgent = deadlines.filter(d => d.daysUntil > 0 && d.daysUntil <= 7);
  const upcoming = deadlines.filter(d => d.daysUntil > 7);

  const css = `
.tca-root{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.tca-root.dark{--card:#1a1d27;--border:#2e3347;--inp:#22263a;--t:#f0f2ff;--t2:#7c85a8}
.tca-root.light{--card:#fff;--border:#e2e5ef;--inp:#f8f9fc;--t:#1a1d2e;--t2:#5b6380}
.tca-wrap{background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:16px}
.tca-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:11px;border:1px solid var(--border);margin-bottom:8px;transition:border-color .15s;cursor:pointer;background:var(--card)}
.tca-item:hover{border-color:${BRAND}}
.tca-item.overdue{border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.04)}
.tca-item.urgent{border-color:rgba(245,158,11,.35);background:rgba(245,158,11,.03)}
.tca-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.tca-title{font-size:13px;font-weight:700;color:var(--t)}
.tca-desc{font-size:11px;color:var(--t2);margin-top:2px;line-height:1.4}
.tca-badge{font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px;border:1px solid;white-space:nowrap;flex-shrink:0}
.tca-section-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--t2);margin:10px 0 6px}
.tca-daily{background:linear-gradient(135deg,rgba(229,107,10,.12),rgba(229,107,10,.04));border:1.5px solid rgba(229,107,10,.3);border-radius:11px;padding:10px 12px;margin-bottom:8px}
`;

  return (
    <>
      <style>{css}</style>
      <div className={`tca-root ${theme}`}>
        <div className="tca-wrap">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: BRAND, marginBottom: 2 }}>
                TRA Compliance Calendar
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--t)" }}>Tax Deadlines · Tanzania</div>
            </div>
            <div style={{
              background: overdue.length > 0 ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.1)",
              border: `1px solid ${overdue.length > 0 ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.25)"}`,
              color: overdue.length > 0 ? "#ef4444" : "#22c55e",
              fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
            }}>
              {overdue.length > 0 ? `${overdue.length} OVERDUE` : "ALL CLEAR"}
            </div>
          </div>

          {/* Daily */}
          <div className="tca-daily">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>📡</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t)" }}>EFD Z-Report — Due Tonight</div>
                <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
                  Transmit daily Z-Report to TRA before midnight. Penalty: TSh 4,000,000 per missed day.
                </div>
              </div>
              {profile.tin ? (
                <a
                  href="https://taxservices.tra.go.tz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: BRAND, color: "#fff", fontSize: 10, fontWeight: 800, padding: "5px 10px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  TRA Portal →
                </a>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", background: "var(--inp)", padding: "4px 8px", borderRadius: 8 }}>
                  Add TIN
                </span>
              )}
            </div>
          </div>

          {overdue.length > 0 && (
            <>
              <div className="tca-section-label" style={{ color: "#ef4444" }}>⚠️ Action Required</div>
              {overdue.map(d => (
                <div key={d.id} className="tca-item overdue">
                  <span className="tca-icon">{d.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="tca-title">{d.title}</div>
                    <div className="tca-desc">{d.description}</div>
                  </div>
                  <span className="tca-badge" style={{ background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", color: "#ef4444" }}>
                    DUE TODAY
                  </span>
                </div>
              ))}
            </>
          )}

          {urgent.length > 0 && (
            <>
              <div className="tca-section-label" style={{ color: "#f59e0b" }}>⏰ Due This Week</div>
              {urgent.map(d => (
                <div
                  key={d.id}
                  className="tca-item urgent"
                  onClick={() => d.link && window.open(d.link, "_blank")}
                >
                  <span className="tca-icon">{d.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="tca-title">{d.title}</div>
                    <div className="tca-desc">{d.description}</div>
                  </div>
                  <span className="tca-badge" style={{ background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.3)", color: "#f59e0b" }}>
                    {d.daysUntil}d
                  </span>
                </div>
              ))}
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <div className="tca-section-label">📅 Upcoming</div>
              {upcoming.slice(0, 4).map(d => {
                const color = getUrgencyColor(d.urgency, d.daysUntil);
                return (
                  <div
                    key={d.id}
                    className="tca-item"
                    onClick={() => d.link && window.open(d.link, "_blank")}
                  >
                    <span className="tca-icon">{d.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="tca-title">{d.title}</div>
                      <div className="tca-desc">{d.description}</div>
                    </div>
                    <span className="tca-badge" style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>
                      {d.category === "annual" ? "Annual" : `${d.daysUntil}d`}
                    </span>
                  </div>
                );
              })}
            </>
          )}

          {!profile.tin && (
            <div style={{
              marginTop: 10, background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.2)",
              borderRadius: 10, padding: "10px 13px", fontSize: 11, color: "var(--t2)", lineHeight: 1.5,
            }}>
              💡 Add your TIN in Settings to unlock TRA filing deadlines and VAT tracking specific to your business.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
