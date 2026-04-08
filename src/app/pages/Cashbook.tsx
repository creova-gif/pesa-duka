import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, BookOpen, Hash, Plus, ArrowUpRight, ArrowDownLeft, X, Wallet } from "lucide-react";
import { TransactionSkeleton } from "../components/SkeletonLoader";
import { useTransactions, useCreateTransaction } from "../hooks/useData";
import { useCountUp } from "../hooks/useCountUp";
import { toast } from "sonner";

const PAYMENT_METHOD_STYLES: Record<string, string> = {
  Cash:          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "M-Pesa":      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Tigo Pesa":   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Airtel Money":"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "HaloPesa":    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

type Filter = "all" | "income" | "expense";

export function Cashbook() {
  const [filterType, setFilterType] = useState<Filter>("all");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", paymentMethod: "Cash" });

  const { data: transactions = [], isLoading, isError } = useTransactions();
  const createTransaction = useCreateTransaction();

  const totalIncome  = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);
  const netBalance = totalIncome - totalExpenses;
  const incomeRatio = totalIncome + totalExpenses > 0 ? (totalIncome / (totalIncome + totalExpenses)) * 100 : 50;

  const animatedBalance = useCountUp(Math.abs(netBalance), 800, 100);
  const animatedIncome  = useCountUp(totalIncome,  700, 0);
  const animatedExpense = useCountUp(totalExpenses, 700, 60);

  const filteredTransactions = useMemo(() =>
    transactions.filter(t => filterType === "all" || t.type === filterType),
    [transactions, filterType]
  );

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((groups, t) => {
      const date = new Date(t.date).toLocaleDateString('en-GB');
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
      return groups;
    }, {} as Record<string, typeof transactions>);
  }, [filteredTransactions]);

  const handleAddExpense = () => {
    const parsedAmount = parseFloat(expenseForm.amount);
    if (!expenseForm.description) { toast.error("Enter a description"); return; }
    if (!expenseForm.amount || isNaN(parsedAmount) || parsedAmount <= 0) { toast.error("Enter a valid amount"); return; }
    const now = new Date();
    createTransaction.mutate(
      { type: 'expense', description: expenseForm.description, amount: parsedAmount, paymentMethod: expenseForm.paymentMethod, date: now.toISOString(), time: now.toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' }) },
      {
        onSuccess: () => { toast.success("Expense recorded"); setShowAddExpense(false); setExpenseForm({ description: "", amount: "", paymentMethod: "Cash" }); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
      }
    );
  };

  if (isLoading) return (
    <div className="p-4 md:p-8 pd-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="pd-skeleton" style={{ width: "120px", height: "28px", borderRadius: "8px" }} />
        <div className="pd-skeleton" style={{ width: "140px", height: "36px", borderRadius: "10px" }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{[0,1,2,3].map(i => <div key={i} className="bg-card rounded-2xl p-5 border border-border"><div className="pd-skeleton mb-2" style={{ width: "80px", height: "11px" }} /><div className="pd-skeleton" style={{ width: "110px", height: "26px" }} /></div>)}</div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden"><TransactionSkeleton rows={8} /></div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center"><div className="text-5xl mb-4">⚠️</div><h2 className="text-lg font-bold mb-2">Failed to load transactions</h2><button onClick={() => window.location.reload()} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">Retry</button></div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 xl:p-8 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pd-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cashbook</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{transactions.length} entries recorded</p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors pd-btn shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Hero Balance Card */}
      <div className="rounded-2xl p-5 md:p-6 mb-4 pd-fade-up pd-d0 overflow-hidden relative" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)", border: "1px solid hsl(var(--border))" }}>
        <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(ellipse at top left, #E56B0A 0%, transparent 60%)" }} />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Balance</p>
        <p className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {netBalance < 0 ? "-" : ""}TSh {animatedBalance.toLocaleString()}
        </p>
        {/* Income / Expense ratio bar */}
        <div className="h-2 rounded-full bg-red-200 dark:bg-red-900/40 overflow-hidden mb-3">
          <div className="h-full rounded-full bg-green-500 pd-progress-bar transition-all duration-700" style={{ width: `${incomeRatio}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-green-600 dark:text-green-400">↑ Income {Math.round(incomeRatio)}%</span>
          <span className="text-red-500">↓ Expenses {Math.round(100 - incomeRatio)}%</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Income",   value: `TSh ${animatedIncome.toLocaleString()}`,  icon: TrendingUp,   bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400", accent: "#22C55E", delay: 0 },
          { label: "Total Expenses", value: `TSh ${animatedExpense.toLocaleString()}`, icon: TrendingDown,  bg: "bg-red-100 dark:bg-red-900/30",   color: "text-red-600 dark:text-red-400",   accent: "#EF4444", delay: 50 },
          { label: "Net Balance",    value: `${netBalance < 0 ? "-" : ""}TSh ${Math.abs(netBalance).toLocaleString()}`, icon: BookOpen, bg: "bg-primary/10", color: "text-primary", accent: "#E56B0A", delay: 100 },
          { label: "Entries",        value: String(transactions.length),                icon: Hash,          bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600",                    accent: "#3B82F6", delay: 150 },
        ].map(({ label, value, icon: Icon, bg, color, accent, delay }) => (
          <div key={label} className="bg-card rounded-2xl p-4 border border-border pd-stat-card pd-fade-up" style={{ borderLeft: `3px solid ${accent}`, animationDelay: `${delay}ms` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">{label}</p>
                <p className={`text-sm md:text-base font-bold pd-number truncate ${color}`}>{value}</p>
              </div>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-5 pd-fade-up pd-d2">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {(["all", "income", "expense"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterType === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "income" ? "↑ Income" : "↓ Expenses"}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{filteredTransactions.length} entries</span>
      </div>

      {/* Transactions */}
      <div className="space-y-5">
        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-bold text-base mb-1">Cashbook is empty</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">POS sales appear here automatically. Add expenses manually to track everything.</p>
            <button onClick={() => setShowAddExpense(true)} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">+ Record First Entry</button>
          </div>
        )}

        {Object.entries(groupedTransactions).map(([date, dayTxns]) => {
          const dayIncome  = dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const dayExpense = dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          return (
            <div key={date}>
              {/* Day header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {new Date(dayTxns[0].date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  {dayIncome > 0 && <span className="text-green-600 dark:text-green-400">+TSh {dayIncome.toLocaleString()}</span>}
                  {dayExpense > 0 && <span className="text-red-500">-TSh {dayExpense.toLocaleString()}</span>}
                </div>
              </div>

              {/* Transaction rows */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                {dayTxns.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-3 p-3.5 pd-tr pd-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {t.type === 'income'
                        ? <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                        : <ArrowDownLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                      }
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.description}</p>
                      <p className="text-[11px] text-muted-foreground">{t.time}</p>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PAYMENT_METHOD_STYLES[t.paymentMethod || 'Cash'] || 'bg-gray-100 text-gray-700'}`}>
                        {t.paymentMethod}
                      </span>
                      <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}TSh {t.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pd-modal-backdrop">
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm shadow-2xl pd-modal-content">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-base font-bold">Record Expense</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Appears in cashbook immediately</p>
              </div>
              <button onClick={() => setShowAddExpense(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
                <input className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Rent, Electricity, Salaries" value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Amount (TSh)</label>
                <input type="number" className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" placeholder="0" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Payment Method</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors" value={expenseForm.paymentMethod} onChange={e => setExpenseForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Tigo Pesa">Tigo Pesa</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="HaloPesa">HaloPesa</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors" onClick={() => setShowAddExpense(false)}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors" onClick={handleAddExpense} disabled={createTransaction.isPending}>
                {createTransaction.isPending ? "Saving…" : "Record Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
