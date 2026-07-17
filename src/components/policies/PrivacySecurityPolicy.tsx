import React from 'react';
import { Lock, ShieldCheck, FileText } from 'lucide-react';

export default function PrivacySecurityPolicy() {
  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Buyer Integrity</span>
        <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
          Privacy & Security Policy
        </h2>
        <div className="h-0.5 w-16 bg-brand mx-auto"></div>
        <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
          We guard your digital profile as strictly as we verify our global cosmetics. Read how your information is handled.
        </p>
      </div>

      {/* Policy Pillars */}
      <div className="space-y-6">
        <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
            <Lock className="w-4.5 h-4.5 text-brand" />
            Safe Buyer Protection Standard
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
            Mahi Creations strictly safeguards your personal telephone numbers, delivery addresses, and purchasing histories. We enforce absolute zero telemetry, no automated advertising trackers, and zero third-party commercial data broker sharing.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start gap-3 mt-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-emerald-900">Encrypted Transactions Only</h4>
              <p className="text-[10px] text-emerald-700 leading-normal mt-0.5">
                All browsing, membership portals, and custom forms are heavily wrapped in modern 256-bit Secure Socket Layers (SSL).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
            <FileText className="w-4.5 h-4.5 text-brand" />
            Payment Gateways & Wallet Confidentiality
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed font-sans">
            Our systems interface exclusively through official secure API handshake endpoints with recognized digital wallets (such as <strong className="text-dark font-bold">eSewa</strong> and <strong className="text-dark font-bold">Khalti</strong>).
          </p>
          <p className="text-xs text-neutral-500 font-light leading-relaxed border-l-2 border-clay-light pl-3.5 italic">
            "Mahi Creations does not record, intercept, or log any digital wallet PINs, bank account numbers, or secondary security passwords. All checkout verification routines are authenticated directly on the respective digital gateway layer."
          </p>
        </div>
      </div>
    </div>
  );
}
