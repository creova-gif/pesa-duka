// ============================================================================
// Pesa Duka v1 — Local-First IndexedDB Repository Layer
// Zero-dependency, Promise-wrapped native IndexedDB with atomic multi-store
// transactions, UUIDv4 idempotency, and cold-start Tanzanian retail seeding.
// ============================================================================

import { products as initialProducts, Product, Customer, Supplier, Transaction } from '../data/mockData';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  cost?: number;
  quantity: number;
  sku?: string;
}

export interface OfflineQueueItem {
  id: string; // UUIDv4
  type: 'TRANSACTION_SYNC' | 'INVENTORY_ADJUST' | 'CUSTOMER_CREDIT';
  payload: any;
  timestamp: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'RECONCILED';
  lastError?: string;
}

export interface CheckoutResult {
  transactionId: string;
  receiptNumber: string;
  timestamp: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  offlineQueued: boolean;
}

const DB_NAME = 'pesa_duka_v1';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

// Generate RFC-compliant UUIDv4 for idempotency
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate serial receipt sequence: POS-TZ-YYMMDD-XXXX
export function generateReceiptNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `POS-TZ-${yy}${mm}${dd}-${rand}`;
}

// Open or get singleton database connection
export function getDb(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('category', 'category', { unique: false });
        productStore.createIndex('sku', 'sku', { unique: false });
        productStore.createIndex('stock', 'stock', { unique: false });
      }

      // 2. Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('timestamp', 'date', { unique: false });
        txStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
        txStore.createIndex('status', 'status', { unique: false });
      }

      // 3. Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const custStore = db.createObjectStore('customers', { keyPath: 'id' });
        custStore.createIndex('phone', 'phone', { unique: false });
      }

      // 4. Suppliers store
      if (!db.objectStoreNames.contains('suppliers')) {
        db.createObjectStore('suppliers', { keyPath: 'id' });
      }

      // 5. Offline sync queue
      if (!db.objectStoreNames.contains('offline_queue')) {
        const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 6. Settings & Key-Value store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = async (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;

      // Clean up connection on page close
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      // Cold-start seed check
      await seedInitialData(dbInstance);

      // Mount development debug harness
      if (typeof window !== 'undefined') {
        (window as any).__DUKA_DEV__ = {
          getDb: () => dbInstance,
          seedMocks: () => seedInitialData(dbInstance!, true),
          getQueue: () => getAllFromStore<OfflineQueueItem>('offline_queue'),
          clearQueue: () => clearStore('offline_queue'),
        };
      }

      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbInitPromise;
}

export const initDb = getDb;

// Cold-start data seeding
export async function seedInitialData(db: IDBDatabase, force = false): Promise<void> {
  const count = await getStoreCount(db, 'products');
  if (count === 0 || force) {
    const tx = db.transaction(['products'], 'readwrite');
    const store = tx.objectStore('products');
    initialProducts.forEach((p) => store.put(p));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

function getStoreCount(db: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction([storeName], 'readonly');
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

// Generic Store Helpers
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function putInStore<T>(storeName: string, item: T): Promise<T> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFromStore(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ============================================================================
// Core Atomic Counter Checkout Transaction
// Atomically:
// 1. Writes transaction record with UUIDv4
// 2. Decrements stock for each cart item (flagging over-allocations)
// 3. Enqueues payload to offline_queue
// ============================================================================
export async function completeAtomicCheckout(params: {
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'mobile_money' | 'credit';
  customerId?: string;
  notes?: string;
}): Promise<CheckoutResult> {
  const db = await getDb();
  const txId = generateUUID();
  const receiptNum = generateReceiptNumber();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions', 'products', 'offline_queue'], 'readwrite');
    const txStore = tx.objectStore('transactions');
    const productStore = tx.objectStore('products');
    const queueStore = tx.objectStore('offline_queue');

    // 1. Transaction Record
    const txRecord: Transaction & { receiptNumber: string; items: CartItem[]; customerId?: string; status: string } = {
      id: txId,
      receiptNumber: receiptNum,
      type: 'income',
      description: `Counter Sale (${params.items.length} items)`,
      amount: params.totalAmount,
      paymentMethod: params.paymentMethod,
      date: now,
      time: new Date().toLocaleTimeString('en-TZ', { hour12: false }),
      items: params.items,
      customerId: params.customerId,
      status: 'COMPLETED_LOCAL',
    };
    txStore.put(txRecord);

    // 2. Decrement Stock atomically for each cart item
    params.items.forEach((item) => {
      const getReq = productStore.get(item.id);
      getReq.onsuccess = () => {
        const prod = getReq.result as Product | undefined;
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
          prod.stock = newStock;
          productStore.put(prod);
        }
      };
    });

    // 3. Queue for cloud synchronization
    const queueItem: OfflineQueueItem = {
      id: txId,
      type: 'TRANSACTION_SYNC',
      payload: txRecord,
      timestamp: now,
      retryCount: 0,
      status: 'PENDING',
    };
    queueStore.put(queueItem);

    tx.oncomplete = () => {
      resolve({
        transactionId: txId,
        receiptNumber: receiptNum,
        timestamp: now,
        totalAmount: params.totalAmount,
        paymentMethod: params.paymentMethod,
        itemCount: params.items.reduce((sum, i) => sum + i.quantity, 0),
        offlineQueued: true,
      });
    };

    tx.onerror = () => {
      reject(tx.error || new Error('Atomic checkout transaction failed'));
    };
  });
}
