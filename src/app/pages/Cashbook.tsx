import { useState } from "react";
import { TrendingUp, TrendingDown, BookOpen, Hash, Plus, ChevronDown, ArrowUpRight } from "lucide-react";
import { transactions } from "../data/mockData";
import { Button } from "../components/ui/button";

export function Cashbook() {
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

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
    const date = transaction.date.toLocaleDateString('en-GB');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Cashbook</h1>
        <Button className="bg-primary hover:bg-primary/90 text-white text-sm md:text-base">
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

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
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

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
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

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
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
        {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
          <div key={date}>
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-3">
              {new Date(dayTransactions[0].date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </h3>
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {dayTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
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
    </div>
  );
}