import { Product, Customer, Sale, Expense, StockTransaction, BusinessSettings, DashboardStats, UserSession } from '../types';

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token: string; user: UserSession; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Products
  async getProducts(category?: string, search?: string): Promise<{ success: boolean; data: Product[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`/api/products?${params.toString()}`);
    return res.json();
  },

  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<{ success: boolean; data: Product; message?: string }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<{ success: boolean; data: Product; message?: string }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async updateProductRate(id: string, newRate: number, reason?: string): Promise<{ success: boolean; data: Product; message?: string }> {
    const res = await fetch(`/api/products/${id}/rate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newRate, reason })
    });
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean; data: Product }> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Inventory
  async adjustStock(productId: string, type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'DAMAGE', quantity: number, notes?: string) {
    const res = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, type, quantity, notes })
    });
    return res.json();
  },

  async getStockTransactions(): Promise<{ success: boolean; data: StockTransaction[] }> {
    const res = await fetch('/api/inventory/transactions');
    return res.json();
  },

  // Sales
  async getSales(date?: string, paymentMethod?: string, search?: string): Promise<{ success: boolean; data: Sale[] }> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);
    if (search) params.append('search', search);
    const res = await fetch(`/api/sales?${params.toString()}`);
    return res.json();
  },

  async createSale(saleData: any): Promise<{ success: boolean; message: string; data: Sale }> {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });
    return res.json();
  },

  async deleteSale(id: string): Promise<{ success: boolean; message: string; data: Sale }> {
    const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Customers
  async getCustomers(search?: string): Promise<{ success: boolean; data: Customer[] }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const res = await fetch(`/api/customers?${params.toString()}`);
    return res.json();
  },

  async createCustomer(customer: { name: string; phone: string; address?: string }): Promise<{ success: boolean; data: Customer }> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    return res.json();
  },

  async payCustomerDue(id: string, amount: number): Promise<{ success: boolean; message: string; data: Customer }> {
    const res = await fetch(`/api/customers/${id}/pay-due`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    return res.json();
  },

  // Expenses
  async getExpenses(): Promise<{ success: boolean; data: Expense[] }> {
    const res = await fetch('/api/expenses');
    return res.json();
  },

  async createExpense(expense: Partial<Expense>): Promise<{ success: boolean; data: Expense }> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    return res.json();
  },

  async deleteExpense(id: string): Promise<{ success: boolean; data: Expense }> {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    const res = await fetch('/api/dashboard/stats');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ success: boolean; data: BusinessSettings }> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<{ success: boolean; data: BusinessSettings; message?: string }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Backup & Restore
  async exportBackup(): Promise<{ success: boolean; timestamp: string; data: any }> {
    const res = await fetch('/api/backup/export');
    return res.json();
  },

  async importBackup(data: any): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/backup/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    return res.json();
  }
};

// Named Export Helpers for Convenient Direct Usage
export const fetchProducts = async (category?: string, search?: string): Promise<Product[]> => {
  const res = await api.getProducts(category, search);
  return res.data || [];
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const res = await api.createProduct(product);
  return res.data;
};

export const updateProductRate = async (id: string, newRate: number, reason?: string): Promise<Product> => {
  const res = await api.updateProductRate(id, newRate, reason);
  return res.data;
};

export const adjustProductStock = async (productId: string, quantity: number, notes?: string): Promise<any> => {
  const type = quantity >= 0 ? 'PURCHASE' : 'SALE';
  return api.adjustStock(productId, type, Math.abs(quantity), notes);
};

export const fetchSales = async (date?: string, paymentMethod?: string, search?: string): Promise<Sale[]> => {
  const res = await api.getSales(date, paymentMethod, search);
  return res.data || [];
};

export const createSale = async (saleData: any): Promise<Sale> => {
  const res = await api.createSale(saleData);
  return res.data;
};

export const deleteSale = async (id: string): Promise<Sale> => {
  const res = await api.deleteSale(id);
  return res.data;
};

export const fetchCustomers = async (search?: string): Promise<Customer[]> => {
  const res = await api.getCustomers(search);
  return res.data || [];
};

export const createCustomer = async (cust: { name: string; phone: string; address?: string }): Promise<Customer> => {
  const res = await api.createCustomer(cust);
  return res.data;
};

export const payCustomerDue = async (id: string, amount: number): Promise<Customer> => {
  const res = await api.payCustomerDue(id, amount);
  return res.data;
};

export const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await api.getExpenses();
  return res.data || [];
};

export const createExpense = async (expense: Partial<Expense>): Promise<Expense> => {
  const res = await api.createExpense(expense);
  return res.data;
};

export const deleteExpense = async (id: string): Promise<Expense> => {
  const res = await api.deleteExpense(id);
  return res.data;
};

export const fetchSettings = async (): Promise<BusinessSettings> => {
  const res = await api.getSettings();
  return res.data;
};

export const updateSettings = async (settings: Partial<BusinessSettings>): Promise<BusinessSettings> => {
  const res = await api.updateSettings(settings);
  return res.data;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.getDashboardStats();
  return res.data;
};

export const exportFullBackup = async (): Promise<any> => {
  const res = await api.exportBackup();
  return res.data;
};

export const importFullBackup = async (data: any): Promise<any> => {
  return api.importBackup(data);
};
