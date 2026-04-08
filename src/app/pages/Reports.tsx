import { useState, useMemo } from 'react';
import {
  Download, TrendingUp, TrendingDown, ShoppingCart, Users,
  BarChart3, Receipt, Zap, ArrowUpRight, Target, Wallet,
} from 'lucide-react';
import WeeklyAIDigest from "../components/WeeklyAIDigest";
import { TaxTracker } from "../components/TaxTracker";
import { useTransactions, useProducts, useCustomers } from "../hooks/useData";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
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

const EXPENSE_COLORS: Record<string, string> = {
  Rent: '#6B7280', Utilities: '#22C55E', Transport: '#EF4444',
  Salaries: '#F59E0B', Supplies: '#3B82F6', Other: '#8B5CF6',
};

function fmt(n: number) {
  if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `TSh ${(n / 1_000).toFixed(0)}K`;
  return `TSh ${Math.round(n).toLocaleString('en-TZ')}`;
}

function fmtFull(n: number) {
  return 'TSh ' + Math.round(n).toLocaleString('en-TZ');
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  fontSize: '12px',
};

type QuickRange = 'today' | '7d' | '30d' | 'custom';

export function Reports() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [fromDate, setFromDate] = useState(sevenDaysAgo.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [activeRange, setActiveRange] = useState<QuickRange>('7d');

  const { data: transactions = [], isLoading } = useTransactions();
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();

  const setRange = (days: number, key: QuickRange) => {
    const end = new Date();
    const start = new Date();
    if (days === 1) {
      setFromDate(end.toISOString().split('T')[0]);
      setToDate(end.toISOString().split('T')[0]);
    } else {
      start.setDate(end.getDate() - (days - 1));
      setFromDate(start.toISOString().split('T')[0]);
      setToDate(end.toISOString().split('T')[0]);
    }
    setActiveRange(key);
  };

  const filteredTxns = useMemo(() => {
    const from = new Date(fromDate + 'T00:00:00');
    const to = new Date(toDate + 'T23:59:59');
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= from && d <= to;
    });
  }, [transactions, fromDate, toDate]);

  const incomeTxns = useMemo(() => filteredTxns.filter(t => t.type === 'income'), [filteredTxns]);
  const expenseTxns = useMemo(() => filteredTxns.filter(t => t.type === 'expense'), [filteredTxns]);

  const totalRevenue = useMemo(() => incomeTxns.reduce((s, t) => s + t.amount, 0), [incomeTxns]);
  const totalExpenses = useMemo(() => expenseTxns.reduce((s, t) => s + t.amount, 0), [expenseTxns]);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const avgTxnValue = incomeTxns.length > 0 ? Math.round(totalRevenue / incomeTxns.length) : 0;

  const dailyData = useMemo(() => {
    const from = new Date(fromDate + 'T00:00:00');
    const to = new Date(toDate + 'T23:59:59');
    const days: Record<string, { date: string; revenue: number; expenses: number; profit: number }> = {};
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      days[key] = { date: dayLabel(key), revenue: 0, expenses: 0, profit: 0 };
    }
    filteredTxns.forEach(t => {
      const key = new Date(t.date).toISOString().split('T')[0];
      if (days[key]) {
        if (t.type === 'income') { days[key].revenue += t.amount; days[key].profit += t.amount; }
        else { days[key].expenses += t.amount; days[key].profit -= t.amount; }
      }
    });
    return Object.values(days);
  }, [filteredTxns, fromDate, toDate]);

  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {};
    incomeTxns.forEach(t => {
      const method = t.paymentMethod || 'Other';
      counts[method] = (counts[method] || 0) + t.amount;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        pct: total > 0 ? Math.round((value / total) * 100) : 0,
        color: PAYMENT_COLORS[name] || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);
  }, [incomeTxns]);

  const topPaymentMethod = paymentData[0]?.name || '—';

  const expenseBreakdown = useMemo(() => {
    const groups: Record<string, number> = {};
    expenseTxns.forEach(t => {
      const desc = (t.description || 'Other').toLowerCase();
      const category =
        desc.includes('rent') ? 'Rent' :
        desc.includes('electric') || desc.includes('water') || desc.includes('util') ? 'Utilities' :
        desc.includes('transport') || desc.includes('fuel') || desc.includes('fare') ? 'Transport' :
        desc.includes('salary') || desc.includes('wage') || desc.includes('staff') ? 'Salaries' :
        desc.includes('stock') || desc.includes('supply') || desc.includes('goods') ? 'Supplies' : 'Other';
      groups[category] = (groups[category] || 0) + t.amount;
    });
    const total = Object.values(groups).reduce((a, b) => a + b, 0);
    return Object.entries(groups)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        pct: total > 0 ? Math.round((value / total) * 100) : 0,
        color: EXPENSE_COLORS[name] || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseTxns]);

  const topProducts = useMemo(() =>
    products
      .map(p => ({ name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name, value: p.stock * p.cost }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    [products]
  );

  const handleExport = () => {
    if (filteredTxns.length === 0) { toast.error("No transactions in this date range to export"); return; }
    const rows = [
      ['Date', 'Type', 'Description', 'Amount (TSh)', 'Payment Method'],
      ...filteredTxns.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        t.type, t.description, t.amount, t.paymentMethod || '',
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

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 pd-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div><div className="pd-skeleton mb-2" style={{ width: "100px", height: "28px", borderRadius: "8px" }} /><div className="pd-skeleton" style={{ width: "160px", height: "14px", borderRadius: "6px" }} /></div>
          <div className="pd-skeleton" style={{ width: "120px", height: "36px", borderRadius: "10px" }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">{[0,1,2,3,4].map(i => <div key={i} className="bg-card rounded-xl p-4 md:p-6 border border-border"><div className="pd-skeleton mb-2" style={{ width: "70px", height: "12px" }} /><div className="pd-skeleton" style={{ width: "100px", height: "24px" }} /></div>)}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">{[0,1].map(i => <div key={i} className="bg-card rounded-2xl border border-border" style={{ height: "380px" }}><div className="p-6"><div className="pd-skeleton mb-4" style={{ width: "140px", height: "20px" }} /></div></div>)}</div>
      </div>
    );
  }

  const rangeLabel = activeRange === 'today' ? 'Today' : activeRange === '7d' ? 'Last 7 days' : activeRange === '30d' ? 'Last 30 days' : `${fromDate} – ${toDate}`;

  return (
    <div className="p-4 md:p-6 xl:p-8 pb-16">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 pd-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredTxns.length} transactions · <span className="font-medium">{rangeLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 pd-live-dot" />
            <span className="text-xs font-bold text-green-700 dark:text-green-400">LIVE DATA</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-semibold hover:bg-accent transition-colors pd-btn"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── DATE FILTER ────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6 pd-fade-up pd-d1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick range pills */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-muted">
            {([['today', 'Today', 1], ['7d', '7 Days', 7], ['30d', '30 Days', 30]] as [QuickRange, string, number][]).map(([key, label, days]) => (
              <button
                key={key}
                onClick={() => setRange(days, key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeRange === key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground font-medium">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setActiveRange('custom'); }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground font-medium">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setActiveRange('custom'); }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI STATS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Revenue', value: fmt(totalRevenue), full: fmtFull(totalRevenue),
            icon: TrendingUp, iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600',
            accent: '#22C55E', delay: 0,
          },
          {
            label: 'Expenses', value: fmt(totalExpenses), full: fmtFull(totalExpenses),
            icon: TrendingDown, iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600',
            accent: '#EF4444', delay: 50,
          },
          {
            label: 'Net Profit', value: fmt(Math.abs(netProfit)), full: (netProfit < 0 ? '-' : '') + fmtFull(Math.abs(netProfit)),
            icon: BarChart3,
            iconBg: netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30',
            iconColor: netProfit >= 0 ? 'text-blue-600' : 'text-red-600',
            accent: netProfit >= 0 ? '#3B82F6' : '#EF4444', delay: 100,
          },
          {
            label: 'Transactions', value: String(incomeTxns.length), full: `${incomeTxns.length} sales`,
            icon: Receipt, iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600',
            accent: '#F59E0B', delay: 150,
          },
          {
            label: 'Customers', value: String(customers.length), full: `${customers.length} total`,
            icon: Users, iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600',
            accent: '#8B5CF6', delay: 200,
          },
        ].map(({ label, value, full, icon: Icon, iconBg, iconColor, accent, delay }) => (
          <div
            key={label}
            className="bg-card rounded-2xl p-4 border border-border pd-stat-card pd-fade-up group"
            style={{ borderLeft: `3px solid ${accent}`, animationDelay: `${delay}ms` }}
            title={full}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">{label}</p>
                <p className="text-lg md:text-xl font-bold pd-number leading-tight">{value}</p>
              </div>
              <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── INSIGHT STRIP ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6 pd-fade-up pd-d2">
        {[
          {
            icon: Target,
            label: 'Profit Margin',
            value: `${profitMargin}%`,
            sub: profitMargin >= 20 ? 'Healthy' : profitMargin >= 0 ? 'Tight' : 'Loss',
            color: profitMargin >= 20 ? 'text-green-600' : profitMargin >= 0 ? 'text-amber-600' : 'text-red-600',
            bg: profitMargin >= 20 ? 'bg-green-100 dark:bg-green-900/30' : profitMargin >= 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30',
          },
          {
            icon: Wallet,
            label: 'Avg Sale Value',
            value: avgTxnValue > 0 ? fmt(avgTxnValue) : '—',
            sub: `per transaction`,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
          },
          {
            icon: Zap,
            label: 'Top Payment',
            value: topPaymentMethod,
            sub: paymentData[0] ? `${paymentData[0].pct}% of sales` : 'No data',
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-4 pd-card flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
              <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1: Revenue trend + Payment methods ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Revenue vs Expenses — spans 3 cols */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-5 pd-card pd-chart-enter pd-d1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">Revenue vs Expenses</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily trend for selected period</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Expenses</span>
            </div>
          </div>
          {totalRevenue === 0 && totalExpenses === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <BarChart3 className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No transactions in this date range</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} axisLine={false} tickLine={false} width={38} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#colorExpenses)" name="Expenses" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Methods — spans 2 cols */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 pd-card pd-chart-enter pd-d2">
          <div className="mb-4">
            <h3 className="text-base font-bold">Payment Methods</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Share of income by method</p>
          </div>
          {paymentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground text-center">No income transactions in this range</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {/* Donut */}
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {paymentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              {/* Method bars */}
              <div className="space-y-2.5 mt-1">
                {paymentData.map(m => (
                  <div key={m.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                        {m.name}
                      </span>
                      <span className="text-muted-foreground">{m.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full pd-progress-bar"
                        style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CHARTS ROW 2: Products + Expenses ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Products in Stock */}
        <div className="bg-card rounded-2xl border border-border p-5 pd-card pd-chart-enter pd-d3">
          <div className="mb-4">
            <h3 className="text-base font-bold">Products in Stock</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{products.length} products · by inventory value</p>
          </div>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <ArrowUpRight className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No products found</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={120} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, 'Stock Value']} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                  {topProducts.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`hsl(var(--primary) / ${1 - i * 0.08})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-5 pd-card pd-chart-enter pd-d4">
          <div className="mb-4">
            <h3 className="text-base font-bold">Expense Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">By category for selected period</p>
          </div>
          {expenseBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <TrendingDown className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No expenses in this date range</p>
            </div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {expenseBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`TSh ${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2.5">
                {expenseBreakdown.map(e => (
                  <div key={e.name} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                    <span className="text-xs font-medium flex-1">{e.name}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${e.pct}%`, backgroundColor: e.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{fmt(e.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AI DIGEST + TRA ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 pd-fade-up pd-d4">
          <WeeklyAIDigest />
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 pd-fade-up pd-d5">
          <TaxTracker />
        </div>
      </div>
    </div>
  );
}
