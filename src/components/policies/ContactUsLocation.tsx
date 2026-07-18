import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2 } from 'lucide-react';
import { BoutiqueSettings } from '../../types';

interface ContactUsLocationProps {
  settings: BoutiqueSettings;
}

export default function ContactUsLocation({ settings }: ContactUsLocationProps) {
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
                    href={`https://wa.me/${settings.whatsappNumber || '971501942989'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm text-emerald-600 hover:underline font-extrabold flex items-center gap-1.5 mt-0.5"
                  >
                    <span>+{settings.whatsappNumber || '971501942989'}</span>
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
}
