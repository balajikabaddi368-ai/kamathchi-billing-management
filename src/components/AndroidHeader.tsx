import React from 'react';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  Smartphone, 
  Monitor, 
  Search, 
  LogOut,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  ShoppingBag,
  Store
} from 'lucide-react';
import { UserSession, NavTab } from '../types';

interface Props {
  title?: string;
  businessName?: string;
  onOpenDrawer: () => void;
  lowStockCount?: number;
  unreadAlertsCount?: number;
  onOpenLowStock?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isPhoneFrame?: boolean;
  onTogglePhoneFrame?: () => void;
  user?: UserSession | null;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showSearch?: boolean;
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onOpenPOS?: () => void;
}

export const AndroidHeader: React.FC<Props> = ({
  title,
  businessName,
  onOpenDrawer,
  lowStockCount,
  unreadAlertsCount,
  onOpenLowStock,
  isDarkMode,
  onToggleDarkMode,
  isPhoneFrame = false,
  onTogglePhoneFrame,
  user,
  currentUser,
  onLogout,
  searchQuery,
  onSearchChange,
  showSearch = true,
  currentTab,
  onSelectTab,
  onOpenPOS
}) => {
  const [currentTime, setCurrentTime] = React.useState('');
  const activeUser = user || currentUser;
  const alertCount = lowStockCount ?? unreadAlertsCount ?? 0;
  const displayTitle = businessName || title || 'SRI KAMATHCHI OILL & FLOUR MILL';

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isStorefront = currentTab === 'storefront';

  return (
    <header className="relative overflow-hidden bg-emerald-800 dark:bg-emerald-950 text-white shadow-md sticky top-0 z-40 transition-colors">
      {/* Background ambient Chekku Machine Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none mix-blend-luminosity"
        style={{ backgroundImage: `url('/images/chekku_oil_machine.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/85 to-amber-950/80 pointer-events-none" />

      {/* Android Status Bar */}
      <div className="relative z-10 px-4 py-1 flex items-center justify-between text-[11px] font-medium tracking-wider text-emerald-100/90 border-b border-emerald-600/40">
        <span className="font-semibold">{currentTime || '10:30 AM'}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-1 bg-emerald-800/60 rounded">5G</span>
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            id="btn-open-drawer"
            onClick={onOpenDrawer}
            className="p-2 -ml-1 rounded-full hover:bg-emerald-600/50 active:bg-emerald-800/80 transition-colors"
            title="Open Menu Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base md:text-lg leading-tight tracking-tight flex items-center gap-1.5">
              <span>{displayTitle}</span>
            </h1>
            <p className="text-[10px] text-emerald-200 truncate max-w-[170px] sm:max-w-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Traditional Wood Cold Press Mill</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1">
          {/* E-Commerce Storefront Mode Switcher */}
          {onSelectTab && (
            <button
              id="btn-header-storefront-toggle"
              onClick={() => onSelectTab(isStorefront ? 'dashboard' : 'storefront')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isStorefront
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30'
              }`}
              title={isStorefront ? 'Switch to Staff Management / POS' : 'Switch to Customer Online Storefront'}
            >
              {isStorefront ? <Store className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />}
              <span className="hidden sm:inline">{isStorefront ? 'Staff POS' : 'Online Shop'}</span>
            </button>
          )}

          {/* Low Stock Alert Button */}
          <button
            id="btn-header-low-stock"
            onClick={onOpenLowStock}
            className="p-2 relative rounded-full hover:bg-emerald-600/50 active:bg-emerald-800 transition-colors"
            title={`${alertCount} Low stock items`}
          >
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 text-slate-900 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {alertCount}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="btn-header-theme-toggle"
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-emerald-600/50 active:bg-emerald-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Desktop Frame Toggle */}
          {onTogglePhoneFrame && (
            <button
              id="btn-header-frame-toggle"
              onClick={onTogglePhoneFrame}
              className="hidden md:flex p-2 rounded-full hover:bg-emerald-600/50 active:bg-emerald-800 transition-colors"
              title={isPhoneFrame ? 'Switch to Full Screen Desktop View' : 'Switch to Android Mobile Device View'}
            >
              {isPhoneFrame ? <Monitor className="w-5 h-5 text-emerald-200" /> : <Smartphone className="w-5 h-5" />}
            </button>
          )}

          {/* User Profile / Logout */}
          {activeUser && onLogout ? (
            <button
              id="btn-header-logout"
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-emerald-600/50 text-emerald-200 hover:text-white transition-colors"
              title={`Logged in as ${'name' in activeUser ? activeUser.name : activeUser.username} - Tap to Logout`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Global Quick Search Bar (Collapsible or in specific tabs) */}
      {showSearch && (
        <div className="relative z-10 px-4 pb-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200" />
            <input
              id="input-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search groundnut oil, wheat flour, sambar powder..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-emerald-800/80 dark:bg-emerald-950/70 border border-emerald-600/50 rounded-xl text-white placeholder-emerald-200/70 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
