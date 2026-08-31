import React, { useState, useEffect } from 'react';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidDrawer } from './components/AndroidDrawer';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { BillingView } from './components/BillingView';
import { BillHistoryView } from './components/BillHistoryView';
import { ReportsView } from './components/ReportsView';
import { CustomersView } from './components/CustomersView';
import { ExpensesView } from './components/ExpensesView';
import { SettingsView } from './components/SettingsView';
import { StorefrontView } from './components/StorefrontView';
import { InvoiceModal } from './components/InvoiceModal';
import { AuthModal } from './components/AuthModal';

import { 
  Product, 
  Sale, 
  Customer, 
  Expense, 
  BusinessSettings, 
  DashboardStats, 
  NavTab 
} from './types';

import { 
  fetchProducts, 
  createProduct, 
  updateProductRate, 
  adjustProductStock, 
  fetchSales, 
  createSale, 
  deleteSale, 
  fetchCustomers, 
  createCustomer, 
  payCustomerDue, 
  fetchExpenses, 
  createExpense, 
  deleteExpense, 
  fetchSettings, 
  updateSettings, 
  fetchDashboardStats,
  exportFullBackup,
  importFullBackup
} from './services/api';

export function App() {
  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);

  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: 'SRI KAMATHCHI OILL & FLOUR MILL',
    tagline: 'Pure Cold Pressed Wood Oils, Fresh Stone Milled Flours & Authentic Spices',
    address: 'No. 88, Mill Street, Gandhi Market, Tamil Nadu - 620008',
    phone: '+91 98401 23456 / +91 94441 67890',
    email: 'srikamathchioill@gmail.com',
    gstNumber: '33AAAAA0000A1Z5',
    upiId: 'srikamathchioill@okaxis',
    currencySymbol: '₹',
    defaultGstPercent: 5,
    taxEnabled: true,
    invoiceFooter: 'Thank you for choosing SRI KAMATHCHI OILL & FLOUR MILL! 100% Pure & Traditional.'
  });

  const [stats, setStats] = useState<DashboardStats>({
    today: {
      totalSales: 0,
      cashSales: 0,
      gpaySales: 0,
      creditSales: 0,
      expenses: 0,
      netProfit: 0,
      billsCount: 0,
      customersCount: 0,
      oilSales: 0,
      flourSales: 0,
      powderSales: 0
    },
    inventory: {
      totalProducts: 0,
      lowStockCount: 0,
      lowStockItems: [],
      totalStockValue: 0,
      totalPurchaseValue: 0
    },
    topSellingProducts: [],
    totalOutstandingDue: 0
  });

  // Modals State
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>({
    username: 'admin',
    role: 'Owner / Admin'
  });

  // Dark Mode side effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load all initial data from backend API
  const refreshAllData = async () => {
    try {
      const [prodsData, salesData, custsData, expData, settingsData, statsData] = await Promise.all([
        fetchProducts(),
        fetchSales(),
        fetchCustomers(),
        fetchExpenses(),
        fetchSettings(),
        fetchDashboardStats()
      ]);

      setProducts(prodsData);
      setSales(salesData);
      setCustomers(custsData);
      setExpenses(expData);
      if (settingsData) setSettings(settingsData);
      if (statsData) setStats(statsData);

      const lowCount = prodsData.filter(p => p.stockQty <= p.minStockAlert).length;
      setUnreadAlerts(lowCount);
    } catch (err) {
      console.error('Failed to fetch data from server:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // --- Handlers ---
  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteSale = async (salePayload: any): Promise<Sale | null> => {
    try {
      const createdSale = await createSale(salePayload);
      await refreshAllData();
      return createdSale;
    } catch (err) {
      console.error(err);
      alert('Error creating bill. Please verify inventory.');
      return null;
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      await deleteSale(saleId);
      await refreshAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel sale.');
    }
  };

  const handleAddProduct = async (productData: any) => {
    await createProduct(productData);
    await refreshAllData();
  };

  const handleUpdateProductRate = async (productId: string, sellingRate: number) => {
    await updateProductRate(productId, sellingRate);
    await refreshAllData();
  };

  const handleAdjustStock = async (productId: string, adjustment: number) => {
    await adjustProductStock(productId, adjustment);
    await refreshAllData();
  };

  const handleAddCustomer = async (custData: any) => {
    await createCustomer(custData);
    await refreshAllData();
  };

  const handlePayCustomerDue = async (customerId: string, amount: number) => {
    await payCustomerDue(customerId, amount);
    await refreshAllData();
  };

  const handleAddExpense = async (expenseData: any) => {
    await createExpense(expenseData);
    await refreshAllData();
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    await refreshAllData();
  };

  const handleUpdateSettings = async (newSettings: BusinessSettings) => {
    await updateSettings(newSettings);
    setSettings(newSettings);
    await refreshAllData();
  };

  const handleExportBackup = async () => {
    const backup = await exportFullBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sri_Lakshmi_Mill_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (jsonData: any) => {
    await importFullBackup(jsonData);
    await refreshAllData();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Android Top Header & Status Bar */}
      <AndroidHeader
        businessName={settings.businessName}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadAlertsCount={unreadAlerts}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenPOS={() => handleSelectTab('pos')}
      />

      {/* Slide-out Android Side Drawer */}
      <AndroidDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        businessSettings={settings}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        {currentTab === 'storefront' && (
          <StorefrontView
            products={products}
            settings={settings}
            onNavigateToPOS={() => handleSelectTab('pos')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            settings={settings}
            onNavigate={handleSelectTab}
            onNewBill={() => handleSelectTab('pos')}
            onAddProduct={() => handleSelectTab('products')}
            onAddCustomer={() => handleSelectTab('customers')}
            onAddExpense={() => handleSelectTab('expenses')}
            onRefresh={refreshAllData}
            isLoading={false}
            products={products}
            recentSales={sales.slice(0, 5)}
            onOpenInvoice={(sale) => setSelectedSaleForInvoice(sale)}
          />
        )}

        {currentTab === 'pos' && (
          <BillingView
            products={products}
            customers={customers}
            settings={settings}
            onCompleteSale={handleCompleteSale}
            onOpenInvoice={(sale) => setSelectedSaleForInvoice(sale)}
          />
        )}

        {currentTab === 'products' && (
          <ProductsView
            products={products}
            settings={settings}
            onAddProduct={handleAddProduct}
            onUpdateRate={handleUpdateProductRate}
            onAdjustStock={handleAdjustStock}
            searchQuery={searchQuery}
          />
        )}

        {currentTab === 'bills' && (
          <BillHistoryView
            sales={sales}
            settings={settings}
            onOpenInvoice={(sale) => setSelectedSaleForInvoice(sale)}
            onDeleteSale={handleDeleteSale}
            searchQuery={searchQuery}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            sales={sales}
            expenses={expenses}
            settings={settings}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersView
            customers={customers}
            settings={settings}
            onAddCustomer={handleAddCustomer}
            onPayCustomerDue={handlePayCustomerDue}
            searchQuery={searchQuery}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            settings={settings}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}
      </main>

      {/* Android Bottom Navigation Bar */}
      <AndroidBottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        lowStockCount={unreadAlerts}
      />

      {/* Invoice Modal (Printing, Thermal 80mm receipt, WhatsApp & PDF) */}
      {selectedSaleForInvoice && (
        <InvoiceModal
          sale={selectedSaleForInvoice}
          settings={settings}
          onClose={() => setSelectedSaleForInvoice(null)}
          onNewBill={() => {
            setSelectedSaleForInvoice(null);
            handleSelectTab('pos');
          }}
        />
      )}

      {/* Admin Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
export default App;
