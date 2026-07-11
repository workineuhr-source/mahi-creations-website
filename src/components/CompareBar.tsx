import React from 'react';
import { Product } from '../types';
import { X, ArrowRightLeft, Sparkles } from 'lucide-react';

interface CompareBarProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}

export default function CompareBar({ products, onRemove, onClear, onOpenCompare }: CompareBarProps) {
  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-dark text-white rounded-2xl shadow-2xl border border-white/10 p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="bg-brand/20 text-brand p-2 rounded-xl flex-shrink-0 animate-pulse">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            Compare list
            <span className="bg-brand text-dark text-[10px] font-black px-2 py-0.5 rounded-full">
              {products.length} / 3
            </span>
          </p>
          <p className="text-[10px] text-neutral-400 font-light hidden sm:block">
            {products.length === 3 ? 'Compare limit reached!' : 'Select up to 3 luxury items.'}
          </p>
        </div>
      </div>

      {/* Mini item list */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-full justify-start sm:justify-center">
        {products.map((p) => (
          <div key={p.id} className="relative w-12 h-14 bg-white/10 border border-white/15 rounded-xl p-1 flex-shrink-0 group">
            <img src={p.image} alt={p.name} className="w-full h-full object-contain rounded" />
            <button
              onClick={() => onRemove(p.id)}
              className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 shadow-md hover:scale-110 transition cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={onClear}
          className="px-3.5 py-2 text-neutral-400 hover:text-white font-bold uppercase tracking-wider text-[10px] transition cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={onOpenCompare}
          disabled={products.length < 1}
          className={`px-5 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] transition shadow-md flex items-center gap-1.5 cursor-pointer ${
            products.length > 0
              ? 'bg-brand text-dark hover:scale-102 hover:bg-brand/90'
              : 'bg-white/10 text-neutral-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Compare {products.length > 1 ? 'Now' : ''}
        </button>
      </div>
    </div>
  );
}
