import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, OrderStatus, BoutiqueSettings, ProductReview, UserSession } from './types';
import { INITIAL_PRODUCTS, DELIVERY_LOCATIONS, DEFAULT_PROMO_SLIDES } from './data';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AuthModal from './components/AuthModal';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import AdminPanel from './components/AdminPanel';
import CustomerPortal from './components/CustomerPortal';
import PolicyPage from './components/PolicyPage';
import ProductDetailModal from './components/ProductDetailModal';
import QuickViewModal from './components/QuickViewModal';
import WhatsAppChat from './components/WhatsAppChat';
import FaqSection from './components/FaqSection';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';
import ToastContainer, { ToastItem } from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Filter, ArrowUpDown, CheckCircle2, Heart, ShieldAlert, ShoppingBag, Eye, HelpCircle, Globe, Mail, ShieldCheck, Send, CreditCard, Check, Facebook, Instagram, Linkedin, RefreshCw, FileText, X, Truck, Info, Lock, ChevronDown, MapPin, Phone, Clock, ChevronLeft, ChevronRight, ArrowUp, Flame } from 'lucide-react';
import { CurrencyCode, CountryConfig, getCustomCountries, saveCustomCountries } from './utils/currency';
import { ESewaLogo, KhaltiLogo, VisaLogo, MasterCardLogo, CODLogo, BankTransferLogo, PayPalLogo, FacebookLogo, InstagramLogo, TikTokLogo, WhatsAppLogo } from './components/BrandLogos';
import SmartRoutineQuiz from './components/SmartRoutineQuiz';

const DEMO_ORDER: Order = {
  id: 'MC-55120',
  customerName: 'Aayusha K.C.',
  customerPhone: '9841567890',
  customerAddress: 'Lazimpat, Kathmandu',
  deliveryLocationId: 'loc-ktm',
  deliveryLocationName: 'Kathmandu Valley (Inside)',
  deliveryFee: 0,
  paymentMethod: 'Khalti',
  items: [
    {
      productId: 'p2',
      productName: 'Mahi Radiant Glow Liquid Foundation',
      price: 2560,
      discountPercent: 20,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
    },
    {
      productId: 'p3',
      productName: 'Mahi Imperial Eyeshadow Palette (18 Shades)',
      price: 4050,
      discountPercent: 10,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    }
  ],
  subtotal: 7700,
  discountAmount: 1090,
  total: 6610,
  status: 'Packaging',
  createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  notes: 'Pack it beautifully with bubble wrap, please!',
  estimatedDelivery: 'July 14, 2026, by 6:00 PM',
  courierName: 'Upaya CityCargo (Boutique Special)',
  courierPhone: '9841002233',
  courierTrackingCode: 'UC-MAHI-88129',
  sellerNotes: 'Order received and reviewed. High-end custom lipstick and bubble wrap included! Have a glowing day!',
  paymentStatus: 'Verified',
  statusLogs: [
    { status: 'Pending', note: 'Order placed by customer via Khalti wallet payment.', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
    { status: 'Confirmed', note: 'Mahi Boutique manager verified items and received Khalti payload.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
    { status: 'Packaging', note: 'Double bubble-wrap layer added. Custom velvet jewelry/cosmetics pouch included.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    } 
  }
};

export default function App() {
  // State lists
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mahi_products_v1');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mahi_orders_v1');
    return saved ? JSON.parse(saved) : [DEMO_ORDER];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mahi_cart_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('mahi_wishlist_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      return next;
    });
  };

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const handleAddToast = (product: Product, message: string = 'Added to Bag!') => {
    const newToast: ToastItem = {
      id: Math.random().toString(36).substring(2, 9),
      product,
      message,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const comparedProducts = useMemo(() => {
    return products.filter(p => compareIds.includes(p.id));
  }, [products, compareIds]);



  const handleToggleCompare = (productId: string) => {
    setCompareIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 3) {
        // Limit reached
        return prev;
      }
      return [...prev, productId];
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setCompareIds(prev => prev.filter(id => id !== productId));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
  };

  const [countries, setCountries] = useState<CountryConfig[]>(() => {
    return getCustomCountries();
  });

  const handleUpdateCountries = (updatedCountries: CountryConfig[]) => {
    setCountries(updatedCountries);
    saveCustomCountries(updatedCountries);
  };

  // Dynamic config states
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('mahi_currency_v1');
    if (saved) return saved as CurrencyCode;
    return 'AED'; // Default to UAE Dirham (AED)
  });

  const [selectedLocationId, setSelectedLocationId] = useState('np-ktm');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('popularity'); // popularity, price-low, price-high, discount
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('mahi_session_v1');
    return saved ? JSON.parse(saved) : null;
  });

  // Dynamic Boutique Config Settings
  const [settings, setSettings] = useState<BoutiqueSettings>(() => {
    const saved = localStorage.getItem('mahi_settings_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If they had the old dark background, automatically upgrade to match the beautiful light theme background
        if (parsed.footerBgColor === '#1a1a1a') {
          parsed.footerBgColor = '#fff0f1';
        }
        if (parsed.footerTextColor === '#e5e5e5') {
          parsed.footerTextColor = '#1a1a1a';
        }
        // Upgrade empty logoUrl to use the newly generated elegant rose-gold crown logo
        if (!parsed.logoUrl || parsed.logoUrl === '') {
          parsed.logoUrl = '/src/assets/images/mahi_logo_new_1783763329444.jpg';
        }
        if (!parsed.faviconUrl || parsed.faviconUrl === '') {
          parsed.faviconUrl = '/src/assets/images/mahi_logo_new_1783763329444.jpg';
        }
        if (!parsed.adminEmail || parsed.adminEmail === '' || parsed.adminEmail === 'workineuhr@gmail.com') {
          parsed.adminEmail = 'mahicreations369@gmail.com';
        }
        if (!parsed.promoSlides || !Array.isArray(parsed.promoSlides) || parsed.promoSlides.length === 0) {
          parsed.promoSlides = DEFAULT_PROMO_SLIDES;
        }
        // Upgrade About section with the beautiful Dubai sourcing, Nepal delivery and Worldwide story
        if (!parsed.aboutPara1 || parsed.aboutPara1.includes('Lalitpur, Jhamsikhel') || parsed.aboutPara1.includes('Founded with a vision')) {
          parsed.aboutBadge = 'Dubai & Worldwide';
          parsed.aboutTitle = 'Our Sourcing Legacy';
          parsed.aboutSubtitle = 'Sourced in Dubai, Delivered in Nepal, Shipped Worldwide.';
          parsed.aboutPara1 = 'Established as a premier luxury digital hub in Dubai, Mahi Creations is built on the philosophy of global accessibility and authentic quality. Every piece of exquisite couture, hand-crafted jewelry, and certified cosmetic formulation is personally sourced from exclusive international distributors right here in the luxury fashion hubs of Dubai.';
          parsed.aboutPara2 = 'While our primary sourcing and authentication hub is based in Dubai, we are deeply committed to bridging premium luxury directly to Nepal and worldwide. With reliable delivery partnerships in Nepal and secure air cargo networks, your luxury curations reach you in perfect condition, no matter where you are in the world.';
          parsed.aboutPara3 = 'All cosmetics are guaranteed 100% authentic, verified, and direct from authorized brand houses. Pair that with our personalized bridal couture fittings, certified high-end jewelry, and round-the-clock concierge support, and Mahi Creations offers a truly global standard of boutique excellence.';
          parsed.footerAbout = 'Mahi Creations is a premium luxury boutique. Sourced directly from Dubai, we deliver high-end authentic cosmetic formulations, custom jewelry, and designer couture to Nepal and worldwide.';
        }
        if (!parsed.coupons || !Array.isArray(parsed.coupons) || parsed.coupons.length === 0) {
          parsed.coupons = [
            { id: 'c1', code: 'WELCOME10', discountPercent: 10, applicableProductId: 'all', isActive: true, usedByPhones: [] },
            { id: 'c2', code: 'LIPSTICK25', discountPercent: 25, applicableProductId: 'p1', isActive: true, usedByPhones: [] },
            { id: 'c3', code: 'GLOW20', discountPercent: 20, applicableProductId: 'p2', isActive: true, usedByPhones: [] }
          ];
        }
        // Ensure new settings fields exist on load
        return {
          adminUser: 'Mahi123@',
          adminPassword: 'Mahi1234567@',
          adminEmail: 'mahicreations369@gmail.com',
          shopName: 'Mahi Creations',
          shopAddress: 'Lalitpur, Jhamsikhel, Nepal',
          logoUrl: '/src/assets/images/mahi_logo_new_1783763329444.jpg',
          faviconUrl: '/src/assets/images/mahi_logo_new_1783763329444.jpg',
          headerPromo: 'Monsoon Glow Offer: Automatically save up to 25% + Free delivery inside Kathmandu Valley!',
          enabledPayments: ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal'],
          enabledCurrencies: ['AED'],
          esewaAccountPhone: '9802058364',
          esewaAccountName: 'Mahi Creations',
          khaltiAccountPhone: '9802058364',
          khaltiAccountName: 'Mahi Creations',
          bankName: 'Nabil Bank Limited',
          bankAccountNumber: '0110017500369',
          bankAccountName: 'Mahi Creations Pvt. Ltd.',
          bankBranch: 'Jhamsikhel Branch',
          paypalEmail: 'mahicreations369@gmail.com',
          paypalAccountName: 'Mahi Creations Luxury',
          codInstructions: 'Pay cash or scan dynamic Fonepay QR upon home delivery by courier.',
          whatsappNumber: '9779802058364',
          facebookLink: 'https://facebook.com/mahicreations',
          tiktokLink: 'https://tiktok.com/@mahicreations',
          instagramLink: 'https://instagram.com/mahicreations_nepal',
          linkedinLink: 'https://linkedin.com/company/mahicreations',
          homeProductIds: INITIAL_PRODUCTS.map(p => p.id),
          sliderProductIds: INITIAL_PRODUCTS.map(p => p.id).slice(0, 3),
          footerBgColor: '#fff0f1',
          footerTextColor: '#1a1a1a',
          footerAbout: 'Mahi Creations is a premium luxury boutique. Sourced directly from Dubai, we deliver high-end authentic cosmetic formulations, custom jewelry, and designer couture to Nepal and worldwide.',
          promoSlides: DEFAULT_PROMO_SLIDES,
          aboutImageUrl: '/src/assets/images/mahi_about_me_1783496157685.jpg',
          heroBadge: 'Mahi Creations Dubai',
          heroTitle: 'Authentic Dubai Sourcing & Worldwide Delivery Luxury',
          heroImageCaption: 'Mahi Creations Showroom & Sourcing Hub',
          heroDescription: "Welcome to Mahi Creations, a premium digital gateway to 100% authentic international treasures. Hand-selected in our luxury sourcing hubs in Dubai, we curate high-end certified cosmetics, fine custom jewelry, and bespoke traditional couture with express delivery to Nepal and worldwide.",
          catalogTitle: 'Our Premium Curations',
          catalogSubtitle: 'Showing authentic cosmetics sourced in Dubai with real-time stock levels',
          aboutBadge: 'Dubai & Worldwide',
          aboutTitle: 'Our Sourcing Legacy',
          aboutSubtitle: 'Sourced in Dubai, Delivered in Nepal, Shipped Worldwide.',
          aboutPara1: 'Established as a premier luxury digital hub in Dubai, Mahi Creations is built on the philosophy of global accessibility and authentic quality. Every piece of exquisite couture, hand-crafted jewelry, and certified cosmetic formulation is personally sourced from exclusive international distributors right here in the luxury fashion hubs of Dubai.',
          aboutPara2: 'While our primary sourcing and authentication hub is based in Dubai, we are deeply committed to bridging premium luxury directly to Nepal and worldwide. With reliable delivery partnerships in Nepal and secure air cargo networks, your luxury curations reach you in perfect condition, no matter where you are in the world.',
          aboutPara3: 'All cosmetics are guaranteed 100% authentic, verified, and direct from authorized brand houses. Pair that with our personalized bridal couture fittings, certified high-end jewelry, and round-the-clock concierge support, and Mahi Creations offers a truly global standard of boutique excellence.',
          sourcingBgUrl: '',
          sourcingBgColor: '#fff0f1',
          sourcingBgBlur: 0,
          sourcingTextColor: '#1a1a1a',
          sourcingTitle: 'Mahi Privilege List',
          sourcingDescription: 'Subscribe for private invitations to global cosmetics drops, traditional apparel pre-orders, and exclusive beauty coupons directly from our certified international houses.',
          sourcingBadge: 'Exclusive Sourcing Access',
          ...parsed
        };
      } catch (e) {
        // use default fallback
      }
    }
    return {
      adminUser: 'Mahi123@',
      adminPassword: 'Mahi1234567@',
      adminEmail: 'mahicreations369@gmail.com',
      shopName: 'Mahi Creations',
      shopAddress: 'Lalitpur, Jhamsikhel, Nepal',
      logoUrl: '/src/assets/images/mahi_logo_new_1783763329444.jpg',
      faviconUrl: '/src/assets/images/mahi_logo_new_1783763329444.jpg',
      headerPromo: 'Monsoon Glow Offer: Automatically save up to 25% + Free delivery inside Kathmandu Valley!',
      enabledPayments: ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal'],
      enabledCurrencies: ['AED'],
      esewaAccountPhone: '9802058364',
      esewaAccountName: 'Mahi Creations',
      khaltiAccountPhone: '9802058364',
      khaltiAccountName: 'Mahi Creations',
      bankName: 'Nabil Bank Limited',
      bankAccountNumber: '0110017500369',
      bankAccountName: 'Mahi Creations Pvt. Ltd.',
      bankBranch: 'Jhamsikhel Branch',
      paypalEmail: 'mahicreations369@gmail.com',
      paypalAccountName: 'Mahi Creations Luxury',
      codInstructions: 'Pay cash or scan dynamic Fonepay QR upon home delivery by courier.',
      whatsappNumber: '9779802058364',
      facebookLink: 'https://facebook.com/mahicreations',
      tiktokLink: 'https://tiktok.com/@mahicreations',
      instagramLink: 'https://instagram.com/mahicreations_nepal',
      linkedinLink: 'https://linkedin.com/company/mahicreations',
      homeProductIds: INITIAL_PRODUCTS.map(p => p.id),
      sliderProductIds: INITIAL_PRODUCTS.map(p => p.id).slice(0, 3),
      footerBgColor: '#fff0f1',
      footerTextColor: '#1a1a1a',
      footerAbout: 'Mahi Creations is a premium luxury boutique. Sourced directly from Dubai, we deliver high-end authentic cosmetic formulations, custom jewelry, and designer couture to Nepal and worldwide.',
      promoSlides: DEFAULT_PROMO_SLIDES,
      aboutImageUrl: '/src/assets/images/mahi_about_me_1783496157685.jpg',
      heroBadge: 'Mahi Creations Dubai',
      heroTitle: 'Authentic Dubai Sourcing & Worldwide Delivery Luxury',
      heroImageCaption: 'Mahi Creations Showroom & Sourcing Hub',
      heroDescription: "Welcome to Mahi Creations, a premium digital gateway to 100% authentic international treasures. Hand-selected in our luxury sourcing hubs in Dubai, we curate high-end certified cosmetics, fine custom jewelry, and bespoke traditional couture with express delivery to Nepal and worldwide.",
      catalogTitle: 'Our Premium Curations',
      catalogSubtitle: 'Showing authentic cosmetics sourced in Dubai with real-time stock levels',
      aboutBadge: 'Dubai & Worldwide',
      aboutTitle: 'Our Sourcing Legacy',
      aboutSubtitle: 'Sourced in Dubai, Delivered in Nepal, Shipped Worldwide.',
      aboutPara1: 'Established as a premier luxury digital hub in Dubai, Mahi Creations is built on the philosophy of global accessibility and authentic quality. Every piece of exquisite couture, hand-crafted jewelry, and certified cosmetic formulation is personally sourced from exclusive international distributors right here in the luxury fashion hubs of Dubai.',
      aboutPara2: 'While our primary sourcing and authentication hub is based in Dubai, we are deeply committed to bridging premium luxury directly to Nepal and worldwide. With reliable delivery partnerships in Nepal and secure air cargo networks, your luxury curations reach you in perfect condition, no matter where you are in the world.',
      aboutPara3: 'All cosmetics are guaranteed 100% authentic, verified, and direct from authorized brand houses. Pair that with our personalized bridal couture fittings, certified high-end jewelry, and round-the-clock concierge support, and Mahi Creations offers a truly global standard of boutique excellence.',
      sourcingBgUrl: '',
      sourcingBgColor: '#fff0f1',
      sourcingBgBlur: 0,
      sourcingTextColor: '#1a1a1a',
      sourcingTitle: 'Mahi Privilege List',
      sourcingDescription: 'Subscribe for private invitations to global cosmetics drops, traditional apparel pre-orders, and exclusive beauty coupons directly from our certified international houses.',
      sourcingBadge: 'Exclusive Sourcing Access',
      coupons: [
        { id: 'c1', code: 'WELCOME10', discountPercent: 10, applicableProductId: 'all', isActive: true, usedByPhones: [] },
        { id: 'c2', code: 'LIPSTICK25', discountPercent: 25, applicableProductId: 'p1', isActive: true, usedByPhones: [] },
        { id: 'c3', code: 'GLOW20', discountPercent: 20, applicableProductId: 'p2', isActive: true, usedByPhones: [] }
      ]
    };
  });

  const [isLoadedFromServer, setIsLoadedFromServer] = useState(false);
  const saveToServer = (key: string, data: any) => {
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    }).catch(err => console.error(`Error syncing ${key} to backend:`, err));
  };

  useEffect(() => {
    localStorage.setItem('mahi_settings_v1', JSON.stringify(settings));
    if (isLoadedFromServer) {
      saveToServer('settings', settings);
    }
  }, [settings, isLoadedFromServer]);

  // Dynamic Favicon Updater
  useEffect(() => {
    if (settings.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  // Keep currency selection persisted
  useEffect(() => {
    localStorage.setItem('mahi_currency_v1', currency);
  }, [currency]);

  // Ensure active currency is always in enabled list
  useEffect(() => {
    const allowed = settings?.enabledCurrencies || ['AED'];
    if (allowed.length > 0 && !allowed.includes(currency)) {
      setCurrency(allowed[0] || 'AED');
    }
  }, [settings?.enabledCurrencies, currency]);

  // Synchronize default shipping location when currency shifts
  useEffect(() => {
    const activeCountry = countries.find(c => c.defaultCurrency === currency) || countries[0];
    if (activeCountry && activeCountry.locations.length > 0) {
      setSelectedLocationId(activeCountry.locations[0].id);
    }
  }, [currency, countries]);

  // Navigation / Modal triggers
  const isHDMode = true;

  const [activeView, setActiveView] = useState<'shop' | 'tracker' | 'admin' | 'portal' | 'about' | 'contact' | 'returns' | 'shipping' | 'privacy' | 'terms' | 'authenticity'>('shop');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [initialTrackId, setInitialTrackId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mahi_admin_logged_in') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mahi_admin_logged_in', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // Guarded Views Route Security
  useEffect(() => {
    if (activeView === 'admin' && !isAdminLoggedIn) {
      setActiveView('shop');
      setAuthModalOpen(true);
    }
  }, [activeView, isAdminLoggedIn]);

  useEffect(() => {
    if (activeView === 'portal' && !userSession) {
      setActiveView('shop');
      setAuthModalOpen(true);
    }
  }, [activeView, userSession]);

  // Initial customer reviews fallback
  const INITIAL_REVIEWS: ProductReview[] = [
    {
      id: 'rev-1',
      productId: 'p1',
      productName: 'Mahi Velvet Matte Liquid Lipstick',
      customerName: 'Aayusha K.C.',
      rating: 5,
      comment: 'The subekshya pigment is gorgeous! Extremely light-weight and water-resistant. Highly recommended!',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      approved: true
    },
    {
      id: 'rev-2',
      productId: 'p2',
      productName: 'Mahi Radiant Glow Liquid Foundation',
      customerName: 'Sushma Shrestha',
      rating: 5,
      comment: 'Matched perfectly with my skin! Extremely hydrated finish and smooth SPF blend.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      approved: true
    }
  ];

  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    const saved = localStorage.getItem('mahi_reviews_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({
          ...r,
          approved: r.approved !== undefined ? r.approved : true
        }));
      } catch (e) {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });

  const [subscribers, setSubscribers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mahi_subscribers_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['shristi.maharjan@gmail.com', 'anisha.karki@outlook.com', 'meera.shrestha@gmail.com', 'sujata.pokharel@yahoo.com'];
  });

  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('mahi_registered_users_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Synchronize state with backend on mount
  useEffect(() => {
    fetch('/api/state')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch master state from server');
        return res.json();
      })
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
        if (data.settings && typeof data.settings === 'object') {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
        if (data.subscribers && Array.isArray(data.subscribers) && data.subscribers.length > 0) {
          setSubscribers(data.subscribers);
        }
        if (data.registeredUsers && Array.isArray(data.registeredUsers)) {
          setRegisteredUsers(data.registeredUsers);
        }
        setIsLoadedFromServer(true);
      })
      .catch((err) => {
        console.warn('Backend connection unavailable, using localStorage fallback:', err);
        setIsLoadedFromServer(true);
      });
  }, []);

  // Persist storage whenever mutated
  useEffect(() => {
    localStorage.setItem('mahi_products_v1', JSON.stringify(products));
    if (isLoadedFromServer) {
      saveToServer('products', products);
    }
  }, [products, isLoadedFromServer]);

  useEffect(() => {
    localStorage.setItem('mahi_orders_v1', JSON.stringify(orders));
    if (isLoadedFromServer) {
      saveToServer('orders', orders);
    }
  }, [orders, isLoadedFromServer]);

  useEffect(() => {
    localStorage.setItem('mahi_cart_v1', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mahi_wishlist_v1', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('mahi_reviews_v1', JSON.stringify(reviews));
    if (isLoadedFromServer) {
      saveToServer('reviews', reviews);
    }
  }, [reviews, isLoadedFromServer]);

  useEffect(() => {
    localStorage.setItem('mahi_session_v1', JSON.stringify(userSession));
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem('mahi_subscribers_v1', JSON.stringify(subscribers));
    if (isLoadedFromServer) {
      saveToServer('subscribers', subscribers);
    }
  }, [subscribers, isLoadedFromServer]);

  useEffect(() => {
    localStorage.setItem('mahi_registered_users_v1', JSON.stringify(registeredUsers));
    if (isLoadedFromServer) {
      saveToServer('registered_users', registeredUsers);
    }
  }, [registeredUsers, isLoadedFromServer]);

  // Dynamic Page Title & Meta tags for SEO & premium look
  useEffect(() => {
    const brandName = settings.shopName || "Mahi Creations";
    let title = `${brandName} | Luxury Handcrafted Treasures & Apparel`;
    let desc = `Explore ${brandName}' exclusive collection of luxury cosmetic treasures, handcrafted custom jewelry, premium traditional clothing, and curated premium lifestyle pieces.`;
    let ogUrl = "https://mahicreations.xyz/";
    let ogImage = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=630";

    if (detailModalOpen && selectedProduct) {
      title = `${selectedProduct.name} | ${brandName}`;
      desc = selectedProduct.description;
      ogUrl = `https://mahicreations.xyz/?product=${selectedProduct.id}`;
      ogImage = selectedProduct.image;
    } else if (quickViewOpen && quickViewProduct) {
      title = `Quick View: ${quickViewProduct.name} | ${brandName}`;
      desc = quickViewProduct.description;
      ogUrl = `https://mahicreations.xyz/?product=${quickViewProduct.id}`;
      ogImage = quickViewProduct.image;
    } else if (activeView === 'admin') {
      title = `Merchant Admin Console | ${brandName}`;
      desc = "Manage products, track orders, adjust settings, and view business performance analytics.";
      ogUrl = "https://mahicreations.xyz/admin";
    } else if (activeView === 'tracker') {
      title = `Track Your Order | ${brandName}`;
      desc = "Enter your tracking code or order ID to get live status, courier, and delivery details.";
      ogUrl = "https://mahicreations.xyz/tracker";
    } else if (activeView === 'portal') {
      title = `Customer Portal | ${brandName}`;
      desc = "View your order history, account information, loyalty points, and custom rewards.";
      ogUrl = "https://mahicreations.xyz/portal";
    } else if (selectedCategory && selectedCategory !== 'All') {
      title = `${selectedCategory} Collection | ${brandName}`;
      desc = `Browse our premium handcrafted ${selectedCategory.toLowerCase()} collection.`;
      ogUrl = `https://mahicreations.xyz/?category=${encodeURIComponent(selectedCategory)}`;
    }

    // Update document title
    document.title = title;

    // Update canonical link
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', ogUrl);

    // Dynamically update OG and normal description meta tags if they exist
    const updateMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.startsWith('meta[name')) {
          const nameAttr = selector.split('"')[1];
          element.setAttribute('name', nameAttr);
        } else if (selector.startsWith('meta[property')) {
          const propAttr = selector.split('"')[1];
          element.setAttribute('property', propAttr);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Primary Meta tags
    updateMeta('meta[name="description"]', 'content', desc);
    updateMeta('meta[name="title"]', 'content', title);
    
    // Open Graph / Facebook Meta tags
    updateMeta('meta[property="og:url"]', 'content', ogUrl);
    updateMeta('meta[property="og:title"]', 'content', title);
    updateMeta('meta[property="og:description"]', 'content', desc);
    updateMeta('meta[property="og:image"]', 'content', ogImage);
    updateMeta('meta[property="og:image:secure_url"]', 'content', ogImage);
    
    // Twitter Card Meta tags
    updateMeta('meta[name="twitter:url"]', 'content', ogUrl);
    updateMeta('meta[name="twitter:title"]', 'content', title);
    updateMeta('meta[name="twitter:description"]', 'content', desc);
    updateMeta('meta[name="twitter:image"]', 'content', ogImage);
  }, [activeView, selectedCategory, selectedProduct, detailModalOpen, quickViewProduct, quickViewOpen]);

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('mahi_session_v1');
  };

  const handleAddReview = (newReview: ProductReview) => {
    const reviewWithStatus = { ...newReview, approved: false };
    setReviews(prev => [reviewWithStatus, ...prev]);
  };

  const handleToggleReviewApproval = (reviewId: string) => {
    setReviews(prev => {
      const targetReview = prev.find(r => r.id === reviewId);
      if (!targetReview) return prev;

      const isBecomingApproved = !targetReview.approved;

      // Update products state accordingly
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === targetReview.productId) {
          const currentCount = p.reviewsCount || 0;
          const currentRating = p.rating || 5.0;

          if (isBecomingApproved) {
            const nextCount = currentCount + 1;
            const nextRating = Number(((currentRating * currentCount + targetReview.rating) / nextCount).toFixed(1));
            return {
              ...p,
              reviewsCount: nextCount,
              rating: nextRating
            };
          } else {
            const nextCount = Math.max(0, currentCount - 1);
            const nextRating = nextCount > 0 
              ? Number(((currentRating * currentCount - targetReview.rating) / nextCount).toFixed(1)) 
              : 5.0;
            return {
              ...p,
              reviewsCount: nextCount,
              rating: nextRating
            };
          }
        }
        return p;
      }));

      return prev.map(r => r.id === reviewId ? { ...r, approved: isBecomingApproved } : r);
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prev => {
      const targetReview = prev.find(r => r.id === reviewId);
      if (targetReview && targetReview.approved) {
        // Only subtract from product if it was approved
        setProducts(prevProducts => prevProducts.map(p => {
          if (p.id === targetReview.productId) {
            const currentCount = p.reviewsCount || 0;
            const currentRating = p.rating || 5.0;
            const nextCount = Math.max(0, currentCount - 1);
            const nextRating = nextCount > 0 
              ? Number(((currentRating * currentCount - targetReview.rating) / nextCount).toFixed(1)) 
              : 5.0;
            return {
              ...p,
              reviewsCount: nextCount,
              rating: nextRating
            };
          }
          return p;
        }));
      }
      return prev.filter(r => r.id !== reviewId);
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    if (!userSession) {
      setAuthModalOpen(true);
      return;
    }
    setCart([{ product, quantity: 1 }]);
    setCheckoutOpen(true);
  };

  // Scroll to catalog helper
  const handleScrollToShop = () => {
    setActiveView('shop');
    setTimeout(() => {
      document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (!userSession) {
      setAuthModalOpen(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Trigger a subtle toast notification instead of opening the drawer
    handleAddToast(product, 'Added to Bag!');
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Checkout transitions
  const handleProceedToCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleOrderCompleted = (newOrder: Order) => {
    // Automatically format a deep-link to WhatsApp with order ID, total, and customer info
    const formatWhatsAppLink = (order: Order): string => {
      const rawNumber = settings.whatsappNumber || '9801122334';
      // Normalize phone number (ensure international prefix for Nepal or keep digits only)
      let cleanNumber = rawNumber.replace(/[^0-9]/g, '');
      if (cleanNumber.length === 10 && cleanNumber.startsWith('9')) {
        cleanNumber = '977' + cleanNumber;
      } else if (cleanNumber.length === 9 && cleanNumber.startsWith('1')) {
        cleanNumber = '977' + cleanNumber;
      }
      if (!cleanNumber) {
        cleanNumber = '9779802058364';
      }

      const shopName = settings.shopName || 'Mahi Creations';
      const orderId = order.id;
      const totalAmount = order.total.toLocaleString('en-IN');
      const currencyCode = order.currency || 'NPR';
      const itemsList = order.items.map(it => `- ${it.productName} (x${it.quantity})`).join('\n');

      const messageText = `Hello *${shopName}*!\n\nI have successfully placed a boutique order. Please find my pre-filled confirmation details below:\n\n🛍️ *Order ID:* ${orderId}\n💰 *Grand Total:* ${currencyCode} ${totalAmount}\n👤 *Customer Name:* ${order.customerName}\n📞 *Contact Phone:* ${order.customerPhone}\n📍 *Delivery Address:* ${order.customerAddress}\n📦 *Items Ordered:*\n${itemsList}\n\nPlease confirm my package verification. Thank you!`;

      return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
    };

    const whatsappDeepLink = formatWhatsAppLink(newOrder);

    // Open the WhatsApp deep-link automatically in a new tab/window
    try {
      window.open(whatsappDeepLink, '_blank');
    } catch (e) {
      console.warn('Auto-opening WhatsApp blocked by browser pop-up blocker.', e);
    }

    // Save to orders state
    setOrders(prev => [newOrder, ...prev]);

    // Handle coupon code redemption tracking
    if (newOrder.couponCode) {
      setSettings(prev => {
        const updatedCoupons = (prev.coupons || []).map(coupon => {
          if (coupon.code === newOrder.couponCode) {
            const cleanPhone = newOrder.customerPhone.replace(/[^0-9]/g, '');
            const usedList = coupon.usedByPhones || [];
            if (!usedList.includes(cleanPhone)) {
              return {
                ...coupon,
                usedByPhones: [...usedList, cleanPhone]
              };
            }
          }
          return coupon;
        });
        return {
          ...prev,
          coupons: updatedCoupons
        };
      });
    }

    // Clear cart
    setCart([]);
    // Redirect view to tracker automatically
    setInitialTrackId(newOrder.id);
    setActiveView('tracker');
    setCheckoutOpen(false);
  };

  // Admin inventory modifications
  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product from Mahi Creations catalog?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const logs = o.statusLogs ? [...o.statusLogs] : [];
        const statusNotes: Record<OrderStatus, string> = {
          'Pending': 'Order returned to Pending review.',
          'Confirmed': 'Order verified and confirmed by boutique managers.',
          'Packaging': 'Parcel is packaged with luxury wrapping and bubble sheets.',
          'Out for Delivery': 'Handed over to delivery agent. On the way.',
          'Delivered': 'Saman successfully delivered! Thank you.',
          'Cancelled': 'Order cancelled by boutique desk.'
        };
        logs.push({
          status,
          note: statusNotes[status] || `Order status updated to ${status}.`,
          timestamp: new Date().toISOString()
        });
        return { ...o, status, statusLogs: logs };
      }
      return o;
    }));
  };

  const handleUpdateOrderDetails = (orderId: string, updatedFields: Partial<Order>) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // If the status is changing inside updatedFields and we didn't manually append a status log, auto-add one
        let statusLogs = o.statusLogs ? [...o.statusLogs] : [];
        if (updatedFields.statusLogs) {
          statusLogs = updatedFields.statusLogs;
        } else if (updatedFields.status && updatedFields.status !== o.status) {
          const statusNotes: Record<OrderStatus, string> = {
            'Pending': 'Order returned to Pending review.',
            'Confirmed': 'Order verified and confirmed by boutique managers.',
            'Packaging': 'Parcel is packaged with luxury wrapping and bubble sheets.',
            'Out for Delivery': 'Handed over to delivery agent. On the way.',
            'Delivered': 'Saman successfully delivered! Thank you.',
            'Cancelled': 'Order cancelled by boutique desk.'
          };
          statusLogs.push({
            status: updatedFields.status,
            note: statusNotes[updatedFields.status] || `Order status updated to ${updatedFields.status}.`,
            timestamp: new Date().toISOString()
          });
        }

        const merged: Order = {
          ...o,
          ...updatedFields
        };
        if (updatedFields.status) {
          merged.status = updatedFields.status;
        }
        merged.statusLogs = statusLogs;
        return merged;
      }
      return o;
    }));
  };

  // Filters & Sorting logic - include all active products in the catalog so that newly added ones are also visible on the homepage and dynamic category tabs
  const homeDisplayProducts = products.filter(p => p.isVisible !== false);

  const filteredProducts = homeDisplayProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            (selectedCategory === 'Wishlist' ? wishlist.includes(p.id) : p.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return homeDisplayProducts.length;
    return homeDisplayProducts.filter(p => p.category === cat).length;
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aDiscounted = a.price - (a.price * a.discountPercent / 100);
    const bDiscounted = b.price - (b.price * b.discountPercent / 100);

    if (sortOption === 'price-low') {
      return aDiscounted - bDiscounted;
    }
    if (sortOption === 'price-high') {
      return bDiscounted - aDiscounted;
    }
    if (sortOption === 'discount') {
      return b.discountPercent - a.discountPercent;
    }
    // Default popularity: sort by ratings and count
    return b.rating * b.reviewsCount - a.rating * a.reviewsCount;
  });

  // Reset page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption]);

  const PRODUCTS_PER_PAGE = 12;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

  // Dynamic categories list from product catalog
  const CATEGORIES = useMemo(() => {
    const unique = new Set(products.map(p => p.category));
    return ['All', ...Array.from(unique)];
  }, [products]);

  // Dynamically compute most ordered/demanded products based on orders history (sabai bhanda dherai magiayeko product list)
  const mostOrderedProducts = useMemo(() => {
    const productOrderCounts: Record<string, number> = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        order.items.forEach(item => {
          productOrderCounts[item.productId] = (productOrderCounts[item.productId] || 0) + item.quantity;
        });
      }
    });

    const visibleProducts = products.filter(p => p.isVisible !== false);
    
    // Sort products by order count. If equal or no orders, sort by rating index (rating * reviewsCount)
    return [...visibleProducts].sort((a, b) => {
      const countA = productOrderCounts[a.id] || 0;
      const countB = productOrderCounts[b.id] || 0;
      
      if (countB !== countA) {
        return countB - countA;
      }
      
      // Fallback popularity rating index
      const popA = a.rating * (a.reviewsCount || 1);
      const popB = b.rating * (b.reviewsCount || 1);
      return popB - popA;
    });
  }, [products, orders]);

  return (
    <div className={`min-h-screen bg-bg-warm flex flex-col font-sans select-none antialiased transition-all duration-300 ${
      isHDMode ? 'subpixel-antialiased tracking-wide text-stone-900' : 'text-neutral-800'
    }`}>
      
      {/* Promo banner ticker at top */}
      <div className="bg-dark text-white py-2.5 px-4 text-center text-[11px] font-semibold tracking-widest uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
        <span>{settings.headerPromo || 'Monsoon Glow Offer: Automatically save up to 25% + Free delivery inside Kathmandu Valley!'}</span>
      </div>

      {/* Primary Header */}
      <Navbar
        settings={settings}
        activeView={activeView}
        selectedCategory={selectedCategory}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setActiveView('shop');
          if (cat === 'All') {
            setSearchQuery('');
          }
          // Smoothly scroll down to the product catalog section so users immediately see matching products
          setTimeout(() => {
            const catalog = document.getElementById('shop-catalog');
            if (catalog) {
              catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        }}
        onCartClick={() => setCartOpen(true)}
        onTrackOrderClick={() => { setActiveView('tracker'); setInitialTrackId(''); }}
        onAdminClick={() => setActiveView('admin')}
        onShopClick={() => {
          setActiveView('shop');
          setSelectedCategory('All');
          setSearchQuery('');
          setSortOption('popularity');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onPortalClick={() => setActiveView('portal')}
        onContactClick={() => {
          setActiveView('contact');
        }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        currency={currency}
        onCurrencyChange={setCurrency}
        userSession={userSession}
        isAdminLoggedIn={isAdminLoggedIn}
        onAuthClick={() => setAuthModalOpen(true)}
        onLogoutClick={() => {
          handleLogout();
          setIsAdminLoggedIn(false);
          setActiveView('shop');
        }}
        categories={CATEGORIES}
      />

      {/* Primary Views Route dispatcher */}
      <main className="flex-grow overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full"
          >
            {activeView === 'shop' && (
              <div className="space-y-4">
                

                {/* Elegant Hero Visual */}
                <Hero
                  onDiscoverClick={handleScrollToShop}
                  promoSlides={settings.promoSlides || []}
                  currency={currency}
                  whatsappNumber={settings.whatsappNumber}
                  aboutImageUrl={settings.aboutImageUrl}
                  heroBadge={settings.heroBadge}
                  heroTitle={settings.heroTitle}
                  heroImageCaption={settings.heroImageCaption}
                  heroDescription={settings.heroDescription}
                  products={products}
                  onViewDetails={handleViewDetails}
                  onCategorySelect={(cat) => {
                    setSelectedCategory(cat);
                    setActiveView('shop');
                    if (cat === 'All') {
                      setSearchQuery('');
                    }
                    setTimeout(() => {
                      const catalog = document.getElementById('shop-catalog');
                      if (catalog) {
                        catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 150);
                  }}
                />

                {/* DYNAMIC TRENDING / MOST REQUESTED SECTION (Real-Time Best Sellers Feed) */}
                {mostOrderedProducts.length > 0 && (
                  <section className={`mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-all duration-300 ${isHDMode ? 'max-w-[1440px]' : 'max-w-7xl'}`}>
                    <div className="bg-gradient-to-br from-[#0c0c0f] via-[#141419] to-[#1c1611] rounded-3xl p-6 sm:p-8 md:p-10 border border-amber-500/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
                      {/* Ambient Golden Background Orbs */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
                      
                      {/* Golden top neon accent line */}
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />

                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 border-b border-white/5 pb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              🔴 Real-Time Demand Feed
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold hidden sm:inline">
                              Fast Demand Tracking System
                            </span>
                          </div>
                          
                          <h3 
                            className="font-sans text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 bg-clip-text leading-tight uppercase tracking-tight"
                            style={{ textShadow: '0 2px 10px rgba(245,158,11,0.15)' }}
                          >
                            🔥 Best Sellers & High Demand
                          </h3>
                          <p className="text-neutral-400 text-xs font-light max-w-2xl leading-relaxed">
                            These premier items are automatically ranked and loaded in real-time according to recent purchase volumes, customer requests, and live checkout demands from our sourcing hubs.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-black shrink-0">
                          <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                          <span>UPDATED LIVE SECONDS AGO</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-8">
                        {mostOrderedProducts.slice(0, 4).map((prod, index) => {
                          // Define prestigious tags for the rankings
                          const ranks = [
                            { label: "👑 No. 1 Best Seller", style: "from-amber-600 via-yellow-500 to-amber-500 text-neutral-950 font-black" },
                            { label: "🔥 Top #2 Highly Requested", style: "from-orange-600 to-amber-500 text-white font-bold" },
                            { label: "✨ Top #3 Sourced Hot", style: "from-neutral-800 to-neutral-950 text-amber-300 border border-amber-500/30 font-bold" },
                            { label: "💎 Top #4 Crowd Choice", style: "from-indigo-900 to-purple-900 text-white font-bold" }
                          ];
                          const rank = ranks[index] || { label: `⚡ Top #${index + 1} Trending`, style: "from-neutral-900 to-neutral-950 text-neutral-300 font-medium" };

                          return (
                            <div key={`trending-${prod.id}`} className="relative group/rank-card">
                              {/* Exclusive Luxury Floating Rank Badge */}
                              <div className="absolute -top-3.5 left-4 z-20 shadow-lg">
                                <span className={`inline-flex items-center gap-1 bg-gradient-to-r ${rank.style} text-[8px] sm:text-[9.5px] uppercase tracking-wider px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}>
                                  {rank.label}
                                </span>
                              </div>

                              {/* Glowing card container for the absolute #1 and #2 items */}
                              <div className={`rounded-2xl transition-all duration-300 ${
                                index === 0 
                                  ? 'ring-2 ring-amber-500/40 shadow-[0_10px_30px_rgba(245,158,11,0.15)] group-hover/rank-card:ring-amber-500/60' 
                                  : index === 1
                                    ? 'ring-1 ring-orange-500/20 shadow-[0_10px_25px_rgba(234,88,12,0.1)]'
                                    : ''
                              }`}>
                                <ProductCard
                                  product={prod}
                                  onAddToCart={handleAddToCart}
                                  currency={currency}
                                  onViewDetails={handleViewDetails}
                                  onQuickView={(p) => {
                                    setQuickViewProduct(p);
                                    setQuickViewOpen(true);
                                  }}
                                  isWishlisted={wishlist.includes(prod.id)}
                                  onToggleWishlist={handleToggleWishlist}
                                  isCompared={compareIds.includes(prod.id)}
                                  onToggleCompare={handleToggleCompare}
                                  isHDMode={isHDMode}
                                />
                              </div>

                              {/* Live Demand Stats Ribbon under card */}
                              <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[9px] text-neutral-400 font-medium">
                                <span className="flex items-center gap-1 text-amber-500/90 font-bold">
                                  <Sparkles className="w-2.5 h-2.5 shrink-0" /> Live Demand
                                </span>
                                <span>
                                  {index === 0 ? '🔥 High Stock-Out Risk' : index === 1 ? '✨ Sells Fast' : 'Verified Dubai Quality'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                )}

                {/* PRODUCT CATALOG WRAPPER */}
                <section id="shop-catalog" className={`mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 transition-all duration-300 ${isHDMode ? 'max-w-[1440px]' : 'max-w-7xl'}`}>
                  

                  {/* Dynamic Empty state or Grid */}
                  {sortedProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-clay shadow-inner max-w-md mx-auto space-y-4 px-6">
                      <div className="w-14 h-14 bg-clay-light rounded-full flex items-center justify-center text-neutral-400 mx-auto">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-neutral-900">No cosmetics found</h4>
                        <p className="text-neutral-500 text-xs font-light max-w-xs mx-auto mt-1 leading-normal">
                          No products match your current search criteria. Try selecting another category pill or refining your search term!
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setSortOption('popularity');
                        }}
                        className="bg-brand hover:bg-dark text-white text-[11px] font-bold uppercase tracking-wider py-3 px-6 rounded-2xl cursor-pointer transition-all duration-300 inline-block shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Reset & Show All Products
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <motion.div 
                        key={`${selectedCategory}-${currentPage}`}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mx-auto transition-all duration-300 ${
                          isHDMode ? 'max-w-[1440px]' : 'max-w-7xl'
                        }`}
                      >
                        {paginatedProducts.map((prod) => (
                          <motion.div key={prod.id} variants={itemVariants}>
                            <ProductCard
                              product={prod}
                              onAddToCart={handleAddToCart}
                              currency={currency}
                              onViewDetails={handleViewDetails}
                              onQuickView={(p) => {
                                setQuickViewProduct(p);
                                setQuickViewOpen(true);
                              }}
                              isWishlisted={wishlist.includes(prod.id)}
                              onToggleWishlist={handleToggleWishlist}
                              isCompared={compareIds.includes(prod.id)}
                              onToggleCompare={handleToggleCompare}
                              isHDMode={isHDMode}
                            />
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-clay/60 max-w-7xl mx-auto">
                          <p className="text-neutral-500 text-xs font-light">
                            Showing <span className="font-bold text-dark">{Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, sortedProducts.length)}</span> to{' '}
                            <span className="font-bold text-dark">{Math.min(currentPage * PRODUCTS_PER_PAGE, sortedProducts.length)}</span> of{' '}
                            <span className="font-bold text-dark">{sortedProducts.length}</span> luxury creations
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (currentPage > 1) {
                                  setCurrentPage(currentPage - 1);
                                  setTimeout(() => {
                                    document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }, 100);
                                }
                              }}
                              disabled={currentPage === 1}
                              className={`flex items-center justify-center w-10 h-10 rounded-xl border border-clay/60 transition cursor-pointer ${
                                currentPage === 1
                                  ? 'opacity-40 cursor-not-allowed bg-transparent text-neutral-400'
                                  : 'bg-white hover:bg-clay-light text-dark hover:border-brand'
                              }`}
                              title="Previous Page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1.5">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => {
                                    setCurrentPage(p);
                                    setTimeout(() => {
                                      document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                  }}
                                  className={`flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                    currentPage === p
                                      ? 'bg-brand border-brand text-white shadow-md shadow-brand/15'
                                      : 'bg-white border-clay/60 text-dark hover:bg-clay-light hover:border-brand'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                if (currentPage < totalPages) {
                                  setCurrentPage(currentPage + 1);
                                  setTimeout(() => {
                                    document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }, 100);
                                }
                              }}
                              disabled={currentPage === totalPages}
                              className={`flex items-center justify-center w-10 h-10 rounded-xl border border-clay/60 transition cursor-pointer ${
                                currentPage === totalPages
                                  ? 'opacity-40 cursor-not-allowed bg-transparent text-neutral-400'
                                  : 'bg-white hover:bg-clay-light text-dark hover:border-brand'
                              }`}
                              title="Next Page"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </section>

                {/* Brand Story / About Us Section with Gorgeous Image Assets */}
                <section className="bg-white border-t border-clay-light py-16 sm:py-20">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                      <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        {settings.aboutBadge || "Our Legacy"}
                      </div>
                      <h2 className="font-serif text-3xl sm:text-4xl font-black text-dark uppercase tracking-tight">
                        {settings.aboutTitle || "About Mahi Creations"}
                      </h2>
                      <div className="h-0.5 w-12 bg-brand mx-auto"></div>
                      <p className="text-neutral-500 text-xs sm:text-sm font-light leading-relaxed">
                        {settings.aboutSubtitle || "Nepal’s premier luxury digital boutique, bridging authentic global formulations and high-end apparel directly to your doorstep."}
                      </p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                      
                      {/* Left Side: Showcase of Mahi Creations Lifestyle Banner */}
                      <div className="lg:col-span-6 relative">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-brand to-[#eaded7] rounded-3xl blur opacity-30 -z-10 animate-pulse"></div>
                        <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-xl aspect-[16/10] bg-white group">
                          <img 
                            src={settings.aboutImageUrl || "/src/assets/images/mahi_about_me_1783496157685.jpg"} 
                            alt="Mahi Creations Luxury Lifestyle Cosmetics" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-5">
                            <div className="text-white text-left space-y-1">
                              <span className="text-[8px] uppercase tracking-widest text-brand font-black bg-white px-2 py-0.5 rounded-md">Boutique Luxury</span>
                              <p className="font-serif text-xs font-bold uppercase tracking-wider">Mahi Creations Vanity Showcase</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Story & Features */}
                      <div className="lg:col-span-6 space-y-6 sm:space-y-8">
                        <div className="space-y-4 font-sans text-neutral-600 text-xs sm:text-sm leading-relaxed font-light">
                          <p className="whitespace-pre-line">
                            {settings.aboutPara1 || "Founded with a vision of blending luxury cosmetic formulations, custom-crafted fine jewelry, and premium traditional apparel, Mahi Creations serves as an exclusive gateway to authentic luxury. Operating from Lalitpur, Jhamsikhel, we curate only the finest certified treasures."}
                          </p>
                          <p className="whitespace-pre-line">
                            {settings.aboutPara2 || "Every cosmetic bottle we carry represents genuine global standards of safety, hydration, and glow. Our traditional apparel lines are hand-stitched by boutique master artisans, preserving timeless cultural heritages while adapting them for the contemporary modern aesthetic."}
                          </p>
                          <p className="whitespace-pre-line">
                            {settings.aboutPara3 || "Whether you are searching for premium Korean skincare regimes, custom makeup, or bespoke boutique jewelry, Mahi Creations ensures standard compliance, real-time stock levels, and expedited courier delivery across Nepal."}
                          </p>
                        </div>

                        {/* Social Signpost Counters / Badges */}
                        <div className="grid grid-cols-3 gap-4 border-t border-clay-light pt-6">
                          <div className="text-center bg-bg-warm/30 p-3 rounded-2xl border border-clay-light/80">
                            <span className="block font-serif text-xl sm:text-2xl font-black text-brand">100%</span>
                            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mt-1">Authentic Gear</span>
                          </div>
                          <div className="text-center bg-bg-warm/30 p-3 rounded-2xl border border-clay-light/80">
                            <span className="block font-serif text-xl sm:text-2xl font-black text-dark">5000+</span>
                            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mt-1">Happy Clients</span>
                          </div>
                          <div className="text-center bg-bg-warm/30 p-3 rounded-2xl border border-clay-light/80">
                            <span className="block font-serif text-xl sm:text-2xl font-black text-dark">LTP & DXB</span>
                            <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mt-1">Global Hubs</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </section>



                {/* Unified Concierge Hub: Explore Curations & Concierge FAQ Side-by-Side */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-fade-in border-t border-clay-light mt-16 bg-[#faf9f9]/40 rounded-3xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start p-2 sm:p-6">
                    
                    {/* Left Side: Explore Curations */}
                    <div className="space-y-6">
                      <div className="space-y-2 text-left">
                        <span className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-brand bg-brand/10 px-3 py-1 rounded inline-block">Explore Curations</span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">Shop By Curated Collections</h2>
                        <p className="text-neutral-500 text-xs font-light">Select a luxury collection to instantly filter global cosmetics and laboratory skincare</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-8 pt-2">
                        {/* Collection 1: Premium Cosmetics */}
                        <div 
                          onClick={() => {
                            setSelectedCategory('Lipsticks');
                            setTimeout(() => {
                              const catalog = document.getElementById('shop-catalog');
                              catalog?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="group cursor-pointer flex flex-col lg:flex-row gap-4 items-start"
                        >
                          {/* Image container - Precise Same Size & Ratio */}
                          <div className="aspect-[16/10] w-full lg:w-44 overflow-hidden rounded-2xl border border-clay bg-neutral-100 shadow-sm relative group-hover:shadow-md transition-all duration-500 flex-shrink-0">
                            <img 
                              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80" 
                              alt="Premium Cosmetics Collection" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                            <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-white bg-dark/90 px-2 py-0.5 rounded shadow-sm">
                              Cosmetics
                            </span>
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-brand transition-colors duration-300">
                                Premium Cosmetics & Fragrance
                              </h3>
                              <span className="text-[9px] font-mono text-neutral-400 bg-clay-light px-1.5 py-0.5 rounded flex-shrink-0">
                                {getCategoryCount('Lipsticks') + getCategoryCount('Eyeshadow') + getCategoryCount('Fragrance')} drop
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 font-light mt-1 leading-relaxed">
                              Hand-selected luxury lipsticks, rich pigment eyeshadows, and exquisite global fragrances.
                            </p>
                            {/* Sub-category Filter Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2.5" onClick={(e) => e.stopPropagation()}>
                              {['Lipsticks', 'Eyeshadow', 'Fragrance'].map((subCat) => (
                                <button
                                  key={subCat}
                                  onClick={() => {
                                    setSelectedCategory(subCat);
                                    setTimeout(() => {
                                      const catalog = document.getElementById('shop-catalog');
                                      catalog?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                  }}
                                  className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                    selectedCategory === subCat
                                      ? 'bg-brand text-white'
                                      : 'bg-clay-light hover:bg-clay text-neutral-600'
                                  }`}
                                >
                                  {subCat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Collection 2: Skincare & Treatments */}
                        <div 
                          onClick={() => {
                            setSelectedCategory('Skincare');
                            setTimeout(() => {
                              const catalog = document.getElementById('shop-catalog');
                              catalog?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="group cursor-pointer flex flex-col lg:flex-row gap-4 items-start"
                        >
                          {/* Image container - Precise Same Size & Ratio */}
                          <div className="aspect-[16/10] w-full lg:w-44 overflow-hidden rounded-2xl border border-clay bg-neutral-100 shadow-sm relative group-hover:shadow-md transition-all duration-500 flex-shrink-0">
                            <img 
                              src="https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=800&q=80" 
                              alt="Advanced Botanical Skincare" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                            <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-white bg-dark/90 px-2 py-0.5 rounded shadow-sm">
                              Botanicals
                            </span>
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-brand transition-colors duration-300">
                                Advanced Botanical Skincare
                              </h3>
                              <span className="text-[9px] font-mono text-neutral-400 bg-clay-light px-1.5 py-0.5 rounded flex-shrink-0">
                                {getCategoryCount('Skincare')} drop
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 font-light mt-1 leading-relaxed">
                              Dermatologist-tested clinical serums, nourishing oil therapies, and advanced hydrating essences.
                            </p>
                            {/* Sub-category Filter Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2.5" onClick={(e) => e.stopPropagation()}>
                              {['Skincare'].map((subCat) => (
                                <button
                                  key={subCat}
                                  onClick={() => {
                                    setSelectedCategory(subCat);
                                    setTimeout(() => {
                                      const catalog = document.getElementById('shop-catalog');
                                      catalog?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                  }}
                                  className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                    selectedCategory === subCat
                                      ? 'bg-brand text-white'
                                      : 'bg-clay-light hover:bg-clay text-neutral-600'
                                  }`}
                                >
                                  {subCat}
                                </button>
                              ))}
                              <button
                                onClick={() => {
                                  setSelectedCategory('All');
                                  setTimeout(() => {
                                    const catalog = document.getElementById('shop-catalog');
                                    catalog?.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                  selectedCategory === 'All'
                                    ? 'bg-dark text-white'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                }`}
                              >
                                All ({getCategoryCount('All')})
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Collection 3: Royal Traditional Wear & Bridal Jewels */}
                        <div 
                          onClick={() => {
                            setSelectedCategory('Clothing');
                            setTimeout(() => {
                              const catalog = document.getElementById('shop-catalog');
                              catalog?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="group cursor-pointer flex flex-col lg:flex-row gap-4 items-start"
                        >
                          {/* Image container - Precise Same Size & Ratio */}
                          <div className="aspect-[16/10] w-full lg:w-44 overflow-hidden rounded-2xl border border-clay bg-neutral-100 shadow-sm relative group-hover:shadow-md transition-all duration-500 flex-shrink-0">
                            <img 
                              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80" 
                              alt="Royal Traditional Wear & Bridal Jewels" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                            <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-white bg-dark/90 px-2 py-0.5 rounded shadow-sm">
                              Bridal & Wear
                            </span>
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-brand transition-colors duration-300">
                                Royal Traditional Wear & Bridal Jewels
                              </h3>
                              <span className="text-[9px] font-mono text-neutral-400 bg-clay-light px-1.5 py-0.5 rounded flex-shrink-0">
                                {getCategoryCount('Clothing') + getCategoryCount('Jewelry')} drop
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 font-light mt-1 leading-relaxed">
                              Intricate organza silk sarees, royal velvet lehengas, and precious gold-plated Kundan wedding jewelry sets.
                            </p>
                            {/* Sub-category Filter Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2.5" onClick={(e) => e.stopPropagation()}>
                              {['Clothing', 'Jewelry'].map((subCat) => (
                                <button
                                  key={subCat}
                                  onClick={() => {
                                    setSelectedCategory(subCat);
                                    setTimeout(() => {
                                      const catalog = document.getElementById('shop-catalog');
                                      catalog?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                  }}
                                  className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                    selectedCategory === subCat
                                      ? 'bg-brand text-white'
                                      : 'bg-clay-light hover:bg-clay text-neutral-600'
                                  }`}
                                >
                                  {subCat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>



                    </div>

                    {/* Right Side: Concierge FAQ (Compact) */}
                    <div className="lg:border-l lg:border-clay-light lg:pl-10">
                      <FaqSection compact={true} />
                    </div>

                  </div>
                </section>

              </div>
            )}

            {/* TRACK VIEW */}
            {activeView === 'tracker' && (
              <OrderTracker
                orders={orders}
                onBackToShop={() => setActiveView('shop')}
                initialSearchId={initialTrackId}
                settings={settings}
              />
            )}

            {/* ADMIN VIEW */}
            {activeView === 'admin' && (
              <AdminPanel
                products={products}
                orders={orders}
                reviews={reviews}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateOrderDetails={handleUpdateOrderDetails}
                onBackToShop={() => setActiveView('shop')}
                settings={settings}
                onUpdateSettings={setSettings}
                onDeleteReview={handleDeleteReview}
                onToggleReviewApproval={handleToggleReviewApproval}
                isAdminLoggedIn={isAdminLoggedIn}
                onAdminLogin={() => setIsAdminLoggedIn(true)}
                countries={countries}
                onUpdateCountries={handleUpdateCountries}
                onAddOrder={(newOrder) => setOrders(prev => [newOrder, ...prev])}
                onAddReview={(newReview) => setReviews(prev => [newReview, ...prev])}
                subscribers={subscribers}
                onUpdateSubscribers={setSubscribers}
              />
            )}

            {/* CUSTOMER PORTAL VIEW */}
            {activeView === 'portal' && (
              <CustomerPortal
                orders={orders}
                products={products}
                reviews={reviews}
                currency={currency}
                onAddReview={handleAddReview}
                onBackToShop={() => setActiveView('shop')}
                userSession={userSession}
                onLogin={handleLogin}
                onLogout={handleLogout}
                settings={settings}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* SEPARATE POLICY & INFORMATION VIEWS */}
            {['about', 'contact', 'returns', 'shipping', 'privacy', 'terms', 'authenticity'].includes(activeView) && (
              <PolicyPage
                viewType={activeView as any}
                onBackToShop={() => {
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                settings={settings}
                currency={currency}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Elements (Cart Drawer, Checkout modal, WhatsApp floating bubble) */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        currency={currency}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        countries={countries}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        currency={currency}
        onCurrencyChange={setCurrency}
        onOrderCompleted={handleOrderCompleted}
        whatsappNumber={settings.whatsappNumber}
        countries={countries}
        settings={settings}
        products={products}
        orders={orders}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        currency={currency}
        reviews={reviews}
        onAddReview={handleAddReview}
        userSession={userSession}
        onAuthNeeded={() => setAuthModalOpen(true)}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      <WhatsAppChat whatsappNumber={settings.whatsappNumber} />

      {/* Back to Top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="back-to-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleScrollToTop}
            className="fixed bottom-24 right-6 z-40 bg-white hover:bg-brand text-dark hover:text-white p-3 rounded-2xl shadow-lg border border-clay hover:border-brand transition-all duration-300 flex items-center justify-center cursor-pointer group"
            title="Back to Top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>

      <ToastContainer
        toasts={toasts}
        onRemove={handleRemoveToast}
        onViewCart={() => setCartOpen(true)}
      />

      <CompareBar
        products={comparedProducts}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
        onOpenCompare={() => setCompareOpen(true)}
      />

      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        products={comparedProducts}
        onRemove={handleRemoveCompare}
        onAddToCart={handleAddToCart}
        onViewDetails={(p) => {
          setCompareOpen(false);
          handleViewDetails(p);
        }}
        currency={currency}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        settings={settings}
        onCustomerLogin={(session) => {
          handleLogin(session);
          setAuthModalOpen(false);
          setActiveView('portal');
        }}
        onAdminLogin={() => {
          setIsAdminLoggedIn(true);
          setAuthModalOpen(false);
          setActiveView('admin');
        }}
        registeredUsers={registeredUsers}
        onRegisterUser={(newUser) => {
          setRegisteredUsers(prev => [...prev, newUser]);
        }}
      />

      {/* Smart AI Beauty Routine Finder Quiz - SMART AI CURATION */}
      {activeView !== 'admin' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
          <SmartRoutineQuiz 
            products={products}
            currency={currency}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            onAuthNeeded={() => setAuthModalOpen(true)}
            isLoggedIn={!!userSession}
          />
        </section>
      )}

      {/* VIP Newsletter Section (Mahi Privilege List) - Exclusive Sourcing Access */}
      {activeView !== 'admin' && (
        <section 
          className="w-full border-t border-b border-clay/50 py-10 sm:py-12 md:py-14 animate-fade-in relative z-10 overflow-hidden"
          style={{ backgroundColor: settings.sourcingBgColor || '#fff0f1' }}
        >
          {/* Dynamic Customized Sourcing Background Photo */}
          {settings.sourcingBgUrl && (
            <div 
              className="absolute inset-0 transition-all duration-500 pointer-events-none"
              style={{
                backgroundImage: `url(${settings.sourcingBgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: `blur(${settings.sourcingBgBlur || 0}px)`,
                transform: (settings.sourcingBgBlur || 0) > 0 ? 'scale(1.05)' : 'none',
              }}
            />
          )}

          {/* Sourcing background subtle dark/light contrast filter overlay */}
          {settings.sourcingBgUrl && (
            <div 
              className="absolute inset-0 pointer-events-none bg-white/60" 
            />
          )}

          {/* Background glowing effects for high-end aesthetic */}
          {!settings.sourcingBgUrl && (
            <>
              <div className="absolute right-0 top-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute left-0 bottom-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
            </>
          )}
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ 
                backgroundColor: 'rgba(235, 148, 134, 0.15)',
                color: settings.sourcingTextColor || '#1a1a1a'
              }}
            >
              <Mail className="w-3.5 h-3.5 animate-pulse" />
              {settings.sourcingBadge || 'Exclusive Sourcing Access'}
            </div>
            
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-tight"
              style={{ color: settings.sourcingTextColor || '#1a1a1a' }}
            >
              {settings.sourcingTitle || 'Mahi Privilege List'}
            </h2>
            
            <div className="h-0.5 w-16 bg-brand mx-auto"></div>
            
            <p 
              className="text-xs sm:text-sm font-light leading-relaxed max-w-2xl mx-auto opacity-90"
              style={{ color: settings.sourcingTextColor || '#1a1a1a' }}
            >
              {settings.sourcingDescription || 'Subscribe for private invitations to global cosmetics drops, traditional apparel pre-orders, and exclusive beauty coupons directly from our certified international houses.'}
            </p>

            <div className="max-w-lg mx-auto pt-4">
              {newsletterSubscribed ? (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center justify-center gap-2.5 animate-fade-in text-xs font-bold shadow-xs">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Successfully Subscribed to the Mahi Privilege Circle!</span>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmedEmail = newsletterEmail.trim().toLowerCase();
                    if (trimmedEmail) {
                      setSubscribers(prev => {
                        if (prev.includes(trimmedEmail)) return prev;
                        return [trimmedEmail, ...prev];
                      });
                      setNewsletterSubscribed(true);
                      
                      const targetMail = settings.adminEmail || 'mahicreations369@gmail.com';
                      const mailtoLink = `mailto:${targetMail}?subject=Mahi%20Creations%20New%20Newsletter%20Subscription&body=Hello%20Mahi%20Creations%2C%0A%0AA%20new%20customer%20has%20subscribed%20to%20your%20newsletter%20from%20the%20website!%0A%0ASubscriber%20Email%20Address%3A%20${encodeURIComponent(trimmedEmail)}%0A%0AYou%20can%20now%20send%20them%20product%20updates%20and%20promotions.%0A%0AHave%20a%20great%20day!`;
                      
                      setTimeout(() => {
                        window.location.href = mailtoLink;
                      }, 500);
                    }
                  }}
                  className="flex flex-col sm:flex-row items-center gap-3 w-full"
                >
                  <div className="relative w-full">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      placeholder="Your email address..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-white text-dark placeholder-neutral-400 border border-clay focus:border-brand focus:outline-none rounded-2xl py-4 pl-11 pr-4 transition-all shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto whitespace-nowrap bg-dark hover:bg-brand text-white py-4 px-8 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Subscribe Now</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Streamlined, Compact Boutique Footer */}
      {activeView !== 'admin' && (
        <footer 
          id="boutique-footer"
          className="py-12 border-t border-clay font-sans mt-16 transition-all duration-300 relative overflow-hidden"
          style={{ 
            backgroundColor: settings.footerBgColor || '#fdfbfa', 
            color: settings.footerTextColor || '#1a1a1a' 
          }}
        >
        {/* Ambient top highlight & decor */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand/60 to-transparent"></div>
        <div className="absolute -top-12 right-12 w-48 h-48 rounded-full bg-brand/5 blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-[11px] leading-relaxed">
            
            {/* Col 1: Brand Essence & Verified Socials */}
            <div className="space-y-4">
              <div 
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-all duration-300"
                onClick={() => {
                  setActiveView('shop');
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSortOption('popularity');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt={settings.shopName || 'Boutique Logo'} 
                    className="max-h-9 w-auto max-w-[120px] object-contain border border-clay/40 rounded-lg p-0.5 bg-white shrink-0 shadow-sm transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-dark text-white border border-brand/20 shadow-md">
                    <Sparkles className="w-4.5 h-4.5 text-brand animate-pulse" />
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-25" />
                  </div>
                )}
                <div>
                  <span className="font-serif text-sm font-extrabold text-dark tracking-wider block uppercase leading-none">
                    {settings.shopName || 'Mahi Creations'}
                  </span>
                  <span className="text-[7.5px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                    Premium Boutique Luxury
                  </span>
                </div>
              </div>
              <p className="text-neutral-500 text-[11px] font-light">
                {settings.footerAbout || 'Nepal’s premier boutique bridging authentic global cosmetic formulations and high-end skincare directly from international certified houses.'}
              </p>
              
              {/* Genuine Social Media Links with High-Quality Brand Logos */}
              <div className="space-y-2 pt-2 border-t border-clay/50">
                <p className="text-[8.5px] uppercase tracking-wider font-bold text-neutral-400">Connect With Us</p>
                <div className="flex items-center gap-2.5">
                  <a 
                    href={settings.facebookLink || "https://facebook.com"} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-[#1877F2]/10 text-neutral-600 hover:text-[#1877F2] flex items-center justify-center transition-all duration-300 border border-clay shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    title="Facebook"
                  >
                    <FacebookLogo className="w-4.5 h-4.5" />
                  </a>
                  <a 
                    href={settings.instagramLink || "https://instagram.com"} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-rose-50 text-neutral-600 hover:text-brand flex items-center justify-center transition-all duration-300 border border-clay shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    title="Instagram"
                  >
                    <InstagramLogo className="w-4.5 h-4.5" />
                  </a>
                  <a 
                    href={settings.tiktokLink || "https://tiktok.com"} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 hover:text-dark flex items-center justify-center transition-all duration-300 border border-clay shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    title="TikTok"
                  >
                    <TikTokLogo className="w-4.5 h-4.5" />
                  </a>
                  <a 
                    href={`https://wa.me/${settings.whatsappNumber}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-green-50 text-green-600 hover:text-green-700 flex items-center justify-center transition-all duration-300 border border-clay shadow-sm hover:shadow-md hover:-translate-y-0.5 relative"
                    title="WhatsApp Concierge"
                  >
                    <WhatsAppLogo className="w-4.5 h-4.5" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Customer Care & Interactive Policies Link */}
            <div className="space-y-3">
              <h5 className="font-serif text-xs font-bold text-dark uppercase tracking-wider">Customer Care</h5>
              <div className="flex flex-col space-y-2 font-semibold text-neutral-600">
                <button 
                  onClick={() => { setActiveView('returns'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left hover:text-brand transition flex items-center gap-2 group cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-brand/80 group-hover:rotate-45 transition-transform" />
                  <span>Return & Refund Policy</span>
                </button>
                <button 
                  onClick={() => { setActiveView('shipping'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left hover:text-brand transition flex items-center gap-2 group cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-brand/80" />
                  <span>Shipping & Delivery Policy</span>
                </button>
                <button 
                  onClick={() => { setActiveView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left hover:text-brand transition flex items-center gap-2 group cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-brand/80" />
                  <span>Privacy & Security Policy</span>
                </button>
                <button 
                  onClick={() => { setActiveView('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left hover:text-brand transition flex items-center gap-2 group cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-brand/80" />
                  <span>Terms & Conditions</span>
                </button>
                <button 
                  onClick={() => { setActiveView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left hover:text-brand transition flex items-center gap-2 group cursor-pointer font-bold text-brand"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  <span>Contact Us & Location</span>
                </button>
              </div>
            </div>

            {/* Col 3: Brand Story & Sourced Capital Origins */}
            <div className="space-y-4">
              <h5 className="font-serif text-xs font-bold text-dark uppercase tracking-wider">The Boutique Legacy</h5>
              <div className="flex flex-col space-y-2 font-semibold text-neutral-600">
                <button 
                  onClick={() => { setActiveView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left hover:text-brand transition flex items-center gap-2 group cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-brand/80" />
                  <span>About Our Boutique</span>
                </button>
                <button 
                  onClick={() => { setActiveView('authenticity'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left hover:text-brand transition flex items-center gap-2 group cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand/80" />
                  <span>100% Sourcing Pledge</span>
                </button>
              </div>

            </div>

            {/* Col 4: We Accept & Direct Courier Delivery */}
            <div className="space-y-4">
              <h5 className="font-serif text-xs font-bold text-dark uppercase tracking-wider font-extrabold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand" />
                We Accept
              </h5>
              <p className="text-neutral-500 text-[10px] font-light leading-relaxed">
                Secure digital payments and real-time bank settlements. We ensure direct home courier service across Nepal and UAE.
              </p>
              
              {/* Payment Gateways structured into an elegant responsive grid layout */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="bg-white p-2 rounded-xl border border-clay hover:border-brand/50 hover:shadow-sm transition-all duration-300 flex items-center justify-center h-10" title="eSewa">
                  <ESewaLogo className="h-4.5 object-contain" />
                </div>
                <div className="bg-white p-2 rounded-xl border border-clay hover:border-brand/50 hover:shadow-sm transition-all duration-300 flex items-center justify-center h-10" title="Khalti">
                  <KhaltiLogo className="h-4.5 object-contain" />
                </div>
                <div className="bg-white p-2 rounded-xl border border-clay hover:border-brand/50 hover:shadow-sm transition-all duration-300 flex items-center justify-center h-10" title="MasterCard">
                  <MasterCardLogo className="h-3.5 w-auto object-contain" />
                </div>
                <div className="bg-white p-2 rounded-xl border border-clay hover:border-brand/50 hover:shadow-sm transition-all duration-300 flex items-center justify-center h-10" title="Bank Transfer">
                  <BankTransferLogo className="h-4.5 object-contain" />
                </div>
                <div className="bg-white p-2 rounded-xl border border-clay hover:border-brand/50 hover:shadow-sm transition-all duration-300 flex items-center justify-center h-10" title="Cash on Delivery">
                  <CODLogo className="h-4.5 object-contain" />
                </div>
                <div className="bg-white p-2 rounded-xl border border-clay hover:border-brand/50 hover:shadow-sm transition-all duration-300 flex items-center justify-center h-10" title="PayPal">
                  <PayPalLogo className="h-4.5 object-contain" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-brand" />
                <span>Express Courier Insured Shipping</span>
              </div>
            </div>

          </div>



          {/* Copyright Signature */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-neutral-400 border-t border-clay/40 pt-5">
            <p className="text-center sm:text-left">&copy; 2026 Mahi Creations Luxury Boutique. All Rights Reserved. Sourced directly from original global production lines.</p>
            
            {/* Quick navigation links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 font-semibold uppercase tracking-wider text-[9px] h-full">
              <span className="flex items-center text-neutral-400 font-medium normal-case text-[10px]">
                <span>Designed & Developed by</span>
                <a 
                  href="https://www.facebook.com/udayarajkhanal369" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-brand hover:underline font-extrabold text-[10px] transition inline-block ml-1"
                >
                  Udaya Raj Khanal
                </a>
              </span>
              <span className="text-clay">•</span>
              <button onClick={() => setActiveView('shop')} className="text-neutral-500 hover:text-brand transition cursor-pointer font-semibold uppercase tracking-wider text-[9px]">Shop</button>
              <span className="text-clay">•</span>
              <button 
                onClick={() => {
                  if (userSession) {
                    setActiveView('portal');
                  } else {
                    setAuthModalOpen(true);
                  }
                }} 
                className="text-neutral-500 hover:text-brand transition cursor-pointer font-semibold uppercase tracking-wider text-[9px]"
              >
                VIP Lounge
              </button>
              <span className="text-clay">•</span>
              <button onClick={() => { setActiveView('tracker'); setInitialTrackId(''); }} className="text-neutral-500 hover:text-brand transition cursor-pointer font-semibold uppercase tracking-wider text-[9px]">Track</button>
              
              {isAdminLoggedIn && (
                <>
                  <span className="text-clay">•</span>
                  <button onClick={() => setActiveView('admin')} className="hover:text-brand transition cursor-pointer text-brand font-bold">Admin Panel</button>
                </>
              )}
            </div>
          </div>
  
        </div>
      </footer>
      )}

    </div>
  );
}
