import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Truck, Lock, ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export default function FaqSection({ compact = false }: { compact?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 'authenticity',
      question: 'Are all your cosmetics & apparel 100% authentic?',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
      answer: 'Yes, 100% genuine and pristine. At Mahi Creations, authenticity is our sacred promise. We source each cosmetic item directly from official brand boutiques, Sephora, or authorized beauty retailers in Seoul, Paris, the US, and Europe. Every single shipment includes verifiable batch codes and pristine packaging, ensuring that your skin receives only the purest luxury formulas.'
    },
    {
      id: 'shipping',
      question: 'How do you handle shipping, and why are there occasional delays?',
      icon: <Truck className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      answer: 'To bring you exclusive global drops and fresh formulas, we operate a direct-import curation pipeline from international hubs (primarily Seoul, Paris, and the US). Standard items are shipped locally in Nepal within 1–3 business days. However, pre-ordered or high-demand custom sourced items can occasionally experience custom clearance holds or air freight transits. We track every milestone and maintain transparent updates via our Live Order Tracker.'
    },
    {
      id: 'payment',
      question: 'Is my payment secure, and how do bank/digital transfers work?',
      icon: <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />,
      answer: 'Your financial peace of mind is absolute. We employ industry-standard encryption for all digital transfers. You can securely settle via eSewa, Khalti, direct bank transfers (IPS/Fonepay), or secure Cash on Delivery (COD) across Nepal. Once your payment is verified, your order is locked into our sourcing registry instantly, and an automated premium PDF receipt is generated for your records.'
    },
    {
      id: 'return-policy',
      question: 'What is the boutique return or exchange policy?',
      icon: <HelpCircle className="w-5 h-5 text-neutral-500 flex-shrink-0" />,
      answer: 'Due to the sanitary and hygienic nature of high-end cosmetics and custom-tailored apparel, we only accept returns or exchanges in the rare event of transit damage or incorrect sourcing. If you notice any issues upon delivery, please document them with photos and contact our support concierge on WhatsApp immediately so we can issue an instant replacement or refund.'
    }
  ];

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const content = (
    <div className={`${compact ? '' : 'bg-[#fcfbfb] rounded-3xl border border-clay p-6 sm:p-10 shadow-md'} space-y-6 sm:space-y-8 relative overflow-hidden text-left`}>
      {/* Abstract background accent */}
      {!compact && (
        <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
      )}
      
      {/* Header Block */}
      <div className={`${compact ? 'text-left' : 'text-center'} space-y-2 max-w-lg ${compact ? '' : 'mx-auto'}`}>
        <div className="inline-flex items-center gap-1 bg-brand/10 text-brand px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Concierge FAQ
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-dark uppercase tracking-wide">
          Frequently Answered Questions
        </h3>
        {!compact && <div className="h-0.5 w-10 bg-brand mx-auto"></div>}
        <p className="text-neutral-500 text-xs font-light leading-relaxed">
          Transparent answers on sourcing, delivery guarantees, and secure payments for our distinguished patrons.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3 relative z-10">
        {faqData.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div 
              key={item.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? 'border-brand bg-white shadow-sm ring-1 ring-brand/15' 
                  : 'border-clay/70 hover:border-brand/45 bg-[#fdfdfd]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(item.id)}
                className="w-full px-4.5 py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-serif text-[11px] sm:text-xs font-semibold text-neutral-800 tracking-wide leading-snug">
                    {item.question}
                  </span>
                </div>
                <div className={`p-1 rounded-full transition-all duration-300 flex-shrink-0 ${isOpen ? 'bg-brand/10 text-brand rotate-180' : 'text-neutral-400 bg-neutral-100'}`}>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="faq-section-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-4 pb-4.5 pt-0.5 border-t border-clay-light/50 text-[11px] text-neutral-500 leading-relaxed font-light space-y-2">
                      <p className="text-neutral-600 font-medium bg-[#fcfbfb] p-3 rounded-xl border border-clay-light/35">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Concierge Link */}
      <div className="text-center pt-3 relative z-10 border-t border-dashed border-clay-light">
        <p className="text-[10px] sm:text-[11px] text-neutral-400">
          Have a different or urgent cosmetic inquiry?{' '}
          <a 
            href="https://wa.me/9779800000000" 
            target="_blank" 
            rel="noreferrer" 
            className="text-brand font-bold hover:underline transition-all"
          >
            Consult Sourcing Concierge via WhatsApp ↗
          </a>
        </p>
      </div>

    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 animate-fade-in text-left">
      {content}
    </section>
  );
}
