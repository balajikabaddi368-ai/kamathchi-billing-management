import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Tag, 
  Calendar, 
  Zap, 
  Truck, 
  Users, 
  Wrench, 
  Package, 
  Home, 
  HelpCircle,
  X,
  IndianRupee
} from 'lucide-react';
import { Expense, BusinessSettings } from '../types';

interface Props {
  expenses: Expense[];
  settings: BusinessSettings;
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const ExpensesView: React.FC<Props> = ({
  expenses,
  settings,
  onAddExpense,
  onDeleteExpense
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electricity' as Expense['category'],
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH' as 'CASH' | 'GPAY' | 'BANK',
    notes: ''
  });

  const categories: Expense['category'][] = [
    'Electricity',
    'Rent',
    'Salary',
    'Transport',
    'Maintenance',
    'Packaging',
    'Raw Material',
    'Other'
  ];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Electricity': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Rent': return <Home className="w-4 h-4 text-blue-500" />;
      case 'Salary': return <Users className="w-4 h-4 text-emerald-500" />;
      case 'Transport': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'Packaging': return <Package className="w-4 h-4 text-teal-500" />;
      default: return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredExpenses = expenses.filter(e => {
    return selectedCategory === 'all' || e.category === selectedCategory;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(formData.amount);
    if (!formData.title || isNaN(amt) || amt <= 0) return;

    await onAddExpense({
      title: formData.title,
      category: formData.category,
      amount: amt,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    });

    setFormData({
      title: '',
      category: 'Electricity',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      notes: ''
    });
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete expense record "${title}"?`)) {
      await onDeleteExpense(id);
    }
  };

  return (
    <div className="pb-24 space-y-4 px-3 pt-2 max-w-lg mx-auto">
      {/* Header & Expense Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mill Expense Tracker</h3>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>

        {/* Total Expense Display */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-300">
              Total Recorded Expenses
            </span>
            <p className="text-lg font-black text-rose-900 dark:text-rose-100">
              {settings.currencySymbol}{totalExpenseAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-lg">
            {filteredExpenses.length} Entries
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            <DollarSign className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No expenses recorded</p>
            <p className="text-[10px] mt-0.5">Track electricity bills, rent, worker salary, and maintenance.</p>
          </div>
        ) : (
          filteredExpenses.map(expense => (
            <div
              key={expense.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getCategoryIcon(expense.category)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {expense.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{expense.category}</span>
                    <span>•</span>
                    <span>{expense.date}</span>
                    <span>•</span>
                    <span className="font-mono">{expense.paymentMethod}</span>
                  </div>
                  {expense.notes && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">{expense.notes}</p>
                  )}
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <span className="text-sm font-black text-rose-600 whitespace-nowrap">
                  - {settings.currencySymbol}{expense.amount}
                </span>
                <button
                  onClick={() => handleDelete(expense.id, expense.title)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                Record New Mill Expense
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Monthly Electricity Bill (TNEB)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(f => ({ ...f, category: e.target.value as any }))}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Amount ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. 2400"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Paid Via
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(f => ({ ...f, paymentMethod: e.target.value as any }))}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="CASH">CASH</option>
                    <option value="GPAY">GPAY / UPI</option>
                    <option value="BANK">BANK NEFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Notes / Voucher No (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Paid to Murugan EB Agent"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
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
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
