import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, MessageCircle, Eye, ShoppingBag, Clock, Flame, ShieldCheck, Truck, Percent, PhoneCall, QrCode } from 'lucide-react';
import { PromoSlide, Product } from '../types';
import { formatPrice, CurrencyCode } from '../utils/currency';

interface HeroProps {
  onDiscoverClick: () => void;
  promoSlides: PromoSlide[];
  currency: CurrencyCode;
  whatsappNumber: string;
  aboutImageUrl?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroImageCaption?: string;
  heroDescription?: string;
  products: Product[];
  onViewDetails?: (product: Product) => void;
  onCategorySelect?: (category: string) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Cosmetics: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80',
  Clothing: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
  Jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
  Kits: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=300&q=80',
  Accessories: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=300&q=80',
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=300&q=80';

export default function Hero({ 
  onDiscoverClick, 
  promoSlides = [], 
  currency, 
  whatsappNumber,
  aboutImageUrl = '/src/assets/images/mahi_about_me_1783496157685.jpg',
  heroBadge = 'Mahi Creations Boutique',
  heroTitle = 'Bridging Authenticity & Global Sourcing Luxury',
  heroImageCaption = 'Mahi Creations Lalitpur, Jhamsikhel',
  heroDescription = "Welcome to Mahi Creations, Nepal's and UAE's premier digital gateway to high-end certified products.",
  products = [],
  onViewDetails,
  onCategorySelect
}: HeroProps) {
  // Campaign Slider State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Auto scroll campaign slides every 6 seconds
  useEffect(() => {
    if (promoSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [promoSlides]);

  const handleNextSlide = () => {
    if (promoSlides.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % promoSlides.length);
  };

  const handlePrevSlide = () => {
    if (promoSlides.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  };

  // Real-Time Countdown State for Flash Sale (counts down to end of day)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Midnight local time
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        return { hours: 23, minutes: 59, seconds: 59 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Rotate Flash Sale Products state (Exactly 6 products, auto-rotating)
  const [flashOffset, setFlashOffset] = useState(0);
  const discountedProducts = products.filter(p => p.discountPercent > 0 && p.isVisible !== false);
  
  useEffect(() => {
    if (discountedProducts.length <= 6) return;
    const interval = setInterval(() => {
      setFlashOffset((prev) => (prev + 1) % discountedProducts.length);
    }, 10000); // Dynamic rotation every 10 seconds
    return () => clearInterval(interval);
  }, [discountedProducts.length]);

  const flashSaleProducts = React.useMemo(() => {
    const pool = discountedProducts.length > 0 ? discountedProducts : products.filter(p => p.isVisible !== false);
    if (pool.length <= 6) return pool;
    
    const result = [];
    for (let i = 0; i < 6; i++) {
      result.push(pool[(flashOffset + i) % pool.length]);
    }
    return result;
  }, [discountedProducts, products, flashOffset]);
  
  // Extract unique categories from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  // Spotlight Tab state for High Demand, Best Sellers, and New Products
  const [spotlightTab, setSpotlightTab] = useState<'bestseller' | 'highdemand' | 'new'>('bestseller');

  const bestSellers = [...products]
    .filter(p => p.isVisible !== false)
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 3);

  const highDemand = [...products]
    .filter(p => p.isVisible !== false)
    .sort((a, b) => {
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0);
      }
      return (b.reviewsCount || 0) - (a.reviewsCount || 0);
    })
    .slice(0, 3);

  const newProducts = [...products]
    .filter(p => p.isVisible !== false)
    .reverse()
    .slice(0, 3);

  const selectedSpotlightProducts = 
    spotlightTab === 'bestseller' ? bestSellers :
    spotlightTab === 'highdemand' ? highDemand :
    newProducts;

  // Current active promo slide details
  const currentSlide = promoSlides[activeSlideIndex] || (promoSlides.length > 0 ? promoSlides[0] : null);

  return (
    <div id="daraj-hero-dashboard" className="w-full bg-[#f4f4f6] pb-8 space-y-6">
      
      {/* 1. TOP CAROUSEL & SIDE PANEL (Daraj Double-Column Layout) */}
      <section className="max-w-[1360px] mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Main Campaign Slide Carousel (9 Cols on desktop) */}
          <div className="col-span-1 lg:col-span-9 relative bg-neutral-100 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] md:aspect-[1.8/1] lg:aspect-[1.9/1] xl:aspect-[2.0/1] min-h-[320px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[480px] shadow-xl border border-neutral-200/10 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 group">
            {currentSlide ? (
              <div className="absolute inset-0 w-full h-full flex flex-col md:flex-row">
                {/* Left side: Product Information (Jankari) */}
                <div className="w-full md:w-[45%] lg:w-[42%] flex-shrink-0 h-[50%] md:h-full bg-gradient-to-br from-white via-clay-light to-bg-warm border-b md:border-b-0 md:border-r border-clay flex flex-col justify-center p-5 sm:p-6 md:p-8 lg:p-10 text-left space-y-2.5 sm:space-y-4 relative z-10 overflow-y-auto no-scrollbar">
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[8px] sm:text-[9px] md:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 sm:py-1 rounded-full shadow-[0_4px_12px_rgba(234,88,12,0.3)] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      ⚡ {currentSlide.subtitle || 'Mega Deal'}
                    </span>
                    <span className="text-[7px] sm:text-[8px] uppercase tracking-wider text-brand font-black flex items-center gap-1 bg-brand/5 px-2 py-0.5 sm:py-1 rounded-md border border-brand/20">
                      <Sparkles className="w-2 h-2 text-brand animate-spin" /> Live Campaign
                    </span>
                  </div>

                  <h2 
                    className="font-serif text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-dark leading-tight uppercase tracking-tight"
                  >
                    {currentSlide.title}
                  </h2>

                  <p 
                    className="text-neutral-600 font-medium text-[9px] sm:text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-4 select-text"
                  >
                    {currentSlide.description}
                  </p>

                  <div className="pt-1.5 sm:pt-2">
                    <a 
                      href={currentSlide.linkUrl || '#shop-catalog'}
                      onClick={(e) => {
                        if (currentSlide.linkUrl?.startsWith('#')) {
                          e.preventDefault();
                          onDiscoverClick();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white text-[8px] sm:text-[9px] md:text-xs font-black uppercase tracking-widest px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 transform hover:scale-[1.04] shadow-[0_6px_15px_rgba(200,160,141,0.3)] hover:shadow-[0_10px_20px_rgba(200,160,141,0.5)] border border-brand-hover/20 active:scale-95 group/btn"
                    >
                      <span>{currentSlide.linkText || 'Shop Offer'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>

                </div>

                {/* Right side: Product Image */}
                <div className="flex-1 h-[50%] md:h-full relative overflow-hidden bg-bg-warm flex items-center justify-center">
                  {currentSlide.imageFit === 'cover' ? (
                    <div className="w-full h-full overflow-hidden relative">
                      <img 
                        src={currentSlide.image} 
                        alt={currentSlide.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center opacity-100 transition-transform duration-[3000ms] ease-out group-hover:scale-105 saturate-[1.05] contrast-[1.03]"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-bg-warm">
                      {/* Blurred background layer using the same photo */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-110 saturate-[1.1]"
                        style={{ backgroundImage: `url(${currentSlide.image})` }}
                      />
                      {/* Centered full image - automatically matches Hero Slider size and aspect ratio */}
                      <img 
                        src={currentSlide.image} 
                        alt={currentSlide.title} 
                        referrerPolicy="no-referrer"
                        className="relative w-full h-full object-contain z-10 transition-transform duration-[3500ms] ease-out group-hover:scale-[1.03] saturate-[1.05] contrast-[1.03]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white bg-gradient-to-r from-orange-600 to-amber-500">
                <Sparkles className="w-12 h-12 mb-2 animate-spin text-white/50" />
                <h3 className="font-serif text-xl font-bold uppercase">Mahi Creations Premium Boutique</h3>
              </div>
            )}

            {/* Slider Navigation Arrows */}
            {promoSlides.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-orange-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 hover:scale-110 active:scale-95 cursor-pointer shadow-lg border border-white/5"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/50 hover:bg-orange-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 hover:scale-110 active:scale-95 cursor-pointer shadow-lg border border-white/5"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dot indicators at the bottom */}
            {promoSlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/5 shadow-md">
                {promoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeSlideIndex ? 'w-6 bg-orange-500 shadow-[0_0_8px_#f97316]' : 'w-2 bg-white/40 hover:bg-white'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Campaign Highlights Panel (Visible everywhere, stacks on mobile) */}
          <div className="col-span-1 lg:col-span-3 flex flex-col bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/70 shadow-sm justify-between gap-4 animate-fade-in">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-800">Spotlight Hub</span>
                </div>
                <span className="text-[8px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-black uppercase tracking-widest animate-pulse">Live</span>
              </div>
              
              {/* Tabs selector */}
              <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => setSpotlightTab('bestseller')}
                  className={`text-[9px] font-extrabold uppercase tracking-wider py-1.5 px-0.5 rounded-lg transition-all ${
                    spotlightTab === 'bestseller' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  title="धेरै बिक्री भएको (Best Sellers)"
                >
                  Best Seller
                </button>
                <button
                  onClick={() => setSpotlightTab('highdemand')}
                  className={`text-[9px] font-extrabold uppercase tracking-wider py-1.5 px-0.5 rounded-lg transition-all ${
                    spotlightTab === 'highdemand' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  title="धेरै मागिएको (High Demand)"
                >
                  High Demand
                </button>
                <button
                  onClick={() => setSpotlightTab('new')}
                  className={`text-[9px] font-extrabold uppercase tracking-wider py-1.5 px-0.5 rounded-lg transition-all ${
                    spotlightTab === 'new' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  title="नयाँ सामान (New Arrivals)"
                >
                  New Arrivals
                </button>
              </div>

              {/* Tab Content: list of 3 items */}
              <div className="space-y-2.5 min-h-[190px]">
                {selectedSpotlightProducts.length > 0 ? (
                  selectedSpotlightProducts.map((p) => {
                    const discountedPrice = p.price - (p.price * p.discountPercent / 100);
                    return (
                      <div 
                        key={p.id}
                        onClick={() => onViewDetails?.(p)}
                        className="group/item flex items-center gap-3 p-2 rounded-xl border border-neutral-100 hover:border-orange-500/30 hover:bg-orange-50/20 cursor-pointer transition-all duration-300"
                      >
                        <div className="w-11 h-11 bg-neutral-50 border border-neutral-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover/item:bg-white transition-all">
                          <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-grow min-w-0 text-left space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-1 py-0.2 rounded truncate max-w-[80px]">
                              {p.category}
                            </span>
                            {p.discountPercent > 0 && (
                              <span className="text-[7px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-1 py-0.2 rounded">
                                -{p.discountPercent}%
                              </span>
                            )}
                          </div>
                          <h5 className="text-[10px] font-bold text-neutral-800 uppercase tracking-tight leading-tight truncate group-hover/item:text-orange-600 transition" title={p.name}>
                            {p.name}
                          </h5>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-[10px] font-black text-neutral-900 leading-none">
                              {formatPrice(discountedPrice, currency)}
                            </span>
                            {p.discountPercent > 0 && (
                              <span className="font-mono text-[8px] text-neutral-400 line-through leading-none">
                                {formatPrice(p.price, currency)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const text = encodeURIComponent(`Hi Mahi Creations, I would like to inquire about this spotlight item: "${p.name}" at ${formatPrice(discountedPrice, currency)}.`);
                            window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                          }}
                          className="w-7 h-7 bg-orange-50 border border-orange-100 hover:bg-orange-600 hover:text-white text-orange-600 rounded-lg flex items-center justify-center transition shrink-0"
                          title="WhatsApp Inquiry"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-neutral-400">
                    <ShoppingBag className="w-6 h-6 text-neutral-300 mb-1" />
                    <p className="text-[9px] font-bold">No items found</p>
                  </div>
                )}
              </div>

              {/* Showroom Preview Mini-Frame */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/8] bg-neutral-100 border border-neutral-100 shadow-inner group/preview">
                <img 
                  src={aboutImageUrl} 
                  alt="Mahi Showroom" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                  <p className="text-[9px] font-black text-white tracking-wide uppercase">
                    📍 Dubai & Nepal Hub
                  </p>
                </div>
              </div>

              {/* Compact Privilege indicators */}
              <div className="grid grid-cols-3 gap-1 text-center border-t border-dashed border-neutral-100 pt-2.5">
                <div className="space-y-0.5">
                  <span className="block text-[8px] font-black text-orange-600 uppercase tracking-tight">Authentic</span>
                  <p className="text-[7px] text-neutral-400 leading-none">100% Certified</p>
                </div>
                <div className="space-y-0.5 border-x border-neutral-100">
                  <span className="block text-[8px] font-black text-orange-600 uppercase tracking-tight">Express</span>
                  <p className="text-[7px] text-neutral-400 leading-none">Nepal & Global</p>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[8px] font-black text-orange-600 uppercase tracking-tight">VIP Support</span>
                  <p className="text-[7px] text-neutral-400 leading-none">24/7 Sourcing</p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Sourcing Call-to-Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  const text = encodeURIComponent("Hi Mahi Creations! I am browsing the boutique app and would like to inquire about premium sourcing options.");
                  window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-orange-600 text-white text-[9px] font-extrabold uppercase tracking-wider py-2.5 rounded-xl transition duration-300"
              >
                <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                <span>Source Any Custom Product</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. DARAJ-STYLE DYNAMIC PROMO TRUST MARQUEE STRIP */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 py-2.5 shadow-md overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="max-w-[1360px] mx-auto px-4 flex items-center justify-between text-white gap-4 flex-wrap sm:flex-nowrap">
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-black tracking-widest uppercase">
              ⚡ LIVE OFFERS
            </span>
            <p className="text-[9px] sm:text-[11px] font-extrabold tracking-wider uppercase text-amber-100">
              MONSOON MEGASALE IS NOW ACTIVE
            </p>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-neutral-100">
            <span className="flex items-center gap-1">✨ FREE DELIVERY</span>
            <span className="flex items-center gap-1">🔒 SECURE CHECKOUT</span>
            <span className="flex items-center gap-1">✓ 100% ORIGINAL SOURCED</span>
          </div>

          <button 
            onClick={onDiscoverClick}
            className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest underline hover:text-amber-200"
          >
            Explore Catalog &rarr;
          </button>
        </div>
      </section>

      {/* 3. FLASH SALE & SPECIAL OFFERS SECTION (List Offer/New Saman Here) */}
      <section className="max-w-[1360px] mx-auto px-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/70 shadow-sm space-y-4">
          
          {/* Section Header: Title, Countdown Timer, Shop More Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-orange-600">
                <Flame className="w-5 h-5 fill-orange-600 text-orange-600 animate-bounce" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-800">
                  Flash Sale
                </h3>
              </div>
              
              {/* Daraj-style Countdown Boxes */}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Ends in</span>
                
                <span className="bg-orange-600 text-white font-mono font-black text-[11px] px-1.5 py-0.5 rounded shadow-sm">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-orange-600 font-bold font-mono text-xs">:</span>
                
                <span className="bg-orange-600 text-white font-mono font-black text-[11px] px-1.5 py-0.5 rounded shadow-sm">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-orange-600 font-bold font-mono text-xs">:</span>
                
                <span className="bg-orange-600 text-white font-mono font-black text-[11px] px-1.5 py-0.5 rounded shadow-sm animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <button 
              onClick={onDiscoverClick}
              className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-orange-600 hover:text-orange-500 border border-orange-500/30 hover:border-orange-500 rounded-lg px-3 py-1.5 transition self-start sm:self-auto"
            >
              Shop All Products
            </button>
          </div>

          {/* Flash Sale Horizontal Scrollable Catalog Grid */}
          {flashSaleProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {flashSaleProducts.map((product) => {
                const discountAmount = (product.price * product.discountPercent) / 100;
                const salePrice = product.price - discountAmount;
                const progressSimulated = Math.min(100, Math.max(15, 100 - (product.stockCount * 6))); // simulated stock claim percentage
                const outOfStock = !product.inStock || product.stockCount === 0;

                return (
                  <div 
                    key={product.id}
                    className="group bg-white border border-neutral-100 hover:border-orange-500/40 rounded-xl overflow-hidden flex flex-col p-2.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative"
                  >
                    {/* Discount Pill Badge */}
                    {product.discountPercent > 0 && (
                      <span className="absolute top-2 left-2 z-10 bg-orange-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md shadow">
                        -{product.discountPercent}%
                      </span>
                    )}

                    {/* Stock Alert Badge */}
                    {outOfStock ? (
                      <span className="absolute top-2 right-2 z-10 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        Sold Out
                      </span>
                    ) : product.stockCount <= 3 ? (
                      <span className="absolute top-2 right-2 z-10 bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                        Only {product.stockCount} Left!
                      </span>
                    ) : null}

                    {/* Product Cover Photo inside exact box frame */}
                    <div 
                      onClick={() => onViewDetails?.(product)}
                      className="aspect-square w-full rounded-lg bg-neutral-50/50 p-2 overflow-hidden flex items-center justify-center cursor-pointer group-hover:bg-neutral-50"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Meta info & pricing */}
                    <div className="mt-2.5 flex-grow flex flex-col justify-between text-left space-y-1.5">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                          {product.category}
                        </span>
                        <h4 
                          onClick={() => onViewDetails?.(product)}
                          className="text-[11px] font-bold text-neutral-800 line-clamp-2 hover:text-orange-500 transition cursor-pointer leading-tight pt-1 uppercase"
                        >
                          {product.name}
                        </h4>
                      </div>

                      <div className="space-y-1.5">
                        {/* Price lines */}
                        <div className="pt-1">
                          <p className="font-mono text-xs sm:text-[13px] font-black text-orange-600 leading-none">
                            {formatPrice(salePrice, currency)}
                          </p>
                          {product.discountPercent > 0 && (
                            <p className="font-mono text-[10px] text-neutral-400 line-through leading-none pt-0.5">
                              {formatPrice(product.price, currency)}
                            </p>
                          )}
                        </div>

                        {/* Stock claimed progress bar */}
                        {!outOfStock && (
                          <div className="space-y-1 pt-0.5">
                            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" 
                                style={{ width: `${progressSimulated}%` }}
                              />
                            </div>
                            <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-tight">
                              {progressSimulated > 85 ? '🔥 Selling Fast' : `${product.stockCount} items in stock`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View/Buy buttons (Overlay inside card) */}
                    <div className="mt-3 pt-2.5 border-t border-dashed border-neutral-100 flex gap-1.5">
                      <button
                        onClick={() => onViewDetails?.(product)}
                        className="flex-1 bg-neutral-900 hover:bg-orange-600 text-white text-[8px] font-extrabold uppercase py-2 rounded-lg transition"
                        title="View Details"
                      >
                        Explore
                      </button>
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(`Hi Mahi Creations, I would like to order: "${product.name}" on flash sale deal at ${formatPrice(salePrice, currency)}.`);
                          window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                        }}
                        className="p-1.5 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 rounded-lg transition"
                        title="WhatsApp Order"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
              <Percent className="w-8 h-8 mx-auto mb-2 text-neutral-300 animate-pulse" />
              <p className="text-xs">No active flash sale products right now. We replenish daily!</p>
            </div>
          )}

        </div>
      </section>

      {/* 4. CATEGORIES LISTING SECTION (Daraj circular icons) */}
      {uniqueCategories.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/70 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-1.5 text-neutral-800">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Browse Categories
                </h3>
              </div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                Easy Sourcing
              </span>
            </div>

            {/* Grid of round circles like Daraj screenshot */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 justify-center">
              {/* "All Products" shortcut */}
              <div 
                onClick={() => onCategorySelect?.('All')}
                className="group flex flex-col items-center text-center space-y-2 cursor-pointer transition-all"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-500 bg-orange-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                  <Sparkles className="w-8 h-8 text-orange-600 group-hover:scale-110 transition" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-neutral-600 group-hover:text-orange-600 transition truncate max-w-full uppercase tracking-tight">
                  All Boutique
                </span>
              </div>

              {/* Unique database categories */}
              {uniqueCategories.map((category) => {
                const img = CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGE;
                return (
                  <div 
                    key={category}
                    onClick={() => onCategorySelect?.(category)}
                    className="group flex flex-col items-center text-center space-y-2 cursor-pointer transition-all"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-500 bg-neutral-100 shadow-sm group-hover:shadow-md transition relative">
                      <img 
                        src={img} 
                        alt={category} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-600 group-hover:text-orange-600 transition truncate max-w-full uppercase tracking-tight">
                      {category}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}
