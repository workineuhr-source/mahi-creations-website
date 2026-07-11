import React from 'react';
import { ShoppingBag, Settings, Truck, Sparkles, User, LogOut, Globe } from 'lucide-react';
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
    <nav className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-clay/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onShopClick}>
            {settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.shopName || 'Boutique Logo'} 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-clay"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-dark text-white">
                <Sparkles className="w-4 h-4 sm:w-5 h-5 text-brand animate-pulse" />
              </div>
            )}
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tighter uppercase text-dark">
                {settings?.shopName || 'Mahi Creations'}
              </span>
              <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.3em] text-neutral-400 font-bold -mt-0.5 pl-0.5">
                Luxury Handcrafted Boutique
              </p>
            </div>
          </div>

          {/* Right utility items: Currency, Cart & ONLY Login/Signout */}
          <div className="flex items-center space-x-3.5">
            {/* Advanced Country & Currency Selector with Auto-Detect */}
            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline-flex items-center text-[10px] text-neutral-400 font-bold uppercase tracking-widest gap-1 bg-clay-light/40 px-2 py-1 rounded-lg">
                <Globe className="w-3 h-3 text-brand" />
                Auto-Sync Country
              </span>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-bg-warm/75 hover:bg-clay-light px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-clay text-[10px] sm:text-xs font-bold text-dark focus:outline-none cursor-pointer tracking-wider transition-all"
                title="Select Shipping Country & Active Currency"
              >
                <option value="NPR">🇳🇵 Nepal (NPR)</option>
                <option value="AED">🇦🇪 UAE (AED)</option>
                <option value="INR">🇮🇳 India (INR)</option>
                <option value="USD">🇺🇸 United States (USD)</option>
                <option value="EUR">🇪🇺 Europe (EUR)</option>
              </select>
            </div>

            {/* Main authentication trigger: Login/Logout button ONLY */}
            {isAdminLoggedIn || userSession ? (
              <button
                onClick={onLogoutClick}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1 cursor-pointer text-[10px] font-bold"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-dark hover:bg-brand text-white px-3.5 py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1 cursor-pointer text-[10px] font-bold"
              >
                <User className="w-3 h-3 text-brand" />
                <span>Login</span>
              </button>
            )}

            {/* Cart Icon */}
            <button
              onClick={onCartClick}
              id="cart-button"
              className="relative p-2 text-dark hover:text-brand hover:bg-clay-light rounded-full transition-all duration-300 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white ring-2 ring-white animate-fade-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Category Navigation Bar - Single Line, Scrollable, Non-Wrapping */}
      {activeView !== 'admin' && (
        <div className="border-t border-clay-light/60 bg-neutral-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap py-1">
              <div className="flex items-center space-x-6 sm:space-x-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onCategorySelect(cat);
                      onShopClick();
                    }}
                    className={`text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 relative py-3 px-2 rounded-lg hover:bg-clay-light/30 flex items-center justify-center min-h-[44px] cursor-pointer ${
                      activeView === 'shop' && selectedCategory === cat
                        ? 'text-brand font-black'
                        : 'text-neutral-500 hover:text-dark'
                    }`}
                  >
                    {cat === 'All' ? 'Home' : cat}
                    {activeView === 'shop' && selectedCategory === cat && (
                      <span className="absolute bottom-1 left-2 right-2 h-[2.5px] bg-brand rounded-full"></span>
                    )}
                  </button>
                ))}

                <button
                  onClick={onTrackOrderClick}
                  className={`text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 relative py-3 px-2 rounded-lg hover:bg-clay-light/30 flex items-center justify-center min-h-[44px] gap-1 cursor-pointer ${
                    activeView === 'tracker' ? 'text-brand font-black' : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 animate-pulse" />
                  Track Order
                  {activeView === 'tracker' && (
                    <span className="absolute bottom-1 left-2 right-2 h-[2.5px] bg-brand rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Extra Admin and Customer Portal links placed subtly at the end of scrollable category bar */}
              <div className="flex items-center space-x-4 pl-4 border-l border-clay-light">
                {isAdminLoggedIn && (
                  <button
                    onClick={onAdminClick}
                    className={`text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:text-brand flex items-center gap-1 whitespace-nowrap py-3 px-2 rounded-lg hover:bg-clay-light/30 min-h-[44px] ${
                      activeView === 'admin' ? 'text-brand font-black' : ''
                    }`}
                  >
                    <Settings className="w-3 h-3" />
                    Admin Console
                  </button>
                )}
                {userSession && (
                  <button
                    onClick={onPortalClick}
                    className={`text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:text-brand flex items-center gap-1 whitespace-nowrap py-3 px-2 rounded-lg hover:bg-clay-light/30 min-h-[44px] ${
                      activeView === 'portal' ? 'text-brand font-black' : ''
                    }`}
                  >
                    <User className="w-3 h-3" />
                    VIP Portal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sub-Navigation Sticky Bar */}
      {activeView !== 'admin' && (
        <div className="md:hidden flex items-center justify-around border-t border-clay-light py-2.5 bg-bg-warm/95 font-sans text-[9px] font-bold tracking-wider text-neutral-500">
          <button
            onClick={onShopClick}
            className={`flex flex-col items-center gap-0.5 py-1 px-1.5 cursor-pointer ${
              activeView === 'shop' ? 'text-brand' : 'text-neutral-500'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeView === 'shop' ? 'text-brand' : 'text-neutral-400'}`} />
            <span>COLLECTION</span>
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
            onClick={onPortalClick}
            className={`flex flex-col items-center gap-0.5 py-1 px-1.5 cursor-pointer ${
              activeView === 'portal' ? 'text-brand' : 'text-neutral-500'
            }`}
          >
            <User className={`w-4 h-4 ${activeView === 'portal' ? 'text-brand' : 'text-neutral-400'}`} />
            <span>PORTAL</span>
          </button>
          {isAdminLoggedIn && (
            <>
              <div className="h-4 w-[1px] bg-clay/50"></div>
              <button
                onClick={onAdminClick}
                className={`flex flex-col items-center gap-0.5 py-1 px-1.5 cursor-pointer ${
                  activeView === 'admin' ? 'text-brand' : 'text-neutral-500'
                }`}
              >
                <Settings className={`w-4 h-4 ${activeView === 'admin' ? 'text-brand' : 'text-neutral-400'}`} />
                <span>ADMIN</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
