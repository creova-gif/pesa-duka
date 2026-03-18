import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5c9bd723/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== PRODUCTS ENDPOINTS ====================

// Get all products
app.get("/make-server-5c9bd723/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ success: true, data: products || [] });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single product
app.get("/make-server-5c9bd723/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    return c.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create product
app.post("/make-server-5c9bd723/products", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;
    const product = { ...body, id };
    await kv.set(`product:${id}`, product);
    return c.json({ success: true, data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update product
app.put("/make-server-5c9bd723/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    const updated = { ...existing, ...body, id };
    await kv.set(`product:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete product
app.delete("/make-server-5c9bd723/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMERS ENDPOINTS ====================

// Get all customers
app.get("/make-server-5c9bd723/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ success: true, data: customers || [] });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create customer
app.post("/make-server-5c9bd723/customers", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;
    const customer = { ...body, id };
    await kv.set(`customer:${id}`, customer);
    return c.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update customer
app.put("/make-server-5c9bd723/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`customer:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    const updated = { ...existing, ...body, id };
    await kv.set(`customer:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete customer
app.delete("/make-server-5c9bd723/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`customer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SUPPLIERS ENDPOINTS ====================

// Get all suppliers
app.get("/make-server-5c9bd723/suppliers", async (c) => {
  try {
    const suppliers = await kv.getByPrefix("supplier:");
    return c.json({ success: true, data: suppliers || [] });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create supplier
app.post("/make-server-5c9bd723/suppliers", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;
    const supplier = { ...body, id };
    await kv.set(`supplier:${id}`, supplier);
    return c.json({ success: true, data: supplier });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update supplier
app.put("/make-server-5c9bd723/suppliers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`supplier:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Supplier not found" }, 404);
    }
    const updated = { ...existing, ...body, id };
    await kv.set(`supplier:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete supplier
app.delete("/make-server-5c9bd723/suppliers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`supplier:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== TRANSACTIONS ENDPOINTS ====================

// Get all transactions
app.get("/make-server-5c9bd723/transactions", async (c) => {
  try {
    const transactions = await kv.getByPrefix("transaction:");
    return c.json({ success: true, data: transactions || [] });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create transaction
app.post("/make-server-5c9bd723/transactions", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `${Date.now()}`;
    const transaction = { ...body, id, date: body.date || new Date().toISOString() };
    await kv.set(`transaction:${id}`, transaction);
    return c.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete transaction
app.delete("/make-server-5c9bd723/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`transaction:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== INITIALIZE DEFAULT DATA ====================

// Initialize database with default data (run once)
app.post("/make-server-5c9bd723/initialize", async (c) => {
  try {
    // Check if already initialized
    const existing = await kv.get("initialized");
    if (existing) {
      return c.json({ success: true, message: "Database already initialized" });
    }

    // Default products
    const defaultProducts = [
      { id: '1', name: 'Azam Boflo Bread', sku: 'AZM-BRD-001', category: 'Food', cost: 1200, price: 1500, stock: 45, unit: 'loaf' },
      { id: '2', name: 'Kilimanjaro Water 1.5L', sku: 'KLM-WTR-015', category: 'Beverages', cost: 500, price: 800, stock: 120, unit: 'bottle' },
      { id: '3', name: 'Serengeti Premium Lager', sku: 'SRG-BER-001', category: 'Beverages', cost: 1800, price: 2500, stock: 60, unit: 'bottle' },
      { id: '4', name: 'Korie Cooking Oil 1L', sku: 'KOR-OIL-001', category: 'Food', cost: 4500, price: 5500, stock: 25, unit: 'bottle' },
      { id: '5', name: 'Sembe White Sugar 1kg', sku: 'SMB-SUG-001', category: 'Food', cost: 2800, price: 3500, stock: 40, unit: 'kg' },
      { id: '6', name: 'Nishati Rice 5kg', sku: 'NSH-RIC-005', category: 'Food', cost: 12000, price: 15000, stock: 18, unit: 'bag' },
      { id: '7', name: 'Azam Unga Ngano 2kg', sku: 'AZM-FLR-002', category: 'Food', cost: 3200, price: 4000, stock: 30, unit: 'pack' },
      { id: '8', name: 'Geisha Soap Bar', sku: 'GSH-SOP-001', category: 'Personal Care', cost: 800, price: 1200, stock: 55, unit: 'bar' },
      { id: '9', name: 'Colgate Toothpaste 75ml', sku: 'CLG-TPS-075', category: 'Personal Care', cost: 1500, price: 2200, stock: 35, unit: 'tube' },
      { id: '10', name: 'Kasuku Exercise Book A4', sku: 'KSK-EXB-A4', category: 'Stationery', cost: 500, price: 800, stock: 200, unit: 'pcs' },
      { id: '11', name: 'Tigo Airtime Voucher 5000', sku: 'TGO-AIR-5K', category: 'Airtime', cost: 4500, price: 5000, stock: 100, unit: 'pcs' },
      { id: '12', name: 'Vodacom Airtime 10000', sku: 'VDC-AIR-10K', category: 'Airtime', cost: 9500, price: 10000, stock: 80, unit: 'pcs' },
      { id: '13', name: 'Azam Cola 500ml', sku: 'AZM-COL-500', category: 'Beverages', cost: 500, price: 700, stock: 90, unit: 'bottle' },
      { id: '14', name: 'Pemba Cloves 50g', sku: 'PMB-CLV-050', category: 'Food', cost: 3000, price: 4500, stock: 12, unit: 'pack' },
      { id: '15', name: 'Blue Band Margarine 250g', sku: 'BLB-MAR-250', category: 'Food', cost: 2000, price: 2800, stock: 28, unit: 'tub' },
      { id: '16', name: 'Chai Bora Tea Bags 100s', sku: 'CHB-TEA-100', category: 'Beverages', cost: 3500, price: 4800, stock: 22, unit: 'box' },
      { id: '17', name: 'Ndovu Cement 50kg', sku: 'NDV-CMT-50K', category: 'Building', cost: 17000, price: 22000, stock: 5, unit: 'bag' },
      { id: '18', name: 'Omo Washing Powder 500g', sku: 'OMO-WSH-500', category: 'Household', cost: 2500, price: 3500, stock: 40, unit: 'pack' },
    ];

    // Default customers
    const defaultCustomers = [
      { id: '1', name: 'Mama Amina Hassan', phone: '+255 754 123 456', purchases: 245000, owes: 15000 },
      { id: '2', name: 'Joseph Mwangi', phone: '+255 713 234 567', purchases: 180000, owes: 0 },
      { id: '3', name: 'Fatma Abdallah', phone: '+255 766 345 678', purchases: 120000, owes: 8500 },
      { id: '4', name: 'Emmanuel Kimaro', phone: '+255 784 456 789', purchases: 95000, owes: 0 },
      { id: '5', name: 'Halima Juma', phone: '+255 625 567 890', purchases: 310000, owes: 22000 },
      { id: '6', name: 'Robert Mushi', phone: '+255 758 678 901', purchases: 67000, owes: 0 },
      { id: '7', name: 'Grace Massawe', phone: '+255 712 789 012', purchases: 155000, owes: 5000 },
    ];

    // Default suppliers
    const defaultSuppliers = [
      { id: '1', name: 'Bakhresa Group', phone: '+255 22 286 0711', address: 'Chang\'ombe, Dar es Salaam', products: 3, net: 'Net 30' },
      { id: '2', name: 'MeTL Group', phone: '+255 22 218 0000', address: 'Nyerere Rd, Dar es Salaam', products: 8, net: 'Net 14' },
      { id: '3', name: 'Azam Beverages', phone: '+255 22 286 1234', address: 'Mikocheni, Dar es Salaam', products: 4, net: 'COD' },
      { id: '4', name: 'TBL (Serengeti Breweries)', phone: '+255 22 218 2333', address: 'Uhuru St, Dar es Salaam', products: 1, net: 'Net 7' },
    ];

    // Default transactions
    const defaultTransactions = [
      { id: '1', type: 'income', description: '1× Omo Washing Powder 500g', amount: 3500, paymentMethod: 'Cash', date: new Date('2026-03-14T17:00:00').toISOString(), time: '17:00' },
      { id: '2', type: 'income', description: '3× Azam Unga Ngano 2kg, 2× Korie Cooking Oil 1L', amount: 23000, paymentMethod: 'M-Pesa', date: new Date('2026-03-14T16:30:00').toISOString(), time: '16:30' },
      { id: '3', type: 'income', description: '20× Kasuku Exercise Book A4, 1× Chai Bora Tea Bags 100s', amount: 20800, paymentMethod: 'Cash', date: new Date('2026-03-14T14:00:00').toISOString(), time: '14:00' },
      { id: '4', type: 'income', description: '1× Colgate Toothpaste 75ml, 2× Geisha Soap Bar', amount: 4600, paymentMethod: 'M-Pesa', date: new Date('2026-03-14T11:30:00').toISOString(), time: '11:30' },
      { id: '5', type: 'income', description: '1× Ndovu Cement 50kg', amount: 22000, paymentMethod: 'Tigo Pesa', date: new Date('2026-03-14T09:45:00').toISOString(), time: '09:45' },
      { id: '6', type: 'income', description: '4× Serengeti Premium Lager, 6× Azam Cola 500ml', amount: 14200, paymentMethod: 'Cash', date: new Date('2026-03-14T09:00:00').toISOString(), time: '09:00' },
      { id: '7', type: 'expense', description: 'Shop WiFi - Airtel broadband', amount: 30000, paymentMethod: 'M-Pesa', date: new Date('2026-03-14T09:00:00').toISOString(), time: '09:00' },
      { id: '8', type: 'expense', description: 'Fuel for delivery', amount: 20000, paymentMethod: 'Cash', date: new Date('2026-03-14T07:00:00').toISOString(), time: '07:00' },
      { id: '9', type: 'expense', description: 'Sales assistant - Juma weekly pay', amount: 50000, paymentMethod: 'Cash', date: new Date('2026-03-13T18:00:00').toISOString(), time: '18:00' },
    ];

    // Save all data
    for (const product of defaultProducts) {
      await kv.set(`product:${product.id}`, product);
    }
    for (const customer of defaultCustomers) {
      await kv.set(`customer:${customer.id}`, customer);
    }
    for (const supplier of defaultSuppliers) {
      await kv.set(`supplier:${supplier.id}`, supplier);
    }
    for (const transaction of defaultTransactions) {
      await kv.set(`transaction:${transaction.id}`, transaction);
    }

    // Mark as initialized
    await kv.set("initialized", true);

    return c.json({ 
      success: true, 
      message: "Database initialized successfully",
      data: {
        products: defaultProducts.length,
        customers: defaultCustomers.length,
        suppliers: defaultSuppliers.length,
        transactions: defaultTransactions.length
      }
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);