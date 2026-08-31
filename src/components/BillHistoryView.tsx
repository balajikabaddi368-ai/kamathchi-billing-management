import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Eye, 
  Printer, 
  Trash2, 
  FileText, 
  ShoppingBag, 
  IndianRupee,
  Wallet,
  Smartphone,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { Sale, BusinessSettings } from '../types';

interface Props {
  sales: Sale[];
  settings: BusinessSettings;
  onOpenInvoice: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => Promise<void>;
  searchQuery: string;
}

export const BillHistoryView: React.FC<Props> = ({
  sales,
  settings,
  onOpenInvoice,
  onDeleteSale,
  searchQuery
}) => {
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<'ALL' | 'CASH' | 'GPAY' | 'CREDIT'>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<string>('');

  const query = (searchQuery || localSearch).toLowerCase();

  const filteredSales = sales.filter(sale => {
    const matchesPayment = selectedPaymentFilter === 'ALL' || sale.paymentMethod === selectedPaymentFilter;
    const matchesDate = !selectedDateFilter || sale.createdAt.startsWith(selectedDateFilter);
    const matchesSearch = !query || 
      sale.billNumber.toLowerCase().includes(query) || 
      sale.customerName.toLowerCase().includes(query) || 
      sale.customerPhone.includes(query) ||
      sale.items.some(i => i.productName.toLowerCase().includes(query));
    return matchesPayment && matchesDate && matchesSearch;
  });

  const totalFilteredRevenue = filteredSales.reduce((sum, s) => sum + s.finalTotal, 0);

  const handleDelete = async (sale: Sale) => {
    if (confirm(`Are you sure you want to cancel Bill #${sale.billNumber} for ₹${sale.finalTotal}? Product stocks will be automatically restored.`)) {
      await onDeleteSale(sale.id);
    }
  };

  return (
    <div className="pb-24 space-y-4 px-3 pt-2 max-w-lg mx-auto">
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bill & Sales History</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg">
            {filteredSales.length} Bills Found
          </span>
        </div>

        {/* Search input if not provided in header */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by Bill #INV-..., customer or item..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
          />
        </div>

        {/* Date Filter & Payment Mode Pills */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1">
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            />
          </div>
          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter('')}
              className="text-[10px] text-rose-600 font-bold px-2 py-1 bg-rose-50 rounded-lg"
            >
              Clear Date
            </button>
          )}
        </div>

        {/* Payment mode filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {(['ALL', 'CASH', 'GPAY', 'CREDIT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedPaymentFilter(mode)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                selectedPaymentFilter === mode
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Total Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
            Selected Bills Total
          </span>
          <p className="text-lg font-black text-emerald-900 dark:text-emerald-100">
            {settings.currencySymbol}{totalFilteredRevenue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="text-right text-[11px] text-emerald-700 dark:text-emerald-300">
          <p className="font-semibold">{filteredSales.length} Invoices</p>
        </div>
      </div>

      {/* Sales List Cards */}
      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No bills found</p>
            <p className="text-[10px] mt-0.5">Try clearing your filters or date range.</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              id={`bill-card-${sale.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                      {sale.billNumber}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      sale.paymentMethod === 'CASH' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      sale.paymentMethod === 'GPAY' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                    {sale.customerName}
                    {sale.customerPhone && <span className="text-[10px] text-slate-400 font-normal ml-1">({sale.customerPhone})</span>}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {settings.currencySymbol}{sale.finalTotal}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(sale.createdAt).toLocaleDateString('en-IN')}{' '}
                    {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Items Summary Line */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700 dark:text-slate-300">Items: </span>
                <span className="truncate">
                  {sale.items.map(i => `${i.productName} (${i.quantity}${i.unit})`).join(', ')}
                </span>
              </div>

              {/* Actions Footer */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  sale.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-50 text-amber-700'
                }`}>
                  Status: {sale.paymentStatus}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-view-invoice-${sale.id}`}
                    onClick={() => onOpenInvoice(sale)}
                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-lg flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View / Print
                  </button>

                  <button
                    id={`btn-delete-sale-${sale.id}`}
                    onClick={() => handleDelete(sale)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Cancel Bill & Restore Stock"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
