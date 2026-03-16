import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { transactions, products } from "../data/mockData";
import { useState, useEffect } from "react";
import MorningBriefing from "../components/MorningBriefing";
import EndOfDayClose from "../components/EndOfDayClose";
import WeeklyAIDigest from "../components/WeeklyAIDigest";
import CreditScoreCard from "../components/CreditScoreCard";

const weeklyData = [
  { day: 'Sun', sales: 37000, id: 'week-sun' },
  { day: 'Mon', sales: 45000, id: 'week-mon' },
  { day: 'Tue', sales: 48000, id: 'week-tue' },
  { day: 'Wed', sales: 61000, id: 'week-wed' },
  { day: 'Thu', sales: 52000, id: 'week-thu' },
  { day: 'Fri', sales: 88000, id: 'week-fri' },
  { day: 'Sat', sales: 89000, id: 'week-sat' },
];

const paymentMethodData = [
  { name: 'Cash', value: 45, color: '#6B7280', id: 'dash-pay-cash' },
  { name: 'M-Pesa', value: 35, color: '#22C55E', id: 'dash-pay-mpesa' },
  { name: 'Credit', value: 8, color: '#EF4444', id: 'dash-pay-credit' },
  { name: 'Airtel Money', value: 7, color: '#3B82F6', id: 'dash-pay-airtel' },
  { name: 'Tigo Pesa', value: 5, color: '#F59E0B', id: 'dash-pay-tigo' },
];

export function Dashboard() {
  const [showMorningBriefing, setShowMorningBriefing] = useState(true);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
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

  const todayIncome = transactions
    .filter(t => t.type === 'income' && t.date.toDateString() === new Date('2026-03-14').toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  const todayTransactions = transactions.filter(
    t => t.date.toDateString() === new Date('2026-03-14').toDateString()
  ).length;

  const lowStockProducts = products.filter(p => p.stock < 20);

  const recentTransactions = transactions.slice(0, 6);

  const topProducts = [
    { name: 'Ndovu Cement 50kg', revenue: 66000 },
    { name: 'Vodacom Airtime 10000', revenue: 50000 },
    { name: 'Nishati Rice 5kg', revenue: 45000 },
    { name: 'Tigo Airtime Voucher 5000', revenue: 30000 },
    { name: 'Korie Cooking Oil 1L', revenue: 27500 },
  ];

  const morningBriefingData = {
    ownerName: "Amina",
    yesterdaySales: 320000,
    yesterdayTransactions: 48,
    topProduct: { name: "Ndovu Cement 50kg", units: 22 },
    overdueDebts: [
      { name: "Juma Ally", amount: 45000, days: 7 },
      { name: "Fatuma Salim", amount: 28000, days: 3 },
    ],
    lowStockItems: ["Ndovu Cement 50kg", "Nishati Rice 5kg"],
    weeklyAvgSales: 285000,
    suggestedTarget: 350000,
  };

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
              const now = new Date();
              const tzHour = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Dar_es_Salaam' })).getHours();
              if (tzHour >= 5 && tzHour < 12) return '🌅 Morning Briefing';
              if (tzHour >= 12 && tzHour < 17) return '☀️ Afternoon Check';
              if (tzHour >= 17 && tzHour < 21) return '🌆 Evening Review';
              return '🌙 End of Day';
            })()}
          </button>
          <p className="text-xs md:text-sm text-muted-foreground">Saturday, 14 March 2026</p>
        </div>
      </div>

      {/* Morning Briefing */}
      {showMorningBriefing && (
        <div className="mb-6">
          <MorningBriefing
            data={morningBriefingData}
            onDismiss={() => setShowMorningBriefing(false)}
            onSetTarget={(target) => console.log('Target set:', target)}
            theme={theme}
          />
        </div>
      )}

      {/* End of Day Modal */}
      {showEndOfDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <EndOfDayClose
            posTotal={todayIncome}
            lowStockItems={[
              { name: "Ndovu Cement 50kg", stock: 5, threshold: 20, supplier: "Dar Cement Suppliers" },
              { name: "Nishati Rice 5kg", stock: 15, threshold: 30, supplier: "Kariakoo Wholesalers" },
            ]}
            onComplete={(summary) => {
              console.log('Day closed:', summary);
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
          value={todayTransactions}
          icon={ShoppingCart}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Profit Margin"
          value="21.5%"
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Low Stock"
          value={`${lowStockProducts.length} Item`}
          icon={AlertTriangle}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Sales Chart */}
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border" key="dashboard-weekly-chart">
          <h3 className="text-base md:text-lg font-semibold mb-4">Weekly Sales</h3>
          <div key="weekly-sales-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart key="dashboard-weekly-bar-chart" data={weeklyData}>
                <CartesianGrid key="dashboard-weekly-grid" strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis key="dashboard-weekly-xaxis" dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis key="dashboard-weekly-yaxis" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip
                  key="dashboard-weekly-tooltip"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar key="dashboard-sales-bar" dataKey="sales" fill="var(--primary)" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border" key="dashboard-payment-chart">
          <h3 className="text-base md:text-lg font-semibold mb-4">Payment Methods</h3>
          <div key="payment-pie-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart key="dashboard-payment-pie-chart">
                <Pie
                  key="dashboard-payment-pie"
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`dash-cell-${entry.id}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  key="dashboard-payment-tooltip"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center mt-4">
            {paymentMethodData.map((method) => (
              <div key={method.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                <span className="text-xs md:text-sm text-muted-foreground">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Transactions */}
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <h3 className="text-base md:text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.date.toLocaleDateString('en-GB')} {transaction.time}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      transaction.paymentMethod === 'Cash'
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        : transaction.paymentMethod === 'M-Pesa'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : transaction.paymentMethod === 'Tigo Pesa'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {transaction.paymentMethod}
                  </span>
                  <span className={`text-sm font-semibold ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}TSh {transaction.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <h3 className="text-base md:text-lg font-semibold mb-4">Top Products</h3>
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

          {/* Low Stock Alert */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold">Low Stock Alerts</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Ndovu Cement 50kg</p>
                  <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Critical</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Only <span className="font-semibold">5 bags</span> remaining
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Nishati Rice 5kg</p>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Low</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Only <span className="font-semibold">15 bags</span> remaining
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Score Card */}
      <div className="mb-6">
        <CreditScoreCard theme={theme} />
      </div>
    </div>
  );
}