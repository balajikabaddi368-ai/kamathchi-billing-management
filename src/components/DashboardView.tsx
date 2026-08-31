import React from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Wallet, 
  Smartphone, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Package, 
  PlusCircle, 
  FileText, 
  Boxes, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Droplet,
  Wheat,
  Percent,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { DashboardStats, Product, Sale, BusinessSettings } from '../types';
import { MainTab } from './AndroidBottomNav';

interface Props {
  stats?: DashboardStats | null;
  settings: BusinessSettings;
  onNavigate: (tab: any, subview?: string) => void;
  onNewBill?: () => void;
  onAddProduct?: () => void;
  onAddCustomer?: () => void;
  onAddExpense?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  products?: Product[];
  recentSales?: Sale[];
  onOpenInvoice?: (sale: Sale) => void;
}

export const DashboardView: React.FC<Props> = ({
  stats,
  settings,
  onNavigate,
  onNewBill,
  onAddProduct,
  onAddCustomer,
  onAddExpense,
  onRefresh,
  isLoading = false
}) => {
  const today = stats?.today || {
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
  };

  const inventory = stats?.inventory || {
    totalProducts: 0,
    lowStockCount: 0,
    lowStockItems: [],
    totalStockValue: 0,
    totalPurchaseValue: 0
  };

  const topSellingProducts = stats?.topSellingProducts || [];
  const totalOutstandingDue = stats?.totalOutstandingDue || 0;

  const totalCatSales = (today.oilSales || 0) + (today.flourSales || 0) + (today.powderSales || 0) || 1;
  const oilPercent = Math.round(((today.oilSales || 0) / totalCatSales) * 100);
  const flourPercent = Math.round(((today.flourSales || 0) / totalCatSales) * 100);
  const powderPercent = Math.max(0, 100 - oilPercent - flourPercent);

  return (
    <div className="pb-24 space-y-4 px-3 pt-2 max-w-lg mx-auto">
      {/* Business Banner Greeting */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
          <Droplet className="w-36 h-36" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-800/80 px-2 py-0.5 rounded-md text-emerald-200">
              Live Business Overview
            </span>
            <h2 className="text-xl font-extrabold mt-1">Today's Performance</h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button
            id="btn-refresh-dashboard"
            onClick={onRefresh}
            className={`p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-all ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Big Today Sales & Profit Counter */}
        <div className="mt-3.5 pt-3 border-t border-emerald-500/40 grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-emerald-200 font-medium">Today's Total Sales</span>
            <div className="text-2xl font-black tracking-tight text-white flex items-center">
              <span>{settings.currencySymbol}</span>
              <span>{today.totalSales.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] text-emerald-200/90 flex items-center gap-1 mt-0.5">
              <ShoppingBag className="w-3 h-3" /> {today.billsCount} Bills Generated
            </span>
          </div>
          <div className="border-l border-emerald-500/40 pl-3">
            <span className="text-[11px] text-emerald-200 font-medium">Estimated Net Profit</span>
            <div className={`text-2xl font-black tracking-tight flex items-center ${today.netProfit >= 0 ? 'text-amber-300' : 'text-rose-300'}`}>
              <span>{settings.currencySymbol}</span>
              <span>{today.netProfit.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] text-emerald-200/90 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> After all expenses
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Android Grid) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Quick Business Actions
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            id="action-new-bill"
            onClick={() => onNewBill ? onNewBill() : onNavigate('pos')}
            className="flex flex-col items-center justify-center p-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 transition-all active:scale-95 group"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold mt-1.5 text-center">New Bill</span>
          </button>

          <button
            id="action-storefront-shop"
            onClick={() => onNavigate('storefront')}
            className="flex flex-col items-center justify-center p-2.5 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-300 transition-all active:scale-95 group border border-amber-300/40 dark:border-amber-700/30"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold mt-1.5 text-center">Online Shop</span>
          </button>

          <button
            id="action-add-expense"
            onClick={() => onAddExpense ? onAddExpense() : onNavigate('expenses')}
            className="flex flex-col items-center justify-center p-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-rose-700 dark:text-rose-300 transition-all active:scale-95 group"
          >
            <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold mt-1.5 text-center">Add Expense</span>
          </button>

          <button
            id="action-view-sales"
            onClick={() => onNavigate('bills')}
            className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-[11px] font-semibold">View Sales</span>
          </button>

          <button
            id="action-view-stock"
            onClick={() => onNavigate('products')}
            className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          >
            <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1" />
            <span className="text-[11px] font-semibold">View Stock</span>
          </button>

          <button
            id="action-add-customer"
            onClick={() => onAddCustomer ? onAddCustomer() : onNavigate('customers')}
            className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          >
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
            <span className="text-[11px] font-semibold">Customers</span>
          </button>
        </div>
      </div>

      {/* Mara Chekku Traditional Oil Mill Machine Showcase Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-md text-white border border-amber-900/40">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/chekku_oil_machine.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-amber-950/70" />

        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Mara Chekku Cold Press
            </span>
            <span className="text-[11px] text-amber-200 font-semibold">
              Wood Pressed • 100% Pure
            </span>
          </div>

          <h3 className="text-base font-black mt-2 leading-snug">
            Traditional Cold Pressed Extraction & Direct Milling
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            Groundnut, Sesame, Coconut & Mustard oils extracted in Vagai wood pestle at below 40°C preserving vitamins & natural aroma.
          </p>

          <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>E-Commerce Catalog Ready</span>
            </div>
            <button
              id="btn-dash-open-storefront"
              onClick={() => onNavigate('storefront')}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all active:scale-95 shadow-xs flex items-center gap-1"
            >
              <span>View Online Store</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modes Split & Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cash Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Cash Sales</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {settings.currencySymbol}{today.cashSales.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Direct Counter Cash</p>
        </div>

        {/* GPay Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">GPay / UPI</span>
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {settings.currencySymbol}{today.gpaySales.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">UPI QR Received</p>
        </div>

        {/* Today Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Today Expenses</span>
            <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {settings.currencySymbol}{today.expenses.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Mill & packing costs</p>
        </div>

        {/* Customer Dues Alert */}
        <div 
          onClick={() => onNavigate('customers')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Customer Dues</span>
            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {settings.currencySymbol}{totalOutstandingDue.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            Credit Ledger <ArrowUpRight className="w-3 h-3 text-amber-500" />
          </p>
        </div>
      </div>

      {/* Inventory & Low Stock Alert Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Valuation</h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
            {inventory.totalProducts} Active Products
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-3">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Selling Stock Value</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">
              {settings.currencySymbol}{inventory.totalStockValue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
            <span className="text-[11px] text-slate-400 font-medium">Purchase Cost Value</span>
            <p className="text-base font-extrabold text-slate-700 dark:text-slate-300">
              {settings.currencySymbol}{inventory.totalPurchaseValue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {inventory.lowStockCount > 0 ? (
          <div 
            onClick={() => onNavigate('products')}
            className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black animate-bounce">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {inventory.lowStockCount} Products in Low Stock!
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  Tap to review & replenish raw materials
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-700 dark:text-amber-300" />
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All oil, flour, and spices stocks are above minimum threshold.</span>
          </div>
        )}
      </div>

      {/* Category Sales Distribution (Oil vs Flour vs Powder) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Today's Category Revenue
        </h3>
        <p className="text-xs text-slate-400 mb-3">Breakdown by Oil, Flour & Spice Powders</p>

        {/* Visual Progress Bars */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3 shadow-inner">
          <div 
            style={{ width: `${oilPercent}%` }} 
            className="bg-amber-500 h-full transition-all duration-500" 
            title={`Oil: ${oilPercent}%`}
          />
          <div 
            style={{ width: `${flourPercent}%` }} 
            className="bg-amber-700 h-full transition-all duration-500" 
            title={`Flour: ${flourPercent}%`}
          />
          <div 
            style={{ width: `${powderPercent}%` }} 
            className="bg-rose-500 h-full transition-all duration-500" 
            title={`Food Powder: ${powderPercent}%`}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400 font-bold mb-0.5">
              <Droplet className="w-3 h-3" /> Oil
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white block">
              {settings.currencySymbol}{(today.oilSales || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">{oilPercent}%</span>
          </div>

          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/50 dark:border-amber-800/50">
            <div className="flex items-center justify-center gap-1 text-amber-800 dark:text-amber-500 font-bold mb-0.5">
              <Wheat className="w-3 h-3" /> Flour
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white block">
              {settings.currencySymbol}{(today.flourSales || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">{flourPercent}%</span>
          </div>

          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center justify-center gap-1 text-rose-700 dark:text-rose-400 font-bold mb-0.5">
              <Sparkles className="w-3 h-3" /> Spices
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white block">
              {settings.currencySymbol}{(today.powderSales || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">{powderPercent}%</span>
          </div>
        </div>
      </div>

      {/* Top 5 Selling Products */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top 5 Best Selling Items</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Based on Bill Volumes</span>
        </div>

        {topSellingProducts && topSellingProducts.length > 0 ? (
          <div className="space-y-2">
            {topSellingProducts.map((prod, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    idx === 0 ? 'bg-amber-400 text-slate-900' :
                    idx === 1 ? 'bg-slate-300 text-slate-800' :
                    idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {prod.name}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                      {prod.category}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {settings.currencySymbol}{prod.revenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {prod.qty} Units Sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No sales recorded yet today.</p>
        )}
      </div>
    </div>
  );
};
