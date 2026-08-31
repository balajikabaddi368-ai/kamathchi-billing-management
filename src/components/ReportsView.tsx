import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Printer, 
  Calendar, 
  Droplet, 
  Wheat, 
  Sparkles, 
  IndianRupee,
  PieChart,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Sale, Expense, BusinessSettings } from '../types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  settings: BusinessSettings;
}

export const ReportsView: React.FC<Props> = ({
  sales,
  expenses,
  settings
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filter based on time range
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredSales = sales.filter(s => {
    if (timeRange === 'today') return s.createdAt.startsWith(todayStr);
    if (timeRange === 'week') return s.createdAt >= weekAgo;
    if (timeRange === 'month') return s.createdAt >= monthAgo;
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (timeRange === 'today') return e.date === todayStr;
    if (timeRange === 'week') return e.date >= weekAgo;
    if (timeRange === 'month') return e.date >= monthAgo;
    return true;
  });

  // Calculate Metrics
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.finalTotal, 0);
  const totalPurchaseCost = filteredSales.reduce((sum, s) => sum + (s.purchaseCost || 0), 0);
  const grossProfit = Math.max(0, totalRevenue - totalPurchaseCost);
  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenseAmount;

  // Category Breakdown
  let oilRev = 0, oilCost = 0;
  let flourRev = 0, flourCost = 0;
  let powderRev = 0, powderCost = 0;

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const itemRev = item.total;
      const itemCost = (item.purchaseRate || 0) * item.quantity;
      if (item.category === 'oil') {
        oilRev += itemRev;
        oilCost += itemCost;
      } else if (item.category === 'flour') {
        flourRev += itemRev;
        flourCost += itemCost;
      } else if (item.category === 'powder') {
        powderRev += itemRev;
        powderCost += itemCost;
      }
    });
  });

  const oilProfit = Math.max(0, oilRev - oilCost);
  const flourProfit = Math.max(0, flourRev - flourCost);
  const powderProfit = Math.max(0, powderRev - powderCost);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Bill Number', 'Date', 'Customer', 'Phone', 'Payment Mode', 'Subtotal', 'Discount', 'Tax', 'Final Total', 'Net Profit'];
    const rows = filteredSales.map(s => [
      s.billNumber,
      new Date(s.createdAt).toLocaleDateString('en-IN'),
      `"${s.customerName}"`,
      s.customerPhone,
      s.paymentMethod,
      s.subtotal,
      s.discount,
      s.taxAmount,
      s.finalTotal,
      s.netProfit
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mill_Sales_Report_${timeRange}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="pb-24 space-y-4 px-3 pt-2 max-w-lg mx-auto">
      {/* Time Range Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Report Period
          </h3>
          <div className="flex gap-1">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-300"
              title="Download Excel / CSV"
            >
              <Download className="w-3 h-3" /> CSV
            </button>
            <button
              onClick={handlePrintReport}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
              title="Print Report"
            >
              <Printer className="w-3 h-3" /> Print
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['today', 'week', 'month', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                timeRange === range
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Profit & Loss Statement Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-lg">
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
          Profit & Loss Statement
        </span>
        <h3 className="text-lg font-black mt-1">
          {timeRange === 'today' ? "Today's Profit" : timeRange === 'week' ? "This Week's Profit" : timeRange === 'month' ? "This Month's Profit" : "Cumulative Net Profit"}
        </h3>

        {/* P&L Equation: Revenue - Purchase Cost - Expenses = Net Profit */}
        <div className="mt-3 bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 space-y-2 text-xs">
          <div className="flex justify-between text-emerald-100">
            <span>Total Sales Revenue:</span>
            <span className="font-mono font-bold text-white">
              + {settings.currencySymbol}{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-emerald-200">
            <span>Purchase / Raw Material Cost:</span>
            <span className="font-mono font-medium">
              - {settings.currencySymbol}{totalPurchaseCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-emerald-200">
            <span>Operational & Mill Expenses:</span>
            <span className="font-mono font-medium">
              - {settings.currencySymbol}{totalExpenseAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pt-2 border-t border-white/20 flex justify-between items-center text-sm font-black">
            <span>NET BUSINESS PROFIT:</span>
            <span className={`font-mono text-base ${netProfit >= 0 ? 'text-amber-300' : 'text-rose-300'}`}>
              {settings.currencySymbol}{netProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Category Profit & Revenue Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-600" />
          Category Revenue & Margins
        </h3>

        {/* Oil Products */}
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs">
              <Droplet className="w-4 h-4 text-amber-500" />
              Oil Products (Marachekku)
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Profit: {settings.currencySymbol}{oilProfit.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Revenue: {settings.currencySymbol}{oilRev.toLocaleString('en-IN')}</span>
            <span>Raw Seed Cost: {settings.currencySymbol}{oilCost.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Flour Products */}
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-300/40 dark:border-amber-800/40">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-400 text-xs">
              <Wheat className="w-4 h-4 text-amber-600" />
              Flour Produce (Atta, Rice, Ragi)
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Profit: {settings.currencySymbol}{flourProfit.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Revenue: {settings.currencySymbol}{flourRev.toLocaleString('en-IN')}</span>
            <span>Grain Cost: {settings.currencySymbol}{flourCost.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Food Powder Products */}
        <div className="p-3 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 text-xs">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Food Powders & Masalas
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Profit: {settings.currencySymbol}{powderProfit.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Revenue: {settings.currencySymbol}{powderRev.toLocaleString('en-IN')}</span>
            <span>Spice Cost: {settings.currencySymbol}{powderCost.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Payment Modes Analytics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Payment Modes Split
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cash</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {settings.currencySymbol}
              {filteredSales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.finalTotal, 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">GPay / UPI</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {settings.currencySymbol}
              {filteredSales.filter(s => s.paymentMethod === 'GPAY').reduce((sum, s) => sum + s.finalTotal, 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Credit Due</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {settings.currencySymbol}
              {filteredSales.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, s) => sum + s.finalTotal, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
