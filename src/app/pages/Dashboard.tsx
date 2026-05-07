import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect, useMemo, useRef } from "react";
import MorningBriefing from "../components/MorningBriefing";
import EndOfDayClose from "../components/EndOfDayClose";
import CreditScoreCard from "../components/CreditScoreCard";
import VATGuardian from "../components/VATGuardian";
import TRAComplianceCalendar from "../components/TRAComplianceCalendar";
import FirstTimeGuide from "../components/FirstTimeGuide";
import AkiliMiniWidget from "../components/AkiliMiniWidget";
import { DashboardSkeleton } from "../components/SkeletonLoader";
import { useCountUp } from "../hooks/useCountUp";
import { useTransactions, useProducts } from "../hooks/useData";
import { getProfile } from "../hooks/useBusinessProfile";
import { toast } from "sonner";

function getStreak(): number {
  try {
    const usedDates: string[] = JSON.parse(localStorage.getItem("pesa_used_dates") || "[]");
    const today = new Date().toDateString();
    if (!usedDates.includes(today)) {
      usedDates.push(today);
      if (usedDates.length > 90) usedDates.shift();
      localStorage.setItem("pesa_used_dates", JSON.stringify(usedDates));
    }
    let streak = 0;
    const check = new Date();
    while (true) {
      if (usedDates.includes(check.toDateString())) { streak++; check.setDate(check.getDate() - 1); }
      else break;
    }
    return streak;
  } catch { return 1; }
}

function formatLiveDate() {
  return new Date().toLocaleDateString("en-TZ", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Africa/Dar_es_Salaam",
  });
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const paymentMethodColors: Record<string, string> = {
  "Cash": "#6B7280",
  "M-Pesa": "#22C55E",
  "Credit": "#EF4444",
  "Airtel Money": "#3B82F6",
  "Tigo Pesa": "#F59E0B",
  "HaloPesa": "#A855F7",
};

export function Dashboard() {
  const [showMorningBriefing, setShowMorningBriefing] = useState(true);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [liveDate, setLiveDate] = useState(formatLiveDate());
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem("pesa_demo_mode") === "true");
  const [upgradeDismissed, setUpgradeDismissed] = useState(() => !!localStorage.getItem("pesa_upgrade_dismissed"));
  const prevTxnCount = useRef<number | null>(null);

  const { data: transactions = [], isLoading: loadingTransactions, isError: errorTransactions } = useTransactions();
  const { data: products = [], isLoading: loadingProducts, isError: errorProducts } = useProducts();

  const profile = getProfile();

  useEffect(() => {
    const checkTheme = () => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setLiveDate(formatLiveDate()), 60000);
    return () => clearInterval(interval);
  }, []);

  // WOW moment: celebrate the very first transaction
  useEffect(() => {
    if (transactions.length === 0) {
      prevTxnCount.current = 0;
      return;
    }
    if (prevTxnCount.current === 0 && transactions.length > 0) {
      toast.success("🎉 Mauzo yako ya kwanza yameandikwa! / First sale recorded!", {
        description: "Akili imeanza kujifunza duka lako. Bonyeza Business Tools ili upate ushauri.",
        duration: 8000,
      });
    }
    prevTxnCount.current = transactions.length;
  }, [transactions.length]);

  const now = new Date();
  const todayStr = now.toDateString();

  const todayTransactionsList = useMemo(
    () => transactions.filter(t => new Date(t.date).toDateString() === todayStr),
    [transactions, todayStr]
  );

  const todayIncome = useMemo(
    () => todayTransactionsList.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    [todayTransactionsList]
  );

  const todayExpenses = useMemo(
    () => todayTransactionsList.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    [todayTransactionsList]
  );

  const profitMargin = useMemo(() => {
    if (todayIncome === 0) return 0;
    return Math.round(((todayIncome - todayExpenses) / todayIncome) * 100);
  }, [todayIncome, todayExpenses]);

  const lowStockProducts = useMemo(
    () => products.filter(p => p.stock < 20),
    [products]
  );

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
    [transactions]
  );

  const weeklyData = useMemo(() => {
    const daySales: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === "income" && d >= weekAgo) {
        daySales[d.getDay()] = (daySales[d.getDay()] || 0) + t.amount;
      }
    });
    return DAYS.map((day, i) => ({ day, sales: daySales[i] }));
  }, [transactions]);

  const paymentMethodData = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === "income" && t.paymentMethod) {
        counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + t.amount;
      }
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(counts).map(([name, value]) => ({
      name, value: Math.round((value / total) * 100),
      color: paymentMethodColors[name] || "#9CA3AF",
    }));
  }, [transactions]);

  const topProducts = useMemo(() => {
    const productSales: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === "income" && t.description) {
        const parts = t.description.split(",");
        parts.forEach(part => {
          const match = part.trim().match(/^(\d+)[×x]\s+(.+)$/);
          if (match) {
            const qty = parseInt(match[1]);
            const name = match[2].trim();
            productSales[name] = (productSales[name] || 0) + (qty * (t.amount / parts.length));
          }
        });
        if (Object.keys(productSales).length === 0 && t.description) {
          productSales[t.description] = (productSales[t.description] || 0) + t.amount;
        }
      }
    });
    return Object.entries(productSales)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [transactions]);

  const yesterday = useMemo(() => {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yStr = y.toDateString();
    const yTxns = transactions.filter(t => new Date(t.date).toDateString() === yStr);
    const ySales = yTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    return { sales: ySales, count: yTxns.length };
  }, [transactions]);

  const weeklyAvgSales = useMemo(() => {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekIncome = transactions
      .filter(t => t.type === "income" && new Date(t.date) >= weekAgo)
      .reduce((s, t) => s + t.amount, 0);
    return Math.round(weekIncome / 7);
  }, [transactions]);

  const morningBriefingData = useMemo(() => ({
    ownerName: profile.ownerName || "Business Owner",
    yesterdaySales: yesterday.sales,
    yesterdayTransactions: yesterday.count,
    topProduct: topProducts[0]
      ? { name: topProducts[0].name, units: Math.round(topProducts[0].revenue / 5000) }
      : { name: "No sales yet", units: 0 },
    overdueDebts: [] as { name: string; amount: number; days: number }[],
    lowStockItems: lowStockProducts.slice(0, 3).map(p => p.name),
    weeklyAvgSales,
    suggestedTarget: Math.round(weeklyAvgSales * 1.2),
  }), [profile.ownerName, yesterday, topProducts, lowStockProducts, weeklyAvgSales]);

  const endOfDayLowStock = useMemo(
    () => lowStockProducts.slice(0, 5).map(p => ({
      name: p.name, stock: p.stock, threshold: 20,
      supplier: "Contact supplier",
    })),
    [lowStockProducts]
  );

  const animatedIncome = useCountUp(todayIncome, 900, 200);

  if (loadingTransactions || loadingProducts) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEndOfDay(true)}
            className="px-3 py-1.5 text-xs md:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {(() => {
              const tzHour = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Dar_es_Salaam" })).getHours();
              if (tzHour >= 5 && tzHour < 12) return "🌅 Morning Briefing";
              if (tzHour >= 12 && tzHour < 17) return "☀️ Afternoon Check";
              if (tzHour >= 17 && tzHour < 21) return "🌆 Evening Review";
              return "🌙 End of Day";
            })()}
          </button>
          {(() => { const s = getStreak(); return s > 0 ? (
            <div title={`${s}-day streak using PESA DUKA`} style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(229,107,10,.1)", border: "1px solid rgba(229,107,10,.25)", borderRadius: "8px", padding: "4px 10px", cursor: "default" }}>
              <span style={{ fontSize: "14px" }}>🔥</span>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#E56B0A" }}>{s}d</span>
            </div>
          ) : null; })()}
          <button
            title="Invite a duka owner — share PESA DUKA"
            onClick={() => { const msg = encodeURIComponent("Nimepata app nzuri ya biashara — PESA DUKA! Inasaidia na mauzo, hesabu, na TRA. Jaribu bure: https://pesaduka.co.tz 🛍️"); window.open(`https://wa.me/?text=${msg}`, "_blank"); }}
            style={{ fontSize: "18px", cursor: "pointer", background: "none", border: "none", padding: "4px" }}
          >📲</button>
          <p className="text-xs md:text-sm text-muted-foreground hidden md:block">{liveDate}</p>
        </div>
      </div>

      {isDemoMode && (
        <div style={{ background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.3)", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🎭</span>
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed" }}>Demo Mode — </span>
              <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>You're viewing sample data. This is exactly what real users see after their first week.</span>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem("pesa_demo_mode"); setIsDemoMode(false); }}
            style={{ fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(124,58,237,.4)", background: "transparent", color: "#7c3aed", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Exit Demo
          </button>
        </div>
      )}

      {showMorningBriefing && (
        <div className="mb-6">
          <MorningBriefing
            data={morningBriefingData}
            onDismiss={() => setShowMorningBriefing(false)}
            onSetTarget={(target) => { localStorage.setItem("pesa_daily_target", String(target)); }}
            theme={theme}
          />
        </div>
      )}

      <FirstTimeGuide
        hasTransactions={transactions.length > 0}
        hasProducts={products.length > 0}
      />

      <AkiliMiniWidget
        txCount={transactions.length}
        productCount={products.length}
        avgDailySales={todayIncome}
        ownerName={profile?.ownerName}
      />

      {showEndOfDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <EndOfDayClose
            posTotal={todayIncome}
            lowStockItems={endOfDayLowStock}
            onComplete={(summary) => {
              console.log("Day closed:", summary);
              setShowEndOfDay(false);
            }}
            onClose={() => setShowEndOfDay(false)}
            theme={theme}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <StatCard
          title="Today's Sales"
          value={`TSh ${animatedIncome.toLocaleString()}`}
          icon={DollarSign}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          accentColor="#E56B0A"
          delay={0}
        />
        <StatCard
          title="Transactions"
          value={todayTransactionsList.length}
          icon={ShoppingCart}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          delay={60}
        />
        <StatCard
          title="Profit Margin"
          value={`${profitMargin}%`}
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          delay={120}
        />
        <StatCard
          title="Low Stock"
          value={`${lowStockProducts.length} item${lowStockProducts.length !== 1 ? "s" : ""}`}
          icon={AlertTriangle}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
          delay={180}
        />
      </div>

      {!upgradeDismissed && transactions.length >= 3 && (
        <div style={{ background: "linear-gradient(135deg, rgba(229,107,10,.07) 0%, rgba(229,107,10,.03) 100%)", border: "1px solid rgba(229,107,10,.25)", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "22px" }}>🚀</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "hsl(var(--foreground))", marginBottom: "2px" }}>You're on Starter — unlock your full business tools</div>
              <div style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>Growth plan adds Akili AI, all 4 mobile money wallets, WhatsApp debt reminders + unlimited invoices. <strong style={{ color: "#E56B0A" }}>TSh 250/day</strong></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
            <a href="/#pricing" style={{ fontSize: "12px", fontWeight: 700, padding: "8px 18px", borderRadius: "9px", border: "none", background: "#E56B0A", color: "#fff", cursor: "pointer", textDecoration: "none" }}>Upgrade → Growth</a>
            <button onClick={() => { localStorage.setItem("pesa_upgrade_dismissed", "true"); setUpgradeDismissed(true); }} style={{ fontSize: "18px", background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", lineHeight: 1 }}>×</button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border pd-card pd-chart-enter pd-d1">
          <h3 className="text-base md:text-lg font-semibold mb-4">Weekly Sales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="sales" fill="var(--primary)" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border pd-card pd-chart-enter pd-d2">
          <h3 className="text-base md:text-lg font-semibold mb-4">Payment Methods</h3>
          {paymentMethodData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              No payment data yet — complete a sale to see breakdown
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentMethodData} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90} paddingAngle={2}
                    dataKey="value" nameKey="name" isAnimationActive={false}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center mt-4">
                {paymentMethodData.map((method) => (
                  <div key={method.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                    <span className="text-xs md:text-sm text-muted-foreground">{method.name} ({method.value}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Transactions */}
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border pd-fade-up pd-d3">
          <h3 className="text-base md:text-lg font-semibold mb-4">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
              No transactions yet — go to POS to make your first sale
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-GB")} {transaction.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      transaction.paymentMethod === "Cash"
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : transaction.paymentMethod === "M-Pesa"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {transaction.paymentMethod}
                    </span>
                    <span className={`text-sm font-semibold ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {transaction.type === "income" ? "+" : "-"}TSh {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products + Low Stock */}
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <h3 className="text-base md:text-lg font-semibold mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
              No sales data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">TSh {product.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold">Low Stock Alerts</h4>
              </div>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map(p => (
                  <div key={p.id} className={`rounded-lg p-3 ${p.stock < 5 ? "bg-red-50 dark:bg-red-900/10" : "bg-amber-50 dark:bg-amber-900/10"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <span className={`text-xs font-semibold ${p.stock < 5 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {p.stock < 5 ? "Critical" : "Low"}
                      </span>
                    </div>
                    <p className={`text-xs ${p.stock < 5 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                      Only <span className="font-semibold">{p.stock} {p.unit || "units"}</span> remaining
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <CreditScoreCard theme={theme} />
      </div>

      {/* TRA Compliance Section */}
      <div className="mb-4">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <span style={{ color: "#E56B0A" }}>📡</span> TRA Compliance Centre
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VATGuardian theme={theme} />
          <TRAComplianceCalendar theme={theme} />
        </div>
      </div>
    </div>
  );
}
