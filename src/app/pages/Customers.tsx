import { Search, Phone, MapPin, CirclePlus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import DebtFollowUpQueue from "../components/DebtFollowUpQueue";
import { LoyaltySystem } from "../components/LoyaltySystem";
import { CardListSkeleton } from "../components/SkeletonLoader";
import { useCustomers, useCreateCustomer } from "../hooks/useData";
import { toast } from "sonner";

const EMPTY_CUSTOMER = { name: "", phone: "", location: "" };

export function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "debt" | "loyalty">("all");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER);

  // Fetch customers from backend
  const { data: customers = [], isLoading, isError } = useCustomers();
  const createCustomer = useCreateCustomer();

  const handleAddCustomer = () => {
    if (!customerForm.name.trim()) { toast.error("Customer name is required"); return; }
    if (!customerForm.phone.trim()) { toast.error("Phone number is required"); return; }
    createCustomer.mutate(
      { name: customerForm.name.trim(), phone: customerForm.phone.trim(), purchases: 0, owes: 0 },
      {
        onSuccess: () => {
          toast.success(`${customerForm.name} added to customers`);
          setShowAddCustomer(false);
          setCustomerForm(EMPTY_CUSTOMER);
        },
        onError: (err: any) => {
          toast.error(`Failed to add customer: ${err?.message || "Unknown error"}`);
        },
      }
    );
  };

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
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="pd-skeleton" style={{ width: "130px", height: "28px", borderRadius: "8px" }} />
          <div className="pd-skeleton" style={{ width: "140px", height: "36px", borderRadius: "10px" }} />
        </div>
        <div className="flex gap-2 mb-6">{[0,1,2].map(i => <div key={i} className="pd-skeleton" style={{ width: "100px", height: "36px", borderRadius: "10px" }} />)}</div>
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">{[0,1,2].map(i => <div key={i} className="bg-card rounded-xl p-4 md:p-6 border border-border"><div className="pd-skeleton mb-2" style={{ width: "80px", height: "12px" }} /><div className="pd-skeleton" style={{ width: "100px", height: "26px" }} /></div>)}</div>
        <CardListSkeleton rows={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold mb-1">Failed to load customers</h2>
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
        <h1 className="text-xl md:text-2xl font-semibold">Customers</h1>
        <Button className="bg-primary hover:bg-primary/90 text-white text-sm md:text-base" onClick={() => setShowAddCustomer(true)}>
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
            {filteredCustomers.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 24px", background: "hsl(var(--card))", borderRadius: "14px", border: "1px solid hsl(var(--border))" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
                <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>{customers.length === 0 ? "No customers yet" : "No customers match your search"}</div>
                <div style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", marginBottom: "16px" }}>
                  {customers.length === 0
                    ? "Add a customer to track their purchases, credit balance, and send debt reminders via WhatsApp automatically."
                    : "Try a different name or phone number."}
                </div>
                {customers.length === 0 && (
                  <button
                    onClick={() => setShowAddCustomer(true)}
                    style={{ fontSize: "13px", fontWeight: 700, padding: "10px 24px", borderRadius: "10px", border: "none", background: "hsl(var(--primary))", color: "#fff", cursor: "pointer" }}
                  >
                    + Add First Customer
                  </button>
                )}
              </div>
            )}
            {filteredCustomers.map((customer, i) => (
              <div
                key={customer.id}
                className="bg-card rounded-xl p-4 md:p-6 border border-border pd-card pd-card-clickable pd-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
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
      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold">Add New Customer</h2>
              <button onClick={() => { setShowAddCustomer(false); setCustomerForm(EMPTY_CUSTOMER); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Full Name *</label>
                <Input placeholder="e.g. Amina Hassan" value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Phone Number *</label>
                <Input placeholder="e.g. +255 712 345 678" value={customerForm.phone} onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Location (optional)</label>
                <Input placeholder="e.g. Kariakoo, Dar es Salaam" value={customerForm.location} onChange={e => setCustomerForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => { setShowAddCustomer(false); setCustomerForm(EMPTY_CUSTOMER); }}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleAddCustomer} disabled={createCustomer.isPending}>
                {createCustomer.isPending ? "Saving…" : "Add Customer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}