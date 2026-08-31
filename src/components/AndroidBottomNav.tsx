import React from 'react';
import { Home, Package, Receipt, BarChart3, FileText } from 'lucide-react';
import { NavTab } from '../types';

export type MainTab = NavTab | 'billing' | 'more' | 'history' | 'inventory';

interface Props {
  activeTab?: string;
  currentTab?: NavTab | string;
  onSelectTab: (tab: any) => void;
  cartCount?: number;
  lowStockCount?: number;
}

export const AndroidBottomNav: React.FC<Props> = ({
  activeTab,
  currentTab,
  onSelectTab,
  cartCount = 0,
  lowStockCount = 0
}) => {
  const active = currentTab || activeTab || 'dashboard';

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; isCenter?: boolean }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'pos', label: 'Billing', icon: Receipt, badge: cartCount > 0 ? cartCount : undefined, isCenter: true },
    { id: 'bills', label: 'Bills', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 fixed bottom-0 left-0 right-0 z-40 px-2 py-1 max-w-md mx-auto shadow-2xl transition-colors">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id || (tab.id === 'pos' && active === 'billing');

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950 scale-105' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}>
                  <Icon className="w-6 h-6" />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-slate-900 text-[11px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[11px] font-bold mt-0.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className="flex-1 py-1 flex flex-col items-center justify-center relative transition-colors focus:outline-none active:scale-95"
            >
              <div className={`relative px-3 py-0.5 rounded-full transition-all ${
                isActive ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
                <Icon className="w-5 h-5" />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 ${
                isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
