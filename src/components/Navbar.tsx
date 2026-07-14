import React from 'react';
import { ShoppingBag, Settings, Truck, Sparkles, User, LogOut, Globe, PhoneCall } from 'lucide-react';
import { CurrencyCode } from '../utils/currency';
import { UserSession, BoutiqueSettings } from '../types';

interface NavbarProps {
  settings?: BoutiqueSettings;
  activeView: string;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onCartClick: () => void;
  onTrackOrderClick: () => void;
  onAdminClick: () => void;
  onShopClick: () => void;
  onPortalClick: () => void;
  onContactClick: () => void;
  cartCount: number;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  userSession: UserSession | null;
  isAdminLoggedIn: boolean;
  onAuthClick: () => void;
  onLogoutClick: () => void;
  categories?: string[];
}

export default function Navbar({
  settings,
  activeView,
  selectedCategory,
  onCategorySelect,
  onCartClick,
  onTrackOrderClick,
  onAdminClick,
  onShopClick,
  onPortalClick,
  onContactClick,
  cartCount,
  currency,
  onCurrencyChange,
  userSession,
  isAdminLoggedIn,
  onAuthClick,
  onLogoutClick,
  categories = ['All', 'Cosmetics', 'Clothing', 'Kits', 'Jewelry', 'Accessories']
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-clay/60 shadow-sm transition-all duration-300">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Main Buttons Flex Container */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 min-w-0">
            {/* Logo Section */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={onShopClick}>
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.shopName || 'Boutique Logo'} 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-clay"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dark text-white shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 h-5 text-brand animate-pulse" />
                </div>
              )}
              <div className="min-w-0">
                <span className="font-sans text-sm sm:text-lg lg:text-xl font-black tracking-tight uppercase text-dark block truncate">
                  {settings?.shopName || 'Mahi Creations'}
                </span>
                <p className="text-[6px] sm:text-[8px] uppercase tracking-[0.25em] text-neutral-400 font-bold -mt-0.5 block truncate">
                  Luxury Boutique
                </p>
              </div>
            </div>

            {/* Middle Nav Buttons (Home, Track Order, Contact Us) */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 shrink-0">
              <button
                onClick={onShopClick}
                className={`text-[11px] lg:text-xs font-black uppercase tracking-widest transition-all duration-200 py-2 px-3.5 rounded-xl cursor-pointer ${
                  activeView === 'shop' 
                    ? 'bg-dark text-white shadow-sm' 
                    : 'text-neutral-600 hover:text-dark hover:bg-clay-light/40'
                }`}
              >
                Home
              </button>
              
              <button
                onClick={onTrackOrderClick}
                className={`text-[11px] lg:text-xs font-black uppercase tracking-widest transition-all duration-200 py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'tracker' 
                    ? 'bg-dark text-white shadow-sm' 
                    : 'text-neutral-600 hover:text-dark hover:bg-clay-light/40'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>

              <button
                onClick={onContactClick}
                className="text-[11px] lg:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-brand transition-all duration-200 py-2 px-3.5 rounded-xl hover:bg-clay-light/40 cursor-pointer"
              >
                Contact Us
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={onAdminClick}
                  className={`text-[11px] lg:text-xs font-black uppercase tracking-widest transition-all duration-200 py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer ${
                    activeView === 'admin' 
                      ? 'bg-brand text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-brand hover:bg-clay-light/40'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Admin</span>
                </button>
              )}

              {userSession && (
                <button
                  onClick={onPortalClick}
                  className={`text-[11px] lg:text-xs font-black uppercase tracking-widest transition-all duration-200 py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer ${
                    activeView === 'portal' 
                      ? 'bg-dark text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-brand hover:bg-clay-light/40'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>VIP Portal</span>
                </button>
              )}
            </div>
          </div>

          {/* Right utility items: Currency, Cart & ONLY Login/Signout */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Advanced Country & Currency Selector with Auto-Detect */}
            <div className="flex items-center">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-bg-warm/75 hover:bg-clay-light px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-clay text-[9px] sm:text-xs font-bold text-dark focus:outline-none cursor-pointer tracking-wider transition-all"
                title="Select Shipping Country & Active Currency"
              >
                {(settings?.enabledCurrencies && settings.enabledCurrencies.length > 0 ? settings.enabledCurrencies : ['AED']).map(code => {
                  if (code === 'NPR') return <option key={code} value="NPR">🇳🇵 NPR</option>;
                  if (code === 'AED') return <option key={code} value="AED">🇦🇪 AED</option>;
                  if (code === 'INR') return <option key={code} value="INR">🇮🇳 INR</option>;
                  if (code === 'USD') return <option key={code} value="USD">🇺🇸 USD</option>;
                  if (code === 'EUR') return <option key={code} value="EUR">🇪🇺 EUR</option>;
                  return null;
                })}
              </select>
            </div>

            {/* Main authentication trigger */}
            {isAdminLoggedIn || userSession ? (
              <button
                onClick={onLogoutClick}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1 cursor-pointer text-[9px] sm:text-[10px] font-bold"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-dark hover:bg-brand text-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1 cursor-pointer text-[9px] sm:text-[10px] font-bold"
              >
                <User className="w-3 h-3 text-brand" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* Cart Icon */}
            <button
              onClick={onCartClick}
              id="cart-button"
              className="relative p-1.5 sm:p-2 text-dark hover:text-brand hover:bg-clay-light rounded-full transition-all duration-300 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-brand text-[8px] sm:text-[9px] font-bold text-white ring-2 ring-white animate-fade-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation Sticky Bar - Responsive and Compact */}
      {activeView !== 'admin' && (
        <div className="md:hidden flex items-center justify-around border-t border-clay-light py-2 bg-white/95 font-sans text-[9px] font-bold tracking-wider text-neutral-500">
          <button
            onClick={onShopClick}
            className={`flex flex-col items-center gap-0.5 py-1 px-1.5 cursor-pointer ${
              activeView === 'shop' ? 'text-brand' : 'text-neutral-500'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeView === 'shop' ? 'text-brand' : 'text-neutral-400'}`} />
            <span>HOME</span>
          </button>
          
          <div className="h-4 w-[1px] bg-clay/50"></div>
          
          <button
            onClick={onTrackOrderClick}
            className={`flex flex-col items-center gap-0.5 py-1 px-1.5 cursor-pointer ${
              activeView === 'tracker' ? 'text-brand' : 'text-neutral-500'
            }`}
          >
            <Truck className={`w-4 h-4 ${activeView === 'tracker' ? 'text-brand' : 'text-neutral-400'}`} />
            <span>TRACK</span>
          </button>
          
          <div className="h-4 w-[1px] bg-clay/50"></div>

          <button
            onClick={onContactClick}
            className="flex flex-col items-center gap-0.5 py-1 px-1.5 cursor-pointer text-neutral-500 hover:text-brand"
          >
            <PhoneCall className="w-4 h-4 text-neutral-400 hover:text-brand" />
            <span>CONTACT</span>
          </button>
          
          {(isAdminLoggedIn || userSession) && (
            <>
              <div className="h-4 w-[1px] bg-clay/50"></div>
              <button
                onClick={isAdminLoggedIn ? onAdminClick : onPortalClick}
                className="flex flex-col items-center gap-0.5 py-1 px-1.5 cursor-pointer text-neutral-500 hover:text-brand"
              >
                <User className="w-4 h-4 text-neutral-400" />
                <span>{isAdminLoggedIn ? 'ADMIN' : 'PORTAL'}</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
