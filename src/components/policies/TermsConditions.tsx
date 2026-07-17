import React from 'react';

export default function TermsConditions() {
  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Legal Integrity</span>
        <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
          Terms & Conditions of Service
        </h2>
        <div className="h-0.5 w-16 bg-brand mx-auto"></div>
        <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
          By browsing and procuring from our luxury boutique, you agree to comply with our client guidelines.
        </p>
      </div>

      {/* Terms Pillars */}
      <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">1</span>
            <h3 className="font-serif text-sm font-bold text-dark uppercase">Boutique Pricing & Currency</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pl-9">
            All catalog listings are finalized at checkout. We ensure complete transparency: the price displayed on your digital tracking invoice is the exact price our courier will receive. If a discount campaign (e.g. up to 25% automated seasonal reductions) is active, it will be transparently applied inside the cart.
          </p>
        </div>

        <div className="space-y-4 border-t border-clay-light/60 pt-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">2</span>
            <h3 className="font-serif text-sm font-bold text-dark uppercase">Sourcing and Ingredient Information</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pl-9">
            We guarantee that every product is authentic and fresh. For all imported laboratory-skincare batches and makeup solutions, we include a clear, accessible ingredient panel so clients with sensitive skin can fully assess properties prior to acquisition.
          </p>
        </div>

        <div className="space-y-4 border-t border-clay-light/60 pt-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">3</span>
            <h3 className="font-serif text-sm font-bold text-dark uppercase">Delivery Abuse Safeguard</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pl-9">
            Mahi Creations prides itself on direct Cash on Delivery trust. However, we reserve the right to temporarily flag or suspend accounts if multiple consecutive delivery attempts are rejected without cause, or if suspicious fraudulent invoicing is observed.
          </p>
        </div>
      </div>
    </div>
  );
}
