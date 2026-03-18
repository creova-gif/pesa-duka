import { Search, Phone, MapPin, CirclePlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import DebtFollowUpQueue from "../components/DebtFollowUpQueue";
import { LoyaltySystem } from "../components/LoyaltySystem";
import { useCustomers } from "../hooks/useData";

export function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "debt" | "loyalty">("all");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Fetch customers from backend
  const { data: customers = [], isLoading } = useCustomers();

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

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const totalCustomers = customers.length;
  const outstandingCredit = customers.reduce((sum, c) => sum + c.owes, 0);
  const customersWithCredit = customers.filter(c => c.owes > 0).length;

  // Transform customers data for DebtFollowUpQueue
  const debtQueueCustomers = customers.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    debt: c.owes,
    lastPurchase: "2025-03-10",
    lastPayment: c.owes > 0 ? "2025-02-15" : "2025-03-10",
    totalSpend: c.purchases,
    paymentHistory: [1, 1, c.owes > 0 ? 0 : 1, 1, 1, c.owes > 50000 ? 0 : 1, 1, c.owes > 0 ? 0 : 1, 1, 1],
    creditLimit: Math.max(100000, c.purchases * 0.2),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Customers</h1>
        <Button className="bg-primary hover:bg-primary/90 text-white text-sm md:text-base">
          <CirclePlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "all"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          All Customers
        </button>
        <button
          onClick={() => setActiveTab("debt")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "debt"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          Debt Follow-Up
        </button>
        <button
          onClick={() => setActiveTab("loyalty")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "loyalty"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          Loyalty System
        </button>
      </div>

      {activeTab === "debt" ? (
        <DebtFollowUpQueue customers={debtQueueCustomers} theme={theme} />
      ) : activeTab === "loyalty" ? (
        <LoyaltySystem theme={theme} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
            <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Customers</p>
              <p className="text-lg md:text-2xl font-semibold">{totalCustomers}</p>
            </div>
            <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Outstanding Credit</p>
              <p className="text-lg md:text-2xl font-semibold text-red-600 dark:text-red-400">
                <span className="hidden md:inline">TSh </span>{outstandingCredit.toLocaleString()}
              </p>
            </div>
            <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">With Credit</p>
              <p className="text-lg md:text-2xl font-semibold">{customersWithCredit}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or phone..."
                className="pl-10 bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Customers List */}
          <div className="space-y-3 md:space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-card rounded-lg p-4 md:p-6 border border-border hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg mb-2 truncate">{customer.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                      <span className="hidden sm:inline">Purchases: TSh {customer.purchases.toLocaleString()}</span>
                    </div>
                    <div className="sm:hidden text-xs text-muted-foreground mt-1">
                      TSh {customer.purchases.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {customer.owes > 0 ? (
                      <div className="bg-red-100 dark:bg-red-900/30 px-3 md:px-4 py-2 rounded-lg">
                        <p className="text-xs text-red-700 dark:text-red-400 mb-1">Owes</p>
                        <p className="text-base md:text-lg font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                          TSh {customer.owes.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 px-3 md:px-4 py-2 rounded-lg">
                        <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">No debt</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}