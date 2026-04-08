import { useState, useEffect, useMemo } from "react";
import { Brain, FileText, BookOpen, Building2, Receipt, Smartphone, Users, Sparkles, ChevronRight } from "lucide-react";
import InvoiceManager from "../components/InvoiceManager";
import BusinessSkillsAcademy from "../components/BusinessSkillsAcademy";
import FormalizationHub from "../components/FormalizationHub";
import AkiliYaBiashara from "../components/AkiliYaBiashara";
import { EFDZReport } from "../components/EFDZReport";
import MobileMoneyLedger from "../components/MobileMoneyLedgerComponent";
import PayrollCalculator from "../components/PayrollCalculator";
import { useTransactions, useProducts } from "../hooks/useData";
import { getProfile } from "../hooks/useBusinessProfile";

type TabId = "akili" | "invoices" | "academy" | "formalization" | "efd" | "mobilemoney" | "payroll";

const TOOLS: { id: TabId; icon: typeof Brain; label: string; desc: string; badge?: string; color: string; bg: string }[] = [
  { id: "akili",        icon: Brain,        label: "Akili AI Advisor",       desc: "Smart insights from your sales data",  badge: "AI",  color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
  { id: "invoices",     icon: FileText,     label: "Invoices",               desc: "Create and manage professional invoices",                color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "academy",      icon: BookOpen,     label: "Business Academy",       desc: "Training to grow your business skills",                  color: "text-green-600",  bg: "bg-green-100 dark:bg-green-900/30" },
  { id: "formalization",icon: Building2,    label: "Registration Hub",       desc: "BRELA, TIN, EFD registration guides",                    color: "text-amber-600",  bg: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "efd",          icon: Receipt,      label: "EFD Z-Report",           desc: "Daily TRA EFD transmission report",   badge: "TRA", color: "text-red-600",    bg: "bg-red-100 dark:bg-red-900/30" },
  { id: "mobilemoney",  icon: Smartphone,   label: "Mobile Money Ledger",    desc: "Reconcile M-Pesa, Airtel, Tigo, Halo",                   color: "text-teal-600",   bg: "bg-teal-100 dark:bg-teal-900/30" },
  { id: "payroll",      icon: Users,        label: "Payroll Calculator",     desc: "NSSF, NHIF, PAYE, SDL deductions",                       color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
];

export function BusinessTools() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<TabId>("akili");

  const { data: transactions = [] } = useTransactions();
  const { data: products = [] } = useProducts();
  const profile = getProfile();

  useEffect(() => {
    const checkTheme = () => setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const shopData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTxns = transactions.filter(t => new Date(t.date) >= weekAgo);
    const weekRevenue = weekTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const weekExpenses = weekTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const weekTransactions = weekTxns.length;
    const weekProfit = weekRevenue - weekExpenses;
    const lowStockProducts = products.filter(p => p.stock < 10);
    const dayTotals: Record<number, number[]> = {};
    transactions.filter(t => t.type === "income").forEach(t => {
      const d = new Date(t.date).getDay();
      if (!dayTotals[d]) dayTotals[d] = [];
      dayTotals[d].push(t.amount);
    });
    const dayStats = [0,1,2,3,4,5,6].map(d => ({
      dayIndex: d,
      avg: dayTotals[d] ? Math.round(dayTotals[d].reduce((s,v) => s+v,0)/dayTotals[d].length) : 0,
      count: (dayTotals[d]||[]).length,
    }));
    const paymentCounts: Record<string, number> = {};
    transactions.forEach(t => { if (t.type==="income" && t.paymentMethod) paymentCounts[t.paymentMethod] = (paymentCounts[t.paymentMethod]||0)+t.amount; });
    const totalPayments = Object.values(paymentCounts).reduce((s,v)=>s+v,1);
    const mpesaPct = Math.round(((paymentCounts["M-Pesa"]||0)/totalPayments)*100);
    const cashPct  = Math.round(((paymentCounts["Cash"]||0)/totalPayments)*100);
    const airtelPct = 100 - mpesaPct - cashPct;
    return {
      name: profile.businessName||"My Shop", owner: profile.ownerName?.split(" ")[0]||"Owner",
      weekRevenue: weekRevenue||0, weekTransactions: weekTransactions||0, weekExpenses: weekExpenses||0, weekProfit: weekProfit||0,
      topProducts: products.slice(0,3).map(p=>({name:p.name,unitsSold:0,revenue:0,stock:p.stock,reorderThreshold:10})),
      overdueDebt:0, debtors:0, bestHour:"09:00–11:00", bestDay:"Saturday", worstDay:"Monday",
      peakSaturday: weekRevenue>0 ? Math.round(weekRevenue/3):0,
      avgDailySales: weekRevenue>0 ? Math.round(weekRevenue/7):0,
      paymentSplit: {mpesa:mpesaPct||58, cash:cashPct||31, airtel:airtelPct>0?airtelPct:11},
      staffCount:1, monthsActive:1,
      creditScore: Math.min(100,Math.max(0,50+(weekRevenue>100000?10:0)+(weekTransactions>50?10:0))),
      stockoutsThisWeek: lowStockProducts.length, dayStats,
    };
  }, [transactions, products, profile]);

  const efdData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    const todayTxns = transactions.filter(t => t.type==="income" && new Date(t.date).toDateString()===todayStr);
    const totalSales = todayTxns.reduce((s,t)=>s+t.amount,0);
    const totalVAT   = Math.round(totalSales-(totalSales/1.18));
    const dateStr    = today.toISOString().split("T")[0];
    return {
      date: dateStr,
      deviceSerial: `EFD-TZ-${profile.tin?.replace(/-/g,"").slice(0,8)||"00000000"}-0001`,
      tin: profile.tin||"NOT SET",
      businessName: profile.businessName||"My Business",
      zReportNumber: `Z-${String(todayTxns.length+1).padStart(5,"0")}`,
      totalSales, totalVAT, totalExempt:0, totalReceipts:todayTxns.length,
      firstReceipt: todayTxns.length>0?`EFD-${String(1).padStart(5,"0")}`:"EFD-00000",
      lastReceipt:  todayTxns.length>0?`EFD-${String(todayTxns.length).padStart(5,"0")}`:"EFD-00000",
      voidedReceipts:0, voidedAmount:0, transmitted:false, transmissionTime:today.toISOString(), traConfirmCode:"",
    };
  }, [transactions, profile]);

  const activeTool = TOOLS.find(t => t.id === activeTab)!;

  return (
    <div className="p-4 md:p-6 xl:p-8 pb-16">

      {/* Header */}
      <div className="mb-6 pd-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Business Tools</h1>
          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            <Sparkles className="w-3 h-3" /> AI-POWERED
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Advanced tools to grow, formalize, and automate your business</p>
      </div>

      {/* Tool Picker Cards — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1 pd-fade-up pd-d1 scrollbar-hide">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTab === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`flex-shrink-0 flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left transition-all duration-150 min-w-[140px] max-w-[160px] ${
                isActive
                  ? "bg-primary text-white border-primary shadow-md scale-[1.02]"
                  : "bg-card border-border hover:border-primary/40 hover:bg-primary/5 pd-card"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? "bg-white/20" : tool.bg}`}>
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : tool.color}`} />
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${isActive ? "text-white" : "text-foreground"}`}>{tool.label}</p>
                {tool.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1 inline-block ${isActive ? "bg-white/25 text-white" : "bg-primary/10 text-primary"}`}>{tool.badge}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active tool breadcrumb */}
      <div className="flex items-center gap-2 mb-5 pd-fade-up pd-d2">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${activeTool.bg}`}>
          <activeTool.icon className={`w-3.5 h-3.5 ${activeTool.color}`} />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">{activeTool.label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{activeTool.desc}</p>
        </div>
      </div>

      {/* Tool Content */}
      <div className="pd-fade-up pd-d3">
        {activeTab === "akili"         && <AkiliYaBiashara shopData={shopData} theme={theme} />}
        {activeTab === "invoices"      && <InvoiceManager theme={theme} />}
        {activeTab === "academy"       && <BusinessSkillsAcademy theme={theme} />}
        {activeTab === "formalization" && <FormalizationHub theme={theme} />}
        {activeTab === "efd"           && <EFDZReport theme={theme} data={efdData} />}
        {activeTab === "mobilemoney"   && <MobileMoneyLedger theme={theme} />}
        {activeTab === "payroll"       && <PayrollCalculator theme={theme} />}
      </div>
    </div>
  );
}
