import React, { useState } from 'react';
import { Product } from '../types';
import { Star, X, ShoppingBag, Eye, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatPrice, CurrencyCode, getProductDisplayPrices } from '../utils/currency';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  currency: CurrencyCode;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  currency
}: QuickViewModalProps) {
  if (!isOpen || !product) return null;

  const [addedMessage, setAddedMessage] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

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
  const image = product.image;

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm font-sans animate-fade-in">
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-clay flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 bg-white/90 hover:bg-dark hover:text-white rounded-full shadow-md text-neutral-500 transition-all cursor-pointer border border-clay-light"
          title="Close Quick View"
        >
          <X className="w-4 h-4" />
        </button>

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
          <img
            src={image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
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

          {product.inStock && !isZoomed && (
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
