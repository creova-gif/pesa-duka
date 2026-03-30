import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect, useMemo } from "react";
import MorningBriefing from "../components/MorningBriefing";
import EndOfDayClose from "../components/EndOfDayClose";
import CreditScoreCard from "../components/CreditScoreCard";
import { useTransactions, useProducts } from "../hooks/useData";
import { getProfile } from "../hooks/useBusinessProfile";

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

  const { data: transactions = [], isLoading: loadingTransactions } = useTransactions();
  const { data: products = [], isLoading: loadingProducts } = useProducts();

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

  if (loadingTransactions || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
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
          <p className="text-xs md:text-sm text-muted-foreground">{liveDate}</p>
        </div>
      </div>

      {showMorningBriefing && (
        <div className="mb-6">
          <MorningBriefing
            data={morningBriefingData}
            onDismiss={() => setShowMorningBriefing(false)}
            onSetTarget={(target) => console.log("Target set:", target)}
            theme={theme}
          />
        </div>
      )}

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
          value={`TSh ${todayIncome.toLocaleString()}`}
          icon={DollarSign}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="Transactions"
          value={todayTransactionsList.length}
          icon={ShoppingCart}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Profit Margin"
          value={`${profitMargin}%`}
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Low Stock"
          value={`${lowStockProducts.length} item${lowStockProducts.length !== 1 ? "s" : ""}`}
          icon={AlertTriangle}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
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

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
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
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
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
    </div>
  );
}
