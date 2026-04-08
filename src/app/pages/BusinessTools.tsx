import { useState, useEffect, useMemo } from "react";
import InvoiceManager from "../components/InvoiceManager";
import BusinessSkillsAcademy from "../components/BusinessSkillsAcademy";
import FormalizationHub from "../components/FormalizationHub";
import AkiliYaBiashara from "../components/AkiliYaBiashara";
import { EFDZReport } from "../components/EFDZReport";
import MobileMoneyLedger from "../components/MobileMoneyLedgerComponent";
import PayrollCalculator from "../components/PayrollCalculator";
import { useTransactions, useProducts } from "../hooks/useData";
import { getProfile } from "../hooks/useBusinessProfile";

export function BusinessTools() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"akili" | "invoices" | "academy" | "formalization" | "efd" | "mobilemoney" | "payroll">("akili");

  const { data: transactions = [] } = useTransactions();
  const { data: products = [] } = useProducts();
  const profile = getProfile();

  useEffect(() => {
    const checkTheme = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
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

    // Day-of-week revenue breakdown (0=Sun, 1=Mon, ..., 6=Sat)
    const dayTotals: Record<number, number[]> = {};
    transactions.filter(t => t.type === "income").forEach(t => {
      const d = new Date(t.date).getDay();
      if (!dayTotals[d]) dayTotals[d] = [];
      dayTotals[d].push(t.amount);
    });
    const dayStats = [0, 1, 2, 3, 4, 5, 6].map(d => ({
      dayIndex: d,
      avg: dayTotals[d] ? Math.round(dayTotals[d].reduce((s, v) => s + v, 0) / dayTotals[d].length) : 0,
      count: (dayTotals[d] || []).length,
    }));

    const paymentCounts: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === "income" && t.paymentMethod) {
        paymentCounts[t.paymentMethod] = (paymentCounts[t.paymentMethod] || 0) + t.amount;
      }
    });
    const totalPayments = Object.values(paymentCounts).reduce((s, v) => s + v, 1);
    const mpesaPct = Math.round(((paymentCounts["M-Pesa"] || 0) / totalPayments) * 100);
    const cashPct = Math.round(((paymentCounts["Cash"] || 0) / totalPayments) * 100);
    const airtelPct = 100 - mpesaPct - cashPct;

    return {
      name: profile.businessName || "My Shop",
      owner: profile.ownerName?.split(" ")[0] || "Owner",
      weekRevenue: weekRevenue || 0,
      weekTransactions: weekTransactions || 0,
      weekExpenses: weekExpenses || 0,
      weekProfit: weekProfit || 0,
      topProducts: products.slice(0, 3).map(p => ({
        name: p.name, unitsSold: 0, revenue: 0,
        stock: p.stock, reorderThreshold: 10,
      })),
      overdueDebt: 0,
      debtors: 0,
      bestHour: "09:00–11:00",
      bestDay: "Saturday",
      worstDay: "Monday",
      peakSaturday: weekRevenue > 0 ? Math.round(weekRevenue / 3) : 0,
      avgDailySales: weekRevenue > 0 ? Math.round(weekRevenue / 7) : 0,
      paymentSplit: { mpesa: mpesaPct || 58, cash: cashPct || 31, airtel: airtelPct > 0 ? airtelPct : 11 },
      staffCount: 1,
      monthsActive: 1,
      creditScore: Math.min(100, Math.max(0, 50 + (weekRevenue > 100000 ? 10 : 0) + (weekTransactions > 50 ? 10 : 0))),
      stockoutsThisWeek: lowStockProducts.length,
      dayStats,
    };
  }, [transactions, products, profile]);

  const efdData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    const todayTxns = transactions.filter(t =>
      t.type === "income" && new Date(t.date).toDateString() === todayStr
    );
    const totalSales = todayTxns.reduce((s, t) => s + t.amount, 0);
    const totalVAT = Math.round(totalSales - (totalSales / 1.18));
    const dateStr = today.toISOString().split("T")[0];
    return {
      date: dateStr,
      deviceSerial: `EFD-TZ-${profile.tin?.replace(/-/g, "").slice(0, 8) || "00000000"}-0001`,
      tin: profile.tin || "NOT SET",
      businessName: profile.businessName || "My Business",
      zReportNumber: `Z-${String(todayTxns.length + 1).padStart(5, "0")}`,
      totalSales,
      totalVAT,
      totalExempt: 0,
      totalReceipts: todayTxns.length,
      firstReceipt: todayTxns.length > 0 ? `EFD-${String(1).padStart(5, "0")}` : "EFD-00000",
      lastReceipt: todayTxns.length > 0 ? `EFD-${String(todayTxns.length).padStart(5, "0")}` : "EFD-00000",
      voidedReceipts: 0,
      voidedAmount: 0,
      transmitted: false,
      transmissionTime: today.toISOString(),
      traConfirmCode: "",
    };
  }, [transactions, profile]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Business Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">AI advisor, training, and advanced business features</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {([
          { id: "akili", label: "🧠 Akili AI Advisor" },
          { id: "invoices", label: "📄 Invoices" },
          { id: "academy", label: "📚 Business Academy" },
          { id: "formalization", label: "🏛️ Registration Hub" },
          { id: "efd", label: "📊 EFD Z-Report" },
          { id: "mobilemoney", label: "💰 Mobile Money Ledger" },
          { id: "payroll", label: "👥 Payroll Calculator" },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "akili" && <AkiliYaBiashara shopData={shopData} theme={theme} />}
      {activeTab === "invoices" && <InvoiceManager theme={theme} />}
      {activeTab === "academy" && <BusinessSkillsAcademy theme={theme} />}
      {activeTab === "formalization" && <FormalizationHub theme={theme} />}
      {activeTab === "efd" && <EFDZReport theme={theme} data={efdData} />}
      {activeTab === "mobilemoney" && <MobileMoneyLedger theme={theme} />}
      {activeTab === "payroll" && <PayrollCalculator theme={theme} />}
    </div>
  );
}
