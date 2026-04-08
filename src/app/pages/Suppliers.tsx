import { Search, Phone, MapPin, Package, CirclePlus } from "lucide-react";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useSuppliers } from "../hooks/useData";

export function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch suppliers from backend
  const { data: suppliers = [], isLoading, isError } = useSuppliers();

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold mb-1">Failed to load suppliers</h2>
          <p className="text-sm text-muted-foreground mb-4">Check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.9)] text-white">
          <CirclePlus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search suppliers..."
            className="pl-10 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-card rounded-lg p-6 border border-border hover:border-[hsl(var(--primary))] transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">{supplier.name}</h3>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">{supplier.products} products</span>
                <span className="text-sm font-semibold">{supplier.net}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{supplier.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}