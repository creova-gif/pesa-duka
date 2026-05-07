// Mock data for CREOVA SME Business OS

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  unit: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  purchases: number;
  owes: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  products: number;
  net: number | string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  paymentMethod: string;
  date: string | Date;
  time: string;
}

export const products: Product[] = [
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

export const customers: Customer[] = [
  { id: '1', name: 'Mama Amina Hassan', phone: '+255 754 123 456', purchases: 245000, owes: 15000 },
  { id: '2', name: 'Joseph Mwangi', phone: '+255 713 234 567', purchases: 180000, owes: 0 },
  { id: '3', name: 'Fatma Abdallah', phone: '+255 766 345 678', purchases: 120000, owes: 8500 },
  { id: '4', name: 'Emmanuel Kimaro', phone: '+255 784 456 789', purchases: 95000, owes: 0 },
  { id: '5', name: 'Halima Juma', phone: '+255 625 567 890', purchases: 310000, owes: 22000 },
  { id: '6', name: 'Robert Mushi', phone: '+255 758 678 901', purchases: 67000, owes: 0 },
  { id: '7', name: 'Grace Massawe', phone: '+255 712 789 012', purchases: 155000, owes: 5000 },
];

export const suppliers: Supplier[] = [
  { id: '1', name: 'Bakhresa Group', phone: '+255 22 286 0711', address: 'Chang\'ombe, Dar es Salaam', products: 3, net: 'Net 30' },
  { id: '2', name: 'MeTL Group', phone: '+255 22 218 0000', address: 'Nyerere Rd, Dar es Salaam', products: 8, net: 'Net 14' },
  { id: '3', name: 'Azam Beverages', phone: '+255 22 286 1234', address: 'Mikocheni, Dar es Salaam', products: 4, net: 'COD' },
  { id: '4', name: 'TBL (Serengeti Breweries)', phone: '+255 22 218 2333', address: 'Uhuru St, Dar es Salaam', products: 1, net: 'Net 7' },
];

export const transactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    description: '1× Omo Washing Powder 500g',
    amount: 3500,
    paymentMethod: 'Cash',
    date: new Date('2026-03-14T17:00:00'),
    time: '17:00',
  },
  {
    id: '2',
    type: 'income',
    description: '3× Azam Unga Ngano 2kg, 2× Korie Cooking Oil 1L',
    amount: 23000,
    paymentMethod: 'M-Pesa',
    date: new Date('2026-03-14T16:30:00'),
    time: '16:30',
  },
  {
    id: '3',
    type: 'income',
    description: '20× Kasuku Exercise Book A4, 1× Chai Bora Tea Bags 100s',
    amount: 20800,
    paymentMethod: 'Cash',
    date: new Date('2026-03-14T14:00:00'),
    time: '14:00',
  },
  {
    id: '4',
    type: 'income',
    description: '1× Colgate Toothpaste 75ml, 2× Geisha Soap Bar',
    amount: 4600,
    paymentMethod: 'M-Pesa',
    date: new Date('2026-03-14T11:30:00'),
    time: '11:30',
  },
  {
    id: '5',
    type: 'income',
    description: '1× Ndovu Cement 50kg',
    amount: 22000,
    paymentMethod: 'Tigo Pesa',
    date: new Date('2026-03-14T09:45:00'),
    time: '09:45',
  },
  {
    id: '6',
    type: 'income',
    description: '4× Serengeti Premium Lager, 6× Azam Cola 500ml',
    amount: 14200,
    paymentMethod: 'Cash',
    date: new Date('2026-03-14T09:00:00'),
    time: '09:00',
  },
  {
    id: '7',
    type: 'expense',
    description: 'Shop WiFi - Airtel broadband',
    amount: 30000,
    paymentMethod: 'M-Pesa',
    date: new Date('2026-03-14T09:00:00'),
    time: '09:00',
  },
  {
    id: '8',
    type: 'expense',
    description: 'Fuel for delivery',
    amount: 20000,
    paymentMethod: 'Cash',
    date: new Date('2026-03-14T07:00:00'),
    time: '07:00',
  },
  {
    id: '9',
    type: 'expense',
    description: 'Sales assistant - Juma weekly pay',
    amount: 50000,
    paymentMethod: 'Cash',
    date: new Date('2026-03-13T18:00:00'),
    time: '18:00',
  },
];

export const paymentMethods = ['Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'HaloPesa', 'Credit'];

export const categories = ['All', 'Food', 'Beverages', 'Personal Care', 'Household', 'Electronics', 'Stationery', 'Airtime', 'Building', 'Other'];