import { useState } from "react";
import { Search, Plus, Minus, Edit, CirclePlus, X } from "lucide-react";
import { categories } from "../data/mockData";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { StockOrderModal } from "../components/StockOrderModal";
import { useProducts, useUpdateStock, useCreateProduct } from "../hooks/useData";
import { toast } from "sonner";

const PRODUCT_CATEGORIES = ["Food", "Beverages", "Personal Care", "Household", "Electronics", "Stationery", "Other"];

const EMPTY_PRODUCT = { name: "", sku: "", category: "Food", cost: "", price: "", stock: "", unit: "unit" };

export function Inventory() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStockOrderModal, setShowStockOrderModal] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  // Fetch products from backend
  const { data: products = [], isLoading, isError } = useProducts();
  const updateStock = useUpdateStock();
  const createProduct = useCreateProduct();

  const handleAddProduct = () => {
    if (!productForm.name.trim()) { toast.error("Product name is required"); return; }
    if (!productForm.sku.trim()) { toast.error("SKU is required"); return; }
    const cost = parseFloat(productForm.cost);
    const price = parseFloat(productForm.price);
    const stock = parseInt(productForm.stock, 10);
    if (isNaN(cost) || cost < 0) { toast.error("Enter a valid cost price"); return; }
    if (isNaN(price) || price < 0) { toast.error("Enter a valid selling price"); return; }
    if (isNaN(stock) || stock < 0) { toast.error("Enter a valid stock quantity"); return; }

    createProduct.mutate(
      { ...productForm, cost, price, stock },
      {
        onSuccess: () => {
          toast.success(`"${productForm.name}" added to inventory`);
          setShowAddProduct(false);
          setProductForm(EMPTY_PRODUCT);
        },
        onError: (err: any) => {
          toast.error(`Failed to add product: ${err?.message || "Unknown error"}`);
        },
      }
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalProducts = products.length;
  const inventoryValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const lowStockItems = products.filter(p => p.stock < 20).length;

  const handleStockChange = (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateStock.mutate(
      { id: productId, stock: newStock },
      {
        onSuccess: () => {
          toast.success(`Stock updated to ${newStock}`);
        },
        onError: (error) => {
          toast.error(`Failed to update stock: ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold mb-1">Failed to load inventory</h2>
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
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-primary">{products.length}</span> products in inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowStockOrderModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            📦 Order Stock
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setShowAddProduct(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Products</p>
          <p className="text-lg md:text-2xl font-semibold">{totalProducts}</p>
        </div>
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Inventory Value</p>
          <p className="text-lg md:text-2xl font-semibold">
            <span className="hidden md:inline">TSh </span>{inventoryValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Low Stock Items</p>
          <p className="text-lg md:text-2xl font-semibold">{lowStockItems}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg p-4 md:p-6 border border-border mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products or SKU..."
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground">Product</th>
                <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground">Category</th>
                <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground">Cost</th>
                <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground hidden md:table-cell">Price</th>
                <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground">Stock</th>
                <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-muted-foreground hidden lg:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>📦</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>{products.length === 0 ? "No products yet" : "No products match your search"}</div>
                    <div style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", marginBottom: "16px" }}>
                      {products.length === 0
                        ? "Add your first product to start tracking stock levels and get automatic low-stock alerts."
                        : "Try a different search term or category filter."}
                    </div>
                    {products.length === 0 && (
                      <button
                        onClick={() => setShowAddProduct(true)}
                        style={{ fontSize: "13px", fontWeight: 700, padding: "10px 24px", borderRadius: "10px", border: "none", background: "hsl(var(--primary))", color: "#fff", cursor: "pointer" }}
                      >
                        + Add First Product
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 md:p-4">
                    <div>
                      <p className="font-medium text-sm md:text-base">{product.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <span className="px-2 md:px-3 py-1 rounded-full bg-muted text-xs md:text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-3 md:p-4 text-sm md:text-base">TSh {product.cost.toLocaleString()}</td>
                  <td className="p-3 md:p-4 text-sm md:text-base hidden md:table-cell">TSh {product.price.toLocaleString()}</td>
                  <td className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStockChange(product.id, product.stock, -1)}
                        disabled={product.stock === 0}
                        className="w-6 h-6 md:w-7 md:h-7 rounded bg-muted hover:bg-accent flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      <span className={`font-semibold text-sm md:text-base ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : product.stock < 20 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                        {product.stock}
                      </span>
                      <button 
                        onClick={() => handleStockChange(product.id, product.stock, 1)}
                        className="w-6 h-6 md:w-7 md:h-7 rounded bg-muted hover:bg-accent flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 hidden lg:table-cell">
                    <button className="text-muted-foreground hover:text-foreground">
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Order Modal */}
      {showStockOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <StockOrderModal
              onClose={() => setShowStockOrderModal(false)}
              onSubmit={(order) => {
                toast.success(`Stock order placed for ${order.supplier || 'supplier'}. Your order has been recorded.`);
                setShowStockOrderModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold">Add New Product</h2>
              <button onClick={() => { setShowAddProduct(false); setProductForm(EMPTY_PRODUCT); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Product Name *</label>
                <Input placeholder="e.g. Azam Boflo Bread" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">SKU *</label>
                  <Input placeholder="e.g. AZM-BRD-001" value={productForm.sku} onChange={e => setProductForm(f => ({ ...f, sku: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Cost (TSh) *</label>
                  <Input type="number" min="0" placeholder="0" value={productForm.cost} onChange={e => setProductForm(f => ({ ...f, cost: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Price (TSh) *</label>
                  <Input type="number" min="0" placeholder="0" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Stock *</label>
                  <Input type="number" min="0" placeholder="0" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Unit</label>
                <Input placeholder="e.g. bottle, kg, pack" value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => { setShowAddProduct(false); setProductForm(EMPTY_PRODUCT); }}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleAddProduct} disabled={createProduct.isPending}>
                {createProduct.isPending ? "Saving…" : "Add Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}