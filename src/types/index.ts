export type ProductCategory = 'oil' | 'flour' | 'powder';

export type NavTab = 'dashboard' | 'pos' | 'products' | 'bills' | 'reports' | 'customers' | 'expenses' | 'settings' | 'storefront';

export interface ProductPackOption {
  label: string;
  quantityMultiplier: number;
  unit: string;
  discountPercent?: number;
  badge?: string;
}

export interface RateHistoryItem {
  id: string;
  oldRate: number;
  newRate: number;
  changedDate: string;
  reason?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image?: string;
  unit: string;
  sellingRate: number;
  purchaseRate: number;
  stockQty: number;
  minStockLevel: number;
  minStockAlert?: number;
  description: string;
  isActive: boolean;
  rateHistory?: RateHistoryItem[];
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    totalSold: number;
    totalRevenue: number;
    totalProfit: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  billsCount: number;
  totalPaid: number;
  totalDue: number;
  lastPurchaseDate: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  rate: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  quantity: number;
  rate: number;
  purchaseRate: number;
  total: number;
}

export interface Sale {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxEnabled: boolean;
  taxPercent: number;
  taxAmount: number;
  finalTotal: number;
  purchaseCost: number;
  netProfit: number;
  paymentMethod: 'CASH' | 'GPAY' | 'CREDIT';
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL';
  paidAmount: number;
  dueAmount: number;
  referenceId?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Electricity' | 'Rent' | 'Salary' | 'Transport' | 'Maintenance' | 'Packaging' | 'Raw Material' | 'Other' | string;
  date: string;
  description?: string;
  notes?: string;
  paymentMethod?: 'CASH' | 'GPAY' | 'BANK' | string;
  createdAt?: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'DAMAGE';
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string;
  date: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  upiId: string;
  upiQrCodeUrl: string;
  invoiceFooter: string;
  currencySymbol: string;
  taxEnabled: boolean;
  defaultGstPercent: number;
}

export interface DashboardStats {
  today: {
    totalSales: number;
    cashSales: number;
    gpaySales: number;
    creditSales: number;
    expenses: number;
    netProfit: number;
    billsCount: number;
    customersCount: number;
    oilSales: number;
    flourSales: number;
    powderSales: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    lowStockItems: Product[];
    totalStockValue: number;
    totalPurchaseValue: number;
  };
  topSellingProducts: {
    name: string;
    category: string;
    qty: number;
    revenue: number;
  }[];
  totalOutstandingDue: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  businessName: string;
  token: string;
}
