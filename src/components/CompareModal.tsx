import React from 'react';
import { Product } from '../types';
import { X, Star, ShoppingBag, Eye } from 'lucide-react';
import { formatPrice, CurrencyCode } from '../utils/currency';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  currency: CurrencyCode;
}

export default function CompareModal({
  isOpen,
  onClose,
  products,
  onRemove,
  onAddToCart,
  onViewDetails,
  currency
}: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-clay shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-clay flex items-center justify-between bg-bg-warm/30">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-dark uppercase tracking-wide">
              Product Comparison
            </h3>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              Comparing {products.length} {products.length === 1 ? 'product' : 'products'} of your choice
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-clay-light rounded-full transition cursor-pointer text-neutral-400 hover:text-dark font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {products.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-neutral-500 text-sm">No products selected for comparison.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-dark hover:bg-brand text-white font-bold uppercase tracking-wider text-xs rounded-xl transition"
              >
                Go Back to Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start divide-y md:divide-y-0 md:divide-x divide-clay-light">
              {products.map((product) => {
                const discountAmount = (product.price * product.discountPercent) / 100;
                const salePrice = product.price - discountAmount;
                const images = product.images && product.images.length > 0 ? product.images : [product.image];

                return (
                  <div key={product.id} className="space-y-6 pt-6 md:pt-0 md:px-4 first:pl-0 last:pr-0 relative group text-left">
                    {/* Remove button */}
                    <button
                      onClick={() => onRemove(product.id)}
                      className="absolute top-0 right-0 p-1.5 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Product Image */}
                    <div className="aspect-[4/5] bg-bg-warm/15 rounded-2xl overflow-hidden border border-clay p-4 relative group/img">
                      <img
                        src={images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain mix-blend-multiply group-hover/img:scale-105 transition-transform duration-300"
                      />
                      {product.discountPercent > 0 && (
                        <div className="absolute top-3 left-3 bg-dark text-white text-[8px] font-bold tracking-widest uppercase py-0.5 px-1.5 rounded">
                          -{product.discountPercent}%
                        </div>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-2">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-brand font-bold bg-brand/5 px-2 py-1 rounded">
                        {product.category}
                      </span>
                      <h4 className="font-serif text-base font-bold text-dark tracking-wide line-clamp-1">
                        {product.name}
                      </h4>
                    </div>

                    {/* Specifications table */}
                    <div className="space-y-3.5 border-t border-clay-light pt-4 text-xs">
                      {/* Price row */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-neutral-400 uppercase tracking-wider text-[9px] font-bold col-span-1">Price</span>
                        <span className="col-span-2 font-semibold text-dark">
                          {formatPrice(salePrice, currency)}
                          {product.discountPercent > 0 && (
                            <span className="text-[10px] text-neutral-400 line-through ml-1.5">
                              {formatPrice(product.price, currency)}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Rating row */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-neutral-400 uppercase tracking-wider text-[9px] font-bold col-span-1">Rating</span>
                        <span className="col-span-2 flex items-center gap-1">
                          <span className="font-bold text-dark flex items-center gap-0.5 text-brand">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {product.rating}
                          </span>
                          <span className="text-neutral-400">({product.reviewsCount} reviews)</span>
                        </span>
                      </div>

                      {/* Stock row */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-neutral-400 uppercase tracking-wider text-[9px] font-bold col-span-1">Stock</span>
                        <span className="col-span-2">
                          {product.inStock ? (
                            <span className="text-emerald-700 font-medium">
                              In Stock {product.stockCount !== undefined ? `(${product.stockCount} left)` : ''}
                            </span>
                          ) : (
                            <span className="text-rose-600 font-medium">Sold Out</span>
                          )}
                        </span>
                      </div>

                      {/* Description row */}
                      <div className="space-y-1">
                        <span className="text-neutral-400 uppercase tracking-wider text-[9px] font-bold block">Description</span>
                        <p className="text-neutral-500 font-light leading-relaxed line-clamp-4">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex gap-2 pt-2 border-t border-clay-light">
                      <button
                        onClick={() => onViewDetails(product)}
                        className="flex-1 py-2 border border-clay bg-white hover:bg-neutral-50 text-dark font-bold uppercase tracking-wider text-[10px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <button
                        onClick={() => product.inStock && onAddToCart(product)}
                        disabled={!product.inStock}
                        className={`flex-1 py-2 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                          product.inStock ? 'bg-dark hover:bg-brand' : 'bg-clay-light text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add To Bag
                      </button>
                    </div>

                  </div>
                );
              })}

              {/* Add filler slot if less than 3 compared */}
              {products.length < 3 && (
                <div className="hidden md:flex flex-col items-center justify-center border-2 border-dashed border-clay-light rounded-3xl aspect-[4/5] p-6 text-center space-y-2 bg-[#fafbfb] text-neutral-400">
                  <span className="text-2xl">✨</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Select Product</p>
                  <p className="text-[9px] font-light max-w-[150px]">
                    Compare up to 3 luxury items to find your ideal match.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
