// API client for CREOVA backend
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5c9bd723`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic fetch wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!data.success) {
    console.error(`API Error on ${endpoint}:`, data.error);
    throw new Error(data.error || 'API request failed');
  }

  return data.data;
}

// ==================== PRODUCTS API ====================

export const productsApi = {
  getAll: () => apiFetch<any[]>('/products'),
  
  getById: (id: string) => apiFetch<any>(`/products/${id}`),
  
  create: (product: any) => 
    apiFetch<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  
  update: (id: string, updates: any) =>
    apiFetch<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`/products/${id}`, {
      method: 'DELETE',
    }),

  updateStock: (id: string, newStock: number) =>
    apiFetch<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ stock: newStock }),
    }),
};

// ==================== CUSTOMERS API ====================

export const customersApi = {
  getAll: () => apiFetch<any[]>('/customers'),
  
  create: (customer: any) =>
    apiFetch<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),
  
  update: (id: string, updates: any) =>
    apiFetch<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`/customers/${id}`, {
      method: 'DELETE',
    }),

  updateDebt: (id: string, newDebt: number, newPurchases: number) =>
    apiFetch<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ owes: newDebt, purchases: newPurchases }),
    }),
};

// ==================== SUPPLIERS API ====================

export const suppliersApi = {
  getAll: () => apiFetch<any[]>('/suppliers'),
  
  create: (supplier: any) =>
    apiFetch<any>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    }),
  
  update: (id: string, updates: any) =>
    apiFetch<any>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`/suppliers/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== TRANSACTIONS API ====================

export const transactionsApi = {
  getAll: () => apiFetch<any[]>('/transactions'),
  
  create: (transaction: any) =>
    apiFetch<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== INITIALIZATION ====================

export const initializeDatabase = () =>
  fetch(`${API_BASE}/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  }).then(res => res.json());
