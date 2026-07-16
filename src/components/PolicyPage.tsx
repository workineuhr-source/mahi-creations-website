import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Lock, 
  FileText, 
  MapPin, 
  Info, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Mail, 
  Phone, 
  Sparkles, 
  Globe, 
  Award,
  ChevronRight,
  Send,
  MessageSquare,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { BoutiqueSettings } from '../types';

interface PolicyPageProps {
  viewType: 'about' | 'contact' | 'returns' | 'shipping' | 'privacy' | 'terms' | 'authenticity';
  onBackToShop: () => void;
  settings: BoutiqueSettings;
  currency: string;
}

export default function PolicyPage({
  viewType,
  onBackToShop,
  settings,
  currency
}: PolicyPageProps) {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 4000);
  };

  // Render individual page content based on viewType
  const renderContent = () => {
    switch (viewType) {
      case 'about':
        return (
          <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
            {/* Elegant Hero Visual */}
            <div className="relative overflow-hidden rounded-3xl border border-clay-light shadow-xl">
              <img 
                src={settings.aboutImageUrl || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80"} 
                alt="About Mahi Creations Studio Sourcing" 
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent flex flex-col justify-end p-8 sm:p-10">
                <span className="text-brand text-xs font-black uppercase tracking-[0.3em] mb-2">The Boutique Story</span>
                <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                  About Mahi Creations
                </h2>
                <p className="text-neutral-300 text-xs sm:text-sm font-light max-w-xl mt-2 leading-relaxed">
                  Nepal's premier luxury digital boutique and handpicked beauty catalog, bridging the world's most exclusive cosmetics and apparel to Kathmandu.
                </p>
              </div>
            </div>

            {/* Core Narrative */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6 text-neutral-600 text-xs sm:text-sm leading-relaxed font-light">
                <h3 className="font-serif text-lg font-bold text-dark border-b border-clay-light pb-2 uppercase">
                  Our Sourcing Philosophy
                </h3>
                <p>
                  Welcome to <strong className="text-dark font-bold">Mahi Creations</strong>, Nepal’s premier luxury digital boutique and handpicked beauty catalog. We specialize in bridging premium global cosmetic formulations, advanced hydration regimes, high-end traditional apparel, and designer accessories directly to the discerning client.
                </p>
                <p>
                  Our journey started with a simple belief: luxury should be authentic, fresh, and uncompromising. We observed a persistent gap in the Nepalese market for direct, certified global beauty brands and royal traditional craftsmanship. Mahi Creations was founded to erase that boundary entirely.
                </p>
                <p>
                  Today, we serve as Kathmandu's trusted curators. We do not operate bulk, dusty warehouses; instead, we deploy a highly personalized, active dispatch chain. Every drop of serum, every shade of lipstick, and every silk thread represents a meticulous quality seal from our sourcing hubs.
                </p>
              </div>

              {/* Sidebar Info Card */}
              <div className="bg-bg-warm/60 border border-clay-light/80 p-6 rounded-3xl space-y-6">
                <h4 className="font-serif text-xs font-black text-brand uppercase tracking-wider">Boutique at a Glance</h4>
                
                <div className="space-y-4 text-xs">
                  <div className="border-b border-clay-light/60 pb-3">
                    <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Establishment</span>
                    <span className="text-dark font-bold text-sm">Kathmandu, Nepal</span>
                  </div>
                  <div className="border-b border-clay-light/60 pb-3">
                    <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Central Hub</span>
                    <span className="text-dark font-bold">Jhamsikhel, Lalitpur</span>
                  </div>
                  <div className="border-b border-clay-light/60 pb-3">
                    <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Curation Niches</span>
                    <span className="text-dark font-bold">Skincare, Cosmetics, Saree & Bridal Jewelry</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase tracking-widest text-[9px] font-bold block">Guarantees</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      100% Original Products
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Value Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <div className="p-6 bg-white border border-clay-light rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-bold text-dark uppercase">Global Sourcing Centers</h4>
                <p className="text-neutral-500 text-xs font-light leading-relaxed">
                  We maintain active dispatch pipelines with authorized global dealers in Paris, Seoul, Tokyo, and New York to ensure immediate shelf freshness.
                </p>
              </div>

              <div className="p-6 bg-white border border-clay-light rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-bold text-dark uppercase">Uncompromising Quality</h4>
                <p className="text-neutral-500 text-xs font-light leading-relaxed">
                  Every cosmetic formulation is verified for storage temperature, safety seal integrity, and manufacturing batch legitimacy before shipment.
                </p>
              </div>

              <div className="p-6 bg-white border border-clay-light rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-bold text-dark uppercase">Custom Bespoke Service</h4>
                <p className="text-neutral-500 text-xs font-light leading-relaxed">
                  From traditional organza silk saree styling to personalized laboratory-grade skincare routines, our virtual concierge provides real-time guidance.
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-12 animate-fade-in max-w-5xl mx-auto py-4">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Direct Connectivity</span>
              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
                Contact Us & Boutique Location
              </h2>
              <div className="h-0.5 w-16 bg-brand mx-auto"></div>
              <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
                Have an inquiry about an imported cosmetics batch, sizing measurements, or custom orders? Reach out via our direct communication channels.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Left Side: Contact Information & Hours */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-serif text-sm font-bold text-dark uppercase tracking-wider border-b border-clay-light pb-2">
                    Boutique Coordinates
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Boutique Location</h4>
                        <p className="text-xs sm:text-sm text-dark font-extrabold mt-0.5">
                          {settings.shopAddress || 'Lalitpur, Jhamsikhel, Nepal'}
                        </p>
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(settings.shopAddress || 'Lalitpur, Jhamsikhel, Nepal')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-brand hover:underline font-bold uppercase tracking-wider block mt-1"
                        >
                          🌐 Open on Google Maps
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Support Email</h4>
                        <a 
                          href={`mailto:${settings.adminEmail || 'mahicreations369@gmail.com'}`}
                          className="text-xs sm:text-sm text-brand hover:underline font-extrabold mt-0.5 block"
                        >
                          {settings.adminEmail || 'mahicreations369@gmail.com'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">WhatsApp & Direct Line</h4>
                        <a 
                          href={`https://wa.me/${settings.whatsappNumber || '9779802058364'}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs sm:text-sm text-emerald-600 hover:underline font-extrabold flex items-center gap-1.5 mt-0.5"
                        >
                          <span>+{settings.whatsappNumber || '9779802058364'}</span>
                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase">Active Now</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Hours Card */}
                <div className="bg-bg-warm/60 border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4">
                  <h3 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand" />
                    Operating Hours
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-neutral-600">
                    <div>
                      <p className="text-neutral-400 font-medium uppercase text-[9px] tracking-wider">Sunday - Friday</p>
                      <p className="text-dark text-sm font-bold mt-0.5">10:00 AM - 08:00 PM</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-medium uppercase text-[9px] tracking-wider">Saturday</p>
                      <p className="text-dark text-sm font-bold mt-0.5">12:00 PM - 06:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Direct Inquiry Form */}
              <div className="lg:col-span-3">
                <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-serif text-sm font-bold text-dark uppercase tracking-wider border-b border-clay-light pb-2">
                    Send a Direct Inquiry
                  </h3>

                  {isSubmitted ? (
                    <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-scale-up">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif text-base font-extrabold text-emerald-900 uppercase">Message Dispatched Successfully</h4>
                      <p className="text-[11px] text-emerald-700 font-light max-w-sm mx-auto leading-relaxed">
                        Thank you for contacting Mahi Creations. Our customer care team and specialized virtual concierge have received your request and will follow up within 12-24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Full Name</label>
                          <input 
                            type="text" 
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-neutral-50 px-4 py-3 rounded-xl border border-clay text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand focus:bg-white transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Email Address</label>
                          <input 
                            type="email" 
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full bg-neutral-50 px-4 py-3 rounded-xl border border-clay text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand focus:bg-white transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Subject (Optional)</label>
                        <input 
                          type="text" 
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="e.g. Skincare batch inquiry, customized lehenga"
                          className="w-full bg-neutral-50 px-4 py-3 rounded-xl border border-clay text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand focus:bg-white transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Detailed Message</label>
                        <textarea 
                          required
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Please enter details about your product inquiry, sizing requirements, or shipment tracking..."
                          className="w-full bg-neutral-50 px-4 py-3 rounded-xl border border-clay text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand focus:bg-white transition resize-none"
                        ></textarea>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-dark hover:bg-brand text-white py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Message</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Buyer Security</span>
              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
                Return & Refund Policy
              </h2>
              <div className="h-0.5 w-16 bg-brand mx-auto"></div>
              <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
                Your absolute confidence is our absolute commitment. Please review our direct return, exchange, and refund framework.
              </p>
            </div>

            {/* Refund Hero Highlight */}
            <div className="flex flex-col sm:flex-row gap-6 items-center p-6 sm:p-8 bg-brand/5 border border-brand/20 rounded-3xl">
              <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                <RefreshCw className="w-7 h-7 text-brand animate-spin-slow" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-serif text-sm sm:text-base font-bold text-dark uppercase">
                  7-Day Visual Verification Guarantee
                </h3>
                <p className="text-neutral-600 text-xs font-light leading-relaxed">
                  Every cosmetic dispatch, advanced hydration drop, and apparel piece is backed by a 7-day safety exchange window. If you receive a physically damaged, wrong, or mismatched product, we will issue a free replacement or instant refund.
                </p>
              </div>
            </div>

            {/* Two Column details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Eligibility */}
              <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
                <h4 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-brand" />
                  Eligibility Criteria
                </h4>
                <ul className="space-y-3.5 text-xs text-neutral-600 font-light">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                    <span>Items must be strictly unopened, unused, and presented in their original premium retail packaging.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                    <span>Manufacturer safety batch stickers, original barcodes, and cellophane box wrap seals must remain completely unbroken.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                    <span className="text-rose-600 font-medium">For essential safety and hygiene standards, opened cosmetic liquids, hydration drops, eyeshadow palettes, or custom-tailored apparel cannot be returned.</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Steps to Return & Refund Methods */}
              <div className="space-y-6">
                <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
                  <h4 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
                    <Lock className="w-4.5 h-4.5 text-brand" />
                    Refund Methods & Timelines
                  </h4>
                  <p className="text-xs text-neutral-600 font-light leading-relaxed">
                    Once our Lalitpur verification boutique inspects and approves the seal integrity of the returned package, your refund is dispatched within <strong className="text-dark font-bold">24 to 48 hours</strong>.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="p-2.5 bg-neutral-50 rounded-xl border border-clay-light text-center">
                      <span className="text-[10px] font-black text-dark block">eSewa</span>
                      <span className="text-[8px] text-neutral-400 font-mono">Instant</span>
                    </div>
                    <div className="p-2.5 bg-neutral-50 rounded-xl border border-clay-light text-center">
                      <span className="text-[10px] font-black text-dark block">Khalti</span>
                      <span className="text-[8px] text-neutral-400 font-mono">Instant</span>
                    </div>
                    <div className="p-2.5 bg-neutral-50 rounded-xl border border-clay-light text-center">
                      <span className="text-[10px] font-black text-dark block">Bank Transfer</span>
                      <span className="text-[8px] text-neutral-400 font-mono">1-2 Days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-warm/40 border border-clay-light p-6 rounded-2xl text-xs space-y-2">
                  <h5 className="font-bold text-dark uppercase text-[10px] tracking-wider">Need to start an exchange?</h5>
                  <p className="text-neutral-500 font-light">
                    Simply take a photo of the received box highlighting the label/seal, and send it directly to our customer concierge on WhatsApp. We will schedule a courier swap instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Secure Logistics</span>
              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
                Shipping & Delivery Policy
              </h2>
              <div className="h-0.5 w-16 bg-brand mx-auto"></div>
              <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
                We bridge international boundaries to bring curated luxury fresh to your doorstep. Here is how our boutique logistics handle fulfillment.
              </p>
            </div>

            {/* Grid of Delivery Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Valley Delivery */}
              <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand/10 text-brand px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-clay-light">
                  Direct Dispatch
                </div>
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-base font-extrabold text-dark uppercase">
                  Kathmandu Valley Delivery
                </h3>
                <p className="text-neutral-600 text-xs font-light leading-relaxed">
                  Fulfillments inside Kathmandu, Lalitpur, and Bhaktapur are directly executed by our in-house boutique delivery courier fleet.
                </p>
                <div className="space-y-2 text-xs border-t border-clay-light/60 pt-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-light">Delivery Window:</span>
                    <span className="text-dark font-bold">12 to 24 Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-light">Delivery Cost:</span>
                    <span className="text-emerald-600 font-extrabold">Free on qualified orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-light">Payment Method:</span>
                    <span className="text-dark font-bold">Cash on Delivery (COD) / Digital Pay</span>
                  </div>
                </div>
              </div>

              {/* Outside Valley */}
              <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-neutral-100 text-neutral-500 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-clay-light">
                  Corporate Courier
                </div>
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-base font-extrabold text-dark uppercase">
                  Outside Valley & UAE Shipping
                </h3>
                <p className="text-neutral-600 text-xs font-light leading-relaxed">
                  Dispatches beyond Kathmandu and international orders (such as UAE shipping) are handled in partnership with premier logistics brokers.
                </p>
                <div className="space-y-2 text-xs border-t border-clay-light/60 pt-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-light">Delivery Window:</span>
                    <span className="text-dark font-bold">2 to 4 Business Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-light">Delivery Cost:</span>
                    <span className="text-dark font-bold">Standard regional carrier fees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-light">Partners:</span>
                    <span className="text-dark font-bold">Pathao, NCM, Aramex</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking System CTA */}
            <div className="bg-bg-warm/60 border border-clay-light p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 max-w-xl text-center md:text-left">
                <h4 className="font-serif text-sm font-bold text-dark uppercase flex items-center justify-center md:justify-start gap-1.5">
                  <Package className="w-4 h-4 text-brand" />
                  Real-Time Digital Order Tracking
                </h4>
                <p className="text-neutral-500 text-xs font-light leading-relaxed">
                  Every confirmed boutique invoice automatically generates a unique digital Tracking ID (e.g., <code className="font-mono text-dark bg-white border border-clay-light px-1.5 py-0.5 rounded font-bold text-[10px]">MC-55120</code>). Paste this code into our real-time portal to view delivery stage updates.
                </p>
              </div>
              <button 
                onClick={onBackToShop}
                className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-brand/20 cursor-pointer shrink-0"
              >
                Trace My Package
              </button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Buyer Integrity</span>
              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
                Privacy & Security Policy
              </h2>
              <div className="h-0.5 w-16 bg-brand mx-auto"></div>
              <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
                We guard your digital profile as strictly as we verify our global cosmetics. Read how your information is handled.
              </p>
            </div>

            {/* Policy Pillars */}
            <div className="space-y-6">
              <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
                  <Lock className="w-4.5 h-4.5 text-brand" />
                  Safe Buyer Protection Standard
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                  Mahi Creations strictly safeguards your personal telephone numbers, delivery addresses, and purchasing histories. We enforce absolute zero telemetry, no automated advertising trackers, and zero third-party commercial data broker sharing.
                </p>
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start gap-3 mt-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-emerald-900">Encrypted Transactions Only</h4>
                    <p className="text-[10px] text-emerald-700 leading-normal mt-0.5">
                      All browsing, membership portals, and custom forms are heavily wrapped in modern 256-bit Secure Socket Layers (SSL).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-serif text-sm font-extrabold text-dark uppercase tracking-wider border-b border-clay-light pb-2 flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-brand" />
                  Payment Gateways & Wallet Confidentiality
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                  Our systems interface exclusively through official secure API handshake endpoints with recognized digital wallets (such as <strong className="text-dark font-bold">eSewa</strong> and <strong className="text-dark font-bold">Khalti</strong>).
                </p>
                <p className="text-xs text-neutral-500 font-light leading-relaxed border-l-2 border-clay-light pl-3.5 italic">
                  "Mahi Creations does not record, intercept, or log any digital wallet PINs, bank account numbers, or secondary security passwords. All checkout verification routines are authenticated directly on the respective digital gateway layer."
                </p>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Legal Integrity</span>
              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
                Terms & Conditions of Service
              </h2>
              <div className="h-0.5 w-16 bg-brand mx-auto"></div>
              <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
                By browsing and procuring from our luxury boutique, you agree to comply with our client guidelines.
              </p>
            </div>

            {/* Terms Pillars */}
            <div className="bg-white border border-clay-light p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">1</span>
                  <h3 className="font-serif text-sm font-bold text-dark uppercase">Boutique Pricing & Currency</h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pl-9">
                  All catalog listings are finalized at checkout. We ensure complete transparency: the price displayed on your digital tracking invoice is the exact price our courier will receive. If a discount campaign (e.g. up to 25% automated seasonal reductions) is active, it will be transparently applied inside the cart.
                </p>
              </div>

              <div className="space-y-4 border-t border-clay-light/60 pt-6">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">2</span>
                  <h3 className="font-serif text-sm font-bold text-dark uppercase">Sourcing and Ingredient Information</h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pl-9">
                  We guarantee that every product is authentic and fresh. For all imported laboratory-skincare batches and makeup solutions, we include a clear, accessible ingredient panel so clients with sensitive skin can fully assess properties prior to acquisition.
                </p>
              </div>

              <div className="space-y-4 border-t border-clay-light/60 pt-6">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">3</span>
                  <h3 className="font-serif text-sm font-bold text-dark uppercase">Delivery Abuse Safeguard</h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pl-9">
                  Mahi Creations prides itself on direct Cash on Delivery trust. However, we reserve the right to temporarily flag or suspend accounts if multiple consecutive delivery attempts are rejected without cause, or if suspicious fraudulent invoicing is observed.
                </p>
              </div>
            </div>
          </div>
        );

      case 'authenticity':
        return (
          <div className="space-y-12 animate-fade-in max-w-4xl mx-auto py-4">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-brand">Certified Authenticity</span>
              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-dark uppercase tracking-tight">
                100% Sourcing & Authenticity Pledge
              </h2>
              <div className="h-0.5 w-16 bg-brand mx-auto"></div>
              <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-2xl mx-auto">
                Counterfeits have zero room in beauty. Read about our absolute seal of quality.
              </p>
            </div>

            {/* Seal Highlight Banner */}
            <div className="p-8 sm:p-10 bg-gradient-to-br from-[#0c0c0f] to-[#1c1611] border border-amber-500/20 rounded-3xl relative overflow-hidden shadow-xl text-center space-y-4">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <Award className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
              <h3 className="font-serif text-lg sm:text-xl font-extrabold text-transparent bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 bg-clip-text leading-tight uppercase tracking-tight">
                Zero Counterfeit Tolerance Seal
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
                Mahi Creations enforces an absolute vetting loop. Every single box contains a certified manufacturer batch code linked back to production facilities in the world's major fashion capitals.
              </p>
            </div>

            {/* Origin Grid */}
            <div className="space-y-6">
              <h3 className="font-serif text-sm font-bold text-dark uppercase tracking-wider text-center">
                Sourcing Capitals & Channels
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
                  <span className="text-xl sm:text-2xl">🗼</span>
                  <h4 className="font-serif text-xs font-bold text-dark uppercase">Seoul, S. Korea</h4>
                  <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Direct K-Beauty drops and laboratory-grade glass-skin serums.</p>
                </div>
                <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
                  <span className="text-xl sm:text-2xl">🗼</span>
                  <h4 className="font-serif text-xs font-bold text-dark uppercase">Paris, France</h4>
                  <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Luxurious cosmetic items and French botanical emulsions.</p>
                </div>
                <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
                  <span className="text-xl sm:text-2xl">🗼</span>
                  <h4 className="font-serif text-xs font-bold text-dark uppercase">Tokyo, Japan</h4>
                  <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Premium sunscreen arrays, masks, and lightweight lipids.</p>
                </div>
                <div className="bg-white border border-clay-light p-5 rounded-2xl text-center space-y-2">
                  <span className="text-xl sm:text-2xl">🗼</span>
                  <h4 className="font-serif text-xs font-bold text-dark uppercase">New York, USA</h4>
                  <p className="text-neutral-500 text-[10px] font-light leading-relaxed">Authorized luxury retail make-up pallets and pigments.</p>
                </div>
              </div>

              <div className="bg-bg-warm/40 border border-clay-light p-6 sm:p-8 rounded-3xl text-xs space-y-3 font-light text-neutral-600 leading-relaxed">
                <h4 className="font-bold text-dark uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  Our Double-Vetting Inspection Loop
                </h4>
                <p>
                  Before any batch of global skincare or designer apparel is showcased on our digital catalog, it undergoes a dual-vetting sequence. First, the batch codes are verified directly through official manufacturer databases. Second, our quality control team physically inspects box seals and temperatures to prevent chemical degradation.
                </p>
                <p>
                  By circumventing unnecessary third-party broker networks, we guarantee absolute authenticity while delivering direct-to-client value that is unrivaled in Nepal.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-bg-warm/15 min-h-[60vh] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back navigation bar */}
        <div className="flex items-center justify-between border-b border-clay-light pb-4 mb-8">
          <button 
            onClick={onBackToShop}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-600 hover:text-brand transition duration-300 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Shop</span>
          </button>
          <span className="text-[10px] text-neutral-400 font-mono font-bold bg-white border border-clay-light/60 px-3 py-1 rounded-full shadow-2xs">
            📄 Separate Document
          </span>
        </div>

        {/* Dynamic page area */}
        {renderContent()}

        {/* Footer actions for quick navigation back to home */}
        <div className="mt-16 border-t border-clay-light pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Licensed & Certified Boutique Sourcing Kathmandu</span>
          </div>
          <button
            onClick={onBackToShop}
            className="bg-dark hover:bg-brand text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition duration-300 cursor-pointer shadow-sm hover:shadow-md"
          >
            Return to Boutique Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
