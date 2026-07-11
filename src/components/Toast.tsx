import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

export interface ToastItem {
  id: string;
  product: Product;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
  onViewCart: () => void;
}

export default function ToastContainer({ toasts, onRemove, onViewCart }: ToastContainerProps) {
  return (
    <div className="fixed top-24 right-4 z-[90] pointer-events-none flex flex-col gap-3 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
            onViewCart={onViewCart}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastCardProps {
  key?: string;
  toast: ToastItem;
  onRemove: (id: string) => void;
  onViewCart: () => void;
}

function ToastCard({ toast, onRemove, onViewCart }: ToastCardProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-brand/20 shadow-xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 relative overflow-hidden group hover:shadow-2xl hover:border-brand/40 transition-all text-left"
    >
      {/* Decorative vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />

      {/* Product Thumbnail */}
      <div className="w-11 h-14 bg-bg-warm/30 rounded-lg overflow-hidden border border-clay flex-shrink-0 flex items-center justify-center p-1 bg-white">
        <img
          src={toast.product.image}
          alt={toast.product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0 pr-6">
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-widest text-[9px]">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
          {toast.message}
        </div>
        <p className="font-serif text-xs font-bold text-dark truncate mt-0.5 max-w-[180px] sm:max-w-[220px]">
          {toast.product.name}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewCart();
            onRemove(toast.id);
          }}
          className="text-[10px] font-black text-brand hover:text-brand-hover uppercase tracking-widest flex items-center gap-1 mt-1.5 hover:underline cursor-pointer group/btn"
        >
          <ShoppingBag className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
          View Bag ↗
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-dark hover:bg-neutral-100 rounded-full transition cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
