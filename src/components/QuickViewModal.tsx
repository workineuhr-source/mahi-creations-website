import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Star, X, ShoppingBag, Eye, ShieldCheck, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, CurrencyCode, getProductDisplayPrices } from '../utils/currency';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  currency: CurrencyCode;
  onPrevProduct?: () => void;
  onNextProduct?: () => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  currency,
  onPrevProduct,
  onNextProduct
}: QuickViewModalProps) {
  const [addedMessage, setAddedMessage] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = product && product.images && product.images.length > 0 
    ? product.images 
    : (product ? [product.image] : []);

  // Reset image index when product changes or modal opens
  useEffect(() => {
    setCurrentImgIndex(0);
  }, [product?.id, isOpen]);

  // Keyboard navigation for accessibility: Esc to close, Arrow keys to cycle
  useEffect(() => {
    if (!isOpen || !product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing inside input or textarea
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT'
      );

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (!isTyping && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
        e.preventDefault();
        if (images.length > 1) {
          setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
        } else if (onPrevProduct) {
          onPrevProduct();
        }
      } else if (!isTyping && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
        e.preventDefault();
        if (images.length > 1) {
          setCurrentImgIndex((prev) => (prev + 1) % images.length);
        } else if (onNextProduct) {
          onNextProduct();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, product, images.length, onClose, onPrevProduct, onNextProduct]);

  if (!isOpen || !product) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!product.inStock) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Compute display pricing
  const {
    formattedOriginal,
    formattedSale
  } = getProductDisplayPrices(product, currency);
  const currentImage = images[currentImgIndex] || product.image;

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm font-sans animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view for ${product.name}`}
    >
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-clay flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Navigation & Close Header Buttons */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5">
          {onPrevProduct && (
            <button
              onClick={onPrevProduct}
              className="p-1.5 bg-white/90 hover:bg-dark hover:text-white rounded-full shadow-md text-neutral-500 transition-all cursor-pointer border border-clay-light"
              title="Previous product (← / ↑)"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onNextProduct && (
            <button
              onClick={onNextProduct}
              className="p-1.5 bg-white/90 hover:bg-dark hover:text-white rounded-full shadow-md text-neutral-500 transition-all cursor-pointer border border-clay-light"
              title="Next product (→ / ↓)"
              aria-label="Next product"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 bg-white/90 hover:bg-dark hover:text-white rounded-full shadow-md text-neutral-500 transition-all cursor-pointer border border-clay-light"
            title="Close Quick View (Esc)"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Left Side: Product Image */}
        <div 
          className="w-full md:w-1/2 relative bg-clay-light aspect-[4/5] md:aspect-auto overflow-hidden cursor-zoom-in group/quickzoom"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => product.inStock && setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {product.discountPercent > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-brand text-white text-[9px] font-bold tracking-widest uppercase py-1 px-2.5 rounded shadow">
              {product.discountPercent}% OFF
            </div>
          )}

          {/* Keyboard shortcut indicator overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-dark/70 backdrop-blur-xs text-[8px] text-white/90 font-mono px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover/quickzoom:opacity-100 transition-opacity">
            Esc close • ← → cycle
          </div>

          <img
            src={currentImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-all duration-200"
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: 'scale(2.5)',
                    transition: 'transform 0.08s ease-out, transform-origin 0.04s ease-out'
                  }
                : {
                    transformOrigin: 'center',
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease-out, transform-origin 0.3s ease-out'
                  }
            }
          />

          {/* Image Navigation Chevrons if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-dark hover:text-white rounded-full flex items-center justify-center text-dark shadow-md transition-all cursor-pointer z-10"
                aria-label="Previous image"
                title="Previous image (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-dark hover:text-white rounded-full flex items-center justify-center text-dark shadow-md transition-all cursor-pointer z-10"
                aria-label="Next image"
                title="Next image (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Thumbnail dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-dark/50 backdrop-blur-xs px-2 py-1 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImgIndex(idx);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentImgIndex ? 'bg-amber-400 w-3' : 'bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {product.inStock && !isZoomed && images.length <= 1 && (
            <div className="absolute bottom-3 right-3 z-10 bg-dark/70 backdrop-blur-xs text-[8px] text-white font-bold tracking-widest uppercase py-1 px-2 rounded-full flex items-center gap-1.5 pointer-events-none transition-opacity duration-300 opacity-0 group-hover/quickzoom:opacity-100">
              <span>🔍 Zoom</span>
            </div>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-dark/45 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <span className="bg-dark text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded shadow-lg border border-white/10">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Essential Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Category / In-Stock Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] tracking-[0.2em] uppercase text-brand font-black bg-clay-light px-2 py-0.5 rounded">
                {product.category}
              </span>
              {product.inStock ? (
                product.stockCount !== undefined && product.stockCount < 5 ? (
                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-rose-600"></span>
                    Only {product.stockCount} left!
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse"></span>
                    In Stock
                  </span>
                )
              ) : (
                <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="font-serif text-lg font-bold text-dark leading-tight line-clamp-2">
              {product.name}
            </h3>

            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex items-center text-brand">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.rating) ? 'fill-current' : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-neutral-800">{product.rating}</span>
            </div>

            {/* Essential Price Row */}
            <div className="bg-bg-warm/30 border border-clay p-3 rounded-xl">
              <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-dark">
                  {formattedSale}
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formattedOriginal}
                  </span>
                )}
              </div>
            </div>

            {/* Shortened Highlight */}
            <p className="text-neutral-500 text-xs font-light leading-relaxed line-clamp-3">
              {product.description}
            </p>
          </div>

          {/* Checkout / Add to bag CTA button */}
          <div className="mt-5 space-y-2">
            <button
              onClick={handleAddToBag}
              disabled={!product.inStock}
              className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                product.inStock
                  ? 'bg-dark hover:bg-brand text-white'
                  : 'bg-clay-light text-neutral-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Bag / Cart
            </button>

            {addedMessage && (
              <p className="text-emerald-700 text-[10px] text-center font-bold animate-pulse">
                ✓ Added to bag!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
