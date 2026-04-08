import { useState } from "react";
import { TrendingUp, TrendingDown, BookOpen, Hash, Plus, ChevronDown, ArrowUpRight, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TransactionSkeleton } from "../components/SkeletonLoader";
import { useTransactions, useCreateTransaction } from "../hooks/useData";
import { toast } from "sonner";

export function Cashbook() {
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paymentMethod: "Cash",
  });

  // Fetch transactions from backend
  const { data: transactions = [], isLoading, isError } = useTransactions();
  const createTransaction = useCreateTransaction();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter(t => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('en-GB');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  const handleAddExpense = () => {
    const parsedAmount = parseFloat(expenseForm.amount);
    if (!expenseForm.description || !expenseForm.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(!expenseForm.description ? "Please enter a description" : "Please enter a valid amount greater than 0");
      return;
    }

    const now = new Date();
    createTransaction.mutate(
      {
        type: 'expense',
        description: expenseForm.description,
        amount: parsedAmount,
        paymentMethod: expenseForm.paymentMethod,
        date: now.toISOString(),
        time: now.toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        onSuccess: () => {
          toast.success("Expense added successfully");
          setShowAddExpense(false);
          setExpenseForm({ description: "", amount: "", paymentMethod: "Cash" });
        },
        onError: (error) => {
          toast.error(`Failed to add expense: ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 pd-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="pd-skeleton" style={{ width: "120px", height: "28px", borderRadius: "8px" }} />
          <div className="pd-skeleton" style={{ width: "140px", height: "36px", borderRadius: "10px" }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">{[0,1,2,3].map(i => <div key={i} className="bg-card rounded-xl p-4 md:p-6 border border-border"><div className="flex justify-between mb-3"><div><div className="pd-skeleton mb-2" style={{ width: "80px", height: "12px" }} /><div className="pd-skeleton" style={{ width: "110px", height: "22px" }} /></div><div className="pd-skeleton" style={{ width: "44px", height: "44px", borderRadius: "10px" }} /></div></div>)}</div>
        <div className="bg-card rounded-xl border border-border p-4 md:p-6 mb-6"><div className="pd-skeleton mb-4" style={{ width: "200px", height: "36px", borderRadius: "10px" }} /></div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <TransactionSkeleton rows={7} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold mb-1">Failed to load transactions</h2>
          <p className="text-sm text-muted-foreground mb-4">Check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Cashbook</h1>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white text-sm md:text-base"
          onClick={() => setShowAddExpense(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Income</p>
              <p className="text-lg md:text-xl font-semibold text-green-600 dark:text-green-400">TSh {totalIncome.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border pd-stat-card pd-fade-up pd-d1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-lg md:text-xl font-semibold text-red-600 dark:text-red-400">TSh {totalExpenses.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border pd-stat-card pd-fade-up pd-d2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Net Balance</p>
              <p className={`text-lg md:text-xl font-semibold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {netBalance >= 0 ? '' : '-'}TSh {Math.abs(netBalance).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border pd-stat-card pd-fade-up pd-d3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Entries</p>
              <p className="text-lg md:text-xl font-semibold">{transactions.length}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Hash className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg p-4 md:p-6 border border-border mb-6">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("income")}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              filterType === "income"
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType("expense")}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              filterType === "expense"
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            Expense
          </button>
          <button className="ml-auto flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent text-xs md:text-sm">
            All methods
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {transactions.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 24px", background: "hsl(var(--card))", borderRadius: "14px", border: "1px solid hsl(var(--border))" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📒</div>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>Your cashbook is empty</div>
            <div style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
              Record every sale, expense, and payment in one place.
            </div>
            <div style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", marginBottom: "20px" }}>
              Sales from POS appear here automatically. Add expenses manually using the button above.
            </div>
            <button
              onClick={() => setShowAddExpense(true)}
              style={{ fontSize: "13px", fontWeight: 700, padding: "10px 24px", borderRadius: "10px", border: "none", background: "hsl(var(--primary))", color: "#fff", cursor: "pointer" }}
            >
              + Record First Entry
            </button>
          </div>
        )}
        {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
          <div key={date}>
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-3">
              {new Date(dayTransactions[0].date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </h3>
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {dayTransactions.map((transaction, i) => (
                <div key={transaction.id} className="p-3 md:p-4 flex items-center gap-3 md:gap-4 pd-tr pd-fade-up" style={{ animationDelay: `${i * 35}ms` }}>
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    <ArrowUpRight className={`w-4 h-4 md:w-5 md:h-5 ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400 rotate-90'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium truncate">{transaction.description}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{transaction.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-2 md:px-3 py-1 rounded ${
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
                    <span
                      className={`text-sm md:text-base font-semibold ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}TSh {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Expense Form */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 md:p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Expense</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowAddExpense(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  type="text"
                  placeholder="e.g., Rent, Electricity, Salaries"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (TSh)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <select
                  className="w-full bg-background rounded-lg border border-border px-3 py-2 text-sm"
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Tigo Pesa">Tigo Pesa</option>
                  <option value="Airtel Money">Airtel Money</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddExpense(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white flex-1"
                onClick={handleAddExpense}
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}