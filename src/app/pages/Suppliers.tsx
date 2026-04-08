import { Search, Phone, MapPin, Package, CirclePlus, X, Truck, Building2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useSuppliers, useCreateSupplier } from "../hooks/useData";
import { toast } from "sonner";

const EMPTY_SUPPLIER = { name: "", phone: "", address: "" };

const AVATAR_COLORS = [
  { bg: "from-orange-500 to-amber-500", text: "text-white" },
  { bg: "from-blue-500 to-cyan-500", text: "text-white" },
  { bg: "from-violet-500 to-purple-500", text: "text-white" },
  { bg: "from-green-500 to-emerald-500", text: "text-white" },
  { bg: "from-rose-500 to-pink-500", text: "text-white" },
  { bg: "from-amber-500 to-yellow-500", text: "text-white" },
  { bg: "from-teal-500 to-cyan-500", text: "text-white" },
  { bg: "from-indigo-500 to-blue-500", text: "text-white" },
];

const NET_BADGE: Record<number | string, { label: string; style: string }> = {
  0:   { label: "COD",    style: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  7:   { label: "Net 7",  style: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  14:  { label: "Net 14", style: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  30:  { label: "Net 30", style: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  60:  { label: "Net 60", style: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function getNetBadge(net: number | string) {
  const val = Number(net);
  return NET_BADGE[val] || { label: String(net) || "COD", style: "bg-muted text-muted-foreground" };
}

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER);

  const { data: suppliers = [], isLoading, isError } = useSuppliers();
  const createSupplier = useCreateSupplier();

  const handleAddSupplier = () => {
    if (!supplierForm.name.trim()) { toast.error("Supplier name is required"); return; }
    if (!supplierForm.phone.trim()) { toast.error("Phone number is required"); return; }
    createSupplier.mutate(
      { name: supplierForm.name.trim(), phone: supplierForm.phone.trim(), address: supplierForm.address.trim() || "—", products: 0, net: 0 },
      {
        onSuccess: () => {
          toast.success(`${supplierForm.name} added!`);
          setShowAddSupplier(false);
          setSupplierForm(EMPTY_SUPPLIER);
        },
        onError: (err: any) => toast.error(`Failed: ${err?.message || "Unknown error"}`),
      }
    );
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.address || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = suppliers.reduce((s, sup) => s + (sup.products || 0), 0);

  if (isLoading) return (
    <div className="p-4 md:p-8 pd-fade-in">
      <div className="flex justify-between mb-6">
        <div className="pd-skeleton" style={{ width: "110px", height: "28px", borderRadius: "8px" }} />
        <div className="pd-skeleton" style={{ width: "130px", height: "36px", borderRadius: "10px" }} />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">{[0,1,2].map(i => <div key={i} className="bg-card rounded-2xl p-4 border border-border"><div className="pd-skeleton mb-2" style={{ width: "70px", height: "11px" }} /><div className="pd-skeleton" style={{ width: "60px", height: "24px" }} /></div>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0,1,2,3].map(i => <div key={i} className="bg-card rounded-2xl border border-border p-5" style={{ height: "140px" }}><div className="pd-skeleton mb-3" style={{ width: "150px", height: "16px" }} /><div className="pd-skeleton mb-2" style={{ width: "120px", height: "12px" }} /><div className="pd-skeleton" style={{ width: "100px", height: "12px" }} /></div>)}</div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center"><div className="text-5xl mb-4">⚠️</div><h2 className="text-lg font-bold mb-2">Failed to load suppliers</h2><button onClick={() => window.location.reload()} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">Retry</button></div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 xl:p-8 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pd-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{suppliers.length} suppliers · {totalProducts} products tracked</p>
        </div>
        <button
          onClick={() => setShowAddSupplier(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors pd-btn shadow-sm"
        >
          <CirclePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Supplier</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 pd-fade-up pd-d1">
        {[
          { label: "Total Suppliers", value: suppliers.length, icon: Building2, accent: "#3B82F6", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600" },
          { label: "Products Tracked", value: totalProducts, icon: Package, accent: "#E56B0A", bg: "bg-primary/10", color: "text-primary" },
          { label: "Avg Products", value: suppliers.length > 0 ? Math.round(totalProducts / suppliers.length) : 0, icon: Truck, accent: "#22C55E", bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600" },
        ].map(({ label, value, icon: Icon, accent, bg, color }) => (
          <div key={label} className="bg-card rounded-2xl p-4 border border-border pd-stat-card pd-fade-up" style={{ borderLeft: `3px solid ${accent}` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">{label}</p>
                <p className={`text-xl font-bold pd-number ${color}`}>{value}</p>
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
          placeholder="Search by name or location…"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-primary transition-colors"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Supplier Cards */}
      {filteredSuppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border pd-fade-up pd-d3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-bold text-base mb-1">{suppliers.length === 0 ? "No suppliers yet" : "No matches found"}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs mb-5">
            {suppliers.length === 0
              ? "Add your suppliers to track products, payment terms, and order history."
              : "Try a different name or location."}
          </p>
          {suppliers.length === 0 && (
            <button onClick={() => setShowAddSupplier(true)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
              + Add First Supplier
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pd-fade-up pd-d3">
          {filteredSuppliers.map((supplier, i) => {
            const avatar = getAvatarColor(supplier.name);
            const initials = getInitials(supplier.name);
            const netBadge = getNetBadge(supplier.net);
            return (
              <div
                key={supplier.id}
                className="bg-card rounded-2xl border border-border pd-card pd-card-clickable overflow-hidden pd-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Top section */}
                <div className="p-5 pb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className={`font-black text-base ${avatar.text}`}>{initials}</span>
                    </div>

                    {/* Name + badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-base leading-tight truncate">{supplier.name}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${netBadge.style}`}>
                          {netBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{supplier.products || 0} products supplied</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mx-5" />

                {/* Contact row */}
                <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate font-medium">{supplier.phone}</span>
                    </div>
                    {supplier.address && supplier.address !== "—" && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick action buttons */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <a
                      href={`tel:${supplier.phone}`}
                      className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 transition-colors"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-green-600" />
                    </a>
                    <button
                      className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                      title="View details"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 pd-modal-backdrop">
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm shadow-2xl pd-modal-content">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-base font-bold">Add New Supplier</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Track products, terms & contact</p>
              </div>
              <button onClick={() => { setShowAddSupplier(false); setSupplierForm(EMPTY_SUPPLIER); }} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Business Name *</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Kariakoo Wholesalers"
                  value={supplierForm.name}
                  onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Phone Number *</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. +255 712 111 222"
                  value={supplierForm.phone}
                  onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Address <span className="font-normal normal-case">(optional)</span></label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Lindi Street, Kariakoo"
                  value={supplierForm.address}
                  onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors" onClick={() => { setShowAddSupplier(false); setSupplierForm(EMPTY_SUPPLIER); }}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors" onClick={handleAddSupplier} disabled={createSupplier.isPending}>
                {createSupplier.isPending ? "Saving…" : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
