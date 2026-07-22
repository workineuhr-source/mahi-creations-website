import React, { useState, useRef, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { CurrencyCode, formatPrice, getProductDisplayPrices } from '../utils/currency';
import { 
  Sparkles, 
  Send, 
  X, 
  ShoppingBag, 
  Plus, 
  Check, 
  Eye, 
  ArrowRight, 
  MessageSquare, 
  RefreshCw, 
  Bot, 
  User, 
  Tag, 
  Trash2,
  ExternalLink,
  Phone,
  Move,
  GripHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatBotProps {
  products: Product[];
  cartItems: CartItem[];
  currency: CurrencyCode;
  onAddToCart: (product: Product) => void;
  onViewProductDetails: (product: Product) => void;
  onOpenCart: () => void;
  onOpenCheckout: () => void;
  whatsappNumber?: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  products?: Product[];
  isCartSummary?: boolean;
}

export default function AIChatBot({
  products,
  cartItems,
  currency,
  onAddToCart,
  onViewProductDetails,
  onOpenCart,
  onOpenCheckout,
  whatsappNumber = '9801234567'
}: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message with product suggestions
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'नमस्ते! 🙏 Welcome to Mahi Creations AI Assistant. I can help you find products with photos, prices, and add them directly to your cart!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      products: products.slice(0, 3) // Initial recommendations
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Helper to handle Add to Cart from within chat
  const handleAddProductFromChat = (product: Product) => {
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);

    const priceInfo = getProductDisplayPrices(product, currency);
    const formattedPrice = formatPrice(priceInfo.salePrice, currency);

    // Auto append confirmation message in chat
    const confirmMsg: ChatMessage = {
      id: `add-${Date.now()}`,
      sender: 'bot',
      text: `🛒 Added "${product.name}" (${formattedPrice}) to your shopping cart! Would you like to view your cart or see more products?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCartSummary: true
    };

    setMessages(prev => [...prev, confirmMsg]);
  };

  // Quick Action Handler
  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
    processUserMessage(promptText);
  };

  // Process message and search matching products
  const processUserMessage = (userQuery: string) => {
    const trimmed = userQuery.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      let replyText = '';
      let matchedProducts: Product[] = [];
      let isCart = false;

      // 1. Check for Cart query
      if (
        lower.includes('cart') || 
        lower.includes('basket') || 
        lower.includes('sama') || 
        lower.includes('bag') ||
        lower.includes('झोला') ||
        lower.includes('सबै सामान')
      ) {
        isCart = true;
        if (cartItems.length === 0) {
          replyText = '🛒 Your shopping cart is currently empty! Here are some top recommended products you can add:';
          matchedProducts = products.slice(0, 3);
        } else {
          replyText = `🛍️ Here are the items currently in your shopping cart (${cartItems.reduce((acc, i) => acc + i.quantity, 0)} items):`;
        }
      } 
      // 2. Search for Sarees / Clothing
      else if (
        lower.includes('saree') || 
        lower.includes('sari') || 
        lower.includes('lehenga') || 
        lower.includes('cloth') || 
        lower.includes('silk') || 
        lower.includes('kapada') ||
        lower.includes('कपडा') ||
        lower.includes('साडी')
      ) {
        matchedProducts = products.filter(p => 
          p.category.toLowerCase().includes('clothing') || 
          p.name.toLowerCase().includes('saree') || 
          p.name.toLowerCase().includes('silk') || 
          p.description.toLowerCase().includes('saree')
        );
        replyText = matchedProducts.length > 0 
          ? `👗 Here are our luxury sarees & bridal wear with photos, prices, and direct Add-To-Cart buttons:`
          : ` Here are our featured boutique wear options:`;
      }
      // 3. Search for Cosmetics / Lipstick / Makeup
      else if (
        lower.includes('lip') || 
        lower.includes('matte') || 
        lower.includes('makeup') || 
        lower.includes('cosmetic') || 
        lower.includes('foundation') || 
        lower.includes('gloss') ||
        lower.includes('लिपस्टिक')
      ) {
        matchedProducts = products.filter(p => 
          p.category.toLowerCase().includes('cosmetics') || 
          p.name.toLowerCase().includes('lipstick') || 
          p.name.toLowerCase().includes('matte') || 
          p.name.toLowerCase().includes('foundation')
        );
        replyText = matchedProducts.length > 0 
          ? `💄 Here are our premium lipsticks & cosmetics with full photo previews and pricing:`
          : ` Here are our top luxury beauty products:`;
      }
      // 4. Search for Jewelry
      else if (
        lower.includes('jewelry') || 
        lower.includes('jewel') || 
        lower.includes('choker') || 
        lower.includes('necklace') || 
        lower.includes('kundan') ||
        lower.includes('गहना')
      ) {
        matchedProducts = products.filter(p => 
          p.category.toLowerCase().includes('jewelry') || 
          p.name.toLowerCase().includes('choker') || 
          p.name.toLowerCase().includes('kundan') || 
          p.description.toLowerCase().includes('jewelry')
        );
        replyText = matchedProducts.length > 0 
          ? `💎 Here are our 22K Kundan & Polki bridal jewelry sets:`
          : ` Here are our top jewelry selections:`;
      }
      // 5. General Search matching keyword
      else {
        matchedProducts = products.filter(p => 
          p.name.toLowerCase().includes(lower) || 
          p.category.toLowerCase().includes(lower) || 
          p.description.toLowerCase().includes(lower)
        );

        if (matchedProducts.length > 0) {
          replyText = `✨ Found ${matchedProducts.length} product(s) matching "${trimmed}". Here are the photos, prices, and direct cart buttons:`;
        } else {
          replyText = `🙏 I couldn't find an exact match for "${trimmed}", but here are our top trending boutique items:`;
          matchedProducts = products.slice(0, 4);
        }
      }

      // Fallback if matched products is empty
      if (matchedProducts.length === 0 && !isCart) {
        matchedProducts = products.slice(0, 3);
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: isCart ? undefined : matchedProducts.slice(0, 4),
        isCartSummary: isCart
      };

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processUserMessage(inputText);
  };

  // Compute cart total for chat cart summary
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const prices = getProductDisplayPrices(item.product, currency);
    return acc + (prices.salePrice * item.quantity);
  }, 0);

  return (
    <motion.div 
      drag
      dragMomentum={false}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 150);
      }}
      className="fixed bottom-6 left-6 sm:left-10 z-50 font-sans cursor-move"
      title="Drag AI Chat anywhere on screen"
    >
      
      {/* EXPANDED AI CHAT CONTAINER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-[360px] sm:w-[420px] h-[580px] rounded-3xl shadow-2xl border border-clay overflow-hidden flex flex-col mb-2 relative"
          >
            {/* HEADER WITH DRAG HANDLE */}
            <div className="bg-dark text-white p-3.5 flex items-center justify-between border-b border-white/10 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2.5">
                <div className="p-1 text-neutral-400 hover:text-white transition" title="Drag to move chat">
                  <GripHorizontal className="w-5 h-5" />
                </div>
                <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark" />
                </div>
                <div>
                  <h3 className="font-serif text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center gap-1.5">
                    Mahi AI Stylist
                    <Sparkles className="w-3.5 h-3.5 text-brand" />
                  </h3>
                  <p className="text-[9px] text-neutral-300 font-medium">
                    Drag anywhere • Photos, Prices & Cart Help
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenCart()}
                  className="p-2 rounded-xl hover:bg-white/10 text-amber-300 transition relative cursor-pointer"
                  title="View Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* QUICK SUGGESTION CHIPS */}
            <div className="p-2.5 bg-bg-warm/50 border-b border-clay/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
              <button
                onClick={() => handleQuickPrompt('Show me lipsticks')}
                className="px-2.5 py-1 bg-white hover:bg-brand/10 border border-clay rounded-full font-semibold text-neutral-700 whitespace-nowrap transition cursor-pointer shadow-2xs"
              >
                💄 Lipsticks
              </button>
              <button
                onClick={() => handleQuickPrompt('Show me sarees')}
                className="px-2.5 py-1 bg-white hover:bg-brand/10 border border-clay rounded-full font-semibold text-neutral-700 whitespace-nowrap transition cursor-pointer shadow-2xs"
              >
                👗 Sarees
              </button>
              <button
                onClick={() => handleQuickPrompt('Show me jewelry')}
                className="px-2.5 py-1 bg-white hover:bg-brand/10 border border-clay rounded-full font-semibold text-neutral-700 whitespace-nowrap transition cursor-pointer shadow-2xs"
              >
                💎 Jewelry
              </button>
              <button
                onClick={() => handleQuickPrompt('Show my cart')}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
              >
                🛒 My Cart
              </button>
            </div>

            {/* MESSAGES BODY */}
            <div className="flex-1 p-3.5 space-y-4 overflow-y-auto bg-bg-warm/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-dark text-white rounded-tr-none font-medium'
                        : 'bg-white text-neutral-800 border border-clay/80 rounded-tl-none font-normal'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="text-[9px] opacity-50 block mt-1 text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* ATTACHED PRODUCTS IN CHAT (PHOTOS + PRICE + ADD TO CART) */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2.5 w-full space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
                        Recommended Products ({msg.products.length})
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.products.map((prod) => {
                          const prices = getProductDisplayPrices(prod, currency);
                          const isAdded = addedProductId === prod.id;

                          return (
                            <div
                              key={prod.id}
                              className="bg-white p-2.5 rounded-2xl border border-clay shadow-sm hover:shadow-md transition flex items-center gap-3 group"
                            >
                              {/* Product Photo */}
                              <div 
                                onClick={() => onViewProductDetails(prod)}
                                className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-clay/50 cursor-pointer relative"
                              >
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                {prod.discountPercent > 0 && (
                                  <span className="absolute top-0.5 left-0.5 bg-rose-600 text-white text-[8px] font-black px-1 rounded-sm">
                                    -{prod.discountPercent}%
                                  </span>
                                )}
                              </div>

                              {/* Product Title & Price */}
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-bold text-brand uppercase tracking-wider block">
                                  {prod.category}
                                </span>
                                <h4 
                                  onClick={() => onViewProductDetails(prod)}
                                  className="text-xs font-bold text-dark truncate cursor-pointer hover:text-brand transition"
                                >
                                  {prod.name}
                                </h4>

                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xs font-black text-dark">
                                    {formatPrice(prices.salePrice, currency)}
                                  </span>
                                  {prices.originalPrice > prices.salePrice && (
                                    <span className="text-[10px] text-neutral-400 line-through font-medium">
                                      {formatPrice(prices.originalPrice, currency)}
                                    </span>
                                  )}
                                </div>

                                {/* Actions Row */}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <button
                                    onClick={() => handleAddProductFromChat(prod)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                                      isAdded
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-dark hover:bg-brand text-white shadow-2xs'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        Added!
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3" />
                                        Add to Cart
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => onViewProductDetails(prod)}
                                    className="p-1 text-neutral-500 hover:text-dark hover:bg-bg-warm rounded-lg transition cursor-pointer"
                                    title="Quick View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ATTACHED CART SUMMARY CARD IN CHAT */}
                  {msg.isCartSummary && (
                    <div className="mt-2.5 w-full bg-white p-3 rounded-2xl border-2 border-brand/30 shadow-md">
                      <div className="flex items-center justify-between border-b border-clay pb-2 mb-2">
                        <span className="text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-brand" />
                          Current Cart Items ({cartItems.length})
                        </span>
                        <button
                          onClick={onOpenCart}
                          className="text-[10px] text-brand hover:underline font-bold"
                        >
                          Full Cart
                        </button>
                      </div>

                      {cartItems.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic text-center py-2">
                          Your cart is empty. Type "lipsticks" or "sarees" to browse products!
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {cartItems.map((item) => {
                            const itemPrices = getProductDisplayPrices(item.product, currency);
                            return (
                              <div key={item.product.id} className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-9 h-9 rounded-lg object-cover border border-clay/60 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-dark truncate text-[11px]">{item.product.name}</p>
                                    <p className="text-[10px] text-neutral-500 font-mono">
                                      Qty: {item.quantity} × {formatPrice(itemPrices.salePrice, currency)}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-bold text-dark text-[11px] shrink-0 font-mono">
                                  {formatPrice(itemPrices.salePrice * item.quantity, currency)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {cartItems.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-clay flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Subtotal</span>
                            <span className="text-xs font-black text-dark font-mono">
                              {formatPrice(cartSubtotal, currency)}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              onOpenCheckout();
                              setIsOpen(false);
                            }}
                            className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1"
                          >
                            <span>Checkout</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-neutral-400 text-xs italic bg-white/60 p-2.5 rounded-2xl border border-clay w-fit animate-pulse">
                  <Bot className="w-4 h-4 text-brand animate-spin" />
                  Mahi AI is searching product photos & prices...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-clay shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask for lipsticks, sarees, cart, prices..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs border border-clay rounded-xl px-3 py-2.5 bg-bg-warm/30 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-dark"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-brand hover:bg-brand-dark disabled:opacity-40 text-white rounded-xl transition shadow cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4 fill-current" />
                </button>
              </div>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => {
            if (isDraggingRef.current) return;
            setIsOpen(true);
          }}
          className="bg-gradient-to-tr from-brand via-amber-700 to-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-amber-300/40 relative group"
          title="Mahi AI Product & Cart Chatbot"
          aria-label="AI Chat Assistant"
        >
          <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white animate-bounce">
            AI Chat
          </span>
        </button>
      )}

    </motion.div>
  );
}
