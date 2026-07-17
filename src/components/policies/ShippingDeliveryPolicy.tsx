import React from 'react';
import { Truck, Globe, Package } from 'lucide-react';

interface ShippingDeliveryPolicyProps {
  onBackToShop: () => void;
}

export default function ShippingDeliveryPolicy({ onBackToShop }: ShippingDeliveryPolicyProps) {
  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Secure Logistics</span>
        <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
          Shipping & Delivery Policy
        </h2>
        <div className="h-0.5 w-16 bg-brand mx-auto"></div>
        <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
          We bridge international boundaries to bring curated luxury fresh to your doorstep. Here is how our boutique logistics handle fulfillment.
        </p>
      </div>

      {/* Grid of Delivery Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Valley Delivery */}
        <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand/10 text-brand px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-clay-light">
            Direct Dispatch
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-extrabold text-dark uppercase">
            Kathmandu Valley Delivery
          </h3>
          <p className="text-neutral-600 text-xs font-light leading-relaxed">
            Fulfillments inside Kathmandu, Lalitpur, and Bhaktapur are directly executed by our in-house boutique delivery courier fleet.
          </p>
          <div className="space-y-2 text-xs border-t border-clay-light/60 pt-3">
            <div className="flex justify-between">
              <span className="text-neutral-400 font-light">Delivery Window:</span>
              <span className="text-dark font-bold">12 to 24 Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-light">Delivery Cost:</span>
              <span className="text-emerald-600 font-extrabold">Free on qualified orders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-light">Payment Method:</span>
              <span className="text-dark font-bold">Cash on Delivery (COD) / Digital Pay</span>
            </div>
          </div>
        </div>

        {/* Outside Valley */}
        <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-neutral-100 text-neutral-500 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-clay-light">
            Corporate Courier
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-extrabold text-dark uppercase">
            Outside Valley & UAE Shipping
          </h3>
          <p className="text-neutral-600 text-xs font-light leading-relaxed">
            Dispatches beyond Kathmandu and international orders (such as UAE shipping) are handled in partnership with premier logistics brokers.
          </p>
          <div className="space-y-2 text-xs border-t border-clay-light/60 pt-3">
            <div className="flex justify-between">
              <span className="text-neutral-400 font-light">Delivery Window:</span>
              <span className="text-dark font-bold">2 to 4 Business Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-light">Delivery Cost:</span>
              <span className="text-dark font-bold">Standard regional carrier fees</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-light">Partners:</span>
              <span className="text-dark font-bold">Pathao, NCM, Aramex</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking System CTA */}
      <div className="bg-bg-warm/60 border border-clay-light p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl text-center md:text-left">
          <h4 className="font-serif text-sm font-bold text-dark uppercase flex items-center justify-center md:justify-start gap-1.5">
            <Package className="w-4 h-4 text-brand" />
            Real-Time Digital Order Tracking
          </h4>
          <p className="text-neutral-500 text-xs font-light leading-relaxed">
            Every confirmed boutique invoice automatically generates a unique digital Tracking ID (e.g., <code className="font-mono text-dark bg-white border border-clay-light px-1.5 py-0.5 rounded font-bold text-[10px]">MC-55120</code>). Paste this code into our real-time portal to view delivery stage updates.
          </p>
        </div>
        <button 
          onClick={onBackToShop}
          className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-brand/20 cursor-pointer shrink-0"
        >
          Trace My Package
        </button>
      </div>
    </div>
  );
}
