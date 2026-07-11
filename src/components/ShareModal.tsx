import React, { useState } from 'react';
import { Product } from '../types';
import { formatPrice, CurrencyCode } from '../utils/currency';
import { X, Copy, Check, Facebook, Instagram, Share2, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  currency: CurrencyCode;
}

export default function ShareModal({ isOpen, onClose, product, currency }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Compute pricing details in chosen currency
  const discountAmount = (product.price * product.discountPercent) / 100;
  const salePrice = product.price - discountAmount;
  const formattedSalePrice = formatPrice(salePrice, currency);
  const formattedOriginalPrice = formatPrice(product.price, currency);

  // Construct direct link mockup
  const shareUrl = `${window.location.origin}/?product=${product.id}`;

  // Formatted caption for copy-pasting to Facebook / Instagram / WhatsApp
  const shareCaption = `✨ LUXURY BEAUTY REVELATION ✨
💄 Mahi Creations Cosmetics - ${product.name}

${product.description}

🌟 Rating: ${product.rating} ★ (${product.reviewsCount} premium reviews)
💝 Exclusive Offer: ${product.discountPercent > 0 ? `${product.discountPercent}% OFF!` : 'New Launch'}
🏷️ Price: ${formattedSalePrice} ${product.discountPercent > 0 ? `(Was ${formattedOriginalPrice})` : ''}

🛒 Order directly on our website & get secure luxury delivery!
🔗 Shop Now: ${shareUrl}

#MahiCreations #CosmeticsBoutique #NepalBeauty #CleanBeauty #VeganMakeup #NepalFashion #Lips #Face`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(shareCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareCaption)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/60 backdrop-blur-xs"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl border border-clay overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[640px]"
          >
          
          {/* Left Column: Visual Simulated Post Mockup */}
          <div className="w-full md:w-1/2 bg-bg-warm p-5 border-b md:border-b-0 md:border-r border-clay flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  Social Feed Preview
                </span>
                <span className="text-[9px] font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase">
                  Active in {currency}
                </span>
              </div>

              {/* Instagram/Facebook Post Container */}
              <div className="bg-white rounded-2xl border border-clay overflow-hidden shadow-sm">
                {/* Simulated Header */}
                <div className="p-3 flex items-center gap-2.5 border-b border-clay-light">
                  <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white font-serif font-black text-xs">
                    M
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark leading-none">mahicreations_nepal</p>
                    <p className="text-[9px] text-neutral-400">Sponsored • Lalitpur, Nepal</p>
                  </div>
                </div>

                {/* Simulated Image */}
                <div className="aspect-square bg-clay-light relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.discountPercent > 0 && (
                    <div className="absolute bottom-3 left-3 bg-dark text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                      SAVE {product.discountPercent}%
                    </div>
                  )}
                </div>

                {/* Simulated Actions & Caption Area */}
                <div className="p-3 space-y-1.5 font-sans">
                  <div className="flex items-center gap-3 text-neutral-600 mb-1">
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    <MessageCircle className="w-4 h-4" />
                    <Share2 className="w-4 h-4 ml-auto" />
                  </div>
                  
                  <div className="text-[11px] leading-relaxed text-dark">
                    <span className="font-bold mr-1">mahicreations_nepal</span>
                    {product.name} — Luxury formulation. Available for 
                    <span className="font-bold text-brand ml-1">{formattedSalePrice}</span>! 
                    {product.discountPercent > 0 && (
                      <span className="text-neutral-400 line-through text-[9px] ml-1">
                        ({formattedOriginalPrice})
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[9px] uppercase tracking-wider font-bold text-brand mt-1.5">
                    #MahiCreations #CosmeticsBoutique #NepalBeauty
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 font-light mt-4 text-center">
              Your customers will see beautiful previews with full photos, specs, and price formatting in {currency}!
            </p>
          </div>

          {/* Right Column: Sharing triggers and copy elements */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-clay">
                <div>
                  <h3 className="font-serif text-lg font-bold text-dark">Share Cosmetics</h3>
                  <p className="text-neutral-400 text-xs font-light">Blast premium cosmetics to socials</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-bg-warm border border-transparent hover:border-clay cursor-pointer text-neutral-400 hover:text-dark transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Share actions */}
              <div className="space-y-3">
                <button
                  onClick={handleFacebookShare}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#0c63d4] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                  Share to Facebook
                </button>

                <button
                  onClick={handleCopyCaption}
                  className="w-full flex items-center justify-center gap-2.5 bg-dark hover:bg-neutral-800 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {copiedCaption ? <Check className="w-4 h-4 text-emerald-400" /> : <Instagram className="w-4 h-4" />}
                  {copiedCaption ? 'Caption Copied!' : 'Copy Instagram Caption'}
                </button>
              </div>

              {/* Direct links container */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Direct Page Link</label>
                <div className="flex items-center gap-2 bg-bg-warm p-2 rounded-xl border border-clay">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full text-[11px] font-mono bg-transparent outline-none text-neutral-600 truncate px-1"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-white hover:bg-brand hover:text-white border border-clay rounded-lg cursor-pointer transition flex-shrink-0"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Rich Caption Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 flex justify-between items-center">
                  <span>Pre-crafted Captions</span>
                  <span className="text-[9px] font-medium text-brand">Includes Hashtags</span>
                </label>
                <textarea
                  readOnly
                  rows={4}
                  value={shareCaption}
                  className="w-full bg-neutral-50 text-[10px] font-mono border border-clay rounded-xl p-3 resize-none outline-none text-neutral-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-clay mt-4 flex items-center gap-2 text-xs font-bold text-neutral-500">
              <Share2 className="w-4 h-4 text-brand" />
              <span>UAE Launch Ready • Multi-Currency Synced</span>
            </div>
          </div>

        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
