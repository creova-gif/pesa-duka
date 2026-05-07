import { useState, useMemo } from "react";
import { Search, Plus, Minus, Edit, CirclePlus, X, Package, DollarSign, AlertTriangle, TrendingUp, LayoutGrid, List } from "lucide-react";
import { categories } from "../data/mockData";
import { StockOrderModal } from "../components/StockOrderModal";
import { TableSkeleton } from "../components/SkeletonLoader";
import { useProducts, useUpdateStock, useCreateProduct } from "../hooks/useData";
import { useCountUp } from "../hooks/useCountUp";
import { toast } from "sonner";

const PRODUCT_CATEGORIES = ["Food", "Beverages", "Personal Care", "Household", "Electronics", "Stationery", "Other"];

const CATEGORY_EMOJI: Record<string, string> = {
  All: "🗂", Food: "🍞", Beverages: "🥤", "Personal Care": "🧴",
  Household: "🏠", Electronics: "⚡", Stationery: "📝",
  Airtime: "📱", Building: "🏗", Other: "📦",
};

const CATEGORY_COLOR: Record<string, string> = {
  Food: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Beverages: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Personal Care": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Household: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Electronics: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Stationery: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Airtime: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Building: "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const AVATAR_BG = [
  "bg-orange-500", "bg-blue-500", "bg-green-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-emerald-500",
];

const EMPTY_PRODUCT = { name: "", sku: "", category: "Food", cost: "", price: "", stock: "", unit: "unit" };

export function Inventory() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStockOrderModal, setShowStockOrderModal] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { data: products = [], isLoading, isError } = useProducts();
  const updateStock = useUpdateStock();
  const createProduct = useCreateProduct();

  const totalProducts   = products.length;
  const inventoryValue  = useMemo(() => products.reduce((s, p) => s + p.cost * p.stock, 0), [products]);
  const lowStockItems   = useMemo(() => products.filter(p => p.stock < 20).length, [products]);
  const avgMargin       = useMemo(() => {
    if (!products.length) return 0;
    const margins = products.filter(p => p.price > 0).map(p => ((p.price - p.cost) / p.price) * 100);
    return margins.length ? Math.round(margins.reduce((s, m) => s + m, 0) / margins.length) : 0;
  }, [products]);

  const animatedValue = useCountUp(inventoryValue, 800, 150);

  const handleAddProduct = () => {
    if (!productForm.name.trim()) { toast.error("Product name is required"); return; }
    if (!productForm.sku.trim()) { toast.error("SKU is required"); return; }
    const cost = parseFloat(productForm.cost), price = parseFloat(productForm.price), stock = parseInt(productForm.stock, 10);
    if (isNaN(cost) || cost < 0) { toast.error("Enter a valid cost"); return; }
    if (isNaN(price) || price < 0) { toast.error("Enter a valid price"); return; }
    if (isNaN(stock) || stock < 0) { toast.error("Enter a valid stock"); return; }
    createProduct.mutate({ ...productForm, cost, price, stock }, {
      onSuccess: () => { toast.success(`"${productForm.name}" added`); setShowAddProduct(false); setProductForm(EMPTY_PRODUCT); },
      onError: (err: any) => toast.error(`Failed: ${err?.message}`),
    });
  };

  const handleStockChange = (id: string, current: number, delta: number) => {
    const newStock = Math.max(0, current + delta);
    updateStock.mutate({ id, stock: newStock }, {
      onSuccess: () => toast.success(`Stock → ${newStock}`),
      onError: (err) => toast.error(`Failed: ${err.message}`),
    });
  };

  const filteredProducts = useMemo(() =>
    products.filter(p => {
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    }),
    [products, selectedCategory, searchQuery]
  );

  if (isLoading) return (
    <div className="p-4 md:p-8 pd-fade-in">
      <div className="flex justify-between mb-6">
        <div><div className="pd-skeleton mb-2" style={{ width: "120px", height: "28px", borderRadius: "8px" }} /><div className="pd-skeleton" style={{ width: "180px", height: "14px" }} /></div>
        <div className="flex gap-2"><div className="pd-skeleton" style={{ width: "120px", height: "36px", borderRadius: "10px" }} /><div className="pd-skeleton" style={{ width: "120px", height: "36px", borderRadius: "10px" }} /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">{[0,1,2,3].map(i => <div key={i} className="bg-card rounded-2xl p-4 border border-border"><div className="pd-skeleton mb-2" style={{ width: "70px", height: "11px" }} /><div className="pd-skeleton" style={{ width: "90px", height: "24px" }} /></div>)}</div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-border bg-muted/50">{[0,1,2,3,4,5].map(i => <th key={i} className="p-4"><div className="pd-skeleton" style={{ width: "60px", height: "12px" }} /></th>)}</tr></thead><TableSkeleton rows={8} /></table>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center"><div className="text-5xl mb-4">⚠️</div><h2 className="text-lg font-bold mb-2">Failed to load inventory</h2><button onClick={() => window.location.reload()} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">Retry</button></div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 xl:p-8 pb-16">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 pd-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5"><span className="font-bold text-primary">{products.length}</span> products · TSh {inventoryValue.toLocaleString()} value</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowStockOrderModal(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors pd-btn">
            📦 <span className="hidden sm:inline">Order Stock</span>
          </button>
          <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors pd-btn">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Products", value: totalProducts, icon: Package, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600", accent: "#3B82F6", delay: 0 },
          { label: "Inventory Value", value: `TSh ${animatedValue.toLocaleString()}`, icon: DollarSign, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600", accent: "#22C55E", delay: 50 },
          { label: "Low Stock Items", value: lowStockItems, icon: AlertTriangle, bg: "bg-red-100 dark:bg-red-900/30", color: "text-red-600", accent: "#EF4444", delay: 100 },
          { label: "Avg Margin", value: `${avgMargin}%`, icon: TrendingUp, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600", accent: "#F59E0B", delay: 150 },
        ].map(({ label, value, icon: Icon, bg, color, accent, delay }) => (
          <div key={label} className="bg-card rounded-2xl p-4 border border-border pd-stat-card pd-fade-up" style={{ borderLeft: `3px solid ${accent}`, animationDelay: `${delay}ms` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">{label}</p>
                <p className={`text-lg font-bold pd-number truncate ${color}`}>{value}</p>
              </div>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Category Filter + View Toggle */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-5 pd-fade-up pd-d2">
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products or SKU…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat ? "bg-primary text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"}`}
              >
                {CATEGORY_EMOJI[cat] || "📦"} {cat}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl ml-auto flex-shrink-0">
            <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products - Table View */}
      {viewMode === "table" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden pd-fade-up pd-d3">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Product</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cost</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Price</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Margin</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stock</th>
                  <th className="px-4 py-3 hidden lg:table-cell" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-base mb-1">{products.length === 0 ? "No products yet" : "No matches found"}</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          {products.length === 0 ? "Add your first product to start tracking stock and get low-stock alerts." : "Try a different search or category."}
                        </p>
                      </div>
                      {products.length === 0 && (
                        <button onClick={() => setShowAddProduct(true)} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">+ Add First Product</button>
                      )}
                    </div>
                  </td></tr>
                )}
                {filteredProducts.map((product, i) => {
                  const margin = product.price > 0 ? Math.round(((product.price - product.cost) / product.price) * 100) : 0;
                  const isLow = product.stock < 20;
                  const isOut = product.stock === 0;
                  const avatarBg = AVATAR_BG[product.name.charCodeAt(0) % AVATAR_BG.length];
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-border last:border-0 pd-tr pd-fade-up transition-colors ${isOut ? "bg-red-50/50 dark:bg-red-900/5" : isLow ? "bg-amber-50/50 dark:bg-amber-900/5" : ""}`}
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${avatarBg} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{product.name[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${CATEGORY_COLOR[product.category] || "bg-muted text-muted-foreground"}`}>
                          {CATEGORY_EMOJI[product.category]} {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">TSh {product.cost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell">TSh {product.price.toLocaleString()}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs font-bold ${margin >= 20 ? "text-green-600" : margin >= 10 ? "text-amber-600" : "text-red-500"}`}>{margin}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleStockChange(product.id, product.stock, -1)} disabled={product.stock === 0} className="w-6 h-6 rounded-lg bg-muted hover:bg-accent flex items-center justify-center disabled:opacity-40 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="text-center min-w-[28px]">
                            <span className={`text-sm font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"}`}>{product.stock}</span>
                          </div>
                          <button onClick={() => handleStockChange(product.id, product.stock, 1)} className="w-6 h-6 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {isLow && !isOut && (
                          <div className="text-[9px] text-amber-600 font-bold mt-0.5 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />Low
                          </div>
                        )}
                        {isOut && (
                          <div className="text-[9px] text-red-600 font-bold mt-0.5">Out of stock</div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <button className="w-7 h-7 rounded-lg bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products - Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pd-fade-up pd-d3">
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-border gap-3">
              <Package className="w-10 h-10 text-muted-foreground/30" />
              <p className="font-bold">{products.length === 0 ? "No products yet" : "No matches"}</p>
              {products.length === 0 && <button onClick={() => setShowAddProduct(true)} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold">+ Add Product</button>}
            </div>
          )}
          {filteredProducts.map((product, i) => {
            const margin = product.price > 0 ? Math.round(((product.price - product.cost) / product.price) * 100) : 0;
            const isLow = product.stock < 20;
            const isOut = product.stock === 0;
            const avatarBg = AVATAR_BG[product.name.charCodeAt(0) % AVATAR_BG.length];
            return (
              <div
                key={product.id}
                className={`bg-card rounded-2xl border p-4 pd-card pd-fade-up ${isOut ? "border-red-300 dark:border-red-800" : isLow ? "border-amber-300 dark:border-amber-800" : "border-border"}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl ${avatarBg} flex items-center justify-center`}>
                    <span className="text-white font-black text-base">{product.name[0]}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLOR[product.category] || "bg-muted text-muted-foreground"}`}>{product.category}</span>
                </div>
                <p className="font-bold text-sm truncate mb-0.5">{product.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono mb-3">{product.sku}</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Price</p>
                    <p className="text-sm font-bold">TSh {product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Margin</p>
                    <p className={`text-sm font-bold ${margin >= 20 ? "text-green-600" : margin >= 10 ? "text-amber-600" : "text-red-500"}`}>{margin}%</p>
                  </div>
                </div>
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${isOut ? "bg-red-100 dark:bg-red-900/20" : isLow ? "bg-amber-100 dark:bg-amber-900/20" : "bg-muted"}`}>
                  <button onClick={() => handleStockChange(product.id, product.stock, -1)} disabled={isOut} className="w-5 h-5 rounded-md bg-background/60 flex items-center justify-center disabled:opacity-40"><Minus className="w-3 h-3" /></button>
                  <span className={`text-sm font-black ${isOut ? "text-red-600" : isLow ? "text-amber-600" : ""}`}>{product.stock}</span>
                  <button onClick={() => handleStockChange(product.id, product.stock, 1)} className="w-5 h-5 rounded-md bg-background/60 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                </div>
                {(isLow || isOut) && (
                  <div className={`text-[10px] font-bold text-center mt-1.5 ${isOut ? "text-red-600" : "text-amber-600"}`}>
                    {isOut ? "⚠️ Out of stock" : "⚠️ Low stock"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stock Order Modal */}
      {showStockOrderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 pd-modal-backdrop">
          <div className="w-full max-w-2xl"><StockOrderModal onClose={() => setShowStockOrderModal(false)} onSubmit={(order) => { toast.success(`Order placed for ${order.supplier || "supplier"}`); setShowStockOrderModal(false); }} /></div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 pd-modal-backdrop">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl pd-modal-content overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-base font-bold">Add New Product</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Appears in inventory and POS instantly</p>
              </div>
              <button onClick={() => { setShowAddProduct(false); setProductForm(EMPTY_PRODUCT); }} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Product Name *</label>
                <input className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary" placeholder="e.g. Azam Boflo Bread" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">SKU *</label>
                  <input className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary" placeholder="AZM-BRD-001" value={productForm.sku} onChange={e => setProductForm(f => ({ ...f, sku: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full h-[42px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:border-primary">
                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["Cost (TSh)", "cost", "0"], ["Price (TSh)", "price", "0"], ["Stock", "stock", "0"]].map(([label, field, ph]) => (
                  <div key={field}>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">{label} *</label>
                    <input type="number" min="0" placeholder={ph} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary" value={(productForm as any)[field]} onChange={e => setProductForm(f => ({ ...f, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Unit</label>
                <input className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary" placeholder="e.g. bottle, kg, pack" value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted" onClick={() => { setShowAddProduct(false); setProductForm(EMPTY_PRODUCT); }}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90" onClick={handleAddProduct} disabled={createProduct.isPending}>
                {createProduct.isPending ? "Saving…" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
