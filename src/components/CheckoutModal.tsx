import React, { useState, useEffect } from 'react';
import { CartItem, Order, OrderStatus, Product, Coupon } from '../types';
import { X, MapPin, Phone, User, CreditCard, Sparkles, Check, ArrowLeft, Send, ShieldCheck, ShoppingBag, Landmark, Copy, Ticket } from 'lucide-react';
import { CURRENCIES, convertPrice, formatPrice, CurrencyCode, CountryConfig, ShippingLocation } from '../utils/currency';
import { ESewaLogo, KhaltiLogo, VisaLogo, MasterCardLogo, CODLogo, BankTransferLogo, PayPalLogo } from './BrandLogos';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onOrderCompleted: (order: Order) => void;
  whatsappNumber?: string;
  countries: CountryConfig[];
  settings?: any;
  products: Product[];
  orders?: Order[];
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  currency,
  onCurrencyChange,
  onOrderCompleted,
  whatsappNumber = '971501942989',
  countries,
  settings,
  products,
  orders = []
}: CheckoutModalProps) {
  // Find country configuration based on selected currency, defaulting to UAE
  const initialCountry = (countries && countries.length > 0) ? (countries.find(c => c.defaultCurrency === currency) || countries[0]) : { code: 'NP', defaultCurrency: 'NPR', locations: [] } as any;
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountry.code);
  
  const activeCountry = countries.find(c => c.code === selectedCountryCode) || countries[0];
  const [selectedLocationId, setSelectedLocationId] = useState<string>(activeCountry.locations[0]?.id || '');


  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'eSewa' | 'Khalti' | 'COD' | 'Bank Transfer' | 'Card Payment' | 'PayPal' | 'IPS'>('Card Payment');
  const [notes, setNotes] = useState('');
  const [addGiftWrap, setAddGiftWrap] = useState(false);

  // Card payment mock states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Simulation Flow States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'simulating-gateway' | 'simulating-otp' | 'success'>('details');
  const [gatewayPhone, setGatewayPhone] = useState('');
  const [gatewayPin, setGatewayPin] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newOrderResult, setNewOrderResult] = useState<Order | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  const handleCopyTrackingId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedTrackingId(true);
      setTimeout(() => setCopiedTrackingId(false), 2000);
    }).catch(err => {
      console.error('Failed to copy order ID: ', err);
    });
  };

  // Coupon engine states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const inputCode = couponCodeInput.trim().toUpperCase();
    if (!inputCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const couponsList: Coupon[] = settings?.coupons || [
      { id: 'c1', code: 'WELCOME10', discountPercent: 10, applicableProductId: 'all', isActive: true, usedByPhones: [] },
      { id: 'c2', code: 'LIPSTICK25', discountPercent: 25, applicableProductId: 'p1', isActive: true, usedByPhones: [] },
      { id: 'c3', code: 'GLOW20', discountPercent: 20, applicableProductId: 'p2', isActive: true, usedByPhones: [] }
    ];

    const coupon = couponsList.find(c => c.code === inputCode);

    if (!coupon) {
      setCouponError('Invalid coupon code. Try WELCOME10, LIPSTICK25, or GLOW20!');
      setAppliedCoupon(null);
      return;
    }

    if (!coupon.isActive) {
      setCouponError('This coupon code is currently inactive.');
      setAppliedCoupon(null);
      return;
    }

    // Verify "yauta coupon ek choti matrai use garna milos par account" (per phone number)
    const cleanCustomerPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanCustomerPhone) {
      const alreadyRedeemed = (coupon.usedByPhones || []).some(ph => ph.replace(/[^0-9]/g, '') === cleanCustomerPhone) ||
                              (orders || []).some(o => o.customerPhone.replace(/[^0-9]/g, '') === cleanCustomerPhone && o.couponCode === inputCode);
      if (alreadyRedeemed) {
        setCouponError('You have already used this coupon. Limit is 1 use per customer/account!');
        setAppliedCoupon(null);
        return;
      }
    }

    // Product specificity check
    if (coupon.applicableProductId !== 'all') {
      const hasProduct = cart.some(item => item.product.id === coupon.applicableProductId);
      if (!hasProduct) {
        const prod = products.find(p => p.id === coupon.applicableProductId);
        setCouponError(`This coupon is only valid for: "${prod?.name || 'specific product'}".`);
        setAppliedCoupon(null);
        return;
      }
    }

    setAppliedCoupon(coupon);
    setCouponSuccess(`Success! Coupon "${coupon.code}" applied. You get ${coupon.discountPercent}% discount!`);
  };

  // Sync state when country changes
  useEffect(() => {
    if (activeCountry) {
      setSelectedLocationId(activeCountry.locations?.[0]?.id || '');
      // Automatically update global currency to match selected country's default currency for frictionless shopping!
      if (isOpen) {
        onCurrencyChange(activeCountry.defaultCurrency);
      }
      
      // Select appropriate payment methods
      let defaultMethod: 'eSewa' | 'Khalti' | 'COD' | 'Bank Transfer' | 'Card Payment' | 'PayPal' = activeCountry.code === 'NP' ? 'eSewa' : 'Card Payment';
      const available = settings?.enabledPayments || ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal'];
      if (!available.includes(defaultMethod)) {
        defaultMethod = available[0] || 'COD';
      }
      setPaymentMethod(defaultMethod);
    }
  }, [selectedCountryCode]);

  if (!isOpen) return null;

  // SECURE ANTI-CHEAT CALCULATIONS (Calculates strictly from database state)
  const rawSubtotal = cart.reduce((sum, item) => {
    const masterProduct = products.find(p => p.id === item.product.id) || item.product;
    return sum + masterProduct.price * item.quantity;
  }, 0);

  const discountAmount = cart.reduce((sum, item) => {
    const masterProduct = products.find(p => p.id === item.product.id) || item.product;
    const itemDiscount = (masterProduct.price * masterProduct.discountPercent) / 100;
    return sum + itemDiscount * item.quantity;
  }, 0);

  const subtotalAfterDiscount = rawSubtotal - discountAmount;

  // Coupon calculations
  let couponDiscountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.applicableProductId === 'all') {
      couponDiscountValue = Math.round((subtotalAfterDiscount * appliedCoupon.discountPercent) / 100);
    } else {
      // Apply only to the matching product
      couponDiscountValue = cart.reduce((sum, item) => {
        if (item.product.id === appliedCoupon.applicableProductId) {
          const masterProduct = products.find(p => p.id === item.product.id) || item.product;
          const finalPriceAfterStandardDiscount = masterProduct.price - (masterProduct.price * masterProduct.discountPercent / 100);
          const itemCouponDiscount = Math.round((finalPriceAfterStandardDiscount * appliedCoupon.discountPercent) / 100);
          return sum + (itemCouponDiscount * item.quantity);
        }
        return sum;
      }, 0);
    }
  }

  // Active shipping fee config
  const activeLocation = activeCountry.locations.find(loc => loc.id === selectedLocationId) || activeCountry.locations[0];
  const deliveryFeeInNpr = activeLocation ? activeLocation.feeInNpr : 0;
  const giftWrapFeeInNpr = addGiftWrap ? 50 : 0;
  const grandTotalInNpr = Math.max(0, subtotalAfterDiscount - couponDiscountValue + deliveryFeeInNpr + giftWrapFeeInNpr);

  // Pre-fill Gateway Phone if matches customer
  const handleOpenGateway = () => {
    setGatewayPhone(customerPhone || '');
    setPaymentStep('simulating-gateway');
  };

  const handleGatewayLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentStep('simulating-otp');
    }, 1500);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentStep('success');
      triggerOrderCreation();
    }, 1800);
  };

  const handleDirectCODOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      triggerOrderCreation();
    }, 1500);
  };

  const triggerOrderCreation = () => {
    const orderId = 'MC-' + Math.floor(10000 + Math.random() * 90000);
    
    const finalOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      customerAddress: `${customerAddress}, ${activeLocation?.name || ''}, ${activeCountry.name}`,
      deliveryLocationId: selectedLocationId,
      deliveryLocationName: activeLocation?.name || 'Local Shipping',
      deliveryFee: deliveryFeeInNpr,
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      couponDiscount: appliedCoupon ? couponDiscountValue : undefined,
      items: [
        ...cart.map(item => {
          const masterProduct = products.find(p => p.id === item.product.id) || item.product;
          return {
            productId: masterProduct.id,
            productName: masterProduct.name,
            price: masterProduct.price - (masterProduct.price * masterProduct.discountPercent / 100),
            discountPercent: masterProduct.discountPercent,
            quantity: item.quantity,
            image: masterProduct.image
          };
        }),
        ...(addGiftWrap ? [{
          productId: 'GIFT-WRAP',
          productName: 'Premium Gift Wrapping',
          price: 50,
          discountPercent: 0,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=200&q=80'
        }] : [])
      ],
      subtotal: rawSubtotal,
      discountAmount: discountAmount,
      total: grandTotalInNpr,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
      currency: currency,
      countryCode: selectedCountryCode,
      estimatedDelivery: 'Within 24 to 48 Hours',
      courierName: 'Mahi Creations Express Rider',
      courierPhone: 'Pending review',
      courierTrackingCode: 'Pending allocation',
      sellerNotes: appliedCoupon 
        ? `Order placed successfully using promo code [${appliedCoupon.code}] with ${appliedCoupon.discountPercent}% off.`
        : 'Order placed successfully. We are preparing your boutique package with extra love.',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Verified',
      statusLogs: [
        {
          status: 'Pending',
          note: `Order placed successfully by customer using ${paymentMethod}. ${appliedCoupon ? `Promo code ${appliedCoupon.code} was validated.` : ''} Waiting for luxury review.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setNewOrderResult(finalOrder);
    onOrderCompleted(finalOrder);
  };

  // Build elegant WhatsApp message link
  const getWhatsAppLink = (order: Order) => {
    const adminNum = whatsappNumber.replace(/[^0-9]/g, '');
    const header = `🛍️ ${settings?.shopName || 'Mahi Creations'} Boutique - New Order Received! 🛍️\n\n`;
    
    const clientGratitude = `💌 Customer Note:\n"Thank you for your purchase! Once your payment is verified, we will dispatch your package to your delivery address."\n\n`;
    
    const details = `------------------------------\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.customerAddress}\nPayment Method: ${order.paymentMethod}\n\n`;
    
    let itemsText = `Cosmetics Ordered:\n`;
    order.items.forEach((item, index) => {
      itemsText += `${index + 1}. ${item.productName} (Qty: ${item.quantity}) - ${formatPrice(item.price, currency)}\n`;
    });
    
    let photosText = `\n📷 Product Photos:\n`;
    order.items.forEach((item) => {
      photosText += `- ${item.productName}:\n${item.image}\n`;
    });
    
    const finances = `\nSubtotal: ${formatPrice(subtotalAfterDiscount, currency)}\nDiscount: -${formatPrice(discountAmount, currency)}\nShipping Fee: ${deliveryFeeInNpr === 0 ? 'FREE' : formatPrice(deliveryFeeInNpr, currency)}${addGiftWrap ? `\nGift Wrapping: ${formatPrice(50, currency)}` : ''}\n------------------------------\nGrand Total: ${formatPrice(grandTotalInNpr, currency)}\n\nBoutique team, please pack with care and expedite shipping!`;
    
    const text = encodeURIComponent(header + clientGratitude + details + itemsText + photosText + finances);
    return `https://wa.me/${adminNum}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-dark/60 backdrop-blur-[4px] font-sans">
      
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-clay">
        
        {/* Header - Hidden in post-order state */}
        {!newOrderResult && (
          <div className="px-6 py-5 bg-bg-warm border-b border-clay flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-clay-light flex items-center justify-center text-brand">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-dark uppercase">Secure Boutique Checkout</h3>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Mahi Creations International</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-clay-light text-neutral-500 hover:text-dark transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Dynamic Display based on stage */}
        {newOrderResult ? (
          /* Post Purchase Success screen */
          <div className="p-8 text-center space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                Order Placed Successfully!
              </span>
              <h4 className="font-serif text-2xl font-bold text-dark mt-3">
                Thank you, {newOrderResult.customerName}!
              </h4>
              <p className="text-neutral-500 text-xs mt-1 max-w-md mx-auto leading-relaxed font-light">
                Your order has been logged in our luxury boutique system. Use the Tracking ID below to review delivery progress.
              </p>
            </div>

            {/* CUSTOMER GRATITUDE CARD WITH PHOTO ATTACHMENT PREVIEW */}
            <div className="bg-gradient-to-br from-brand/10 to-bg-warm border-2 border-brand/20 p-6 rounded-3xl max-w-lg mx-auto space-y-4 shadow-sm text-left">
              <div className="flex items-center gap-2 text-brand">
                <Sparkles className="w-5 h-5 fill-current" />
                <span className="font-bold text-xs uppercase tracking-wider">{settings?.shopName || 'Mahi Creations'} Boutique Confirmation</span>
              </div>
              <p className="font-serif text-sm sm:text-base text-dark font-semibold leading-relaxed">
                "Thank you so much for your purchase! Once your payment is confirmed, we will dispatch your items to your delivery destination."
              </p>

              {/* Product Photos attachment preview list */}
              <div className="pt-2">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Item Photos:</p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {newOrderResult.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-clay-light flex-shrink-0">
                      <img
                        src={it.image}
                        alt={it.productName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-15 rounded-lg object-cover bg-clay-light border"
                      />
                      <div className="text-[11px] leading-tight max-w-[120px]">
                        <p className="font-bold text-dark truncate">{it.productName}</p>
                        <p className="text-neutral-400">Qty: {it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Track ID Slate */}
            <div className="bg-white p-5 rounded-2xl max-w-sm mx-auto border border-clay shadow-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-brand" />
              <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">Your Order Tracking ID</p>
              <div className="flex items-center justify-between gap-3 mt-1.5 bg-bg-warm/70 p-2 px-3.5 rounded-xl border border-clay/60">
                <span className="text-xl font-mono font-black text-dark tracking-wider select-text">
                  {newOrderResult.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyTrackingId(newOrderResult.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                    copiedTrackingId 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-dark hover:bg-brand text-white hover:scale-[1.03] active:scale-[0.97]'
                  }`}
                >
                  {copiedTrackingId ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-brand" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 font-medium mt-2 tracking-wide leading-relaxed">
                Save this ID to check order status & track delivery progress in the top menu tracker.
              </p>
            </div>

            {/* ORDER ITEMS SUMMARY */}
            <div className="max-w-md mx-auto border border-clay rounded-2xl p-4 text-left bg-clay-light/25 space-y-2.5">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-clay/60 pb-1.5">
                Order Invoice Summary
              </p>
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
                {newOrderResult.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-neutral-600">
                    <span className="truncate max-w-[280px]">
                      {it.productName} <span className="text-[10px] text-neutral-400 font-bold">x{it.quantity}</span>
                    </span>
                    <span className="font-semibold">{formatPrice(it.price * it.quantity, currency)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-clay/60 pt-2 flex justify-between text-xs font-bold text-dark">
                <span>Grand Total ({newOrderResult.paymentMethod}):</span>
                <span className="text-brand text-sm">{formatPrice(grandTotalInNpr, currency)}</span>
              </div>
            </div>

            {/* WHATSAPP PUSH ACTIONS */}
            <div className="bg-clay-light border border-clay rounded-2xl p-5 max-w-md mx-auto space-y-3.5">
              <div>
                <p className="text-xs font-bold text-dark uppercase tracking-wider flex items-center justify-center gap-1.5">
                  💬 Direct Boutique Confirmation
                </p>
                <p className="text-[11px] text-neutral-500 font-normal mt-1 leading-relaxed">
                  Click below to send order invoice details directly to {settings?.shopName || 'Mahi Creations'} WhatsApp! This allows you to chat immediately with our dispatch team regarding logistics and delivery timing.
                </p>
              </div>

              <a
                href={getWhatsAppLink(newOrderResult)}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 fill-current" />
                Send Invoice to WhatsApp
              </a>
            </div>

            {/* Close action */}
            <div>
              <button
                onClick={onClose}
                className="text-xs font-bold text-neutral-500 hover:text-dark underline transition-all cursor-pointer"
              >
                Close and Return to Shop
              </button>
            </div>
          </div>
        ) : paymentStep === 'simulating-gateway' ? (
          /* Simulated eSewa or Khalti or Card gateway */
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setPaymentStep('details')}
                className="p-1 rounded-full hover:bg-clay-light text-neutral-600 transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-6 w-[1px] bg-clay"></div>
              <h4 className="font-serif text-lg font-bold text-dark uppercase">
                Secure Merchant Gateway
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Form panel */}
              <div className="md:col-span-7 space-y-6">
                
                {paymentMethod === 'Card Payment' ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block">Secure Gateway</span>
                        <span className="text-lg font-bold text-dark">Visa / Mastercard / Amex</span>
                      </div>
                      <CreditCard className="w-8 h-8 text-slate-600" />
                    </div>

                    <form onSubmit={handleGatewayLogin} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full text-center text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">CVV</label>
                          <input
                            type="password"
                            required
                            placeholder="•••"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full text-center text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-mono"
                          />
                        </div>
                      </div>

                      <div className="bg-bg-warm border border-clay p-3 rounded-lg text-[10px] text-neutral-500 leading-normal flex gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Card Sandbox:</strong> Use any dummy numbers. Transactions are simulated over secure TLS channels.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full bg-dark hover:bg-brand text-white text-xs font-bold tracking-widest uppercase py-3.5 rounded-xl transition cursor-pointer shadow-md mt-2"
                      >
                        {isProcessingPayment ? 'Processing Securely...' : `Pay ${formatPrice(grandTotalInNpr, currency)}`}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* eSewa or Khalti dynamic panel */
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase block">Secure Mobile Wallet</span>
                        <span className="text-lg font-black text-emerald-700 uppercase tracking-wide font-sans">{paymentMethod}</span>
                      </div>
                      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-[10px] font-bold">
                        {paymentMethod}
                      </div>
                    </div>

                    <form onSubmit={handleGatewayLogin} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Wallet Mobile Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 98XXXXXXXX"
                          value={gatewayPhone}
                          onChange={(e) => setGatewayPhone(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Wallet PIN</label>
                        <input
                          type="password"
                          required
                          placeholder="••••"
                          maxLength={6}
                          value={gatewayPin}
                          onChange={(e) => setGatewayPin(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none tracking-widest"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-widest uppercase py-3.5 rounded-xl transition shadow cursor-pointer mt-2"
                      >
                        {isProcessingPayment ? 'Connecting Wallet Server...' : `Pay ${formatPrice(grandTotalInNpr, currency)}`}
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Bill Details */}
              <div className="md:col-span-5 bg-clay-light/25 p-4.5 rounded-2xl border border-clay space-y-4">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Payment Invoice
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal:</span>
                    <span className="text-dark font-bold">{formatPrice(subtotalAfterDiscount, currency)}</span>
                  </div>
                  {addGiftWrap && (
                    <div className="flex justify-between text-neutral-500 animate-fade-in">
                      <span>Premium Gift Wrap:</span>
                      <span className="text-rose-600 font-bold">+{formatPrice(50, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Shipping:</span>
                    <span className="text-dark font-bold">{deliveryFeeInNpr === 0 ? 'FREE' : formatPrice(deliveryFeeInNpr, currency)}</span>
                  </div>
                  <div className="border-t border-clay pt-2 flex justify-between font-bold text-dark">
                    <span>Payable Total:</span>
                    <span className="text-brand text-sm">{formatPrice(grandTotalInNpr, currency)}</span>
                  </div>
                </div>

                <div className="bg-white border border-clay/60 p-3 rounded-xl text-[10px] text-dark leading-normal">
                  📦 <strong>Customer:</strong> {customerName || 'Guest'} <br />
                  📍 <strong>Country:</strong> {activeCountry.name} <br />
                  🗺️ <strong>Delivery:</strong> {activeLocation?.name || ''}
                </div>
              </div>

            </div>
          </div>
        ) : paymentStep === 'simulating-otp' ? (
          /* Simulated OTP screen */
          <div className="p-8 text-center max-w-sm mx-auto space-y-5">
            <div className="w-12 h-12 bg-clay-light text-brand rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-dark">Secure Verification Code</h4>
              <p className="text-neutral-500 text-xs mt-1 font-light leading-relaxed">
                A verification code has been simulated and sent. Key in the OTP below to complete authorization.
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Type '1234' to authorize"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center text-lg font-mono font-bold tracking-widest border border-clay rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-brand bg-bg-warm/30"
              />

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full bg-dark hover:bg-brand text-white text-xs font-bold tracking-widest uppercase py-4 rounded-xl transition cursor-pointer"
              >
                {isProcessingPayment ? 'Verifying...' : 'Authorize Payment'}
              </button>
            </form>

            <p className="text-[10px] text-neutral-400">
              Demo sandbox mode: Simply type any code and submit.
            </p>
          </div>
        ) : (
          /* Details Form */
          <form onSubmit={handleDirectCODOrderSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form Entries (Left Column) */}
              <div className="space-y-4.5">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-clay pb-1">
                  1. Delivery Details
                </h4>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Shipping Country</label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full text-xs border border-clay rounded-lg p-3 bg-white focus:outline-none focus:border-brand font-medium text-dark cursor-pointer"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs border border-clay rounded-lg p-3 bg-bg-warm/40 focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    Mobile Number (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +971 50 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs border border-clay rounded-lg p-3 bg-bg-warm/40 focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                </div>

                {/* Shipping Location Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Delivery Region / Emirates</label>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full text-xs border border-clay rounded-lg p-3 bg-white focus:outline-none focus:border-brand font-medium text-dark cursor-pointer"
                  >
                    {activeCountry.locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.feeInNpr === 0 ? '(Free Shipping)' : `(+${formatPrice(loc.feeInNpr, currency)})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Specific Street Address / Villa / Apartment
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Ward No. 3, Jhamsikhel, Lalitpur (near Ring Road)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-xs border border-clay rounded-lg p-3 bg-bg-warm/40 focus:ring-1 focus:ring-brand focus:outline-none resize-none"
                  />
                </div>

              </div>

              {/* Payment Methods (Right Column) */}
              <div className="space-y-4.5">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-clay pb-1">
                  2. Payment Method
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Dynamic Options depending on country and admin settings */}
                  {selectedCountryCode === 'NP' ? (
                    <>
                      {/* eSewa */}
                      {(settings?.enabledPayments ?? ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment']).includes('eSewa') && (
                        <label
                          className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer ${
                            paymentMethod === 'eSewa'
                              ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                              : 'border-clay bg-white text-neutral-600 hover:bg-clay-light'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'eSewa'}
                            onChange={() => setPaymentMethod('eSewa')}
                            className="sr-only"
                          />
                          <span className="flex items-center gap-1.5">
                            <ESewaLogo className="h-5 w-auto" />
                          </span>
                          <span className="text-[10px] text-neutral-400 leading-tight font-medium">Pay securely via eSewa Portal</span>
                        </label>
                      )}

                      {/* Khalti */}
                      {(settings?.enabledPayments ?? ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment']).includes('Khalti') && (
                        <label
                          className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer ${
                            paymentMethod === 'Khalti'
                              ? 'border-purple-500 bg-purple-50/40 text-purple-950 shadow-sm ring-1 ring-purple-500'
                              : 'border-clay bg-white text-neutral-600 hover:bg-clay-light'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'Khalti'}
                            onChange={() => setPaymentMethod('Khalti')}
                            className="sr-only"
                          />
                          <span className="flex items-center gap-1.5">
                            <KhaltiLogo className="h-5 w-auto" />
                          </span>
                          <span className="text-[10px] text-neutral-400 leading-tight font-medium">Instant sandbox OTP Gateway</span>
                        </label>
                      )}

                      {/* Connect IPS */}
                      {(settings?.enabledPayments ?? ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal', 'IPS']).includes('IPS') && (
                        <label
                          className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer ${
                            paymentMethod === 'IPS'
                              ? 'border-blue-600 bg-blue-50/40 text-blue-950 shadow-sm ring-1 ring-blue-600'
                              : 'border-clay bg-white text-neutral-600 hover:bg-clay-light'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'IPS'}
                            onChange={() => setPaymentMethod('IPS')}
                            className="sr-only"
                          />
                          <span className="flex items-center gap-1.5 font-serif text-xs font-black text-[#004f80]">
                            <Landmark className="w-5 h-5 text-[#004f80]" />
                            <span>Connect IPS</span>
                          </span>
                          <span className="text-[10px] text-neutral-400 leading-tight font-medium">Pay via Connect IPS Account</span>
                        </label>
                      )}
                    </>
                  ) : (
                    /* Card Payment (Default International) */
                    (settings?.enabledPayments ?? ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment']).includes('Card Payment') && (
                      <label
                        className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer col-span-2 ${
                          paymentMethod === 'Card Payment'
                            ? 'border-brand bg-brand/5 text-dark shadow-sm ring-1 ring-brand'
                            : 'border-clay bg-white text-neutral-600 hover:bg-clay-light'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'Card Payment'}
                          onChange={() => setPaymentMethod('Card Payment')}
                          className="sr-only"
                        />
                        <span className="text-xs font-black tracking-wide text-dark uppercase flex items-center justify-between w-full">
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-brand" />
                            <span>Credit / Debit Card</span>
                          </span>
                          <div className="flex gap-1 items-center">
                            <VisaLogo className="h-3 w-auto" />
                            <MasterCardLogo className="h-3 w-auto" />
                          </div>
                        </span>
                        <span className="text-[10px] text-neutral-400 leading-tight font-medium">Visa, Mastercard, American Express or UnionPay</span>
                      </label>
                    )
                  )}

                  {/* Cash on Delivery */}
                  {(settings?.enabledPayments ?? ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal']).includes('COD') && (
                    <label
                      className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer ${
                        paymentMethod === 'COD'
                          ? 'border-brand bg-clay-light/40 text-dark shadow-sm ring-1 ring-brand'
                          : 'border-clay bg-white text-neutral-600 hover:bg-clay-light'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-1">
                        <CODLogo className="h-5 w-auto" />
                      </span>
                      <span className="text-[10px] text-neutral-400 leading-tight font-medium">Pay upon delivery drops</span>
                    </label>
                  )}

                  {/* Bank Transfer */}
                  {(settings?.enabledPayments ?? ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal']).includes('Bank Transfer') && (
                    <label
                      className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer ${
                        paymentMethod === 'Bank Transfer'
                          ? 'border-dark bg-clay-light/50 text-dark shadow-sm ring-1 ring-dark'
                          : 'border-clay bg-white text-neutral-600 hover:bg-clay-light'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'Bank Transfer'}
                        onChange={() => setPaymentMethod('Bank Transfer')}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-1">
                        <BankTransferLogo className="h-5 w-auto" />
                      </span>
                      <span className="text-[10px] text-neutral-400 leading-tight font-medium">Manual Transfer with receipt</span>
                    </label>
                  )}

                  {/* PayPal */}
                  {(settings?.enabledPayments ?? ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal']).includes('PayPal') && (
                    <label
                      className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer ${
                        paymentMethod === 'PayPal'
                          ? 'border-blue-600 bg-blue-50/40 text-blue-950 shadow-sm ring-1 ring-blue-600'
                          : 'border-clay bg-white text-neutral-600 hover:bg-clay-light'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'PayPal'}
                        onChange={() => setPaymentMethod('PayPal')}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-1">
                        <PayPalLogo className="h-5 w-auto" />
                      </span>
                      <span className="text-[10px] text-neutral-400 leading-tight font-medium">Pay securely via PayPal</span>
                    </label>
                  )}

                </div>

                {/* DYNAMIC PAYMENT INSTRUCTIONS BOX */}
                {(() => {
                  if (paymentMethod === 'eSewa') {
                    return (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3 text-left animate-fade-in mt-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">eSewa Wallet Settlement Details</span>
                        </div>
                        <div className="text-xs space-y-2 text-emerald-950 font-medium">
                          <p>Please send the total amount to our verified eSewa account:</p>
                          <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1 mt-1 shadow-xs">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">eSewa ID / Phone:</span>
                              <span className="font-bold select-all">{settings?.esewaAccountPhone || '9802058364'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Account Name:</span>
                              <span className="font-bold">{settings?.esewaAccountName || 'Mahi Creations'}</span>
                            </div>
                          </div>
                          
                          {settings?.esewaQrUrl && (
                            <div className="flex flex-col items-center justify-center p-3.5 bg-white border border-emerald-100 rounded-xl mt-2.5">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Scan to Pay via eSewa QR</p>
                              <img src={settings.esewaQrUrl} alt="eSewa QR Code" className="h-44 w-44 object-contain rounded border border-clay" />
                            </div>
                          )}

                          <p className="text-[9px] text-neutral-400 mt-1 italic">
                            Post-submission, please take a screenshot and share it with us via WhatsApp to complete instant activation.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (paymentMethod === 'Khalti') {
                    return (
                      <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3 text-left animate-fade-in mt-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-800">Khalti Wallet Settlement Details</span>
                        </div>
                        <div className="text-xs space-y-2 text-purple-950 font-medium">
                          <p>Please send the total amount to our verified Khalti account:</p>
                          <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1 mt-1 shadow-xs">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Khalti ID / Phone:</span>
                              <span className="font-bold select-all">{settings?.khaltiAccountPhone || '9802058364'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Account Name:</span>
                              <span className="font-bold">{settings?.khaltiAccountName || 'Mahi Creations'}</span>
                            </div>
                          </div>

                          {settings?.khaltiQrUrl && (
                            <div className="flex flex-col items-center justify-center p-3.5 bg-white border border-purple-100 rounded-xl mt-2.5">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Scan to Pay via Khalti QR</p>
                              <img src={settings.khaltiQrUrl} alt="Khalti QR Code" className="h-44 w-44 object-contain rounded border border-clay" />
                            </div>
                          )}

                          <p className="text-[9px] text-neutral-400 mt-1 italic">
                            Post-submission, please take a screenshot and share it with us via WhatsApp to complete instant activation.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (paymentMethod === 'IPS') {
                    return (
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 text-left animate-fade-in mt-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#004f80]" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#004f80]">Connect IPS Settlement Details</span>
                        </div>
                        <div className="text-xs space-y-2 text-blue-950 font-medium">
                          <p>Please make your Connect IPS transfer to our official merchant account:</p>
                          <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1 mt-1 shadow-xs">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">IPS Phone/ID:</span>
                              <span className="font-bold select-all">{settings?.ipsAccountPhone || '9802058364'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Account Name:</span>
                              <span className="font-bold">{settings?.ipsAccountName || 'Mahi Creations'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Settlement Bank:</span>
                              <span className="font-bold">{settings?.ipsBankName || 'Global IME Bank'}</span>
                            </div>
                          </div>

                          {settings?.ipsQrUrl && (
                            <div className="flex flex-col items-center justify-center p-3.5 bg-white border border-blue-100 rounded-xl mt-2.5">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Scan to Pay via Connect IPS QR</p>
                              <img src={settings.ipsQrUrl} alt="Connect IPS QR Code" className="h-44 w-44 object-contain rounded border border-clay" />
                            </div>
                          )}

                          <p className="text-[9px] text-neutral-400 mt-1 italic">
                            Post-submission, please take a screenshot and share it with us via WhatsApp to verify your Connect IPS transaction.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (paymentMethod === 'Bank Transfer') {
                    return (
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 text-left animate-fade-in mt-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">Direct Bank Settlement Details</span>
                        </div>
                        <div className="text-xs space-y-2 text-blue-950 font-medium">
                          <p>Please make a bank transfer or mobile banking deposit to our official account:</p>
                          <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1 mt-1 shadow-xs font-sans">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Bank Name:</span>
                              <span className="font-bold">{settings?.bankName || 'Nabil Bank Limited'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Account Number:</span>
                              <span className="font-mono font-bold select-all">{settings?.bankAccountNumber || '0110017500369'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Account Holder:</span>
                              <span className="font-bold">{settings?.bankAccountName || 'Mahi Creations Pvt. Ltd.'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Branch Location:</span>
                              <span className="font-bold text-[11px]">{settings?.bankBranch || 'Jhamsikhel Branch'}</span>
                            </div>
                          </div>

                          {settings?.bankQrUrl && (
                            <div className="flex flex-col items-center justify-center p-3.5 bg-white border border-blue-100 rounded-xl mt-2.5">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Scan to Pay via Bank/Fonepay QR</p>
                              <img src={settings.bankQrUrl} alt="Bank QR Code" className="h-44 w-44 object-contain rounded border border-clay" />
                            </div>
                          )}

                          <p className="text-[9px] text-neutral-400 mt-1 italic">
                            Please upload or message us your deposit receipt with your order name to process warehouse dispatch immediately.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (paymentMethod === 'PayPal') {
                    return (
                      <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-2 text-left animate-fade-in mt-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#003087]" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-900">PayPal International Settlement</span>
                        </div>
                        <div className="text-xs space-y-1 text-blue-950 font-medium">
                          <p>Please send payment via PayPal to our registered merchant email:</p>
                          <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1 mt-1 shadow-xs">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">PayPal Email:</span>
                              <span className="font-bold select-all">{settings?.paypalEmail || 'mahicreations369@gmail.com'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[10px] uppercase">Registered Name:</span>
                              <span className="font-bold">{settings?.paypalAccountName || 'Mahi Creations Luxury'}</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-neutral-400 mt-1 italic">
                            Note: Make sure to transfer in USD equivalent or your regional currency. Send payment receipt for rapid dispatch.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (paymentMethod === 'COD') {
                    return (
                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2 text-left animate-fade-in mt-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-neutral-800" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800">Cash on Delivery Policy</span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed font-light">
                          {settings?.codInstructions || 'Pay cash or scan dynamic Fonepay QR upon home delivery by courier.'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Custom remarks */}
                <div className="space-y-1 mt-3">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-neutral-500">Order Notes / Delivery Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring doorbell, deliver after 5 PM"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs border border-clay rounded-lg p-2.5 bg-bg-warm/40 focus:outline-none"
                  />
                </div>

                {/* Gift Wrap option */}
                <div className="mt-4 p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 hover:border-rose-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="giftWrapCheckbox"
                      checked={addGiftWrap}
                      onChange={(e) => setAddGiftWrap(e.target.checked)}
                      className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 cursor-pointer accent-rose-600"
                    />
                    <label htmlFor="giftWrapCheckbox" className="cursor-pointer select-none">
                      <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                        Add Premium Gift Wrap 🎁
                      </span>
                      <span className="text-[10px] text-neutral-500 font-light block leading-tight mt-0.5">
                        Elevate your order with luxury wrapping & card (+50 NPR / {formatPrice(50, currency)})
                      </span>
                    </label>
                  </div>
                </div>

                {/* AUTOMATED COUPON ENGINE FORM */}
                <div className="mt-4 p-4 bg-gradient-to-br from-brand/5 to-bg-warm/30 border border-clay rounded-2xl space-y-3 shadow-inner">
                  <span className="text-[10px] font-extrabold tracking-widest text-brand uppercase flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-brand" />
                    Automated Coupon Code Engine
                  </span>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Promo Code (e.g. WELCOME10)"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-1 text-xs border border-clay rounded-lg p-2.5 focus:ring-1 focus:ring-brand focus:outline-none bg-white font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-dark hover:bg-brand text-white font-bold text-[10px] tracking-wider uppercase rounded-lg transition duration-200 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[10px] font-bold text-rose-600 animate-shake">
                      ⚠️ {couponError}
                    </p>
                  )}

                  {couponSuccess && (
                    <p className="text-[10px] font-bold text-emerald-700">
                      ✨ {couponSuccess}
                    </p>
                  )}

                  {/* Available hints */}
                  {!appliedCoupon && (
                    <p className="text-[9px] text-neutral-400 font-normal leading-normal">
                      💡 Try codes: <strong>WELCOME10</strong> (10% all products), <strong>LIPSTICK25</strong> (25% off lipstick), or <strong>GLOW20</strong> (20% off foundation). 1 use per customer/phone.
                    </p>
                  )}
                </div>

                {/* Subtotal slate info */}
                <div className="bg-clay-light/15 rounded-xl p-3 border border-clay space-y-2 text-xs mt-3">
                  <div className="flex justify-between text-neutral-500">
                    <span>Cosmetics Subtotal:</span>
                    <span>{formatPrice(subtotalAfterDiscount, currency)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-fade-in flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span>Coupon Discount ({appliedCoupon.code}):</span>
                        <span className="font-bold">-{formatPrice(couponDiscountValue, currency)}</span>
                      </div>
                      <p className="text-[9px] text-emerald-600">
                        {appliedCoupon.applicableProductId === 'all' 
                          ? 'Applied to total order value' 
                          : `Applied ${appliedCoupon.discountPercent}% off strictly on product: "${products.find(p => p.id === appliedCoupon.applicableProductId)?.name || 'product'}"`}
                      </p>
                    </div>
                  )}

                  {addGiftWrap && (
                    <div className="flex justify-between text-neutral-500 animate-fade-in">
                      <span>Premium Gift Wrap:</span>
                      <span className="text-rose-600 font-bold">+{formatPrice(50, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500">
                    <span>Boutique Shipping:</span>
                    <span>{deliveryFeeInNpr === 0 ? 'FREE' : formatPrice(deliveryFeeInNpr, currency)}</span>
                  </div>
                  <div className="border-t border-clay pt-2 flex justify-between font-bold text-dark">
                    <span>Payable Grand Total:</span>
                    <span className="text-brand text-sm">{formatPrice(grandTotalInNpr, currency)}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="border-t border-clay pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] text-neutral-400 font-light max-w-sm leading-normal">
                🔒 Protected by boutique SSL encryption. By placing the order, cosmetic quantities are reserved immediately in UAE fulfillment storage.
              </span>
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-dark hover:bg-brand text-white text-xs font-bold tracking-widest uppercase px-7 py-3.5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isProcessingPayment ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Processing...
                  </span>
                ) : (
                  'Place Boutique Order & Confirm on WhatsApp'
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
