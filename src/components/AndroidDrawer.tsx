import React from 'react';
import { 
  X, 
  Home, 
  Package, 
  Receipt, 
  FileText, 
  Users, 
  DollarSign, 
  Boxes, 
  BarChart3, 
  Settings, 
  Download, 
  ShieldCheck, 
  Droplet, 
  Wheat, 
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { BusinessSettings, UserSession, NavTab } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings?: BusinessSettings;
  businessSettings?: BusinessSettings;
  user?: UserSession | null;
  currentUser?: { username: string; role: string } | null;
  onNavigate?: (tab: any, subview?: string) => void;
  onSelectTab?: (tab: NavTab) => void;
  currentTab?: NavTab;
  onOpenAuth?: () => void;
  onOpenLogin?: () => void;
  onLogout: () => void;
}

export const AndroidDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  businessSettings,
  user,
  currentUser,
  onNavigate,
  onSelectTab,
  onOpenAuth,
  onOpenLogin,
  onLogout
}) => {
  if (!isOpen) return null;

  const currentSettings = settings || businessSettings || {
    businessName: 'SRI KAMATHCHI OILL & FLOUR MILL',
    tagline: 'Pure Traditional Oils, Flours & Spices',
    address: 'Gandhi Market, Tamil Nadu',
    phone: '+91 98401 23456',
    email: 'srikamathchioill@gmail.com',
    gstNumber: '33AAAAA0000A1Z5',
    upiId: 'srikamathchioill@okaxis',
    currencySymbol: '₹',
    defaultGstPercent: 5,
    taxEnabled: true,
    invoiceFooter: 'Thank you for supporting traditional mill produce!'
  };

  const activeUser = user || currentUser;

  const handleLink = (tab: any, subview?: string) => {
    let targetTab: NavTab = 'dashboard';
    if (tab === 'dashboard' || tab === 'home') targetTab = 'dashboard';
    else if (tab === 'billing' || tab === 'pos') targetTab = 'pos';
    else if (tab === 'products') targetTab = 'products';
    else if (tab === 'bills' || subview === 'history') targetTab = 'bills';
    else if (tab === 'reports') targetTab = 'reports';
    else if (tab === 'customers' || subview === 'customers') targetTab = 'customers';
    else if (tab === 'expenses' || subview === 'expenses') targetTab = 'expenses';
    else if (tab === 'settings' || subview === 'settings' || subview === 'backup') targetTab = 'settings';
    else if (tab === 'inventory' || subview === 'inventory') targetTab = 'products';
    
    if (onSelectTab) onSelectTab(targetTab);
    else if (onNavigate) onNavigate(targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 transition-transform animate-in slide-in-from-left duration-200">
        {/* Drawer Header Banner */}
        <div className="p-5 bg-emerald-950 text-white relative overflow-hidden">
          {/* Authentic Chekku Machine Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
            style={{ backgroundImage: `url('/images/chekku_oil_machine.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/80 to-transparent" />

          <button
            id="btn-close-drawer"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors relative z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={currentSettings.logo || '/images/chekku_oil_machine.jpg'} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">{currentSettings.businessName}</h2>
              <p className="text-xs text-amber-300 mt-0.5 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Mara Chekku Cold Press
              </p>
            </div>
          </div>

          <div className="relative z-10 text-xs text-emerald-100 bg-emerald-900/60 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 flex items-center justify-between">
            <span className="truncate">{activeUser ? (('name' in activeUser) ? activeUser.name : activeUser.username) : 'Staff / Cashier'}</span>
            <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
              {activeUser ? activeUser.role : 'ADMIN'}
            </span>
          </div>
        </div>

        {/* Drawer Scrollable Links */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
          
          {/* E-Commerce Storefront Link */}
          <button
            id="drawer-link-storefront"
            onClick={() => handleLink('storefront')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold transition-colors text-left border border-amber-400/30 mb-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Online Storefront</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Customer Shop & WhatsApp Orders</p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-extrabold">
              SHOP
            </span>
          </button>

          <p className="px-3 py-1 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Main Operations
          </p>

          <button
            id="drawer-link-home"
            onClick={() => handleLink('dashboard')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">Dashboard Overview</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="drawer-link-billing"
            onClick={() => handleLink('pos')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Voice POS Billing</span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
              Fast
            </span>
          </button>

          <button
            id="drawer-link-history"
            onClick={() => handleLink('bills')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Bill History & Invoices</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Product Catalogs
          </p>

          <button
            id="drawer-link-oil"
            onClick={() => handleLink('products', 'oil')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Droplet className="w-4 h-4 text-amber-500" />
              <span>Oil Products (Chekku)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="drawer-link-flour"
            onClick={() => handleLink('products', 'flour')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Wheat className="w-4 h-4 text-amber-600" />
              <span>Flour Products (Atta, Rice)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="drawer-link-powder"
            onClick={() => handleLink('products', 'powder')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Food Powders & Masalas</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Finance & Stock
          </p>

          <button
            id="drawer-link-customers"
            onClick={() => handleLink('customers')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Customers & Credit Ledger</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="drawer-link-expenses"
            onClick={() => handleLink('expenses')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <span>Expense Management</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="drawer-link-inventory"
            onClick={() => handleLink('products')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4 text-indigo-500" />
              <span>Inventory & Stock Log</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="drawer-link-reports"
            onClick={() => handleLink('reports')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-teal-500" />
              <span>Profit & Loss / Reports</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            System & Admin
          </p>

          <button
            id="drawer-link-settings"
            onClick={() => handleLink('settings')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Business Settings & GST</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="drawer-link-backup"
            onClick={() => handleLink('settings')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-slate-500" />
              <span>Database Backup & Restore</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          {activeUser ? (
            <button
              id="drawer-btn-logout"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out from Admin
            </button>
          ) : (
            <button
              id="drawer-btn-login"
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else if (onOpenAuth) onOpenAuth();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Login
            </button>
          )}
          <p className="text-center text-[10px] text-slate-400 mt-2">
            v2.4.0 • Sri Lakshmi Mill POS
          </p>
        </div>
      </div>
    </div>
  );
};
