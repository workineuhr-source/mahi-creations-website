import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { BoutiqueSettings } from '../types';

// Import separate, dedicated policy components
import AboutOurBoutique from './policies/AboutOurBoutique';
import ContactUsLocation from './policies/ContactUsLocation';
import ReturnRefundPolicy from './policies/ReturnRefundPolicy';
import ShippingDeliveryPolicy from './policies/ShippingDeliveryPolicy';
import PrivacySecurityPolicy from './policies/PrivacySecurityPolicy';
import TermsConditions from './policies/TermsConditions';
import SourcingPledge from './policies/SourcingPledge';

interface PolicyPageProps {
  viewType: 'about' | 'contact' | 'returns' | 'shipping' | 'privacy' | 'terms' | 'authenticity';
  onBackToShop: () => void;
  settings: BoutiqueSettings;
  currency: string;
}

export default function PolicyPage({
  viewType,
  onBackToShop,
  settings,
  currency
}: PolicyPageProps) {
  
  // Render the cleanly separated component based on the active route/viewType
  const renderContent = () => {
    switch (viewType) {
      case 'about':
        return <AboutOurBoutique settings={settings} />;
      case 'contact':
        return <ContactUsLocation settings={settings} />;
      case 'returns':
        return <ReturnRefundPolicy />;
      case 'shipping':
        return <ShippingDeliveryPolicy onBackToShop={onBackToShop} />;
      case 'privacy':
        return <PrivacySecurityPolicy />;
      case 'terms':
        return <TermsConditions />;
      case 'authenticity':
        return <SourcingPledge />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-bg-warm/15 min-h-[60vh] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back navigation bar */}
        <div className="flex items-center justify-between border-b border-clay-light pb-4 mb-8">
          <button 
            onClick={onBackToShop}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-600 hover:text-brand transition duration-300 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Shop</span>
          </button>
          <span className="text-[10px] text-neutral-400 font-mono font-bold bg-white border border-clay-light/60 px-3 py-1 rounded-full shadow-2xs">
            📄 Separate Document
          </span>
        </div>

        {/* Dynamic page area */}
        {renderContent()}

        {/* Footer actions for quick navigation back to home */}
        <div className="mt-16 border-t border-clay-light pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Licensed & Certified Boutique Sourcing Kathmandu</span>
          </div>
          <button
            onClick={onBackToShop}
            className="bg-dark hover:bg-brand text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition duration-300 cursor-pointer shadow-sm hover:shadow-md"
          >
            Return to Boutique Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
