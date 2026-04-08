import { Search, Phone, MapPin, CirclePlus, X, Users, CreditCard, AlertTriangle, Star, TrendingUp, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import DebtFollowUpQueue from "../components/DebtFollowUpQueue";
import { LoyaltySystem } from "../components/LoyaltySystem";
import { CardListSkeleton } from "../components/SkeletonLoader";
import { useCustomers, useCreateCustomer } from "../hooks/useData";
import { toast } from "sonner";

const EMPTY_CUSTOMER = { name: "", phone: "", location: "" };

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

type TabId = "all" | "debt" | "loyalty";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "all", label: "All Customers", icon: Users },
  { id: "debt", label: "Debt Follow-Up", icon: AlertTriangle },
  { id: "loyalty", label: "Loyalty", icon: Star },
];

export function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER);

  const { data: customers = [], isLoading, isError } = useCustomers();
  const createCustomer = useCreateCustomer();

  const handleAddCustomer = () => {
    if (!customerForm.name.trim()) { toast.error("Customer name is required"); return; }
    if (!customerForm.phone.trim()) { toast.error("Phone number is required"); return; }
    createCustomer.mutate(
      { name: customerForm.name.trim(), phone: customerForm.phone.trim(), purchases: 0, owes: 0 },
      {
        onSuccess: () => {
          toast.success(`${customerForm.name} added!`);
          setShowAddCustomer(false);
          setCustomerForm(EMPTY_CUSTOMER);
        },
        onError: (err: any) => toast.error(`Failed: ${err?.message || "Unknown error"}`),
      }
    );
  };

  useEffect(() => {
    const checkTheme = () => setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  );

  const totalCustomers = customers.length;
  const outstandingCredit = customers.reduce((sum, c) => sum + c.owes, 0);
  const customersWithCredit = customers.filter(c => c.owes > 0).length;
  const topSpender = [...customers].sort((a, b) => b.purchases - a.purchases)[0];

  const debtQueueCustomers = customers.map(c => ({
    id: c.id, name: c.name, phone: c.phone, debt: c.owes,
    lastPurchase: "2025-03-10", lastPayment: c.owes > 0 ? "2025-02-15" : "2025-03-10",
    totalSpend: c.purchases,
    paymentHistory: [1, 1, c.owes > 0 ? 0 : 1, 1, 1, c.owes > 50000 ? 0 : 1, 1, c.owes > 0 ? 0 : 1, 1, 1],
    creditLimit: Math.max(100000, c.purchases * 0.2),
  }));

  if (isLoading) return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="pd-skeleton" style={{ width: "130px", height: "28px", borderRadius: "8px" }} />
        <div className="pd-skeleton" style={{ width: "140px", height: "36px", borderRadius: "10px" }} />
      </div>
      <div className="flex gap-2 mb-6">{[0,1,2].map(i => <div key={i} className="pd-skeleton" style={{ width: "120px", height: "40px", borderRadius: "12px" }} />)}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">{[0,1,2,3].map(i => <div key={i} className="bg-card rounded-2xl p-4 border border-border"><div className="pd-skeleton mb-2" style={{ width: "70px", height: "11px" }} /><div className="pd-skeleton" style={{ width: "90px", height: "24px" }} /></div>)}</div>
      <CardListSkeleton rows={5} />
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold mb-2">Failed to load customers</h2>
        <p className="text-sm text-muted-foreground mb-4">Check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 xl:p-8 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pd-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{totalCustomers} registered · {customersWithCredit} with active credit</p>
        </div>
        <button
          onClick={() => setShowAddCustomer(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors pd-btn"
        >
          <CirclePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 p-1 bg-muted rounded-2xl w-fit pd-fade-up pd-d1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === "debt" ? (
        <DebtFollowUpQueue customers={debtQueueCustomers} theme={theme} />
      ) : activeTab === "loyalty" ? (
        <LoyaltySystem theme={theme} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Customers", value: totalCustomers, icon: Users, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600", accent: "#3B82F6", delay: 0 },
              { label: "Outstanding Credit", value: `TSh ${outstandingCredit.toLocaleString()}`, icon: CreditCard, bg: "bg-red-100 dark:bg-red-900/30", color: "text-red-600", accent: "#EF4444", delay: 50 },
              { label: "With Debt", value: customersWithCredit, icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600", accent: "#F59E0B", delay: 100 },
              { label: "Top Spender", value: topSpender ? topSpender.name.split(" ")[0] : "—", icon: TrendingUp, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600", accent: "#22C55E", delay: 150 },
            ].map(({ label, value, icon: Icon, bg, color, accent, delay }) => (
              <div key={label} className="bg-card rounded-2xl p-4 border border-border pd-stat-card pd-fade-up" style={{ borderLeft: `3px solid ${accent}`, animationDelay: `${delay}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">{label}</p>
                    <p className="text-lg font-bold pd-number truncate">{value}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5 pd-fade-up pd-d2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone number…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Customer list */}
          <div className="space-y-3">
            {filteredCustomers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-border">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-bold text-base mb-1">{customers.length === 0 ? "No customers yet" : "No matches found"}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
                  {customers.length === 0
                    ? "Add your first customer to track purchases, credit, and send WhatsApp reminders."
                    : "Try a different name or phone number."}
                </p>
                {customers.length === 0 && (
                  <button onClick={() => setShowAddCustomer(true)} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">
                    + Add First Customer
                  </button>
                )}
              </div>
            )}

            {filteredCustomers.map((customer, i) => (
              <div
                key={customer.id}
                className="bg-card rounded-2xl border border-border pd-card pd-card-clickable pd-fade-up"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarColor(customer.name)}`}>
                    {getInitials(customer.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm truncate">{customer.name}</h3>
                      {customer === topSpender && customers.length > 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">⭐ Top</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        TSh {customer.purchases.toLocaleString()} spent
                      </span>
                    </div>
                  </div>

                  {/* Debt / Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {customer.owes > 0 ? (
                      <div className="text-right">
                        <div className="text-[10px] text-red-500 font-bold uppercase tracking-wide mb-0.5">Owes</div>
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">TSh {customer.owes.toLocaleString()}</div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Cleared</span>
                    )}
                    <button className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 transition-colors" title="Send WhatsApp">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 pd-modal-backdrop">
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm shadow-2xl pd-modal-content">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-base font-bold">Add New Customer</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Track purchases, credit & send reminders</p>
              </div>
              <button onClick={() => { setShowAddCustomer(false); setCustomerForm(EMPTY_CUSTOMER); }} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Full Name *</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Amina Hassan"
                  value={customerForm.name}
                  onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Phone Number *</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. +255 712 345 678"
                  value={customerForm.phone}
                  onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Location <span className="font-normal normal-case">(optional)</span></label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Kariakoo, Dar es Salaam"
                  value={customerForm.location}
                  onChange={e => setCustomerForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors" onClick={() => { setShowAddCustomer(false); setCustomerForm(EMPTY_CUSTOMER); }}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors" onClick={handleAddCustomer} disabled={createCustomer.isPending}>
                {createCustomer.isPending ? "Saving…" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
