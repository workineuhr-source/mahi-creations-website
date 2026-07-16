import React, { useState } from 'react';
import { Product } from '../types';
import { Star, ShoppingBag, Flame, Sparkles, Share2, ChevronLeft, ChevronRight, Heart, Eye, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, CurrencyCode, getProductDisplayPrices } from '../utils/currency';
import ShareModal from './ShareModal';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  currency: CurrencyCode;
  onViewDetails?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  key?: React.Key | string;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  isCompared: boolean;
  onToggleCompare: (productId: string) => void;
  isHDMode?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  currency,
  onViewDetails,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  isHDMode = true
}: ProductCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Image list check
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  // Auto-slide images every 5 seconds if multiple photos exist
  React.useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImgIndex, images.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOutOfStock) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Compute display prices and currency
  const {
    displayCurrency,
    formattedOriginal,
    formattedSale
  } = getProductDisplayPrices(product, currency);

  // Automatically detect out of stock if flag is false or stock count is 0
  const isOutOfStock = !product.inStock || product.stockCount === 0;

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleOpenShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShareOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
        onClick={() => onViewDetails?.(product)}
        className={`group bg-white rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col h-full relative cursor-pointer ${
          isHDMode 
            ? 'border-neutral-300/80 shadow-md hover:shadow-2xl hover:border-brand/60 hover:-translate-y-1.5 hover:scale-[1.025]' 
            : 'border-clay hover:shadow-xl hover:border-brand/40 hover:-translate-y-1 hover:scale-[1.02]'
        }`}
      >
        
        {/* Floating Share Button (Top Left) */}
        <button
          onClick={handleOpenShare}
          className="absolute top-4 left-4 z-10 bg-white/95 hover:bg-brand hover:text-white text-dark p-2.5 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border border-clay/60"
          title="Share to Facebook & Instagram"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Floating Wishlist Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 z-10 bg-white/95 hover:bg-rose-50 text-dark p-2.5 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border border-clay/60"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-neutral-600"}`} />
        </button>

        {/* Floating Compare Button (Top Right, styled beautifully next to Wishlist) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleCompare(product.id);
          }}
          className={`absolute top-4 right-[48px] z-10 p-2.5 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border border-clay/60 ${
            isCompared
              ? 'bg-brand text-white border-brand'
              : 'bg-white/95 text-neutral-600 hover:bg-clay-light'
          }`}
          title={isCompared ? "Remove from comparison" : "Compare this item (up to 3)"}
        >
          <GitCompare className="w-3.5 h-3.5" />
        </button>

        {/* Floating Badges Stack */}
        <div className="absolute top-16 left-4 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div key="out-of-stock-badge" className="bg-neutral-900/95 text-white text-[8px] font-black tracking-widest uppercase py-1 px-2.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Out of Stock
            </div>
          )}

          {/* Low Stock Badge */}
          {!isOutOfStock && product.stockCount !== undefined && product.stockCount < 5 && product.stockCount > 0 && (
            <div key="low-stock-badge" className="bg-rose-600 text-white text-[8px] font-black tracking-widest uppercase py-1 px-2.5 rounded-full shadow-lg flex items-center gap-1.5 border border-rose-500 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Only {product.stockCount} Left!
            </div>
          )}

          {/* Best Seller Badge (if reviews count is > 50) */}
          {!isOutOfStock && product.reviewsCount !== undefined && product.reviewsCount > 50 && (
            <div key="best-seller-badge" className="bg-amber-500 text-white text-[8px] font-black tracking-widest uppercase py-1 px-2.5 rounded-full shadow-lg flex items-center gap-1 border border-amber-400">
              <Flame className="w-2.5 h-2.5 fill-current text-white animate-pulse" />
              Best Seller
            </div>
          )}

          {/* Limited Deal Badge (if discount is high, e.g. >= 15%) */}
          {!isOutOfStock && product.discountPercent !== undefined && product.discountPercent >= 15 && (
            <div key="limited-deal-badge" className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[8px] font-black tracking-widest uppercase py-1 px-2.5 rounded-full shadow-lg flex items-center gap-1 border border-rose-400">
              <Sparkles className="w-2.5 h-2.5 text-white" />
              Limited Deal
            </div>
          )}
        </div>

        {/* Discount Tag (Artistic Black Block Style - shifted slightly to the left of Wishlist button) */}
        {product.discountPercent > 0 && (
          <div key="discount-tag" className="absolute top-5 right-14 z-10 bg-dark text-white text-[9px] font-bold tracking-widest uppercase py-1 px-2 rounded shadow-md">
            -{product.discountPercent}% OFF
          </div>
        )}

        {/* Subtle Out of Stock Overlay */}
        {isOutOfStock && (
          <div key="out-of-stock-overlay" className="absolute inset-0 bg-neutral-900/5 backdrop-blur-[0.5px] z-[5] pointer-events-none transition-all duration-300" />
        )}

        {/* Image container with Slider */}
        <div 
          className="relative aspect-square overflow-hidden bg-neutral-50/40 group/slider cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => !isOutOfStock && setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={(e) => {
            if (images.length > 1) {
              e.stopPropagation();
              e.preventDefault();
              setCurrentImgIndex((prev) => (prev + 1) % images.length);
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImgIndex}
              src={images[currentImgIndex]}
              alt={`${product.name} - Slide ${currentImgIndex + 1}`}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-contain p-4 object-center ${isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              loading="lazy"
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(2.4)',
                      transition: 'transform 0.08s ease-out, transform-origin 0.04s ease-out'
                    }
                  : {
                      transformOrigin: 'center',
                      transform: 'scale(1)',
                      transition: 'transform 0.3s ease-out, transform-origin 0.3s ease-out'
                    }
              }
            />
          </AnimatePresence>

          {/* Zoom Texture Hint */}
          {!isOutOfStock && !isZoomed && (
            <div className="absolute bottom-3 right-3 z-10 bg-dark/70 backdrop-blur-xs text-[8px] text-white font-black tracking-widest uppercase py-1 px-2.5 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover/slider:opacity-100 flex items-center gap-1">
              <span>🔍 Zoom</span>
            </div>
          )}

          {/* Subtly decorative hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Slider controls if multiple photos exist */}
          {images.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-dark hover:text-white rounded-full flex items-center justify-center text-dark shadow-md opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer z-10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNextImage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-dark hover:text-white rounded-full flex items-center justify-center text-dark shadow-md opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer z-10"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCurrentImgIndex(idx);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentImgIndex
                        ? 'bg-brand w-3.5'
                        : 'bg-white/65 hover:bg-white'
                    }`}
                    aria-label={`Go to photo slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick View Button Overlay */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onQuickView?.(product);
              }}
              className="bg-white/95 hover:bg-brand hover:text-white text-dark font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-clay transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>
        </div>

        {/* Content wrapper */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          {/* Category & Star Rating row */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[10px] tracking-[0.25em] uppercase text-brand font-bold bg-clay-light px-2.5 py-1 rounded">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-brand text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-neutral-700">{product.rating}</span>
              <span className="text-neutral-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-dark leading-snug mb-1.5 group-hover:text-brand transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>

          {/* Description summary */}
          <p className="text-neutral-500 text-xs sm:text-sm font-light line-clamp-2 mb-3 flex-grow leading-relaxed">
            {product.description}
          </p>

          {/* Pricing & Add to Cart section */}
          <div className="border-t border-clay-light pt-3 mt-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Price</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-sm sm:text-base font-bold text-dark">
                    {formattedSale}
                  </span>
                  {product.discountPercent > 0 && (
                    <span className="text-xs text-neutral-400 line-through">
                      {formattedOriginal}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Bag trigger */}
              <button
                onClick={() => !isOutOfStock && onAddToCart(product)}
                disabled={isOutOfStock}
                className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                  !isOutOfStock
                    ? 'bg-dark hover:bg-brand text-white hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                    : 'bg-clay-light text-neutral-400 cursor-not-allowed'
                }`}
                title={!isOutOfStock ? 'Add to bag' : 'Sold Out'}
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Render Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        product={product}
        currency={currency}
      />
    </>
  );
}
