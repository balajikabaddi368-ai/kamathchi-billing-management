import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  X, 
  Receipt,
  Edit2
} from 'lucide-react';
import { Customer, BusinessSettings } from '../types';

interface Props {
  customers: Customer[];
  settings: BusinessSettings;
  onAddCustomer: (customer: { name: string; phone: string; address?: string }) => Promise<void>;
  onPayCustomerDue: (customerId: string, amount: number) => Promise<void>;
  searchQuery: string;
}

export const CustomersView: React.FC<Props> = ({
  customers,
  settings,
  onAddCustomer,
  onPayCustomerDue,
  searchQuery
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'due'>('all');
  
  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  // Pay Due Modal
  const [payDueCustomer, setPayDueCustomer] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');

  const query = (searchQuery || localSearch).toLowerCase();

  const filteredCustomers = customers.filter(c => {
    const matchesTab = activeTab === 'all' || (activeTab === 'due' && c.totalDue > 0);
    const matchesSearch = !query || 
      c.name.toLowerCase().includes(query) || 
      c.phone.includes(query) || 
      c.address.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const totalOutstandingDue = customers.reduce((sum, c) => sum + (c.totalDue || 0), 0);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    await onAddCustomer(formData);
    setFormData({ name: '', phone: '', address: '' });
    setIsAddModalOpen(false);
  };

  const handleOpenPayDue = (c: Customer) => {
    setPayDueCustomer(c);
    setPayAmount(String(c.totalDue));
  };

  const handleConfirmPayDue = async () => {
    if (!payDueCustomer) return;
    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0) return;
    await onPayCustomerDue(payDueCustomer.id, amt);
    setPayDueCustomer(null);
  };

  return (
    <div className="pb-24 space-y-4 px-3 pt-2 max-w-lg mx-auto">
      {/* Header Banner & Due Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer & Credit Ledger</h3>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Customer
          </button>
        </div>

        {/* Total Due Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">
              Total Outstanding Customer Dues
            </span>
            <p className="text-lg font-black text-amber-900 dark:text-amber-100">
              {settings.currencySymbol}{totalOutstandingDue.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-lg">
            {customers.filter(c => c.totalDue > 0).length} Overdue Accounts
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by customer name, phone number, address..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'due'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Has Credit Due ({customers.filter(c => c.totalDue > 0).length})
          </button>
        </div>
      </div>

      {/* Customer Cards List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map(cust => (
            <div
              key={cust.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {cust.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Phone className="w-3 h-3 text-slate-400" /> {cust.phone || 'No phone'}
                    </span>
                  </div>
                  {cust.address && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {cust.address}
                    </p>
                  )}
                </div>

                {cust.totalDue > 0 ? (
                  <div className="text-right bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                    <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-300 block">
                      Outstanding Due
                    </span>
                    <span className="text-sm font-black text-rose-600">
                      {settings.currencySymbol}{cust.totalDue}
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> No Dues
                    </span>
                  </div>
                )}
              </div>

              {/* Purchase History stats */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Purchases</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    {settings.currencySymbol}{cust.totalPurchases.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Bills Count</span>
                  <p className="font-extrabold text-slate-700 dark:text-slate-300">
                    {cust.billsCount} Bills
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Last Purchased</span>
                  <p className="font-medium text-slate-600 dark:text-slate-400 text-[11px]">
                    {cust.lastPurchaseDate || '-'}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              {cust.totalDue > 0 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleOpenPayDue(cust)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    Record Due Payment
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ======================================= */}
      {/* 1. ADD NEW CUSTOMER MODAL               */}
      {/* ======================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Add New Customer Profile
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Customer / Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ramesh Kumar / Annapoorna Mess"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 9840123456"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Shop Address / Location
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. No 14, Gandhi Bazaar, Trichy"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. RECORD DUE PAYMENT MODAL             */}
      {/* ======================================= */}
      {payDueCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                Record Credit Due Payment
              </h3>
              <button onClick={() => setPayDueCustomer(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{payDueCustomer.name}</p>
              <p className="text-[11px] text-slate-500">Ph: {payDueCustomer.phone}</p>
              <div className="mt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Pending Due:</span>
                <span className="font-extrabold text-rose-600 text-sm">{settings.currencySymbol}{payDueCustomer.totalDue}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Amount Received ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  max={payDueCustomer.totalDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={String(payDueCustomer.totalDue)}
                  className="w-full px-3 py-2 text-base font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPayAmount(String(payDueCustomer.totalDue))}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-300"
                >
                  Pay Full ({settings.currencySymbol}{payDueCustomer.totalDue})
                </button>
                {payDueCustomer.totalDue > 1000 && (
                  <button
                    type="button"
                    onClick={() => setPayAmount('1000')}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
                  >
                    ₹1,000
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayDueCustomer(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayDue}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                Mark Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
