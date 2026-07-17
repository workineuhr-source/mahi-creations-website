import React from 'react';
import { ShieldCheck, Globe, Award, Sparkles } from 'lucide-react';
import { BoutiqueSettings } from '../../types';

interface AboutOurBoutiqueProps {
  settings: BoutiqueSettings;
}

export default function AboutOurBoutique({ settings }: AboutOurBoutiqueProps) {
  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
      {/* Elegant Hero Visual */}
      <div className="relative overflow-hidden rounded-3xl border border-clay-light shadow-xl">
        <img 
          src={settings.aboutImageUrl || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80"} 
          alt="About Mahi Creations Studio Sourcing" 
          referrerPolicy="no-referrer"
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent flex flex-col justify-end p-8 sm:p-10">
          <span className="text-brand text-xs font-black uppercase tracking-[0.3em] mb-2">The Boutique Story</span>
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            About Mahi Creations
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm font-light max-w-xl mt-2 leading-relaxed">
            Nepal's premier luxury digital boutique and handpicked beauty catalog, bridging the world's most exclusive cosmetics and apparel to Kathmandu.
          </p>
        </div>
      </div>

      {/* Core Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 text-neutral-600 text-xs sm:text-sm leading-relaxed font-light">
          <h3 className="font-serif text-lg font-bold text-dark border-b border-clay-light pb-2 uppercase">
            Our Sourcing Philosophy
          </h3>
          <p>
            Welcome to <strong className="text-dark font-bold">Mahi Creations</strong>, Nepal’s premier luxury digital boutique and handpicked beauty catalog. We specialize in bridging premium global cosmetic formulations, advanced hydration regimes, high-end traditional apparel, and designer accessories directly to the discerning client.
          </p>
          <p>
            Our journey started with a simple belief: luxury should be authentic, fresh, and uncompromising. We observed a persistent gap in the Nepalese market for direct, certified global beauty brands and royal traditional craftsmanship. Mahi Creations was founded to erase that boundary entirely.
          </p>
          <p>
            Today, we serve as Kathmandu's trusted curators. We do not operate bulk, dusty warehouses; instead, we deploy a highly personalized, active dispatch chain. Every drop of serum, every shade of lipstick, and every silk thread represents a meticulous quality seal from our sourcing hubs.
          </p>
        </div>

        {/* Sidebar Info Card */}
        <div className="bg-bg-warm/60 border border-clay-light/80 p-6 rounded-3xl space-y-6">
          <h4 className="font-serif text-xs font-black text-brand uppercase tracking-wider">Boutique at a Glance</h4>
          
          <div className="space-y-4 text-xs">
            <div className="border-b border-clay-light/60 pb-3">
              <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Establishment</span>
              <span className="text-dark font-bold text-sm">Kathmandu, Nepal</span>
            </div>
            <div className="border-b border-clay-light/60 pb-3">
              <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Central Hub</span>
              <span className="text-dark font-bold">Jhamsikhel, Lalitpur</span>
            </div>
            <div className="border-b border-clay-light/60 pb-3">
              <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Curation Niches</span>
              <span className="text-dark font-bold">Skincare, Cosmetics, Saree & Bridal Jewelry</span>
            </div>
            <div>
              <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Guarantees</span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                100% Original Products
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Value Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-white border border-clay-light rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <Globe className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-bold text-dark uppercase">Global Sourcing Centers</h4>
          <p className="text-neutral-500 text-xs font-light leading-relaxed">
            We maintain active dispatch pipelines with authorized global dealers in Paris, Seoul, Tokyo, and New York to ensure immediate shelf freshness.
          </p>
        </div>

        <div className="p-6 bg-white border border-clay-light rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-bold text-dark uppercase">Uncompromising Quality</h4>
          <p className="text-neutral-500 text-xs font-light leading-relaxed">
            Every cosmetic formulation is verified for storage temperature, safety seal integrity, and manufacturing batch legitimacy before shipment.
          </p>
        </div>

        <div className="p-6 bg-white border border-clay-light rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-sm font-bold text-dark uppercase">Custom Bespoke Service</h4>
          <p className="text-neutral-500 text-xs font-light leading-relaxed">
            From traditional organza silk saree styling to personalized laboratory-grade skincare routines, our virtual concierge provides real-time guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
