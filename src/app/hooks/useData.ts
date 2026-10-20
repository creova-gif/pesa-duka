import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllFromStore,
  putInStore,
  deleteFromStore,
  completeAtomicCheckout,
  generateUUID,
  getDb,
  CartItem,
  CheckoutResult,
} from '../lib/db';
import { Product, Customer, Supplier, Transaction } from '../data/mockData';
import { productsApi, customersApi, suppliersApi, transactionsApi } from '../lib/api';

const STALE_TIME = 1000 * 30;

// ==================== PRODUCTS ====================

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      try {
        await getDb();
        const local = await getAllFromStore<Product>('products');
        if (local && local.length > 0) return local;
      } catch (err) {
        console.warn('Local IndexedDB fetch failed, falling back to API:', err);
      }
      return productsApi.getAll();
    },
    staleTime: STALE_TIME,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: any) => {
      const p = { ...product, id: product.id || String(Date.now()) };
      await putInStore('products', p);
      return p;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const all = await getAllFromStore<Product>('products');
      const existing = all.find((p) => p.id === id);
      if (existing) {
        const updated = { ...existing, ...updates };
        await putInStore('products', updated);
        return updated;
      }
      return productsApi.update(id, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const all = await getAllFromStore<Product>('products');
      const existing = all.find((p) => p.id === id);
      if (existing) {
        existing.stock = stock;
        await putInStore('products', existing);
        return existing;
      }
      return productsApi.updateStock(id, stock);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFromStore('products', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ==================== CUSTOMERS ====================

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      try {
        const local = await getAllFromStore<Customer>('customers');
        if (local && local.length > 0) return local;
      } catch (err) {
        console.warn('Customer local fetch fallback:', err);
      }
      return customersApi.getAll();
    },
    staleTime: STALE_TIME,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: any) => {
      const c = { ...customer, id: customer.id || String(Date.now()) };
      await putInStore('customers', c);
      return c;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const all = await getAllFromStore<Customer>('customers');
      const existing = all.find((c) => c.id === id);
      if (existing) {
        const updated = { ...existing, ...updates };
        await putInStore('customers', updated);
        return updated;
      }
      return productsApi.update(id, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFromStore('customers', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

// ==================== TRANSACTIONS & CHECKOUT ====================

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      try {
        const local = await getAllFromStore<Transaction>('transactions');
        if (local && local.length > 0) return local;
      } catch (err) {
        console.warn('Transaction local fetch fallback:', err);
      }
      return transactionsApi.getAll();
    },
    staleTime: STALE_TIME,
  });
}

export function useAtomicCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeAtomicCheckout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (txData: any) => {
      // If full atomic checkout format with items
      if (txData.items && txData.totalAmount) {
        return completeAtomicCheckout(txData);
      }
      // Standard transaction record
      const id = txData.id || generateUUID();
      const record = {
        ...txData,
        id,
        date: txData.date || new Date().toISOString(),
        time: txData.time || new Date().toLocaleTimeString('en-TZ', { hour12: false }),
      };
      await putInStore('transactions', record);
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}



export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFromStore('transactions', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

// ==================== SUPPLIERS ====================

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<Supplier[]> => {
      try {
        const local = await getAllFromStore<Supplier>('suppliers');
        if (local && local.length > 0) return local;
      } catch (err) {
        console.warn('Supplier local fetch fallback:', err);
      }
      return suppliersApi.getAll();
    },
    staleTime: STALE_TIME,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: any) => {
      const s = { ...supplier, id: supplier.id || String(Date.now()) };
      await putInStore('suppliers', s);
      return s;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const all = await getAllFromStore<Supplier>('suppliers');
      const existing = all.find((s) => s.id === id);
      if (existing) {
        const updated = { ...existing, ...updates };
        await putInStore('suppliers', updated);
        return updated;
      }
      return suppliersApi.update(id, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFromStore('suppliers', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

