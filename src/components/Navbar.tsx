import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Settings, Truck, Sparkles, User, LogOut, Search, X, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
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
  categories = ['All', 'Cosmetics', 'Clothing', 'Kits', 'Jewelry', 'Accessories'],
  searchQuery = '',
  onSearchChange
}: NavbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopFocused, setIsDesktopFocused] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  // Auto focus mobile search input when expanded
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 50);
    }
  }, [isMobileSearchOpen]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileSearchOpen) setIsMobileSearchOpen(false);
        if (isDesktopFocused) setIsDesktopFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSearchOpen, isDesktopFocused]);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-clay/60 shadow-sm transition-all duration-300 relative">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 relative">
          
          {/* Logo & Main Buttons Flex Container */}
          <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 min-w-0">
            {/* Logo Section */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={onShopClick}>
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.shopName || 'Boutique Logo'} 
                  className="max-h-8 sm:max-h-11 w-auto max-w-[100px] sm:max-w-[160px] object-contain border border-clay/40 rounded-lg p-0.5 bg-white shrink-0 shadow-sm transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dark text-white shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 h-5 text-brand animate-pulse" />
                </div>
              )}
              <div className="min-w-0">
                <span className="font-sans text-xs sm:text-lg lg:text-xl font-black tracking-tight uppercase text-dark block truncate">
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
            </div>
          </div>

          {/* Center/Right Desktop Expanding Search Bar & Utilities */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Desktop Expanding Search Bar */}
            <div className="hidden sm:block relative">
              <motion.div
                initial={false}
                animate={{
                  width: isDesktopFocused || searchQuery ? 260 : 150,
                }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className={`flex items-center rounded-full border transition-all duration-300 py-1.5 px-3 bg-bg-warm/80 hover:bg-white ${
                  isDesktopFocused || searchQuery 
                    ? 'border-brand/70 shadow-sm bg-white ring-2 ring-brand/15' 
                    : 'border-clay/80'
                }`}
              >
                <Search className={`w-3.5 h-3.5 shrink-0 transition-colors ${isDesktopFocused || searchQuery ? 'text-brand' : 'text-neutral-400'}`} />
                <input
                  ref={desktopInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsDesktopFocused(true)}
                  onBlur={() => {
                    if (!searchQuery) setIsDesktopFocused(false);
                  }}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent ml-2 text-xs font-medium text-dark placeholder-neutral-400 focus:outline-none truncate"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      onSearchChange?.('');
                      desktopInputRef.current?.focus();
                    }}
                    className="p-0.5 text-neutral-400 hover:text-dark shrink-0 cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            </div>

            {/* Mobile Expanding Search Icon Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className={`sm:hidden p-1.5 rounded-full transition-all duration-300 relative cursor-pointer ${
                searchQuery 
                  ? 'bg-brand/10 text-brand border border-brand/30' 
                  : 'text-dark hover:bg-clay-light'
              }`}
              aria-label="Search Products"
              title="Search Boutique"
            >
              <Search className="w-4.5 h-4.5" />
              {searchQuery && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-white" />
              )}
            </button>

            {/* Country & Currency Selector */}
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

            {/* Admin Button (when logged in as admin) */}
            {isAdminLoggedIn && (
              <button
                onClick={onAdminClick}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-200 py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-full flex items-center gap-1 cursor-pointer border ${
                  activeView === 'admin' 
                    ? 'bg-brand text-white border-brand shadow-sm shadow-brand/25' 
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-clay/60 hover:text-brand'
                }`}
              >
                <Settings className="w-3 h-3 animate-spin-slow" />
                <span className="hidden min-[380px]:inline">Admin</span>
              </button>
            )}

            {/* VIP Portal Button (Only when logged in) */}
            {userSession && (
              <button
                onClick={onPortalClick}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-200 py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-full flex items-center gap-1 cursor-pointer border ${
                  activeView === 'portal' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-900 border-amber-400 font-extrabold shadow-sm' 
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/60 hover:border-amber-400/50'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="hidden min-[420px]:inline">VIP Portal</span>
              </button>
            )}

            {/* Main authentication trigger */}
            {isAdminLoggedIn || userSession ? (
              <button
                onClick={onLogoutClick}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1 cursor-pointer text-[9px] sm:text-[10px] font-bold border border-rose-200/40"
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

          {/* MOBILE FULL-WIDTH SMOOTH EXPANDING SEARCH OVERLAY */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.9, y: -2 }}
                animate={{ opacity: 1, scaleX: 1, y: 0 }}
                exit={{ opacity: 0, scaleX: 0.9, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="absolute inset-x-2 top-2 bottom-2 z-50 flex items-center bg-white rounded-2xl border-2 border-brand/60 shadow-xl px-3 gap-2 origin-right"
              >
                <Search className="w-4 h-4 text-brand shrink-0 animate-pulse" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsMobileSearchOpen(false);
                    }
                  }}
                  placeholder="Search sarees, cosmetics, makeup..."
                  className="w-full bg-transparent text-xs font-semibold text-dark placeholder-neutral-400 focus:outline-none py-1"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      onSearchChange?.('');
                      mobileInputRef.current?.focus();
                    }}
                    className="p-1 text-neutral-400 hover:text-dark rounded-full cursor-pointer shrink-0"
                    title="Clear text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Mobile Sub-Navigation Sticky Bar - Responsive Fixed Bottom Navigation (App-like Design) */}
      {activeView !== 'admin' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-clay-light py-2.5 px-2 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)] font-sans text-[9px] font-bold tracking-wider text-neutral-500">
          {/* Home Tab */}
          <button
            onClick={onShopClick}
            className={`flex flex-col items-center gap-1 py-0.5 px-2 transition-all duration-300 relative cursor-pointer ${
              activeView === 'shop' ? 'text-brand scale-105' : 'text-neutral-500 hover:text-dark'
            }`}
          >
            <Sparkles className={`w-5 h-5 transition-all ${activeView === 'shop' ? 'text-brand stroke-[2.2]' : 'text-neutral-400'}`} />
            <span className="text-[9px] font-black uppercase">HOME</span>
            {activeView === 'shop' && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand" />
            )}
          </button>
          
          {/* Track Tab */}
          <button
            onClick={onTrackOrderClick}
            className={`flex flex-col items-center gap-1 py-0.5 px-2 transition-all duration-300 relative cursor-pointer ${
              activeView === 'tracker' ? 'text-brand scale-105' : 'text-neutral-500 hover:text-dark'
            }`}
          >
            <Truck className={`w-5 h-5 transition-all ${activeView === 'tracker' ? 'text-brand stroke-[2.2]' : 'text-neutral-400'}`} />
            <span className="text-[9px] font-black uppercase">TRACK</span>
            {activeView === 'tracker' && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand" />
            )}
          </button>

          {/* Search Mobile Bottom Quick Action */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(true);
            }}
            className={`flex flex-col items-center gap-1 py-0.5 px-2 transition-all duration-300 relative cursor-pointer ${
              isMobileSearchOpen || searchQuery ? 'text-brand scale-105' : 'text-neutral-500 hover:text-dark'
            }`}
          >
            <div className="relative">
              <Search className={`w-5 h-5 transition-all ${isMobileSearchOpen || searchQuery ? 'text-brand stroke-[2.2]' : 'text-neutral-400'}`} />
              {searchQuery && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-brand ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[9px] font-black uppercase">SEARCH</span>
          </button>
          
          {/* Cart Tab (with real-time Badge) */}
          <button
            onClick={onCartClick}
            className="flex flex-col items-center gap-1 py-0.5 px-2 transition-all duration-300 relative cursor-pointer text-neutral-500 hover:text-dark"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-neutral-400 hover:text-brand transition-all" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-black uppercase">BAG</span>
          </button>

          {/* Account/VIP/Portal Tab */}
          {userSession ? (
            <button
              onClick={onPortalClick}
              className={`flex flex-col items-center gap-1 py-0.5 px-2 transition-all duration-300 relative cursor-pointer ${
                activeView === 'portal' ? 'text-brand scale-105' : 'text-neutral-500 hover:text-dark'
              }`}
            >
              <User className={`w-5 h-5 transition-all ${activeView === 'portal' ? 'text-brand stroke-[2.2]' : 'text-neutral-400'}`} />
              <span className="text-[9px] font-black uppercase">PORTAL</span>
              {activeView === 'portal' && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand" />
              )}
            </button>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex flex-col items-center gap-1 py-0.5 px-2 transition-all duration-300 relative cursor-pointer text-neutral-500 hover:text-dark"
            >
              <User className="w-5 h-5 text-neutral-400" />
              <span className="text-[9px] font-black uppercase">LOGIN</span>
            </button>
          )}

          {/* Contact Tab */}
          <button
            onClick={onContactClick}
            className={`flex flex-col items-center gap-1 py-0.5 px-2 transition-all duration-300 relative cursor-pointer ${
              activeView === 'contact' ? 'text-brand scale-105' : 'text-neutral-500 hover:text-dark'
            }`}
          >
            <PhoneCall className={`w-5 h-5 transition-all ${activeView === 'contact' ? 'text-brand stroke-[2.2]' : 'text-neutral-400'}`} />
            <span className="text-[9px] font-black uppercase">CONTACT</span>
            {activeView === 'contact' && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand" />
            )}
          </button>
        </div>
      )}
    </nav>
  );
}

