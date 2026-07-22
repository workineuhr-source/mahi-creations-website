import React, { useState, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, GripHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface WhatsAppChatProps {
  whatsappNumber?: string;
}

export default function WhatsAppChat({ whatsappNumber = '971501942989' }: WhatsAppChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const isDraggingRef = useRef(false);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    const adminNum = whatsappNumber.replace(/[^0-9]/g, ''); // Central boutique admin contact
    const text = encodeURIComponent(customMsg || 'Hi Mahi Creations! I am looking for premium makeup recommendations, shade guidance, and delivery status.');
    window.open(`https://wa.me/${adminNum}?text=${text}`, '_blank', 'noopener,noreferrer');
    setCustomMsg('');
    setIsOpen(false);
  };

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
      className="fixed bottom-6 right-6 z-40 font-sans cursor-move"
      title="Drag WhatsApp widget anywhere on screen"
    >
      
      {/* Expanded Chat Card */}
      {isOpen ? (
        <div className="bg-white w-80 rounded-3xl shadow-2xl border border-clay overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="bg-dark text-white p-3.5 flex items-center justify-between cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <div className="p-1 text-neutral-400 hover:text-white transition" title="Drag to move chat">
                <GripHorizontal className="w-4 h-4" />
              </div>
              <div className="relative w-8 h-8 rounded-full bg-clay-light flex items-center justify-center text-brand font-serif font-black shadow-sm">
                M
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-dark"></span>
              </div>
              <div>
                <p className="font-serif text-xs font-bold tracking-wide uppercase">WhatsApp Support</p>
                <p className="text-[9px] text-emerald-400 font-bold tracking-wide uppercase">● Drag to move • Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-bg-warm/30 space-y-3 max-h-60 overflow-y-auto">
            {/* System welcome bubble */}
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-clay text-xs text-neutral-600 leading-relaxed font-light">
              Welcome to <span className="font-bold text-dark uppercase tracking-wide">Mahi Creations Boutique</span>. 🙏
              <p className="mt-1">
                Need premium support, shade-matching advice, formulation details, custom discount codes, or shipping status queries? Connect with our personal beauty concierge directly on WhatsApp!
              </p>
            </div>
          </div>

          {/* Form and CTA */}
          <form onSubmit={handleStartChat} className="p-3 bg-white border-t border-clay-light space-y-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full text-xs border border-clay rounded-xl p-2.5 bg-bg-warm/40 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-dark"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-xl transition shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              Chat on WhatsApp
            </button>
          </form>

        </div>
      ) : (
        /* Floating Button Trigger */
        <button
          onClick={() => {
            if (isDraggingRef.current) return;
            setIsOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-4.5 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce border border-emerald-500"
          title="Direct WhatsApp Chat with Seller"
          aria-label="WhatsApp Chat"
        >
          <MessageSquare className="w-6 h-6 stroke-[1.8] fill-current" />
        </button>
      )}

    </motion.div>
  );
}
