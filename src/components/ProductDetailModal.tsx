import React, { useState } from 'react';
import { Product, ProductReview, UserSession } from '../types';
import { Star, X, ShoppingBag, Truck, Check, Sparkles, Heart, HelpCircle, MessageSquare, Flame, Camera, Image, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, CurrencyCode } from '../utils/currency';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  currency: CurrencyCode;
  reviews: ProductReview[];
  onAddReview?: (review: ProductReview) => void;
  userSession?: UserSession | null;
  onAuthNeeded?: () => void;
}

const BEAUTY_PLACEHOLDERS = [
  {
    name: '🎨 Palette Glow Swatch',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: '💄 Matte Lipstick Swatch',
    url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: '🧴 Dewy Liquid Glow',
    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: '🌸 Hydra Gold Petal Elixir',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: '👑 Traditional Shimmer Jewels',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: '👗 Organza Pure Silk Couture',
    url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80'
  }
];

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  currency,
  reviews,
  onAddReview,
  userSession,
  onAuthNeeded
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [addedMessage, setAddedMessage] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

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
    if (!product.inStock) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Review submission state
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewName, setReviewName] = useState(userSession?.fullName || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Sync session name if logged in
  React.useEffect(() => {
    if (userSession?.fullName) {
      setReviewName(userSession.fullName);
    }
  }, [userSession?.fullName]);

  // Compute pricing
  const discountAmount = (product.price * product.discountPercent) / 100;
  const salePrice = product.price - discountAmount;

  // Filter reviews for this specific product (approved ones, plus user's own reviews awaiting approval)
  const productReviews = reviews.filter(
    (r) => r.productId === product.id && (r.approved || (userSession && r.customerName === userSession.fullName))
  );

  const handleAddToBag = () => {
    onAddToCart(product);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  const handleDirectBuy = () => {
    onBuyNow(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-dark/65 backdrop-blur-md font-sans">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-clay animate-fade-in my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Close */}
        <div className="absolute right-5 top-5 z-20">
          <button
            onClick={onClose}
            className="p-2 bg-white/90 hover:bg-dark hover:text-white rounded-full shadow-md text-neutral-500 transition-all cursor-pointer border border-clay-light"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Visual Product Gallery */}
            <div className="md:col-span-5 space-y-4">
              <div 
                className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-clay bg-clay-light shadow-inner cursor-zoom-in group/detailzoom"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => product.inStock && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={(e) => {
                  if (images.length > 1) {
                    setCurrentImgIndex((prev) => (prev + 1) % images.length);
                  }
                }}
              >
                
                {product.discountPercent > 0 && (
                  <div className="absolute top-4 left-4 z-10 bg-brand text-white text-[9px] font-bold tracking-widest uppercase py-1 px-2.5 rounded shadow">
                    {product.discountPercent}% OFF
                  </div>
                )}

                <img
                  src={images[currentImgIndex]}
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

                {/* Left/Right Chevrons overlay */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 hover:bg-dark hover:text-white rounded-full flex items-center justify-center text-dark shadow-md opacity-0 group-hover/detailzoom:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImgIndex((prev) => (prev + 1) % images.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 hover:bg-dark hover:text-white rounded-full flex items-center justify-center text-dark shadow-md opacity-0 group-hover/detailzoom:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {product.inStock && !isZoomed && (
                  <div className="absolute bottom-3 right-3 z-10 bg-dark/70 backdrop-blur-xs text-[9px] text-white font-bold tracking-wider py-1 px-2.5 rounded-full flex items-center gap-1.5 pointer-events-none transition-opacity duration-300 opacity-0 group-hover/detailzoom:opacity-100">
                    <span>🔍 Hover to Zoom Texture</span>
                  </div>
                )}

                {!product.inStock && (
                  <div className="absolute inset-0 bg-dark/45 backdrop-blur-[1.5px] z-10 flex items-center justify-center">
                    <span className="bg-dark text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg border border-white/10">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails list if multiple images exist */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        idx === currentImgIndex
                          ? 'border-brand shadow-sm scale-102'
                          : 'border-clay hover:border-neutral-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Unique selling points block */}
              <div className="bg-bg-warm/35 border border-clay-light p-4 rounded-2xl space-y-2.5 text-xs text-neutral-600">
                <p className="font-bold text-dark uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  Mahi Creations Guarantee
                </p>
                <div className="space-y-1.5 font-medium leading-relaxed">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                    100% Original Premium Cosmetics
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                    Clinically safe & Hydrated Formulas
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                    Custom-crafted luxury packaging
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Complete specifications */}
            <div className="md:col-span-7 flex flex-col space-y-6">
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-brand font-bold bg-clay-light px-3 py-1 rounded">
                    {product.category}
                  </span>
                  
                  {product.inStock && (
                    product.stockCount !== undefined && product.stockCount < 5 ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        Low Stock: Only {product.stockCount} left!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                        In Stock & Ready
                      </span>
                    )
                  )}
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-dark tracking-tight leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-brand">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(product.rating) ? 'fill-current' : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-black text-neutral-800">{product.rating}</span>
                  <span className="text-neutral-400">({productReviews.length || product.reviewsCount} verified reviews)</span>
                </div>
              </div>

              {/* Price slab */}
              <div className="bg-bg-warm/45 border border-clay p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Sale price</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-dark">
                      {formatPrice(salePrice, currency)}
                    </span>
                    {product.discountPercent > 0 && (
                      <span className="text-xs text-neutral-400 line-through">
                        {formatPrice(product.price, currency)}
                      </span>
                    )}
                  </div>
                </div>

                {product.discountPercent > 0 && (
                  <div className="bg-dark text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded flex items-center gap-1 shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-brand fill-brand" />
                    Save {product.discountPercent}%
                  </div>
                )}
              </div>

              {/* Direct buying CTAs */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDirectBuy}
                    disabled={!product.inStock}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      product.inStock
                        ? 'bg-brand hover:bg-dark text-white'
                        : 'bg-clay-light text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Instant Buy Now
                  </button>

                  <button
                    onClick={handleAddToBag}
                    disabled={!product.inStock}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] border cursor-pointer ${
                      product.inStock
                        ? 'bg-white hover:bg-clay-light text-dark border-clay'
                        : 'bg-clay-light text-neutral-400 border-transparent cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Bag / Cart
                  </button>
                </div>

                {addedMessage && (
                  <p className="text-emerald-700 text-xs text-center font-bold animate-pulse">
                    ✓ Product added successfully to your shopping bag!
                  </p>
                )}
              </div>

              {/* Product Info Description */}
              <div className="space-y-3 text-xs leading-relaxed text-neutral-600 border-t border-clay-light pt-5">
                <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider">Product Highlights & Benefits</h4>
                <p className="font-light">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-bg-warm/25 p-3.5 rounded-xl border border-clay-light">
                    <p className="font-bold text-dark uppercase tracking-wider text-[9px] mb-1">Skin Type Friendly</p>
                    <p className="font-medium text-neutral-500">All Skins (Hypoallergenic tested)</p>
                  </div>
                  <div className="bg-bg-warm/25 p-3.5 rounded-xl border border-clay-light">
                    <p className="font-bold text-dark uppercase tracking-wider text-[9px] mb-1">Durability</p>
                    <p className="font-medium text-neutral-500">Up to 16 Hours matte longevity</p>
                  </div>
                </div>
              </div>

              {/* REVIEWS SEGMENT FOR THIS SPECIFIC PRODUCT */}
              <div className="border-t border-clay-light pt-6 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-brand" />
                    Verified Reviews ({productReviews.length})
                  </h4>

                  <button
                    onClick={() => setIsWritingReview(!isWritingReview)}
                    className="text-[10px] font-bold text-brand uppercase tracking-wider border border-brand/20 bg-brand/5 px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-all cursor-pointer"
                  >
                    {isWritingReview ? 'Close Form' : '✏️ Write a Review'}
                  </button>
                </div>

                {isWritingReview && (
                  !userSession ? (
                    <div className="bg-bg-warm/35 border border-clay p-6 rounded-xl text-center space-y-3 animate-fade-in">
                      <Lock className="w-5 h-5 text-brand mx-auto animate-bounce" />
                      <p className="font-bold text-dark text-xs uppercase tracking-wider">Authentication Required</p>
                      <p className="text-neutral-500 text-[11px] leading-relaxed max-w-xs mx-auto">
                        Please log in to your Mahi VIP account to post a product review. Only verified members can submit feedback.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onAuthNeeded?.();
                        }}
                        className="bg-brand hover:bg-dark text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                      >
                        Log In / Sign Up
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const finalName = userSession.fullName;
                        if (!finalName.trim()) {
                          alert('Please fill in your name.');
                          return;
                        }
                        if (!reviewComment.trim()) {
                          alert('Please share your valuable feedback!');
                          return;
                        }

                        if (onAddReview) {
                          const newReview: ProductReview = {
                            id: 'rev-' + Math.floor(1000 + Math.random() * 9000),
                            productId: product.id,
                            productName: product.name,
                            customerName: finalName.trim(),
                            rating: reviewRating,
                            comment: reviewComment.trim(),
                            createdAt: new Date().toISOString(),
                            approved: false, // Default to false, can be approved in admin console
                            photoUrl: reviewPhoto || undefined
                          };
                          onAddReview(newReview);
                        }

                        setReviewSuccess(true);
                        setReviewComment('');
                        setReviewPhoto('');
                        setTimeout(() => {
                          setReviewSuccess(false);
                          setIsWritingReview(false);
                        }, 2000);
                      }}
                      className="bg-bg-warm/35 border border-clay p-4 rounded-xl space-y-3.5 animate-fade-in text-left"
                    >
                      <h5 className="font-serif text-xs font-bold uppercase tracking-wider text-dark border-b border-clay pb-1.5">
                        Share Your Beauty Experience
                      </h5>

                      {reviewSuccess ? (
                        <div className="text-center py-4 space-y-2">
                          <p className="text-emerald-700 font-bold">✓ Thank you! Review submitted successfully.</p>
                          <p className="text-neutral-400 text-[10px]">Your feedback is awaiting review and is visible in your customer portal!</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-neutral-500 uppercase text-[9px] tracking-wider block">Your Name</label>
                              <input
                                type="text"
                                disabled
                                value={userSession.fullName}
                                className="w-full text-xs p-2.5 bg-neutral-100 border border-clay rounded-lg font-medium text-neutral-500 cursor-not-allowed"
                              />
                              <p className="text-[8px] text-emerald-600 font-bold">✓ Verified Mahi VIP Member</p>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-neutral-500 uppercase text-[9px] tracking-wider block">Cosmetic Rating</label>
                              <div className="flex items-center gap-1 py-1">
                                {[1, 2, 3, 4, 5].map((stars) => (
                                  <button
                                    key={stars}
                                    type="button"
                                    onClick={() => setReviewRating(stars)}
                                    className="cursor-pointer hover:scale-110 transition-all text-brand"
                                  >
                                    <Star className={`w-4 h-4 ${stars <= reviewRating ? 'fill-current' : 'text-neutral-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-neutral-500 uppercase text-[9px] tracking-wider block">Review Comments</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Describe pigment, glow texture, skincare hydration, duration, or luxurious unboxing..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-clay rounded-lg focus:outline-none focus:ring-1 focus:ring-brand font-medium text-dark"
                            />
                          </div>

                          {/* Photo Attachment Placeholder Selection */}
                          <div className="space-y-2 border-t border-clay/50 pt-3">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-neutral-500 uppercase text-[9px] tracking-wider flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-brand" />
                                Attach Luxury Review Photo
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const randomPic = BEAUTY_PLACEHOLDERS[Math.floor(Math.random() * BEAUTY_PLACEHOLDERS.length)];
                                  setReviewPhoto(randomPic.url);
                                }}
                                className="text-[9px] font-bold text-brand hover:underline"
                              >
                                ✨ Auto-Generate Photo
                              </button>
                            </div>

                            <div className="grid grid-cols-6 gap-1.5">
                              {BEAUTY_PLACEHOLDERS.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setReviewPhoto(preset.url)}
                                  title={preset.name}
                                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                    reviewPhoto === preset.url ? 'border-brand scale-102 ring-2 ring-brand/10' : 'border-clay hover:border-neutral-400'
                                  }`}
                                >
                                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>

                            {reviewPhoto && (
                              <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-clay mt-2">
                                <div className="flex items-center gap-2">
                                  <img src={reviewPhoto} alt="Selected attachment" className="w-8 h-8 rounded object-cover border border-clay" />
                                  <span className="text-[10px] font-medium text-neutral-500">Aesthetic photo attached successfully!</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setReviewPhoto('')}
                                  className="text-[9px] text-rose-600 font-bold hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsWritingReview(false)}
                              className="px-3.5 py-1.5 bg-clay-light hover:bg-clay text-neutral-700 font-bold uppercase tracking-wide rounded-lg transition text-[10px]"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-dark hover:bg-brand text-white font-bold uppercase tracking-widest rounded-lg transition text-[10px] shadow-sm cursor-pointer"
                            >
                              Post Review
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  )
                )}

                {productReviews.length === 0 ? (
                  <p className="italic text-neutral-400 font-light text-left">
                    Be the first to review this product! Share your glow feedback above.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                    {productReviews.map((rev) => (
                      <div key={rev.id} className="bg-bg-warm/25 p-3.5 border border-clay-light rounded-xl space-y-1.5 text-left">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-800">{rev.customerName}</span>
                            {!rev.approved && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200/50 font-bold uppercase">
                                Awaiting Approval
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-brand">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-neutral-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-neutral-600 font-light italic">"{rev.comment}"</p>

                        {rev.photoUrl && (
                          <div className="mt-1.5 relative rounded-xl overflow-hidden w-24 h-16 border border-clay hover:border-brand cursor-zoom-in group/photo bg-clay-light transition-all">
                            <img
                              src={rev.photoUrl}
                              alt="Customer review attachment"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-105"
                              onClick={() => setZoomedPhoto(rev.photoUrl || null)}
                            />
                            <div className="absolute inset-0 bg-dark/10 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[8px] text-white bg-dark/70 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Zoom</span>
                            </div>
                          </div>
                        )}

                        <p className="text-[9px] text-neutral-400 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Zoom Lightbox Modal inside detail modal */}
        {zoomedPhoto && (
          <div className="fixed inset-0 z-[60] bg-dark/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden border border-clay p-4 shadow-2xl animate-fade-in flex flex-col items-center">
              <button
                onClick={() => setZoomedPhoto(null)}
                className="absolute right-4 top-4 p-2 bg-white/90 hover:bg-dark hover:text-white rounded-full shadow-md text-neutral-500 transition-all cursor-pointer z-10 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-clay bg-neutral-100 mt-8 mb-4">
                <img src={zoomedPhoto} alt="Review attachment detail" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-neutral-400 font-mono text-center">Verified Customer Attachment View</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
