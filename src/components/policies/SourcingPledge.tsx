import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

export default function SourcingPledge() {
  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Certified Authenticity</span>
        <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
          100% Sourcing & Authenticity Pledge
        </h2>
        <div className="h-0.5 w-16 bg-brand mx-auto"></div>
        <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
          Counterfeits have zero room in beauty. Read about our absolute seal of quality.
        </p>
      </div>

      {/* Seal Highlight Banner */}
      <div className="p-8 sm:p-10 bg-gradient-to-br from-[#0c0c0f] to-[#1c1611] border border-amber-500/20 rounded-3xl relative overflow-hidden shadow-xl text-center space-y-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <Award className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
        <h3 className="font-serif text-lg sm:text-xl font-extrabold text-transparent bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 bg-clip-text leading-tight uppercase tracking-tight">
          Zero Counterfeit Tolerance Seal
        </h3>
        <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
          Mahi Creations enforces an absolute vetting loop. Every single box contains a certified manufacturer batch code linked back to production facilities in the world's major fashion capitals.
        </p>
      </div>

      {/* Origin Grid */}
      <div className="space-y-6">
        <h3 className="font-serif text-sm font-bold text-dark uppercase tracking-wider text-center">
          Sourcing Capitals & Channels
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
            <span className="text-xl sm:text-2xl">🗼</span>
            <h4 className="font-serif text-xs font-bold text-dark uppercase">Seoul, S. Korea</h4>
            <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Direct K-Beauty drops and laboratory-grade glass-skin serums.</p>
          </div>
          <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
            <span className="text-xl sm:text-2xl">🗼</span>
            <h4 className="font-serif text-xs font-bold text-dark uppercase">Paris, France</h4>
            <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Luxurious cosmetic items and French botanical emulsions.</p>
          </div>
          <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
            <span className="text-xl sm:text-2xl">🗼</span>
            <h4 className="font-serif text-xs font-bold text-dark uppercase">Tokyo, Japan</h4>
            <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Premium sunscreen arrays, masks, and lightweight lipids.</p>
          </div>
          <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
            <span className="text-xl sm:text-2xl">🗼</span>
            <h4 className="font-serif text-xs font-bold text-dark uppercase">New York, USA</h4>
            <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Authorized luxury retail make-up pallets and pigments.</p>
          </div>
        </div>

        <div className="bg-bg-warm/40 border border-clay-light p-6 sm:p-8 rounded-3xl text-xs space-y-3 font-light text-neutral-600 leading-relaxed">
          <h4 className="font-bold text-dark uppercase text-[11px] tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand" />
            Our Double-Vetting Inspection Loop
          </h4>
          <p>
            Before any batch of global skincare or designer apparel is showcased on our digital catalog, it undergoes a dual-vetting sequence. First, the batch codes are verified directly through official manufacturer databases. Second, our quality control team physically inspects box seals and temperatures to prevent chemical degradation.
          </p>
          <p>
            By circumventing unnecessary third-party broker networks, we guarantee absolute authenticity while delivering direct-to-client value that is unrivaled in Nepal.
          </p>
        </div>
      </div>
    </div>
  );
}
