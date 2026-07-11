import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, MessageCircle, Eye, ShoppingBag } from 'lucide-react';
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
}

export default function Hero({ 
  onDiscoverClick, 
  promoSlides = [], 
  currency, 
  whatsappNumber,
  aboutImageUrl = '/src/assets/images/mahi_about_me_1783496157685.jpg',
  heroBadge = 'Mahi Creations Boutique',
  heroTitle = 'Bridging Authenticity & Global Sourcing Luxury',
  heroImageCaption = 'Mahi Creations Lalitpur, Jhamsikhel',
  heroDescription = "Welcome to Mahi Creations, Nepal's and UAE's premier digital gateway to high-end certified products. We specialize in curating premium global cosmetic formulations, traditional custom-crafted apparel, and bespoke fine jewelry directly from fashion capitals.",
  products = [],
  onViewDetails
}: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto scroll products every 5 seconds
  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  const handleNext = () => {
    if (products.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    if (products.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (products.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-clay-light/80 via-white to-bg-warm py-12 lg:py-20 border-b border-clay/60">
        <div className="absolute right-[5%] top-[10%] w-80 h-80 bg-[#eaded7] rounded-full blur-[70px] -z-10 opacity-70 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white border border-clay text-neutral-600 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            {heroBadge}
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-dark leading-tight tracking-tight uppercase whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="max-w-md mx-auto text-neutral-500 text-xs sm:text-sm font-light leading-relaxed whitespace-pre-line">
            {heroDescription}
          </p>
          <button
            onClick={onDiscoverClick}
            className="inline-flex items-center gap-2 bg-dark hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full shadow-xl transition cursor-pointer"
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4 text-brand" />
          </button>
        </div>
      </section>
    );
  }

  const currentProduct = products[activeIndex] || products[0];
  const discountAmount = (currentProduct.price * currentProduct.discountPercent) / 100;
  const salePrice = currentProduct.price - discountAmount;
  const isOutOfStock = !currentProduct.inStock || currentProduct.stockCount === 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-clay-light/85 via-white to-bg-warm py-10 sm:py-16 lg:py-20 border-b border-clay/60 transition-all duration-500">
      {/* Ambient background blurs for luxurious texture */}
      <div className="absolute right-[5%] top-[10%] w-96 h-96 bg-[#eaded7] rounded-full blur-[80px] -z-10 opacity-80 animate-pulse"></div>
      <div className="absolute left-[5%] bottom-[10%] w-80 h-80 bg-[#f3efed] rounded-full blur-[70px] -z-10 opacity-70"></div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Company Photo and Sourcing Details */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {heroBadge}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-dark leading-tight tracking-tight uppercase whitespace-pre-line">
                {heroTitle}
              </h1>
              <div className="h-1 w-16 bg-brand rounded-full"></div>
            </div>

            {/* Luxurious Company Showroom Photo Frame */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl aspect-[16/10] bg-white group">
              <img 
                src={aboutImageUrl} 
                alt="Showroom Store Showcase" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-transparent to-transparent flex items-end p-5">
                <div className="text-white space-y-1">
                  <span className="text-[8px] uppercase tracking-widest text-brand font-black bg-white px-2 py-0.5 rounded-md">
                    Store Showcase
                  </span>
                  <p className="font-serif text-xs font-bold uppercase tracking-wider">{heroImageCaption}</p>
                </div>
              </div>
            </div>

            {/* Exquisite description of what we sell */}
            <div className="space-y-4 font-sans text-neutral-600">
              <p className="text-xs sm:text-sm font-light leading-relaxed whitespace-pre-line">
                {heroDescription}
              </p>
            </div>

            {/* Call to action to discover catalog */}
            <div className="pt-2">
              <button
                onClick={onDiscoverClick}
                className="inline-flex items-center gap-2.5 bg-dark hover:bg-brand text-white text-[11px] font-bold uppercase tracking-widest py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
              >
                <span>Discover Collections</span>
                <ArrowRight className="w-4 h-4 text-brand" />
              </button>
            </div>
          </div>

          {/* Right Column: Premium Dynamic Product Slider */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-400">
                Premium Showcase ({activeIndex + 1} of {products.length})
              </span>
              
              {/* Slider Navigation Arrows */}
              {products.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 bg-white hover:bg-dark hover:text-white text-neutral-600 rounded-full border border-clay transition cursor-pointer shadow-xs active:scale-95"
                    title="Previous Product"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 bg-white hover:bg-dark hover:text-white text-neutral-600 rounded-full border border-clay transition cursor-pointer shadow-xs active:scale-95"
                    title="Next Product"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Product Slider Card Group */}
            <div className="relative group">
              {/* Slide decorative back glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-brand to-[#eaded7] rounded-3xl blur-xl opacity-35 -z-10 animate-pulse"></div>

              {/* PRODUCT PHOTO: Image container matching requirements */}
              <div 
                onClick={() => onViewDetails?.(currentProduct)}
                className="relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl bg-[#faf8f7] aspect-[16/10] cursor-pointer"
              >
                <img 
                  src={currentProduct.image} 
                  alt={currentProduct.name} 
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain p-6 transition-all duration-700 ${isOutOfStock ? 'opacity-65 grayscale-[30%]' : 'group-hover:scale-[1.02]'}`}
                  key={currentProduct.id}
                />
                
                {/* Spotlights Tags */}
                <div className="absolute top-4 left-4 bg-brand/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-md border border-brand/20">
                  ✨ Best Seller
                </div>

                {/* Stock Warning/Badge */}
                {isOutOfStock ? (
                  <div className="absolute top-4 right-4 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-md">
                    Sold Out
                  </div>
                ) : (
                  currentProduct.discountPercent > 0 && (
                    <div className="absolute top-4 right-4 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-md animate-pulse">
                      {currentProduct.discountPercent}% OFF
                    </div>
                  )
                )}
              </div>

              {/* PRODUCT DETAILS BELOW PHOTO: Brand, Name, and Price Container */}
              <div className="mt-4 bg-white border border-clay-light p-5 sm:p-6 rounded-3xl shadow-xl space-y-4 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand bg-brand/5 px-2.5 py-1 rounded-md inline-block">
                      {currentProduct.brand || "Boutique Exclusive"}
                    </span>
                    <span className="text-[8px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded uppercase">
                      {currentProduct.category}
                    </span>
                  </div>
                  
                  <h3 
                    onClick={() => onViewDetails?.(currentProduct)}
                    className="font-serif text-lg sm:text-xl font-black text-dark tracking-tight uppercase leading-snug hover:text-brand transition cursor-pointer"
                  >
                    {currentProduct.name}
                  </h3>

                  {/* PRICE DISPLAY */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="font-mono text-base sm:text-lg font-black text-brand">
                      {formatPrice(salePrice, currency)}
                    </span>
                    {currentProduct.discountPercent > 0 && (
                      <span className="font-mono text-xs text-neutral-400 line-through">
                        {formatPrice(currentProduct.price, currency)}
                      </span>
                    )}
                  </div>

                  <p className="font-sans text-neutral-500 text-xs font-light leading-relaxed line-clamp-2 pt-1">
                    {currentProduct.description}
                  </p>
                </div>

                {/* Interactive Action Row */}
                <div className="border-t border-dashed border-clay-light pt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onViewDetails?.(currentProduct)}
                    className="bg-dark hover:bg-brand text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Product Details</span>
                  </button>

                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Hi Mahi Creations, I would like to inquire about: "${currentProduct.name}" (${currentProduct.brand || 'Boutique'}). Is it available?`);
                      window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                    }}
                    className="bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 text-[10px] font-black uppercase tracking-widest py-3 px-5 rounded-2xl transition cursor-pointer flex items-center gap-1.5"
                    title="WhatsApp Inquiry"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dot Progress Indicators */}
            {products.length > 1 && (
              <div className="flex justify-center gap-1.5 pt-2">
                {products.slice(0, 10).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex ? 'w-6 bg-brand' : 'w-2 bg-clay hover:bg-neutral-400'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
