import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, Check, RefreshCw, ShoppingBag, ArrowRight, Eye, Gift, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, CurrencyCode } from '../utils/currency';

interface SmartRoutineQuizProps {
  products: Product[];
  currency: CurrencyCode;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onAuthNeeded: () => void;
  isLoggedIn: boolean;
}

export default function SmartRoutineQuiz({
  products,
  currency,
  onAddToCart,
  onViewDetails,
  onAuthNeeded,
  isLoggedIn,
}: SmartRoutineQuizProps) {
  const [step, setStep] = useState<number>(1); // 1: skin/vibe type, 2: goal concern, 3: matching
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Vibe options
  const VIBES = [
    { id: 'hydration', label: '🌿 Dry / Moisture Seeking', desc: 'Looking for rich laboratory hydration, serums, and deep organic essences.' },
    { id: 'radiance', label: '✨ Dullness / Glow Booster', desc: 'Want flawless skin-like coverage, radiant finish, and luminous high-shine lips.' },
    { id: 'bridal', label: '👑 Luxury Glamour & Wedding', desc: 'Seeking exquisite Kundan chokers, silk organza sarees, and long-lasting pigments.' },
    { id: 'minimalist', label: '💎 Minimalist Day Ritual', desc: 'Clean vegan brushes, premium essentials, and light breathable hydration.' }
  ];

  // Goal options based on selected vibe
  const GOALS: Record<string, { id: string; label: string; desc: string }[]> = {
    hydration: [
      { id: 'deep-skin', label: 'Advanced Botanical Skincare', desc: 'Direct moisture clinical serum therapies.' },
      { id: 'complete-kit', label: 'Ultimate Glow Kit Combo', desc: 'Bridal glow hamper with all accessories.' }
    ],
    radiance: [
      { id: 'flawless-base', label: 'Radiant Foundation Base', desc: 'Buildable fluid with natural skin finish.' },
      { id: 'velvet-matte-lips', label: 'Luscious Matte Comfort Lips', desc: 'Transfer-proof velvet colors infused with shea butter.' }
    ],
    bridal: [
      { id: 'wedding-couture', label: 'Handcrafted Heritage Sarees', desc: 'Pure organza silk sarees decorated with pearl borders.' },
      { id: 'royal-jewelry', label: 'Polki & Kundan Jewelry Chokers', desc: '22k gold plated bridal choker sets.' }
    ],
    minimalist: [
      { id: 'clean-accessories', label: 'Premium Vegan Brushes', desc: '12-piece professional-grade soft synthetic fibers.' },
      { id: 'daily-matte', label: 'Soft Matte Velvet Lips', desc: 'Daily-wear high-comfort shades.' }
    ]
  };

  // Logic to find actual products based on selected options
  const getMatchedProducts = (): Product[] => {
    if (!selectedVibe || !selectedGoal) return [];

    let matchIds: string[] = [];

    if (selectedVibe === 'hydration') {
      if (selectedGoal === 'deep-skin') {
        // Find skincare
        matchIds = ['p2', 'ac1']; // Foundation, brush
      } else {
        matchIds = ['kt1']; // Hamper Kit
      }
    } else if (selectedVibe === 'radiance') {
      if (selectedGoal === 'flawless-base') {
        matchIds = ['p2', 'ac1'];
      } else {
        matchIds = ['p1', 'p3']; // Lipstick, Eyeshadow
      }
    } else if (selectedVibe === 'bridal') {
      if (selectedGoal === 'wedding-couture') {
        matchIds = ['cl1', 'cl2']; // Saree, Lehenga
      } else {
        matchIds = ['jw1', 'kt1']; // Choker, Kit
      }
    } else if (selectedVibe === 'minimalist') {
      if (selectedGoal === 'clean-accessories') {
        matchIds = ['ac1', 'p3']; // Brushes, Eyeshadow
      } else {
        matchIds = ['p1', 'p2']; // Lipstick, Foundation
      }
    }

    // fallback to some products if none match
    if (matchIds.length === 0) {
      return products.slice(0, 2);
    }

    return products.filter(p => matchIds.includes(p.id));
  };

  const handleNextStep = () => {
    if (step === 1 && selectedVibe) {
      setStep(2);
      // Auto select first goal option
      const currentGoals = GOALS[selectedVibe] || [];
      if (currentGoals.length > 0) {
        setSelectedGoal(currentGoals[0].id);
      }
    } else if (step === 2 && selectedGoal) {
      setIsCalculating(true);
      setStep(3);
      setTimeout(() => {
        setIsCalculating(false);
      }, 1200);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedVibe(null);
    setSelectedGoal(null);
  };

  const currentGoals = selectedVibe ? (GOALS[selectedVibe] || []) : [];
  const matched = getMatchedProducts();

  return (
    <div id="smart-ritual-finder" className="bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 border border-clay rounded-3xl p-6 sm:p-8 shadow-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
        
        {/* Left Side: Dynamic Instruction & Progress */}
        <div className="lg:w-1/3 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Smart AI Curation</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
              Personalized Ritual Matcher
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Answer two quick cosmetic or lifestyle questions to let our boutique algorithm suggest the absolute perfect luxury combinations.
            </p>
          </div>

          {/* Stepper progress display */}
          <div className="space-y-4 pt-4 border-t border-clay-light/60">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-dark text-white' : 'bg-clay-light text-neutral-400'}`}>1</span>
              <span className="text-xs font-bold text-neutral-800">Your Skin Vibe & Styling Preference</span>
            </div>
            <div className="h-4 w-[1px] bg-clay ml-3" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-dark text-white' : 'bg-clay-light text-neutral-400'}`}>2</span>
              <span className="text-xs font-bold text-neutral-800">Your Ultimate Goal</span>
            </div>
            <div className="h-4 w-[1px] bg-clay ml-3" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-brand text-white shadow-sm' : 'bg-clay-light text-neutral-400'}`}>3</span>
              <span className="text-xs font-bold text-neutral-800">Your Custom Boutique Drops</span>
            </div>
          </div>
        </div>

        {/* Right Side: Step Interactive Body */}
        <div className="flex-1 bg-white border border-clay-light/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand">Step 1 of 2</h4>
                  <p className="text-sm font-bold text-neutral-900 mt-0.5">Which of these best describes your daily routine or outfit style?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {VIBES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVibe(v.id)}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                        selectedVibe === v.id
                          ? 'bg-brand/5 border-brand ring-1 ring-brand/40 shadow-sm'
                          : 'bg-clay-light/20 hover:bg-clay-light/50 border-clay/60'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        selectedVibe === v.id ? 'border-brand bg-brand text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {selectedVibe === v.id && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-neutral-800 block">{v.label}</span>
                        <span className="text-[10px] text-neutral-400 font-light block leading-tight">{v.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-clay-light/60 mt-4">
                  <button
                    disabled={!selectedVibe}
                    onClick={handleNextStep}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${
                      selectedVibe
                        ? 'bg-dark hover:bg-brand text-white shadow-sm cursor-pointer'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Continue to Goal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand">Step 2 of 2</h4>
                  <p className="text-sm font-bold text-neutral-900 mt-0.5">What is your ultimate beauty or style aspiration today?</p>
                </div>

                <div className="space-y-3 pt-1">
                  {currentGoals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                        selectedGoal === g.id
                          ? 'bg-brand/5 border-brand ring-1 ring-brand/40 shadow-sm'
                          : 'bg-clay-light/20 hover:bg-clay-light/50 border-clay/60'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        selectedGoal === g.id ? 'border-brand bg-brand text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {selectedGoal === g.id && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-neutral-800 block">{g.label}</span>
                        <span className="text-[10px] text-neutral-500 font-light block leading-tight">{g.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-clay-light/60 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-clay-light transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={!selectedGoal}
                    onClick={handleNextStep}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${
                      selectedGoal
                        ? 'bg-brand hover:bg-dark text-white shadow-sm cursor-pointer'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Analyze Match</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {isCalculating ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <RefreshCw className="w-8 h-8 text-brand animate-spin" />
                    <span className="text-xs font-bold text-neutral-700 animate-pulse font-mono tracking-wider">ALIGNING LIFESTYLE PARAMETERS...</span>
                    <span className="text-[10px] text-neutral-400 font-light">Retrieving custom premium lab formulas & silk weights</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand">Your Tailored Curation</h4>
                        <p className="text-sm font-bold text-neutral-900 mt-0.5">Perfect match found for your aesthetic style! ✨</p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-[9px] uppercase font-black tracking-wider text-neutral-500 hover:text-brand flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retake Matcher</span>
                      </button>
                    </div>

                    {/* Recommendations Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {matched.map((prod) => {
                        const finalPrice = prod.price - (prod.price * prod.discountPercent / 100);
                        return (
                          <div
                            key={prod.id}
                            className="bg-clay-light/10 border border-clay/40 rounded-2xl p-3 flex gap-3 transition-all duration-300 hover:shadow-xs group hover:border-brand/35"
                          >
                            {/* Product Thumbnail */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-clay-light flex-shrink-0 relative">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              {prod.discountPercent > 0 && (
                                <span className="absolute top-1 left-1 text-[8px] font-bold text-white bg-rose-500 px-1 py-0.5 rounded shadow-sm">
                                  -{prod.discountPercent}%
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex flex-col justify-between flex-1 min-w-0">
                              <div>
                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-neutral-400 block">{prod.category}</span>
                                <h5 className="text-xs font-bold text-neutral-800 truncate leading-tight mt-0.5 group-hover:text-brand transition-colors">
                                  {prod.name}
                                </h5>
                                <p className="text-[10px] text-neutral-500 font-light truncate leading-normal mt-0.5">
                                  {prod.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-clay-light/40">
                                <div className="flex flex-col">
                                  {prod.discountPercent > 0 ? (
                                    <>
                                      <span className="text-xs font-black text-brand leading-none">
                                        {formatPrice(finalPrice, currency)}
                                      </span>
                                      <span className="text-[9px] text-neutral-400 line-through leading-none mt-0.5">
                                        {formatPrice(prod.price, currency)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs font-black text-neutral-800">
                                      {formatPrice(prod.price, currency)}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => onViewDetails(prod)}
                                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg cursor-pointer transition"
                                    title="View Details"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!isLoggedIn) {
                                        onAuthNeeded();
                                      } else {
                                        onAddToCart(prod);
                                      }
                                    }}
                                    className="px-2 py-1.5 bg-dark hover:bg-brand text-white rounded-lg text-[9px] font-bold flex items-center gap-1 transition"
                                  >
                                    <ShoppingBag className="w-2.5 h-2.5" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 flex items-center justify-between gap-3 text-xs mt-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span className="text-neutral-700 font-light leading-snug">
                          Get these items wrapped in our <b>Premium Gift Wrap</b> for a complete presentation!
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 font-mono bg-white px-2 py-0.5 rounded shadow-xs border border-rose-100">
                        +50 NPR ONLY 🎁
                      </span>
                    </div>

                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
