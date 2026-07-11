import React from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Plus, Minus, Trash2, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { convertPrice, formatPrice, CurrencyCode, ShippingLocation, CountryConfig } from '../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currency: CurrencyCode;
  selectedLocationId: string;
  onLocationChange: (id: string) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  countries: CountryConfig[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  currency,
  selectedLocationId,
  onLocationChange,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  countries
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Find country matching chosen currency
  const activeCountry = countries.find(c => c.defaultCurrency === currency) || countries[0];


  // Base calculations in NPR
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const discountAmount = cart.reduce((sum, item) => {
    const itemDiscount = (item.product.price * item.product.discountPercent) / 100;
    return sum + itemDiscount * item.quantity;
  }, 0);

  const subtotalAfterDiscount = rawSubtotal - discountAmount;

  // Delivery calculations
  const selectedLocation = activeCountry.locations.find(loc => loc.id === selectedLocationId) || activeCountry.locations[0];
  const deliveryFeeInNpr = selectedLocation ? selectedLocation.feeInNpr : 0;
  const isFreeDelivery = deliveryFeeInNpr === 0;

  const grandTotalInNpr = subtotalAfterDiscount + deliveryFeeInNpr;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-[3px] transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-fade-in border-l border-clay animate-slide-in">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-clay-light flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <h2 className="font-serif text-xl font-bold text-dark">Your Shopping Bag</h2>
              <span className="bg-clay-light text-dark text-xs font-bold rounded-full px-2.5 py-0.5">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-clay-light text-neutral-500 hover:text-dark transition-all cursor-pointer"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-clay-light border border-clay-light flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-dark">Your bag is empty</p>
                  <p className="text-neutral-500 text-xs font-light max-w-xs mt-1">
                    Add gorgeous premium cosmetics from our curations to populate your beauty routine.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-dark hover:bg-brand text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemDiscountAmount = (item.product.price * item.product.discountPercent) / 100;
                const finalItemPrice = item.product.price - itemDiscountAmount;

                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3.5 bg-clay-light/40 rounded-2xl border border-clay/50 hover:border-brand/30 transition-all"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-white border border-clay-light flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-dark truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[9px] text-brand font-bold tracking-widest uppercase mt-0.5">
                          {item.product.category}
                        </p>
                      </div>

                      {/* Pricing, Quantity adjustment row */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-clay bg-white rounded-lg">
                          <button
                            onClick={() => onUpdateQty(item.product.id, -1)}
                            className="p-1 px-2 text-neutral-600 hover:bg-clay-light transition-colors rounded-l-lg cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, 1)}
                            className="p-1 px-2 text-neutral-600 hover:bg-clay-light transition-colors rounded-r-lg cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-dark">
                            {formatPrice(finalItemPrice * item.quantity, currency)}
                          </span>
                          {item.product.discountPercent > 0 && (
                            <span className="text-[9px] text-neutral-400 line-through block">
                              {formatPrice(item.product.price * item.quantity, currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout / Pricing Calculations */}
          {cart.length > 0 && (
            <div className="border-t border-clay-light bg-clay-light/25 p-6 space-y-4">
              
              {/* Shipping location selection */}
              <div className="bg-white p-3.5 rounded-xl border border-clay/60 shadow-sm space-y-3">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  Select {activeCountry.name} Delivery Region
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="w-full text-xs font-semibold text-dark bg-clay-light/40 border border-clay rounded-lg p-2.5 focus:ring-1 focus:ring-brand focus:outline-none cursor-pointer"
                >
                  {activeCountry.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.feeInNpr === 0 ? '(FREE Delivery)' : `(+${formatPrice(loc.feeInNpr, currency)})`}
                    </option>
                  ))}
                </select>
                
                {isFreeDelivery && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200/50">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 flex-shrink-0" />
                    Congratulations! This location qualifies for FREE delivery.
                  </p>
                )}

                {/* Collapsible Delivery Guide */}
                <details className="text-[11px] text-neutral-600 bg-clay-light/20 p-2.5 rounded-xl border border-clay-light">
                  <summary className="font-bold text-dark cursor-pointer flex items-center justify-between select-none">
                    <span className="flex items-center gap-1">📍 Delivery Rates Guide</span>
                    <span className="text-[9px] text-brand uppercase font-black tracking-wider">Show All</span>
                  </summary>
                  <div className="mt-2 space-y-1.5 divide-y divide-clay/40 pt-1 max-h-32 overflow-y-auto pr-1">
                    {activeCountry.locations.map((loc) => (
                      <div key={loc.id} className="flex justify-between items-center pt-1.5 first:pt-0">
                        <span className="font-medium text-neutral-700">{loc.name}</span>
                        {loc.feeInNpr === 0 ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">FREE DELIVERY</span>
                        ) : (
                          <span className="font-mono text-neutral-900 font-bold">{formatPrice(loc.feeInNpr, currency)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              {/* Price Details Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Bag Subtotal</span>
                  <span>{formatPrice(rawSubtotal, currency)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-brand font-bold bg-clay-light px-2.5 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1">🏷️ Automated Savings</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-neutral-500">
                  <span>Logistics Delivery Fee</span>
                  <span>{isFreeDelivery ? 'FREE' : formatPrice(deliveryFeeInNpr, currency)}</span>
                </div>

                <div className="border-t border-clay/60 pt-3 flex justify-between items-end">
                  <div>
                    <span className="font-serif text-base font-bold text-dark block">Estimated Total</span>
                    <span className="text-[9px] text-neutral-400">(All custom duties & VAT included)</span>
                  </div>
                  <span className="font-sans text-lg font-black text-brand">
                    {formatPrice(grandTotalInNpr, currency)}
                  </span>
                </div>
              </div>

              {/* Proceed Action CTA */}
              <button
                onClick={onProceedToCheckout}
                className="w-full inline-flex items-center justify-center gap-2 bg-dark hover:bg-brand text-white text-xs font-bold tracking-widest uppercase py-4 rounded-xl shadow-lg hover:shadow-brand/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                Proceed to Checkout
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
