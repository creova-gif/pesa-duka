import { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, FileText, BarChart3, Receipt } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import WeeklyAIDigest from "../components/WeeklyAIDigest";
import { TaxTracker } from "../components/TaxTracker";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const revenueExpensesData = [
  { date: '8 Mar', revenue: 45000, expenses: 380000, id: 'rev-mar-8' },
  { date: '9 Mar', revenue: 68000, expenses: 42000, id: 'rev-mar-9' },
  { date: '10 Mar', revenue: 72000, expenses: 95000, id: 'rev-mar-10' },
  { date: '11 Mar', revenue: 65000, expenses: 88000, id: 'rev-mar-11' },
  { date: '12 Mar', revenue: 78000, expenses: 105000, id: 'rev-mar-12' },
  { date: '13 Mar', revenue: 92000, expenses: 68000, id: 'rev-mar-13' },
  { date: '14 Mar', revenue: 89500, expenses: 50000, id: 'rev-mar-14' },
];

const topProductsData = [
  { name: 'Ndovu Cement 50kg', value: 100, id: 'top-ndovu' },
  { name: 'Vodacom Airtime 10000', value: 85, id: 'top-vodacom' },
  { name: 'Nishati Rice 5kg', value: 70, id: 'top-nishati' },
  { name: 'Tigo Airtime Voucher 5000', value: 60, id: 'top-tigo' },
  { name: 'Korie Cooking Oil 1L', value: 55, id: 'top-korie' },
  { name: 'Serengeti Premium Lager', value: 50, id: 'top-serengeti' },
  { name: 'Kasuku Exercise Book A4', value: 45, id: 'top-kasuku' },
  { name: 'Kilimanjaro Water 1.5L', value: 40, id: 'top-kilimanjaro' },
];

const paymentMethodData = [
  { name: 'Cash', value: 45, color: '#6B7280', id: 'pay-cash' },
  { name: 'M-Pesa', value: 35, color: '#22C55E', id: 'pay-mpesa' },
  { name: 'Credit', value: 8, color: '#EF4444', id: 'pay-credit' },
  { name: 'Airtel', value: 7, color: '#3B82F6', id: 'pay-airtel' },
  { name: 'Tigo Pesa', value: 5, color: '#F59E0B', id: 'pay-tigo' },
];

const expenseBreakdownData = [
  { name: 'Rent', value: 30, color: '#6B7280', id: 'exp-rent' },
  { name: 'Utilities', value: 15, color: '#22C55E', id: 'exp-utilities' },
  { name: 'Transport', value: 10, color: '#EF4444', id: 'exp-transport' },
  { name: 'Supplies', value: 8, color: '#3B82F6', id: 'exp-supplies' },
  { name: 'Salaries', value: 12, color: '#F59E0B', id: 'exp-salaries' },
  { name: 'Other', value: 25, color: '#8B5CF6', id: 'exp-other' },
];

export function Reports() {
  const [fromDate, setFromDate] = useState('2026-03-07');
  const [toDate, setToDate] = useState('2026-03-14');

  const handleExport = () => {
    alert('Exporting reports to CSV...\n\nNote: Full export functionality with PDF and Excel formats is available in Pro tier (TZS 30,000/month)');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Free Tier (Basic Reports)</span>
          </div>
          <Button className="bg-card border border-border hover:bg-accent" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-card rounded-lg p-6 border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">From</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">To</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex gap-2 ml-4">
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-accent text-sm">Today</button>
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-accent text-sm">7 Days</button>
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-accent text-sm">This Month</button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Revenue</p>
              <p className="text-xl font-semibold">TSh 415,600</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">COGS</p>
              <p className="text-xl font-semibold">TSh 326,100</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gross Profit</p>
              <p className="text-xl font-semibold">TSh 89,500</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-xl font-semibold">TSh 736,000</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
              <p className="text-xl font-semibold text-red-600">-TSh 646,500</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Revenue vs Expenses */}
        <div className="bg-card rounded-lg p-6 border border-border" key="reports-revenue-chart">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          <div key="revenue-line-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart key="reports-revenue-line-chart" data={revenueExpensesData}>
                <CartesianGrid key="reports-revenue-grid" strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis key="reports-revenue-xaxis" dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis key="reports-revenue-yaxis" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  key="reports-revenue-tooltip"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend key="reports-revenue-legend" />
                <Line key="reports-revenue-line" type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} name="Revenue" isAnimationActive={false} />
                <Line key="reports-expenses-line" type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card rounded-lg p-6 border border-border" key="reports-payment-chart">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div key="payment-pie-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key="reports-payment-pie-chart">
                <Pie
                  key="reports-payment-pie"
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`rep-cell-${entry.id}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="reports-payment-tooltip" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {paymentMethodData.map((method) => (
              <div key={method.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                <span className="text-sm text-muted-foreground">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card rounded-lg p-6 border border-border" key="reports-products-chart">
          <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
          <div key="products-bar-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart key="reports-products-bar-chart" data={topProductsData} layout="vertical">
                <CartesianGrid key="reports-products-grid" strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis key="reports-products-xaxis" type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  key="reports-products-yaxis"
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  key="reports-products-tooltip"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar key="reports-products-bar" dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-card rounded-lg p-6 border border-border" key="reports-expense-chart">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <div key="expense-pie-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key="reports-expense-pie-chart">
                <Pie
                  key="reports-expense-pie"
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {expenseBreakdownData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="reports-expense-tooltip" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {expenseBreakdownData.map((expense) => (
              <div key={expense.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }} />
                <span className="text-sm text-muted-foreground">{expense.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly AI Digest */}
      <div className="bg-card rounded-lg p-6 border border-border mt-6">
        <WeeklyAIDigest />
      </div>

      {/* Tax Tracker */}
      <div className="bg-card rounded-lg p-6 border border-border mt-6">
        <TaxTracker />
      </div>
    </div>
  );
}