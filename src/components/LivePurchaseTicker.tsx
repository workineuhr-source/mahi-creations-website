import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, X, CheckCircle } from 'lucide-react';
import { Product } from '../types';

interface LivePurchaseTickerProps {
  products: Product[];
}

interface SimulatedPurchase {
  buyerName: string;
  location: string;
  productName: string;
  productImg: string;
  timeAgo: string;
}

const BUYERS = [
  { name: 'Anisha K.', location: 'Jhamsikhel, Lalitpur' },
  { name: 'Meera S.', location: 'Baneshwor, Kathmandu' },
  { name: 'Rojina S.', location: 'Lakeside, Pokhara' },
  { name: 'Sujata P.', location: 'Sauraha, Chitwan' },
  { name: 'Sajina B.', location: 'Chabahil, Kathmandu' },
  { name: 'Kripa P.', location: 'Amarpath, Butwal' },
  { name: 'Prerna K.', location: 'Dharan, Sunsari' }
];

export default function LivePurchaseTicker({ products }: LivePurchaseTickerProps) {
  const [purchase, setPurchase] = useState<SimulatedPurchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!products || products.length === 0) return;

    // Cycle through a mock live purchase notification every 15-20 seconds
    const interval = setInterval(() => {
      // Pick random buyer
      const buyer = BUYERS[Math.floor(Math.random() * BUYERS.length)];
      // Pick random product
      const product = products[Math.floor(Math.random() * products.length)];
      
      const timeOptions = ['Just now', '2 mins ago', '5 mins ago', '1 min ago'];
      const timeAgo = timeOptions[Math.floor(Math.random() * timeOptions.length)];

      setPurchase({
        buyerName: buyer.name,
        location: buyer.location,
        productName: product.name,
        productImg: product.image,
        timeAgo
      });
      setIsVisible(true);

      // Hide after 6 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);

    }, 18000);

    // Show initial one after 4 seconds
    const initialTimeout = setTimeout(() => {
      const buyer = BUYERS[0];
      const product = products[0] || { name: 'Mahi Velvet Matte Liquid Lipstick', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80' };
      setPurchase({
        buyerName: buyer.name,
        location: buyer.location,
        productName: product.name,
        productImg: product.image,
        timeAgo: 'Just now'
      });
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [products]);

  if (!purchase) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="live-purchase-ticker"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-40 max-w-sm w-[calc(100vw-3rem)] bg-white/95 backdrop-blur-md border border-brand/20 rounded-2xl p-4 shadow-xl flex items-center gap-3.5"
        >
          {/* Product Thumbnail */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 border border-clay-light flex-shrink-0">
            <img 
              src={purchase.productImg} 
              alt={purchase.productName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-brand" />
              <span>Verified Boutique Order</span>
              <span className="text-neutral-300 font-normal">•</span>
              <span className="text-neutral-400 font-bold font-mono normal-case tracking-normal">{purchase.timeAgo}</span>
            </div>
            
            <p className="text-xs text-neutral-800 font-medium leading-tight mt-1 truncate">
              <span className="font-extrabold text-neutral-900">{purchase.buyerName}</span> ({purchase.location})
            </p>
            
            <p className="text-[10px] text-neutral-500 font-light mt-0.5 truncate leading-relaxed">
              secured <span className="font-bold text-neutral-700">{purchase.productName}</span>
            </p>
          </div>

          {/* Action icon */}
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition flex-shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
