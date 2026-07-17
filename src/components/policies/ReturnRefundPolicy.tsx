import React from 'react';
import { RefreshCw, CheckCircle2, Lock } from 'lucide-react';

export default function ReturnRefundPolicy() {
  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Buyer Security</span>
        <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
          Return & Refund Policy
        </h2>
        <div className="h-0.5 w-16 bg-brand mx-auto"></div>
        <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
          Your absolute confidence is our absolute commitment. Please review our direct return, exchange, and refund framework.
        </p>
      </div>

      {/* Refund Hero Highlight */}
      <div className="flex flex-col sm:flex-row gap-6 items-center p-6 sm:p-8 bg-brand/5 border border-brand/20 rounded-3xl">
        <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
          <RefreshCw className="w-7 h-7 text-brand animate-spin-slow" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-sm sm:text-base font-bold text-dark uppercase">
            7-Day Visual Verification Guarantee
          </h3>
          <p className="text-neutral-600 text-xs font-light leading-relaxed">
            Every cosmetic dispatch, advanced hydration drop, and apparel piece is backed by a 7-day safety exchange window. If you receive a physically damaged, wrong, or mismatched product, we will issue a free replacement or instant refund.
          </p>
        </div>
      </div>

      {/* Two Column details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Eligibility */}
        <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
          <h4 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-brand" />
            Eligibility Criteria
          </h4>
          <ul className="space-y-3.5 text-xs text-neutral-600 font-light">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
              <span>Items must be strictly unopened, unused, and presented in their original premium retail packaging.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
              <span>Manufacturer safety batch stickers, original barcodes, and cellophane box wrap seals must remain completely unbroken.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
              <span className="text-rose-600 font-medium">For essential safety and hygiene standards, opened cosmetic liquids, hydration drops, eyeshadow palettes, or custom-tailored apparel cannot be returned.</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Steps to Return & Refund Methods */}
        <div className="space-y-6">
          <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
            <h4 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
              <Lock className="w-4.5 h-4.5 text-brand" />
              Refund Methods & Timelines
            </h4>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              Once our Lalitpur verification boutique inspects and approves the seal integrity of the returned package, your refund is dispatched within <strong className="text-dark font-bold">24 to 48 hours</strong>.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-clay-light text-center">
                <span className="text-[10px] font-black text-dark block">eSewa</span>
                <span className="text-[8px] text-neutral-400 font-mono">Instant</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-clay-light text-center">
                <span className="text-[10px] font-black text-dark block">Khalti</span>
                <span className="text-[8px] text-neutral-400 font-mono">Instant</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-clay-light text-center">
                <span className="text-[10px] font-black text-dark block">Bank Transfer</span>
                <span className="text-[8px] text-neutral-400 font-mono">1-2 Days</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-warm/40 border border-clay-light p-6 rounded-2xl text-xs space-y-2">
            <h5 className="font-bold text-dark uppercase text-[10px] tracking-wider">Need to start an exchange?</h5>
            <p className="text-neutral-500 font-light">
              Simply take a photo of the received box highlighting the label/seal, and send it directly to our customer concierge on WhatsApp. We will schedule a courier swap instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
