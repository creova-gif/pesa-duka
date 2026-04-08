import { useState, useMemo } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, FileText, BarChart3, Receipt } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import WeeklyAIDigest from "../components/WeeklyAIDigest";
import { TaxTracker } from "../components/TaxTracker";
import { useTransactions, useProducts, useCustomers } from "../hooks/useData";
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
import { toast } from "sonner";

const PAYMENT_COLORS: Record<string, string> = {
  Cash: '#6B7280',
  'M-Pesa': '#22C55E',
  Credit: '#EF4444',
  'Airtel Money': '#3B82F6',
  'Tigo Pesa': '#F59E0B',
  HaloPesa: '#A855F7',
  Other: '#64748B',
};

function fmt(n: number) {
  return 'TSh ' + Math.round(n).toLocaleString('en-TZ');
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function Reports() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [fromDate, setFromDate] = useState(sevenDaysAgo.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);

  const { data: transactions = [], isLoading } = useTransactions();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();

  const setRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setFromDate(start.toISOString().split('T')[0]);
    setToDate(end.toISOString().split('T')[0]);
  };

  const filteredTxns = useMemo(() => {
    const from = new Date(fromDate + 'T00:00:00');
    const to = new Date(toDate + 'T23:59:59');
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= from && d <= to;
    });
  }, [transactions, fromDate, toDate]);

  const totalRevenue = useMemo(() =>
    filteredTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [filteredTxns]);

  const totalExpenses = useMemo(() =>
    filteredTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filteredTxns]);

  const netProfit = totalRevenue - totalExpenses;
  const totalTransactions = filteredTxns.filter(t => t.type === 'income').length;

  const dailyData = useMemo(() => {
    const from = new Date(fromDate + 'T00:00:00');
    const to = new Date(toDate + 'T23:59:59');
    const days: Record<string, { date: string; revenue: number; expenses: number }> = {};

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      days[key] = { date: dayLabel(key), revenue: 0, expenses: 0 };
    }

    filteredTxns.forEach(t => {
      const key = new Date(t.date).toISOString().split('T')[0];
      if (days[key]) {
        if (t.type === 'income') days[key].revenue += t.amount;
        else days[key].expenses += t.amount;
      }
    });

    return Object.values(days);
  }, [filteredTxns, fromDate, toDate]);

  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTxns.filter(t => t.type === 'income').forEach(t => {
      const method = t.paymentMethod || 'Other';
      counts[method] = (counts[method] || 0) + t.amount;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value: Math.round(value), color: PAYMENT_COLORS[name] || '#64748B' }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTxns]);

  const expenseBreakdown = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredTxns.filter(t => t.type === 'expense').forEach(t => {
      const desc = (t.description || 'Other').toLowerCase();
      const category =
        desc.includes('rent') ? 'Rent' :
        desc.includes('electric') || desc.includes('water') || desc.includes('util') ? 'Utilities' :
        desc.includes('transport') || desc.includes('fuel') || desc.includes('fare') ? 'Transport' :
        desc.includes('salary') || desc.includes('wage') || desc.includes('staff') ? 'Salaries' :
        desc.includes('stock') || desc.includes('supply') || desc.includes('goods') ? 'Supplies' : 'Other';
      groups[category] = (groups[category] || 0) + t.amount;
    });
    const colors: Record<string, string> = {
      Rent: '#6B7280', Utilities: '#22C55E', Transport: '#EF4444',
      Salaries: '#F59E0B', Supplies: '#3B82F6', Other: '#8B5CF6',
    };
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value: Math.round(value), color: colors[name] || '#64748B' }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTxns]);

  const handleExport = () => {
    if (filteredTxns.length === 0) { toast.error("No transactions in this date range to export"); return; }
    const rows = [
      ['Date', 'Type', 'Description', 'Amount (TSh)', 'Payment Method'],
      ...filteredTxns.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        t.type,
        t.description,
        t.amount,
        t.paymentMethod || '',
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesa-duka-report-${fromDate}-to-${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported to CSV');
  };

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filteredTxns.length} transactions in range</p>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700">
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">● LIVE DATA</span>
          </div>
          <Button className="bg-card border border-border hover:bg-accent" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-card rounded-lg p-4 md:p-6 border border-border mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">From</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-background w-40" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">To</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-background w-40" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRange(1)} className="px-4 py-2 rounded-lg bg-muted hover:bg-accent text-sm font-medium">Today</button>
            <button onClick={() => setRange(7)} className="px-4 py-2 rounded-lg bg-muted hover:bg-accent text-sm font-medium">7 Days</button>
            <button onClick={() => setRange(30)} className="px-4 py-2 rounded-lg bg-muted hover:bg-accent text-sm font-medium">This Month</button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-6">
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Revenue</p>
              <p className="text-lg md:text-xl font-semibold text-green-600 dark:text-green-400">{fmt(totalRevenue)}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-lg md:text-xl font-semibold text-red-600 dark:text-red-400">{fmt(totalExpenses)}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
              <p className={`text-lg md:text-xl font-semibold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {netProfit < 0 ? '-' : ''}{fmt(Math.abs(netProfit))}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <BarChart3 className={`w-4 h-4 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Transactions</p>
              <p className="text-lg md:text-xl font-semibold">{totalTransactions}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Customers</p>
              <p className="text-lg md:text-xl font-semibold">{customers.length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Revenue vs Expenses */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          {dailyData.length === 0 || (totalRevenue === 0 && totalExpenses === 0) ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">No transactions in this date range</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} name="Revenue" dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          {paymentData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">No income transactions in this range</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={2} dataKey="value" nameKey="name" isAnimationActive={false}>
                    {paymentData.map((entry, i) => <Cell key={`pay-${i}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {paymentData.map(m => (
                  <div key={m.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-sm text-muted-foreground">{m.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-1">Products in Stock</h3>
          <p className="text-xs text-muted-foreground mb-4">{products.length} products · top by inventory value</p>
          {products.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">No products found</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={products.slice(0, 8).map(p => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name, value: p.stock * p.cost }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={130} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, 'Stock Value']} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          {expenseBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">No expenses in this date range</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={2} dataKey="value" nameKey="name" isAnimationActive={false}>
                    {expenseBreakdown.map((entry, i) => <Cell key={`exp-${i}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {expenseBreakdown.map(e => (
                  <div key={e.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                    <span className="text-sm text-muted-foreground">{e.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
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
