import React, { useState } from 'react';
import { Order, Product, ProductReview, UserSession, OrderStatus } from '../types';
import { 
  User, Phone, MapPin, Search, Star, MessageSquare, LogOut, CheckCircle2, 
  ShoppingBag, Truck, Calendar, Clock, CreditCard, ChevronRight, Sparkles, Printer, AlertCircle, Check, Download, Camera, X, Heart, Trash2
} from 'lucide-react';
import { formatPrice, CurrencyCode, getProductDisplayPrices } from '../utils/currency';
import { generateOrderReceiptPDF } from '../utils/pdfGenerator';

interface CustomerPortalProps {
  orders: Order[];
  products: Product[];
  reviews: ProductReview[];
  onAddReview: (review: ProductReview) => void;
  onBackToShop: () => void;
  currency: CurrencyCode;
  userSession: UserSession | null;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
  settings?: any;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
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

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Booked', desc: 'Saman received! We are reviewing your delivery group.' },
  { status: 'Confirmed', label: 'Boutique Approved', desc: 'Payment checked & order verified.' },
  { status: 'Packaging', label: 'Carefully Packed', desc: 'Disinfected & wrapped in Mahi gift packaging.' },
  { status: 'Out for Delivery', label: 'Courier Dispatched', desc: 'Rider is carrying your makeup package!' },
  { status: 'Delivered', label: 'Saman Delivered', desc: 'Item successfully handed over! Enjoy your glow!' }
];

export default function CustomerPortal({
  orders,
  products,
  reviews,
  onAddReview,
  onBackToShop,
  currency,
  userSession,
  onLogin,
  onLogout,
  settings,
  wishlist,
  onToggleWishlist,
  onAddToCart
}: CustomerPortalProps) {
  // Login form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Nepal');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [loginError, setLoginError] = useState('');

  // Write Review form states
  const [reviewProduct, setReviewProduct] = useState<Product | { id: string; name: string; image: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Search orders manual input (optional helper)
  const [manualSearchId, setManualSearchId] = useState('');
  const [manualOrder, setManualOrder] = useState<Order | null>(null);
  const [manualError, setManualError] = useState('');

  // Filter orders for the logged-in customer
  const matchedOrders = userSession 
    ? orders.filter(o => {
        const phoneMatch = o.customerPhone.trim() === userSession.phone.trim();
        const nameMatch = o.customerName.toLowerCase().trim() === userSession.fullName.toLowerCase().trim();
        return phoneMatch || nameMatch;
      })
    : [];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setLoginError('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setLoginError('Please enter a valid Nepalese or Gulf contact number.');
      return;
    }
    if (!address.trim()) {
      setLoginError('Please specify your complete shipping destination address.');
      return;
    }

    onLogin({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      country: country.trim() || 'Nepal',
      whatsapp: whatsapp.trim() || phone.trim(),
      location: location.trim() || address.trim().split(',')[0]
    });
    setLoginError('');
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    setManualOrder(null);

    if (!manualSearchId.trim()) return;

    const found = orders.find(o => o.id.toLowerCase() === manualSearchId.trim().toLowerCase());
    if (found) {
      setManualOrder(found);
    } else {
      setManualError('No order found with Tracking ID: ' + manualSearchId.toUpperCase());
    }
  };

  const handleOpenReviewModal = (productId: string, productName: string, productImage: string) => {
    setReviewProduct({ id: productId, name: productName, image: productImage });
    setRating(5);
    setComment('');
    setReviewSuccess(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct) return;
    if (!comment.trim()) {
      alert('Please share your valuable cosmetic feedback comment!');
      return;
    }

    const newRev: ProductReview = {
      id: 'rev-' + Math.floor(1000 + Math.random() * 9000),
      productId: reviewProduct.id,
      productName: reviewProduct.name,
      customerName: userSession?.fullName || 'Verified Buyer',
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      photoUrl: reviewPhoto || undefined
    };

    onAddReview(newRev);
    setReviewSuccess(true);
    setReviewPhoto('');
    setTimeout(() => {
      setReviewProduct(null);
      setReviewSuccess(false);
    }, 2000);
  };

  const getStatusIndex = (currentStatus: OrderStatus) => {
    return STATUS_STEPS.findIndex(step => step.status === currentStatus);
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveToBag = (product: Product) => {
    onAddToCart(product);
    onToggleWishlist(product.id);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 font-sans">
      
      {/* Styles for beautiful invoice printed version */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, footer, nav, .no-print, button, .promo-ticker, #whatsapp-chat-bubble, .fixed {
            display: none !important;
          }
          .screen-portal-content {
            display: none !important;
          }
          .print-only-invoice {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* RENDER DYNAMIC PRINTABLE INVOICES DIRECTLY FROM PORTAL FOR LOGGED-IN CUSTOMER */}
      {matchedOrders.map((o) => (
        <div key={`print-${o.id}`} id={`print-invoice-${o.id}`} className="hidden print-only-invoice bg-white text-black p-10 font-sans w-full max-w-4xl mx-auto border border-neutral-200">
          <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-6">
            <div>
              <h1 className="text-2xl font-serif font-extrabold tracking-tight text-neutral-900 uppercase">
                Mahi Creations
              </h1>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mt-0.5">
                Premium Luxury Cosmetics & Boutique
              </p>
              <div className="text-[11px] text-neutral-600 mt-3 space-y-0.5">
                <p>WhatsApp Support: +{settings?.whatsappNumber || '9779802058364'}</p>
                <p>Email: orders@mahicreations.com</p>
                <p>Web: www.mahicreations.com</p>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-wider text-neutral-800">
                Official Invoice
              </h2>
              <div className="text-[11px] text-neutral-600 mt-3 space-y-1">
                <p><span className="font-semibold text-neutral-800">Invoice No:</span> <span className="font-mono font-bold">{o.id}</span></p>
                <p>
                  <span className="font-semibold text-neutral-800">Date:</span>{' '}
                  {new Date(o.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p>
                  <span className="font-semibold text-neutral-800">Payment Status:</span>{' '}
                  <span className="font-bold uppercase text-neutral-900">{o.status === 'Cancelled' ? 'Voided' : 'Authorized / Paid'}</span>
                </p>
                <p>
                  <span className="font-semibold text-neutral-800">Delivery:</span>{' '}
                  <span className="font-bold uppercase text-neutral-900">{o.status}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 my-8 text-xs">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-300 pb-1.5 mb-2.5">
                Bill To (Recipient)
              </h3>
              <div className="space-y-1.5 text-neutral-700">
                <p className="font-bold text-neutral-900">{o.customerName}</p>
                <p><span className="font-semibold">Phone:</span> {o.customerPhone}</p>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-300 pb-1.5 mb-2.5">
                Ship To (Destination)
              </h3>
              <div className="space-y-1.5 text-neutral-700">
                <p className="font-semibold text-neutral-900">{o.customerAddress}</p>
                <p><span className="font-semibold">Region:</span> {o.deliveryLocationName}</p>
                <p><span className="font-semibold">Method:</span> {o.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="my-8">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-800 text-neutral-800 uppercase font-bold text-[10px] tracking-wider bg-neutral-100">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Product Description</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-center w-16">Qty</th>
                  <th className="p-3 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-700">
                {o.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-center text-neutral-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-neutral-900">
                      {it.productName}
                      {it.discountPercent > 0 && (
                        <span className="text-[10px] text-emerald-700 block font-normal">
                          Discount Applied: {it.discountPercent}% Off
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {formatPrice(it.price, (o.currency as CurrencyCode) || currency)}
                    </td>
                    <td className="p-3 text-center">{it.quantity}</td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      {formatPrice(it.price * it.quantity, (o.currency as CurrencyCode) || currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end my-8">
            <div className="w-80 text-xs space-y-2.5">
              <div className="flex justify-between text-neutral-600">
                <span>Gross Subtotal:</span>
                <span>{formatPrice(o.subtotal - o.discountAmount, (o.currency as CurrencyCode) || currency)}</span>
              </div>
              {o.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount Savings:</span>
                  <span>- {formatPrice(o.discountAmount, (o.currency as CurrencyCode) || currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee:</span>
                <span>{o.deliveryFee === 0 ? 'FREE' : formatPrice(o.deliveryFee, (o.currency as CurrencyCode) || currency)}</span>
              </div>
              <div className="border-t border-neutral-800 pt-3 flex justify-between font-bold text-neutral-900 text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-base font-extrabold">{formatPrice(o.total, (o.currency as CurrencyCode) || currency)}</span>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-neutral-300 pt-8 mt-12 text-[11px] text-neutral-500">
            <p className="font-semibold text-neutral-700">Dhanyabaad for shopping with Mahi Creations!</p>
            <p className="text-[9px] text-neutral-400 mt-2">This is an electronically generated boutique invoice.</p>
          </div>
        </div>
      ))}

      {/* SCREEN VIEW (HIDDEN ON PRINT) */}
      <div className="screen-portal-content no-print">

        {/* HEADER BRANDING */}
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-brand bg-clay-light px-4.5 py-1.5 rounded-full font-bold inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Mahi VIP Lounge
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-dark uppercase tracking-tight mt-3">
            Customer Portal
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
            Log in to view all your order tracking codes instantly, print official cosmetic receipts, and write feedback reviews.
          </p>
        </div>

        {/* LOGGED OUT STATE: SHOW BEAUTIFUL REGISTRATION/LOGIN FORM */}
        {!userSession ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-clay shadow-xl space-y-6">
            <div className="text-center space-y-1 pb-4 border-b border-clay-light">
              <div className="w-12 h-12 bg-clay-light rounded-full flex items-center justify-center text-brand mx-auto mb-2">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-dark uppercase tracking-wide">Enter Guest Details</h3>
              <p className="text-[11px] text-neutral-400 font-light">
                We'll match your details with your active cosmetic bookings inside Nepal/UAE!
              </p>
            </div>

             <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-600 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name (e.g. Alisha Shrestha)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-600 uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9802058364"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-600 uppercase tracking-wider block">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-500" />
                    <input
                      type="tel"
                      placeholder="Same as phone if empty"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-medium font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-600 uppercase tracking-wider block">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs px-4 py-3 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-medium cursor-pointer"
                  >
                    <option value="Nepal">🇳🇵 Nepal</option>
                    <option value="United Arab Emirates">🇦🇪 United Arab Emirates (UAE)</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="Qatar">🇶🇦 Qatar</option>
                    <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                    <option value="United States">🇺🇸 United States (USA)</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="Other">🌍 Other Country</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-600 uppercase tracking-wider block">City / Location Area</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kathmandu / Dubai"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-600 uppercase tracking-wider block">Full Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-neutral-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="Exact landmark, area, ward number (e.g. New Baneshwor, Marg-10, near Civil Hospital)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                  />
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-red-600 text-[11px] bg-red-50 p-2.5 rounded-lg border border-red-150">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-dark hover:bg-brand text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition cursor-pointer"
              >
                Access My Lounge Portal
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={onBackToShop}
                className="text-[11px] text-neutral-400 hover:text-dark hover:underline uppercase font-bold tracking-wider"
              >
                &larr; Back to Shop Catalogue
              </button>
            </div>
          </div>
        ) : (
          
          /* LOGGED IN ACTIVE DASHBOARD VIEW */
          <div className="space-y-8 animate-fade-in">
            
            {/* LOGGED IN USER BAR */}
            <div className="bg-dark text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand/20 border border-brand/35 flex items-center justify-center text-brand">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
                      Namaste, {userSession.fullName}!
                    </h3>
                    <span className="text-[9px] uppercase tracking-widest bg-brand/20 text-brand px-2.5 py-0.5 rounded-full font-bold">
                      Verified VIP
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono"><Phone className="w-3.5 h-3.5 text-neutral-500" /> {userSession.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-500" /> {userSession.address}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-center">
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-red-500/10 hover:text-red-300 text-neutral-300 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition border border-white/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <button
                  onClick={onBackToShop}
                  className="inline-flex items-center gap-1.5 bg-brand text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Shop More
                </button>
              </div>
            </div>

            {/* TWO-COLUMN GRID IN CUSTOMER LOUNGE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT & CENTER PORTION: MY SAMAN TRACKING LIST */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xl font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand" />
                    My Bookings & Parcel Tracking
                  </h4>
                  <span className="bg-clay-light px-3 py-1 rounded-full text-xs font-bold text-neutral-600">
                    {matchedOrders.length} Bookings found
                  </span>
                </div>

                {matchedOrders.length === 0 ? (
                  /* If no automatic order matches found */
                  <div className="bg-white p-8 rounded-3xl border border-clay text-center space-y-4 shadow-sm">
                    <div className="w-12 h-12 bg-clay-light rounded-full flex items-center justify-center text-neutral-400 mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-dark text-sm uppercase tracking-wider">No automatic booking found</p>
                      <p className="text-neutral-500 text-xs mt-1 leading-relaxed max-w-sm mx-auto font-light">
                        We couldn't automatically find any orders matching your registered phone (<span className="font-mono">{userSession.phone}</span>). 
                        If you checkout with a different number, you can look it up manually below!
                      </p>
                    </div>

                    {/* Manual order finder */}
                    <div className="max-w-sm mx-auto border-t border-clay-light pt-5 mt-2">
                      <form onSubmit={handleManualSearch} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter Tracking ID (e.g. MC-55120)"
                          value={manualSearchId}
                          onChange={(e) => setManualSearchId(e.target.value)}
                          className="flex-grow text-xs px-3.5 py-2.5 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-mono uppercase font-semibold"
                        />
                        <button type="submit" className="bg-dark hover:bg-brand text-white px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer">
                          Find
                        </button>
                      </form>
                      {manualError && <p className="text-red-600 text-[11px] mt-2 text-left">{manualError}</p>}

                      {manualOrder && (
                        <div className="mt-4 p-4 bg-clay-light/50 border border-clay rounded-2xl text-left text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-dark">{manualOrder.id}</span>
                            <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded font-bold uppercase">{manualOrder.status}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500">Booked by {manualOrder.customerName} for {formatPrice(manualOrder.total, (manualOrder.currency as CurrencyCode) || currency)}</p>
                          <button
                            onClick={() => {
                              // If they want to link this manually
                              onLogin({
                                fullName: manualOrder.customerName,
                                phone: manualOrder.customerPhone,
                                address: manualOrder.customerAddress,
                                country: manualOrder.countryCode === 'NP' ? 'Nepal' : manualOrder.countryCode === 'AE' ? 'United Arab Emirates' : 'Nepal',
                                whatsapp: manualOrder.customerPhone,
                                location: manualOrder.deliveryLocationName
                              });
                              setManualOrder(null);
                              setManualSearchId('');
                            }}
                            className="w-full py-1.5 bg-dark text-white text-[10px] font-bold uppercase tracking-widest rounded-lg mt-1"
                          >
                            Link this order to my profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  
                  /* List matched orders with custom timelines */
                  matchedOrders.map((order) => {
                    const currentIndex = getStatusIndex(order.status);
                    
                    return (
                      <div key={order.id} className="bg-white p-6 rounded-3xl border border-clay shadow-md space-y-6">
                        
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-clay-light">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg font-black text-dark">{order.id}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-0.5 font-bold uppercase tracking-wider">
                              Booked on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>

                           <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => generateOrderReceiptPDF(order, settings)}
                              className="inline-flex items-center justify-center gap-1.5 bg-brand hover:bg-dark text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                              title="Download official PDF Receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </button>
                            <button
                              onClick={() => {
                                // Trigger print with window.print() but the css makes sure ONLY the div print-invoice-[id] prints
                                const printStyles = document.createElement('style');
                                printStyles.innerHTML = `
                                  @media print {
                                    #print-invoice-${order.id} {
                                      display: block !important;
                                    }
                                  }
                                `;
                                document.head.appendChild(printStyles);
                                window.print();
                                // Clean up after print
                                setTimeout(() => {
                                  document.head.removeChild(printStyles);
                                }, 1000);
                              }}
                              className="inline-flex items-center justify-center gap-1.5 bg-clay-light hover:bg-clay text-neutral-700 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Receipt
                            </button>
                            <a
                              href={`https://wa.me/${settings?.whatsappNumber || '9779802058364'}?text=Hi Mahi, I am inquiring about my Order ${order.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Inquire WhatsApp
                            </a>
                          </div>
                        </div>

                        {/* Order Progress Line */}
                        {order.status === 'Cancelled' ? (
                          <div className="bg-red-50 text-red-800 p-4 rounded-xl text-center text-xs border border-red-200">
                            <strong>This cosmetic booking was cancelled.</strong> Please reach support to reactivate or review payment status.
                          </div>
                        ) : (
                          <div className="py-2">
                            <div className="flex flex-col sm:flex-row justify-between gap-6 relative">
                              {/* Connector line */}
                              <div className="hidden sm:block absolute left-4 right-4 top-4.5 h-[2px] bg-clay-light -z-10" />
                              
                              {STATUS_STEPS.map((step, idx) => {
                                const isDone = idx <= currentIndex;
                                const isCurrent = idx === currentIndex;

                                return (
                                  <div key={idx} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-1.5 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                      isCurrent 
                                        ? 'bg-brand text-white ring-4 ring-clay-light scale-105'
                                        : isDone 
                                        ? 'bg-dark text-white'
                                        : 'bg-clay-light text-neutral-400 border border-clay/50'
                                    }`}>
                                      {isDone && !isCurrent ? <Check className="w-4.5 h-4.5 stroke-[2.5]" /> : idx + 1}
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className={`text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-brand' : isDone ? 'text-dark' : 'text-neutral-400'}`}>
                                        {step.label}
                                      </p>
                                      <p className="text-[9px] text-neutral-400 max-w-[130px] leading-tight hidden sm:block font-light">
                                        {step.desc}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Order Items & Review Action */}
                        <div className="bg-bg-warm/35 p-4 rounded-2xl border border-clay-light space-y-4">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Items Purchased:</p>
                          
                          <div className="divide-y divide-clay-light">
                            {order.items.map((it) => (
                              <div key={it.productId} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-12 rounded bg-white border border-clay overflow-hidden flex-shrink-0">
                                    <img src={it.image} alt={it.productName} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="text-xs">
                                    <h5 className="font-bold text-dark">{it.productName}</h5>
                                    <p className="text-neutral-400 font-medium">Qty: {it.quantity} @ {formatPrice(it.price, (order.currency as CurrencyCode) || currency)}</p>
                                  </div>
                                </div>

                                <div className="text-right flex items-center gap-3">
                                  <span className="text-xs font-bold text-dark">
                                    {formatPrice(it.price * it.quantity, (order.currency as CurrencyCode) || currency)}
                                  </span>
                                  <button
                                    onClick={() => handleOpenReviewModal(it.productId, it.productName, it.image)}
                                    className="bg-brand hover:bg-dark text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1 shadow-sm"
                                  >
                                    <Star className="w-3 h-3 fill-current" />
                                    Review
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary footer */}
                        <div className="flex justify-between items-center pt-2 text-xs font-bold text-dark">
                          <p className="text-neutral-500 font-normal">Paid via <span className="font-bold">{order.paymentMethod}</span></p>
                          <p className="text-sm">Total Paid: <span className="text-brand text-base font-black">{formatPrice(order.total, (order.currency as CurrencyCode) || currency)}</span></p>
                        </div>

                      </div>
                    );
                  })
                )}

                {/* DEDICATED WISHLIST SECTION */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-clay shadow-md space-y-6">
                  <div className="flex items-center justify-between border-b border-clay-light pb-4">
                    <h4 className="font-serif text-xl font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                      <Heart className="w-5 h-5 text-brand fill-current" />
                      My VIP Wishlist
                    </h4>
                    <span className="bg-brand/10 text-brand text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {wishlistProducts.length} Saved {wishlistProducts.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="p-10 text-center text-neutral-400 space-y-3">
                      <Heart className="w-10 h-10 mx-auto text-neutral-300" />
                      <p className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Your wishlist is empty</p>
                      <p className="text-[11px] text-neutral-400 font-light max-w-xs mx-auto">
                        Save your favorite custom apparel measurements or high-end cosmetics as you browse, then access them here.
                      </p>
                      <button
                        onClick={onBackToShop}
                        className="mt-2 bg-dark hover:bg-brand text-white text-[10px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Explore Boutique Catalogue
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-clay-light">
                      {wishlistProducts.map((prod) => {
                        const {
                          formattedOriginal,
                          formattedSale
                        } = getProductDisplayPrices(prod, currency);
                        
                        return (
                          <div key={prod.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 text-xs">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-15 rounded-lg bg-neutral-50 border border-clay overflow-hidden flex-shrink-0">
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-1 text-left">
                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-neutral-400">{prod.category}</span>
                                <h5 className="font-bold text-dark text-sm leading-tight">{prod.name}</h5>
                                <div className="flex items-center gap-2 font-bold">
                                  <span className="text-brand">{formattedSale}</span>
                                  {prod.discountPercent > 0 && (
                                    <span className="text-[10px] text-neutral-400 line-through font-normal">
                                      {formattedOriginal}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                onClick={() => handleMoveToBag(prod)}
                                className="flex items-center gap-1.5 bg-brand hover:bg-dark text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-brand/10"
                                title="Move to shopping bag and remove from wishlist"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Move to Bag
                              </button>
                              <button
                                onClick={() => onToggleWishlist(prod.id)}
                                className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition cursor-pointer border border-red-150/40"
                                title="Remove from wishlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT Portion: MY SETTINGS & PRODUCT FEEDBACKS */}
              <div className="space-y-6">
                
                {/* DIGITAL VIP MEMBERSHIP CARD */}
                <div className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-neutral-900 to-amber-950 text-white rounded-3xl border border-amber-500/35 p-6 shadow-2xl space-y-6">
                  {/* Subtle golden glare overlay */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span className="font-serif text-sm font-black tracking-widest uppercase">Mahi Creations</span>
                      </div>
                      <p className="text-[9px] text-amber-500/80 tracking-widest font-bold uppercase">Boutique VIP Lounge</p>
                    </div>
                    <span className="text-[8px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                      ROYAL PASS
                    </span>
                  </div>

                  {/* Golden chip & Contactless Wireless Signal Visual */}
                  <div className="flex justify-between items-center pt-2">
                    {/* Chip Graphic */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 p-[1px] opacity-85">
                      <div className="w-full h-full rounded-[5px] bg-amber-800/10 border border-amber-900/10 grid grid-cols-3 grid-rows-2 gap-[1px]">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="border-[0.5px] border-amber-400/30"></div>
                        ))}
                      </div>
                    </div>
                    {/* Wireless signal */}
                    <svg className="w-6 h-6 text-amber-400/50 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8M12 3v14" />
                    </svg>
                  </div>

                  {/* Member Card Information */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">VIP Cardholder</p>
                      <h4 className="font-serif text-base font-extrabold text-amber-100 tracking-wide">
                        {userSession.fullName}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-0.5">
                        <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">WhatsApp / Contact</p>
                        <p className="text-[11px] font-mono text-neutral-200 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                          {userSession.whatsapp || userSession.phone}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">Country / State</p>
                        <p className="text-[11px] text-neutral-200 font-semibold">
                          {userSession.country || 'Nepal'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left border-t border-amber-500/15 pt-3">
                      <div className="space-y-0.5">
                        <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">Lounge Location</p>
                        <p className="text-[11px] text-neutral-200 font-semibold truncate" title={userSession.location || userSession.address}>
                          {userSession.location || 'Kathmandu'}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">VIP membership no.</p>
                        <p className="text-[11px] font-mono text-amber-400 font-bold tracking-wider">
                          MC-VIP-{(userSession.phone || '9800000000').slice(-4)}-{((userSession.fullName || 'A').charCodeAt(0) * 7) % 99}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-0.5 border-t border-amber-500/15 pt-3 text-left">
                      <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">Full Registered Address</p>
                      <p className="text-[10px] text-stone-300 font-light leading-snug">
                        {userSession.address}
                      </p>
                    </div>
                  </div>

                  {/* Card Security/Footer Seal */}
                  <div className="flex justify-between items-center pt-2 border-t border-amber-500/10 text-[8px] text-amber-500/60 tracking-wider font-semibold">
                    <span>MEMBER SINCE {new Date().getFullYear()}</span>
                    <span>ACTIVE VIP LEVEL 1</span>
                  </div>
                </div>

                {/* LOUNGE FEEDBACK STATS CARD */}
                <div className="bg-white p-6 rounded-3xl border border-clay shadow-md space-y-4">
                  <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wider flex items-center gap-2 border-b border-clay pb-2">
                    <Star className="w-4.5 h-4.5 text-brand fill-current" />
                    My Feedback Reviews
                  </h4>

                  {reviews.filter(r => r.customerName === userSession.fullName).length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
                      <p>You haven't posted any cosmetics feedback yet. Share your experience with the Mahi community!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                      {reviews.filter(r => r.customerName === userSession.fullName).map((rev) => (
                        <div key={rev.id} className="bg-bg-warm/30 p-3 rounded-xl border border-clay-light text-xs space-y-1.5 text-left">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-dark truncate max-w-[120px]">{rev.productName}</span>
                            <div className="flex items-center gap-0.5 text-brand">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-neutral-200'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="italic text-neutral-600 font-light text-[11px]">"{rev.comment}"</p>
                          
                          {rev.photoUrl && (
                            <div className="mt-1.5 rounded-lg overflow-hidden w-16 h-12 border border-clay bg-neutral-100 cursor-zoom-in group/photo" onClick={() => setZoomedPhoto(rev.photoUrl || null)}>
                              <img src={rev.photoUrl} alt="" className="w-full h-full object-cover transition-transform group-hover/photo:scale-105" />
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-1 border-t border-dashed border-clay-light">
                            <p className="text-[9px] text-neutral-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</p>
                            <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                              rev.approved 
                                ? 'bg-green-50 text-green-600 border border-green-200/50' 
                                : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                            }`}>
                              {rev.approved ? 'Approved & Live' : 'Awaiting Sourcing Review'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MAHI CREATIONS COMMUNITY REVIEWS BROADCAST */}
                <div className="bg-white p-6 rounded-3xl border border-clay shadow-md space-y-4">
                  <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wider flex items-center gap-2 border-b border-clay pb-2">
                    <Sparkles className="w-4.5 h-4.5 text-brand" />
                    Community Reviews
                  </h4>
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {reviews.filter(r => r.approved).slice(0, 8).map((rev) => (
                      <div key={rev.id} className="text-xs space-y-1.5 border-b border-clay-light/50 pb-3 last:border-b-0 last:pb-0 text-left">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-neutral-800">{rev.customerName}</span>
                          <div className="flex items-center text-brand">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-current' : 'text-neutral-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Product: {rev.productName}</p>
                        <p className="text-[11px] text-neutral-500 font-light">"{rev.comment}"</p>

                        {rev.photoUrl && (
                          <div className="mt-1.5 rounded-lg overflow-hidden w-16 h-12 border border-clay bg-neutral-100 cursor-zoom-in group/photo" onClick={() => setZoomedPhoto(rev.photoUrl || null)}>
                            <img src={rev.photoUrl} alt="" className="w-full h-full object-cover transition-transform group-hover/photo:scale-105" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* REVERSIBLE MODAL FOR WRITING A REVIEW */}
      {reviewProduct && (
        <div className="fixed inset-0 bg-dark/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-clay max-w-md w-full p-6 space-y-5 animate-fade-in text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-clay-light">
              <h3 className="font-serif text-lg font-bold text-dark uppercase tracking-wide flex items-center gap-1.5">
                <Star className="w-5 h-5 text-brand fill-current" />
                Submit Feedback
              </h3>
              <button onClick={() => setReviewProduct(null)} className="p-1 hover:bg-clay-light rounded-full transition cursor-pointer text-neutral-400 hover:text-dark">
                &times;
              </button>
            </div>

            {reviewSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wider">Review Submitted!</h4>
                  <p className="text-neutral-400 text-xs mt-1">Thank you for sharing your experience. Your feedback keeps Mahi exquisite!</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {/* Selected Item header */}
                <div className="flex items-center gap-3 bg-bg-warm/35 p-3 rounded-xl border border-clay-light">
                  <div className="w-8 h-10 rounded overflow-hidden border border-clay flex-shrink-0 bg-white">
                    <img src={reviewProduct.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-dark truncate max-w-[280px]">{reviewProduct.name}</p>
                    <p className="text-[10px] text-neutral-400">Share your skin, lipstick pigment, or duration feedback.</p>
                  </div>
                </div>

                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-600 uppercase tracking-wider block">Cosmetic Experience</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setRating(stars)}
                        className="p-1 cursor-pointer hover:scale-110 transition-all text-brand"
                      >
                        <Star className={`w-7 h-7 ${stars <= rating ? 'fill-current' : 'text-neutral-200'}`} />
                      </button>
                    ))}
                    <span className="font-bold text-neutral-500 ml-2 font-mono">({rating} / 5 Stars)</span>
                  </div>
                </div>

                {/* Comment area */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-600 uppercase tracking-wider block">Write your comment</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe product texture, pigmentation, smell, or packaging condition... (e.g., Highly pigmented lipstick, super smooth matte! Loved it.)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs p-3 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                  />
                </div>

                {/* Photo Attachment Placeholder Selection */}
                <div className="space-y-2 border-t border-clay/50 pt-3 text-left">
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

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewProduct(null)}
                    className="px-4 py-2 bg-clay-light hover:bg-clay text-neutral-700 font-bold uppercase tracking-wide rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-dark hover:bg-brand text-white font-bold uppercase tracking-widest rounded-lg transition cursor-pointer shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Zoom Lightbox Modal inside Customer Portal */}
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
  );
}
