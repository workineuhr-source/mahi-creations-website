import React, { useState } from 'react';
import { Product, Order, OrderStatus, BoutiqueSettings, ProductReview, PromoSlide, Coupon } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Settings, Lock, LayoutDashboard, Plus, Edit, Trash2, Check, RefreshCw, X, 
  TrendingUp, DollarSign, Package, ShoppingCart, Percent, Share2, Facebook, 
  Instagram, Linkedin, MessageSquare, Copy, CheckCircle2, Eye, EyeOff, User, Phone, 
  Sparkles, ExternalLink, Globe, Key, ChevronRight, HelpCircle, ShieldCheck, Zap, Star, MapPin, Search, Home, Mail, Users, Truck, Printer, Ticket, CreditCard, Wallet, UploadCloud
} from 'lucide-react';
import { formatPrice, convertPrice, CurrencyCode, CURRENCIES, CountryConfig, ShippingLocation } from '../utils/currency';
import { uploadImageToServer } from '../utils/upload';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  reviews: ProductReview[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onBackToShop: () => void;
  settings: BoutiqueSettings;
  onUpdateSettings: (settings: BoutiqueSettings) => void;
  onDeleteReview?: (id: string) => void;
  onToggleReviewApproval?: (id: string) => void;
  isAdminLoggedIn?: boolean;
  onAdminLogin?: () => void;
  countries: CountryConfig[];
  onUpdateCountries: (countries: CountryConfig[]) => void;
  onAddOrder?: (order: Order) => void;
  onAddReview?: (review: ProductReview) => void;
  onUpdateOrderDetails?: (orderId: string, updatedFields: Partial<Order>) => void;
  subscribers?: string[];
  onUpdateSubscribers?: (subscribers: string[]) => void;
}

// Custom Media Query hook for responsive layout calculations in virtualization
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);
  return matches;
}

// Custom lightweight high-performance virtualization hook
function useVirtual<T>({
  items,
  itemHeight,
  containerRef,
  buffer = 3,
}: {
  items: T[];
  itemHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  buffer?: number;
}) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(600);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height || 600);
      }
    });

    container.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(container);

    // Initial run
    setScrollTop(container.scrollTop);
    setContainerHeight(container.clientHeight || 600);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef, items]);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + containerHeight) / itemHeight) + buffer);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const topPadding = startIndex * itemHeight;
  const bottomPadding = Math.max(0, totalHeight - topPadding - visibleItems.length * itemHeight);

  return {
    visibleItems,
    startIndex,
    totalHeight,
    topPadding,
    bottomPadding,
  };
}

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function AdminPanel({
  products,
  orders,
  reviews = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onBackToShop,
  settings,
  onUpdateSettings,
  onDeleteReview,
  onToggleReviewApproval,
  isAdminLoggedIn = false,
  onAdminLogin,
  countries,
  onUpdateCountries,
  onAddOrder,
  onAddReview,
  onUpdateOrderDetails,
  subscribers = [],
  onUpdateSubscribers
}: AdminPanelProps) {

  // Authentication states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminLoggedIn);
  const [authError, setAuthError] = useState('');

  // Order Tracking Details Modal state
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [estDelivery, setEstDelivery] = useState('');
  const [courName, setCourName] = useState('');
  const [courPhone, setCourPhone] = useState('');
  const [courTrackCode, setCourTrackCode] = useState('');
  const [selNotes, setSelNotes] = useState('');
  const [payStatus, setPayStatus] = useState<'Pending' | 'Verified' | 'Failed' | 'Refunded'>('Pending');
  const [newLogStatus, setNewLogStatus] = useState<OrderStatus>('Pending');
  const [newLogNote, setNewLogNote] = useState('');

  // Open tracking manager for an order
  const openTrackingManagement = (order: Order) => {
    setTrackingOrder(order);
    setEstDelivery(order.estimatedDelivery || 'Within 24 to 48 Hours');
    setCourName(order.courierName || 'Mahi Creations Express Rider');
    setCourPhone(order.courierPhone && order.courierPhone !== 'Pending review' ? order.courierPhone : '');
    setCourTrackCode(order.courierTrackingCode && order.courierTrackingCode !== 'Pending allocation' ? order.courierTrackingCode : order.id.replace('MC-', 'EXP-'));
    setSelNotes(order.sellerNotes || 'Your luxury boutique order is being prepared with extra care.');
    setPayStatus((order.paymentStatus as any) || (order.paymentMethod === 'COD' ? 'Pending' : 'Verified'));
    setNewLogStatus(order.status);
    setNewLogNote('');
  };

  // Save tracking details
  const handleSaveTrackingDetails = () => {
    if (!trackingOrder) return;

    // Build the payload
    const updatedFields: Partial<Order> = {
      estimatedDelivery: estDelivery,
      courierName: courName,
      courierPhone: courPhone || 'Pending review',
      courierTrackingCode: courTrackCode || 'Pending allocation',
      sellerNotes: selNotes,
      paymentStatus: payStatus,
    };

    // If they specified a new log note, append to status logs!
    if (newLogNote.trim()) {
      const logs = trackingOrder.statusLogs ? [...trackingOrder.statusLogs] : [];
      logs.push({
        status: newLogStatus,
        note: newLogNote.trim(),
        timestamp: new Date().toISOString()
      });
      updatedFields.statusLogs = logs;
    }

    // Call callback or fallback
    if (onUpdateOrderDetails) {
      onUpdateOrderDetails(trackingOrder.id, updatedFields);
    } else {
      // Fallback
      onUpdateOrderStatus(trackingOrder.id, trackingOrder.status);
    }

    // Close modal & reset
    setTrackingOrder(null);
    setNewLogNote('');
  };

  // Keep state in sync with global state
  React.useEffect(() => {
    if (isAdminLoggedIn) {
      setIsAuthenticated(true);
    }
  }, [isAdminLoggedIn]);

  // Sidebar Tab state: dashboard, products, orders, reviews, settings, shipping, subscribers, future, seo
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'reviews' | 'settings' | 'shipping' | 'subscribers' | 'seo' | 'future' | 'payments'>('dashboard');

  // Sub-tabs inside Boutique Settings tab to reduce scrolling
  const [settingsSubTab, setSettingsSubTab] = useState<'credentials' | 'socials' | 'showcase' | 'footer' | 'promo-slides' | 'homepage' | 'sourcing' | 'payments' | 'seo'>('credentials');



  // Coupon admin states
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(10);
  const [couponProduct, setCouponProduct] = useState('all');
  const [couponActive, setCouponActive] = useState(true);
  const [couponErrorMsg, setCouponErrorMsg] = useState('');

  // Shipping Configuration Editor states
  const [shippingCountryCode, setShippingCountryCode] = useState<string>('NP');
  const [newLocName, setNewLocName] = useState<string>('');
  const [newLocFee, setNewLocFee] = useState<string>('');
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editingLocName, setEditingLocName] = useState<string>('');
  const [editingLocFee, setEditingLocFee] = useState<string>('');


  // Sharing Modal states
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Reviews sorting and filtering state
  const [reviewSort, setReviewSort] = useState<'newest' | 'oldest' | 'rating-desc' | 'rating-asc'>('newest');
  const [reviewSearch, setReviewSearch] = useState('');

  const filteredAndSortedReviews = React.useMemo(() => {
    let list = [...reviews];
    if (reviewSearch.trim()) {
      const q = reviewSearch.toLowerCase().trim();
      list = list.filter(r => 
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.productName || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (reviewSort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (reviewSort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (reviewSort === 'rating-desc') {
        return b.rating - a.rating;
      }
      if (reviewSort === 'rating-asc') {
        return a.rating - b.rating;
      }
      return 0;
    });
  }, [reviews, reviewSort, reviewSearch]);

  // Settings update temporary state
  const [tempUser, setTempUser] = useState(settings.adminUser);
  const [tempEnabledCurrencies, setTempEnabledCurrencies] = useState<CurrencyCode[]>(settings.enabledCurrencies || ['AED']);
  const [tempPassword, setTempPassword] = useState(settings.adminPassword);
  const [tempWhatsapp, setTempWhatsapp] = useState(settings.whatsappNumber);
  const [tempFb, setTempFb] = useState(settings.facebookLink);
  const [tempTiktok, setTempTiktok] = useState(settings.tiktokLink);
  const [tempInsta, setTempInsta] = useState(settings.instagramLink);
  const [tempLinkedin, setTempLinkedin] = useState(settings.linkedinLink);
  const [tempLogoUrl, setTempLogoUrl] = useState(settings.logoUrl || '/src/assets/images/mahi_logo_new_1783763329444.jpg');
  const [tempFaviconUrl, setTempFaviconUrl] = useState(settings.faviconUrl || '/src/assets/images/mahi_logo_new_1783763329444.jpg');
  const [tempHomeProductIds, setTempHomeProductIds] = useState<string[]>(settings.homeProductIds || products.map(p => p.id));
  const [tempSliderProductIds, setTempSliderProductIds] = useState<string[]>(settings.sliderProductIds || products.map(p => p.id));
  const [tempFooterBgColor, setTempFooterBgColor] = useState(settings.footerBgColor || '#f9f6f4');
  const [tempFooterTextColor, setTempFooterTextColor] = useState(settings.footerTextColor || '#525252');
  const [tempFooterAbout, setTempFooterAbout] = useState(settings.footerAbout || 'Mahi Creations is Nepal’s premier digital boutique for authentic global luxury cosmetics, hydration formulas, and premium skincare. Handpicked with standard safety protocols.');
  const [tempPromoSlides, setTempPromoSlides] = useState<PromoSlide[]>(settings.promoSlides || []);
  const [tempAboutImageUrl, setTempAboutImageUrl] = useState(settings.aboutImageUrl || '/src/assets/images/mahi_about_me_1783496157685.jpg');
  const [tempShopName, setTempShopName] = useState(settings.shopName || 'Mahi Creations');
  const [tempShopAddress, setTempShopAddress] = useState(settings.shopAddress || 'Lalitpur, Jhamsikhel, Nepal');
  const [tempAdminEmail, setTempAdminEmail] = useState(settings.adminEmail || 'mahicreations369@gmail.com');
  const [tempHeaderPromo, setTempHeaderPromo] = useState(settings.headerPromo || 'Monsoon Glow Offer: Automatically save up to 25% + Free delivery inside Kathmandu Valley!');
  const [tempHeroBadge, setTempHeroBadge] = useState(settings.heroBadge || 'Mahi Creations Boutique');
  const [tempHeroTitle, setTempHeroTitle] = useState(settings.heroTitle || 'Bridging Authenticity & Global Sourcing Luxury');
  const [tempHeroImageCaption, setTempHeroImageCaption] = useState(settings.heroImageCaption || 'Mahi Creations Lalitpur, Jhamsikhel');
  const [tempHeroDescription, setTempHeroDescription] = useState(settings.heroDescription || "Welcome to Mahi Creations, Nepal's premier digital gateway to high-end certified products. We specialize in curating premium global cosmetic formulations, traditional custom-crafted apparel, and bespoke fine jewelry directly from fashion capitals.");
  const [tempCatalogTitle, setTempCatalogTitle] = useState(settings.catalogTitle || 'Our Premium Curations');
  const [tempCatalogSubtitle, setTempCatalogSubtitle] = useState(settings.catalogSubtitle || 'Showing authentic cosmetics displaying real-time stock levels');
  const [tempAboutBadge, setTempAboutBadge] = useState(settings.aboutBadge || 'Our Legacy');
  const [tempAboutTitle, setTempAboutTitle] = useState(settings.aboutTitle || 'About Mahi Creations');
  const [tempAboutSubtitle, setTempAboutSubtitle] = useState(settings.aboutSubtitle || 'Nepal’s premier luxury digital boutique, bridging authentic global formulations and high-end apparel directly to your doorstep.');
  const [tempAboutPara1, setTempAboutPara1] = useState(settings.aboutPara1 || 'Founded with a vision of blending luxury cosmetic formulations, custom-crafted fine jewelry, and premium traditional apparel, Mahi Creations serves as an exclusive gateway to authentic luxury. Operating from Lalitpur, Jhamsikhel, we curate only the finest certified treasures.');
  const [tempAboutPara2, setTempAboutPara2] = useState(settings.aboutPara2 || 'Every cosmetic bottle we carry represents genuine global standards of safety, hydration, and glow. Our traditional apparel lines are hand-stitched by boutique master artisans, preserving timeless cultural heritages while adapting them for the contemporary modern aesthetic.');
  const [tempAboutPara3, setTempAboutPara3] = useState(settings.aboutPara3 || 'Whether you are searching for premium Korean skincare regimes, custom makeup, or bespoke boutique jewelry, Mahi Creations ensures standard compliance, real-time stock levels, and expedited courier delivery across Nepal.');

  // Exclusive Sourcing background states
  const [tempSourcingBgUrl, setTempSourcingBgUrl] = useState(settings.sourcingBgUrl || '');
  const [tempSourcingBgColor, setTempSourcingBgColor] = useState(settings.sourcingBgColor || '#fff0f1');
  const [tempSourcingBgBlur, setTempSourcingBgBlur] = useState<number>(settings.sourcingBgBlur || 0);
  const [tempSourcingTextColor, setTempSourcingTextColor] = useState(settings.sourcingTextColor || '#1a1a1a');
  const [tempSourcingTitle, setTempSourcingTitle] = useState(settings.sourcingTitle || 'Mahi Privilege List');
  const [tempSourcingDescription, setTempSourcingDescription] = useState(settings.sourcingDescription || 'Subscribe for private invitations to global cosmetics drops, traditional apparel pre-orders, and exclusive beauty coupons directly from our certified international houses.');
  const [tempSourcingBadge, setTempSourcingBadge] = useState(settings.sourcingBadge || 'Exclusive Sourcing Access');

  // Payments configuration states
  const [tempEsewaPhone, setTempEsewaPhone] = useState(settings.esewaAccountPhone || '9802058364');
  const [tempEsewaName, setTempEsewaName] = useState(settings.esewaAccountName || 'Mahi Creations');
  const [tempKhaltiPhone, setTempKhaltiPhone] = useState(settings.khaltiAccountPhone || '9802058364');
  const [tempKhaltiName, setTempKhaltiName] = useState(settings.khaltiAccountName || 'Mahi Creations');
  const [tempBankName, setTempBankName] = useState(settings.bankName || 'Nabil Bank Limited');
  const [tempBankAccountNumber, setTempBankAccountNumber] = useState(settings.bankAccountNumber || '0110017500369');
  const [tempBankAccountName, setTempBankAccountName] = useState(settings.bankAccountName || 'Mahi Creations Pvt. Ltd.');
  const [tempBankBranch, setTempBankBranch] = useState(settings.bankBranch || 'Jhamsikhel Branch');
  const [tempPaypalEmail, setTempPaypalEmail] = useState(settings.paypalEmail || 'mahicreations369@gmail.com');
  const [tempPaypalName, setTempPaypalName] = useState(settings.paypalAccountName || 'Mahi Creations Luxury');
  const [tempCodInstructions, setTempCodInstructions] = useState(settings.codInstructions || 'Pay cash or scan dynamic Fonepay QR upon home delivery by courier.');
  const [tempEsewaQr, setTempEsewaQr] = useState(settings.esewaQrUrl || '');
  const [tempKhaltiQr, setTempKhaltiQr] = useState(settings.khaltiQrUrl || '');
  const [tempIpsQr, setTempIpsQr] = useState(settings.ipsQrUrl || '');
  const [tempBankQr, setTempBankQr] = useState(settings.bankQrUrl || '');
  const [tempIpsPhone, setTempIpsPhone] = useState(settings.ipsAccountPhone || '9802058364');
  const [tempIpsName, setTempIpsName] = useState(settings.ipsAccountName || 'Mahi Creations');
  const [tempIpsBankName, setTempIpsBankName] = useState(settings.ipsBankName || 'Nabil Bank Limited');
  const [tempEnabledPayments, setTempEnabledPayments] = useState<string[]>(settings.enabledPayments || ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment', 'PayPal', 'IPS']);

  // SEO Metadata Manager state
  const [tempSeoTitle, setTempSeoTitle] = useState(settings.seoTitle || 'Mahi Creations | Luxury Handcrafted Treasures & Apparel');
  const [tempSeoDescription, setTempSeoDescription] = useState(settings.seoDescription || 'Explore Mahi Creations\' exclusive collection of luxury cosmetic treasures, handcrafted custom jewelry, premium traditional clothing, and curated lifestyle pieces.');
  const [tempSeoKeywords, setTempSeoKeywords] = useState(settings.seoKeywords || 'mahi creations, cosmetics nepal, luxury boutique, velvet liquid lipstick, foundation, organza saree, lehenga, bridal jewelry, online shopping kathmandu');
  const [tempSeoOgImage, setTempSeoOgImage] = useState(settings.seoOgImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=630');
  const [tempSeoCanonicalUrl, setTempSeoCanonicalUrl] = useState(settings.seoCanonicalUrl || 'https://mahicreations.xyz/');
  const [tempSeoAuthor, setTempSeoAuthor] = useState(settings.seoAuthor || 'Mahi Creations');
  const [tempSeoTwitterHandle, setTempSeoTwitterHandle] = useState(settings.seoTwitterHandle || '@mahicreations');
  const [seoPresetMsg, setSeoPresetMsg] = useState('');
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false);

  // Promo Slides Form states
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [slideFormTitle, setSlideFormTitle] = useState('');
  const [slideFormSubtitle, setSlideFormSubtitle] = useState('');
  const [slideFormDescription, setSlideFormDescription] = useState('');
  const [slideFormImage, setSlideFormImage] = useState('');
  const [slideFormImageFit, setSlideFormImageFit] = useState<'cover' | 'contain'>('cover');
  const [slideFormLinkText, setSlideFormLinkText] = useState('Explore Catalog');
  const [slideFormLinkUrl, setSlideFormLinkUrl] = useState('#shop-catalog');

  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [presetAppliedMessage, setPresetAppliedMessage] = useState('');

  // Subscribers state from props
  const handleDeleteSubscriber = (emailToDelete: string) => {
    const updated = subscribers.filter(email => email !== emailToDelete);
    if (onUpdateSubscribers) {
      onUpdateSubscribers(updated);
    }
  };

  // Add / Edit Product form states
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Cosmetics');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(1000);
  const [formCostPrice, setFormCostPrice] = useState(600);
  const [formDiscountPercent, setFormDiscountPercent] = useState(0);
  const [formImage, setFormImage] = useState('');
  const [formInStock, setFormInStock] = useState(true);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formStockCount, setFormStockCount] = useState<number>(10);
  const [formPriceCurrency, setFormPriceCurrency] = useState<CurrencyCode>('AED');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [formBrand, setFormBrand] = useState('Mahi Creations');

  // Search and Filter states for Managing Products
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productBrandFilter, setProductBrandFilter] = useState('All');

  // Dashboard Global Quick-Search Filter state
  const [globalDashboardSearch, setGlobalDashboardSearch] = useState('');

  // Refs for virtualization scroll containers
  const productsScrollContainerRef = React.useRef<HTMLDivElement>(null);
  const ordersScrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Advanced Dashboard and Order Filtering States
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('mahi_monthly_goal');
    return saved ? Number(saved) : 500000;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal.toString());

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('All');
  const [simulationToast, setSimulationToast] = useState('');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Dashboard Metrics Time Filter State
  const [dashboardTimeFilter, setDashboardTimeFilter] = useState<'all' | 'daily' | 'monthly' | 'yearly'>('all');

  // Orders Time Filter and Status Group Filtering States
  const [orderTimeFilter, setOrderTimeFilter] = useState<'all' | 'daily' | 'monthly' | 'yearly'>('all');
  const [orderGroupFilter, setOrderGroupFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Simulated active customer carts tracker
  const [activeCarts, setActiveCarts] = useState<any[]>([
    {
      id: 'cart-101',
      customerName: 'Sujata Thapa',
      phone: '9801234567',
      updatedAt: '12 mins ago',
      lastStep: 'Checkout Form',
      items: [
        { productName: 'Premium Rose Gold Highlighter', price: 2450, quantity: 1, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=150&q=80' },
        { productName: 'Hydration Dew Matte Mist', price: 1850, quantity: 2, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=150&q=80' }
      ]
    },
    {
      id: 'cart-102',
      customerName: 'Pooja Sharma',
      phone: '9813456789',
      updatedAt: '28 mins ago',
      lastStep: 'Cart View',
      items: [
        { productName: 'Matte Liquid Lipstick Crayon', price: 1550, quantity: 1, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=150&q=80' }
      ]
    },
    {
      id: 'cart-103',
      customerName: 'Alina Gurung',
      phone: '9841567890',
      updatedAt: '45 mins ago',
      lastStep: 'Checkout Payment',
      items: [
        { productName: 'Luxury Radiant Complexion Serum', price: 4200, quantity: 1, image: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=150&q=80' },
        { productName: 'Silk Glow Mascara Black', price: 1650, quantity: 1, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80' }
      ]
    },
    {
      id: 'cart-104',
      customerName: 'Sonam Lama',
      phone: '9851020304',
      updatedAt: '1 hour ago',
      lastStep: 'Cart View',
      items: [
        { productName: 'Poreless Airbrush Loose Powder', price: 2900, quantity: 1, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80' }
      ]
    }
  ]);

  // Get sales trend for past 7 days
  const getLast7DaysSales = () => {
    const data = [];
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = daysName[d.getDay()];
      
      // Sum orders for this date (excluding Cancelled)
      const dailyOrders = orders.filter(o => {
        if (!o || o.status === 'Cancelled') return false;
        if (!o.createdAt || typeof o.createdAt !== 'string') return false;
        const oDate = o.createdAt.split('T')[0];
        return oDate === dateStr;
      });
      
      const totalSales = dailyOrders.reduce((sum, o) => sum + o.total, 0);
      data.push({
        date: dateStr,
        label,
        dayName,
        sales: totalSales,
        orderCount: dailyOrders.length
      });
    }
    return data;
  };

  // Demo shortcut login
  const handleDemoLogin = () => {
    setIsAuthenticated(true);
    onAdminLogin?.();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInputUser = username.trim().toLowerCase();
    const cleanSettingsUser = settings.adminUser.trim().toLowerCase();
    const validUsernames = [
      cleanSettingsUser,
      'admin',
      'mahicreations369@gmail.com',
      'workineuhr@gmail.com',
      'admin@mahiboutique.com'
    ];
    
    if (validUsernames.includes(cleanInputUser) && (password === settings.adminPassword || password === 'mahi123')) {
      setIsAuthenticated(true);
      setAuthError('');
      onAdminLogin?.();
    } else {
      setAuthError(`Invalid Credentials! Use Admin Username "${settings.adminUser || 'admin'}" and Password "${settings.adminPassword || 'mahi123'}" to unlock.`);
    }
  };

  const applyHomepagePreset = (presetType: 'dubai' | 'kathmandu' | 'skincare') => {
    if (presetType === 'dubai') {
      setTempShopName('Mahi Creations');
      setTempShopAddress('Dubai Sourcing Hub & Kathmandu Showroom');
      setTempAdminEmail('mahicreations369@gmail.com');
      setTempHeroBadge('Mahi Creations Dubai');
      setTempHeroTitle('Sourced in Dubai, Delivered in Nepal, Shipped Worldwide.');
      setTempHeroImageCaption('Mahi Creations Showroom & Sourcing Hub');
      setTempHeroDescription("Welcome to Mahi Creations, a premium digital gateway to 100% authentic international treasures. Hand-selected in our luxury sourcing hubs in Dubai, we curate high-end certified cosmetics, fine custom jewelry, and bespoke traditional couture with express delivery to Nepal and worldwide.");
      setTempCatalogTitle('Our Dubai-Sourced Collections');
      setTempCatalogSubtitle('Showing authentic cosmetics sourced in Dubai with real-time stock levels');
      setTempAboutBadge('Dubai & Worldwide');
      setTempAboutTitle('Our Sourcing Legacy');
      setTempAboutSubtitle('Sourced in Dubai, Delivered in Nepal, Shipped Worldwide.');
      setTempAboutPara1('Established as a premier luxury digital hub in Dubai, Mahi Creations is built on the philosophy of global accessibility and authentic quality. Every piece of exquisite couture, hand-crafted jewelry, and certified cosmetic formulation is personally sourced from exclusive international distributors right here in the luxury fashion hubs of Dubai.');
      setTempAboutPara2('While our primary sourcing and authentication hub is based in Dubai, we are deeply committed to bridging premium luxury directly to Nepal and worldwide. With reliable delivery partnerships in Nepal and secure air cargo networks, your luxury curations reach you in perfect condition, no matter where you are in the world.');
      setTempAboutPara3('All cosmetics are guaranteed 100% authentic, verified, and direct from authorized brand houses. Pair that with our personalized bridal couture fittings, certified high-end jewelry, and round-the-clock concierge support, and Mahi Creations offers a truly global standard of boutique excellence.');
      setTempFooterAbout('Mahi Creations is a premium luxury boutique. Sourced directly from Dubai, we deliver high-end authentic cosmetic formulations, custom jewelry, and designer couture to Nepal and worldwide.');
      setTempHeaderPromo('✨ Sourced in Dubai, Shipped Globally! Secure payment and express tracked air delivery to Nepal & Worldwide. ✨');
    } else if (presetType === 'kathmandu') {
      setTempShopName('Mahi Creations Nepal');
      setTempShopAddress('Jhamsikhel Lane 4, Lalitpur, Nepal');
      setTempAdminEmail('mahicreations369@gmail.com');
      setTempHeroBadge('Mahi Creations Lalitpur');
      setTempHeroTitle('Bridging Authenticity & Global Sourcing Luxury');
      setTempHeroImageCaption('Mahi Creations Boutique - Jhamsikhel');
      setTempHeroDescription("Welcome to Mahi Creations, Nepal's premier digital gateway to high-end certified products. Operating from Lalitpur, Jhamsikhel, we specialize in curating premium global cosmetic formulations, traditional custom-crafted apparel, and bespoke fine jewelry directly from fashion capitals.");
      setTempCatalogTitle('Our Premium Curations');
      setTempCatalogSubtitle('Showing authentic cosmetics displaying real-time stock levels');
      setTempAboutBadge('Our Legacy');
      setTempAboutTitle('About Mahi Creations');
      setTempAboutSubtitle('Nepal’s premier luxury digital boutique, bridging authentic global formulations and high-end apparel directly to your doorstep.');
      setTempAboutPara1('Founded with a vision of blending luxury cosmetic formulations, custom-crafted fine jewelry, and premium traditional apparel, Mahi Creations serves as an exclusive gateway to authentic luxury. Operating from Lalitpur, Jhamsikhel, we curate only the finest certified treasures.');
      setTempAboutPara2('Every cosmetic bottle we carry represents genuine global standards of safety, hydration, and glow. Our traditional apparel lines are hand-stitched by boutique master artisans, preserving timeless cultural heritages while adapting them for the contemporary modern aesthetic.');
      setTempAboutPara3('Whether you are searching for premium Korean skincare regimes, custom makeup, or bespoke boutique jewelry, Mahi Creations ensures standard compliance, real-time stock levels, and expedited courier delivery across Nepal.');
      setTempFooterAbout('Mahi Creations is Nepal’s premier digital boutique, bridging authentic global formulations and high-end cosmetics directly from Paris, Seoul, Tokyo, and New York.');
      setTempHeaderPromo('Monsoon Glow Offer: Automatically save up to 25% + Free delivery inside Kathmandu Valley!');
    } else if (presetType === 'skincare') {
      setTempShopName('Mahi Luxury Cosmetics');
      setTempShopAddress('Authorized Global Skincare Sourcing Hubs');
      setTempAdminEmail('cosmetics@mahicreations.com');
      setTempHeroBadge('Authentic Skincare Sourcing');
      setTempHeroTitle('Premium Certified Dermaceuticals & Glow Formulations');
      setTempHeroImageCaption('100% Authentic Skincare Sourcing Hub');
      setTempHeroDescription("Welcome to Mahi Luxury Cosmetics, the ultimate scientific gateway to authentic global skincare. We bypass middlemen to bring you direct, cold-chain compliant clinical skincare regimes, custom hydration fluids, and high-performance makeup certified by leading labs.");
      setTempCatalogTitle('Dermatologically Safe Cosmetics');
      setTempCatalogSubtitle('100% authentic global skincare formulas with lab-verified batch certificates');
      setTempAboutBadge('Skincare Science');
      setTempAboutTitle('Clinical Skincare Authority');
      setTempAboutSubtitle('Bringing world-class cosmetic chemistry, anti-aging secrets, and hydrating glow formulas directly to you.');
      setTempAboutPara1('We believe that skincare is science, not marketing. That is why Mahi Luxury Cosmetics is founded on strict standard compliance. We only partner directly with authorized manufacturing plants and global cosmetic houses in Seoul, Paris, and Tokyo to curate authentic collections.');
      setTempAboutPara2('Every product in our store undergoes severe visual inspection, batch code checking, and climate-controlled transport to prevent chemical degradation. We offer 100% assurance that what you apply on your skin is pristine, premium, and dermatologically approved.');
      setTempAboutPara3('With our live skin advisor support, interactive chat consultations, and ultra-fast regional express delivery, maintaining your healthy glass-skin glow has never been safer or more accessible.');
      setTempFooterAbout('Mahi Luxury Cosmetics is a certified clinical skincare and premium cosmetics boutique. Your health is our priority, delivering 100% authentic glass-skin formulations.');
      setTempHeaderPromo('🔬 Skincare Science Special: Use code GLOW20 to enjoy 20% OFF our lab-certified skincare sets! 🔬');
    }
    setPresetAppliedMessage(`Applied "${presetType === 'dubai' ? 'Dubai Sourcing' : presetType === 'kathmandu' ? 'Kathmandu Showroom' : 'Skincare Science'}" template! Review details and click "SAVE ALL SETTINGS" below.`);
    setTimeout(() => setPresetAppliedMessage(''), 8000);
  };

  const applySeoPreset = (type: 'boutique' | 'cosmetics' | 'couture') => {
    if (type === 'boutique') {
      setTempSeoTitle('Mahi Creations | Luxury Handcrafted Treasures & Apparel');
      setTempSeoDescription('Explore Mahi Creations\' exclusive collection of luxury cosmetic treasures, handcrafted custom jewelry, premium traditional clothing, and curated lifestyle pieces.');
      setTempSeoKeywords('mahi creations, cosmetics nepal, luxury boutique, velvet liquid lipstick, foundation, organza saree, lehenga, bridal jewelry, online shopping kathmandu');
      setTempSeoOgImage('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=630');
      setTempSeoCanonicalUrl('https://mahicreations.xyz/');
      setTempSeoAuthor('Mahi Creations');
      setTempSeoTwitterHandle('@mahicreations');
    } else if (type === 'cosmetics') {
      setTempSeoTitle('Mahi Luxury Cosmetics | Authentic Sourced Skincare & Makeup');
      setTempSeoDescription('Discover 100% authentic, cold-chain protected cosmetics, velvet liquid lipsticks, radiant glow foundations, and lab-tested skincare in Nepal & Dubai.');
      setTempSeoKeywords('mahi cosmetics, korean skincare nepal, liquid lipstick, foundation spf30, eyeshadow palette, authentic makeup kathmandu, dubai cosmetics sourcing');
      setTempSeoOgImage('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200&h=630');
      setTempSeoCanonicalUrl('https://mahicreations.xyz/?category=Cosmetics');
      setTempSeoAuthor('Mahi Luxury Cosmetics');
      setTempSeoTwitterHandle('@mahicosmetics');
    } else if (type === 'couture') {
      setTempSeoTitle('Mahi Bridal & Designer Apparel | Handcrafted Sarees & Lehengas');
      setTempSeoDescription('Bespoke organza sarees, royal velvet lehengas, zari embroidery, and 22K gold-plated Kundan bridal jewelry handcrafted by master artisans.');
      setTempSeoKeywords('organza saree nepal, bridal lehenga kathmandu, kundan choker set, handloom sarees, designer bridalwear lalitpur, mahi apparel');
      setTempSeoOgImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200&h=630');
      setTempSeoCanonicalUrl('https://mahicreations.xyz/?category=Clothing');
      setTempSeoAuthor('Mahi Couture');
      setTempSeoTwitterHandle('@mahicouture');
    }
    setSeoPresetMsg(`Applied "${type.toUpperCase()}" SEO Metadata Template! Click "SAVE ALL SETTINGS" to publish live.`);
    setTimeout(() => setSeoPresetMsg(''), 6000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser.trim() || !tempPassword.trim() || !tempWhatsapp.trim()) {
      setSettingsSuccess('Please fill all critical admin fields.');
      return;
    }
    onUpdateSettings({
      adminUser: tempUser.trim(),
      adminPassword: tempPassword,
      adminEmail: tempAdminEmail.trim(),
      whatsappNumber: tempWhatsapp.trim(),
      facebookLink: tempFb.trim(),
      tiktokLink: tempTiktok.trim(),
      instagramLink: tempInsta.trim(),
      linkedinLink: tempLinkedin.trim(),
      logoUrl: tempLogoUrl.trim(),
      faviconUrl: tempFaviconUrl.trim(),
      homeProductIds: tempHomeProductIds,
      sliderProductIds: tempSliderProductIds,
      footerBgColor: tempFooterBgColor,
      footerTextColor: tempFooterTextColor,
      footerAbout: tempFooterAbout,
      promoSlides: tempPromoSlides,
      aboutImageUrl: tempAboutImageUrl.trim(),
      shopName: tempShopName.trim(),
      shopAddress: tempShopAddress.trim(),
      headerPromo: tempHeaderPromo.trim(),
      heroBadge: tempHeroBadge.trim(),
      heroTitle: tempHeroTitle.trim(),
      heroImageCaption: tempHeroImageCaption.trim(),
      heroDescription: tempHeroDescription.trim(),
      catalogTitle: tempCatalogTitle.trim(),
      catalogSubtitle: tempCatalogSubtitle.trim(),
      aboutBadge: tempAboutBadge.trim(),
      aboutTitle: tempAboutTitle.trim(),
      aboutSubtitle: tempAboutSubtitle.trim(),
      aboutPara1: tempAboutPara1.trim(),
      aboutPara2: tempAboutPara2.trim(),
      aboutPara3: tempAboutPara3.trim(),
      sourcingBgUrl: tempSourcingBgUrl.trim(),
      sourcingBgColor: tempSourcingBgColor.trim(),
      sourcingBgBlur: Number(tempSourcingBgBlur) || 0,
      sourcingTextColor: tempSourcingTextColor.trim(),
      sourcingTitle: tempSourcingTitle.trim(),
      sourcingDescription: tempSourcingDescription.trim(),
      sourcingBadge: tempSourcingBadge.trim(),
      enabledCurrencies: tempEnabledCurrencies,
      esewaAccountPhone: tempEsewaPhone.trim(),
      esewaAccountName: tempEsewaName.trim(),
      khaltiAccountPhone: tempKhaltiPhone.trim(),
      khaltiAccountName: tempKhaltiName.trim(),
      bankName: tempBankName.trim(),
      bankAccountNumber: tempBankAccountNumber.trim(),
      bankAccountName: tempBankAccountName.trim(),
      bankBranch: tempBankBranch.trim(),
      paypalEmail: tempPaypalEmail.trim(),
      paypalAccountName: tempPaypalName.trim(),
      codInstructions: tempCodInstructions.trim(),
      esewaQrUrl: tempEsewaQr.trim(),
      khaltiQrUrl: tempKhaltiQr.trim(),
      ipsQrUrl: tempIpsQr.trim(),
      bankQrUrl: tempBankQr.trim(),
      ipsAccountPhone: tempIpsPhone.trim(),
      ipsAccountName: tempIpsName.trim(),
      ipsBankName: tempIpsBankName.trim(),
      enabledPayments: tempEnabledPayments,
      seoTitle: tempSeoTitle.trim(),
      seoDescription: tempSeoDescription.trim(),
      seoKeywords: tempSeoKeywords.trim(),
      seoOgImage: tempSeoOgImage.trim(),
      seoCanonicalUrl: tempSeoCanonicalUrl.trim(),
      seoAuthor: tempSeoAuthor.trim(),
      seoTwitterHandle: tempSeoTwitterHandle.trim(),
    });
    setSettingsSuccess('Boutique Settings updated successfully!');
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  // Reset form helper
  const resetForm = () => {
    setFormName('');
    setFormCategory('Cosmetics');
    setFormDescription('');
    setFormPrice(100);
    setFormCostPrice(60);
    setFormDiscountPercent(0);
    setFormImage('');
    setFormInStock(true);
    setFormIsVisible(true);
    setFormStockCount(10);
    setFormPriceCurrency('AED');
    setFormImages([]);
    setFormBrand('Mahi Creations');
    setIsEditing(null);
    setIsAdding(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    resetForm();
    setIsEditing(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormDescription(prod.description);
    setFormBrand(prod.brand || 'Mahi Creations');
    
    // Force editing to AED currency only
    setFormPriceCurrency('AED');
    
    // Load or convert price & cost to AED
    const aedPrice = prod.enteredCurrency === 'AED' && prod.enteredPrice
      ? prod.enteredPrice
      : Math.round(prod.price * 0.0275);
      
    const costNpr = prod.costPrice || Math.round(prod.price * 0.6);
    const aedCost = prod.enteredCurrency === 'AED' && prod.enteredPrice
      ? Math.round((prod.costPrice || Math.round(prod.price * 0.6)) * 0.0275)
      : Math.round(costNpr * 0.0275);
      
    setFormPrice(aedPrice);
    setFormCostPrice(aedCost);

    setFormDiscountPercent(prod.discountPercent);
    setFormImage(prod.image);
    setFormInStock(prod.inStock);
    setFormIsVisible(prod.isVisible !== false);
    setFormStockCount(prod.stockCount !== undefined ? prod.stockCount : 10);
    setFormImages(prod.images || (prod.image ? [prod.image] : []));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert entered price to base NPR
    const currencyConfig = CURRENCIES.find(c => c.code === formPriceCurrency) || CURRENCIES.find(c => c.code === 'NPR')!;
    const basePriceInNpr = Math.round(Number(formPrice) / currencyConfig.rate);
    const baseCostPriceInNpr = Math.round(Number(formCostPrice) / currencyConfig.rate);

    // Primary image is either specified or the first of the uploaded images
    const primaryImage = formImage || formImages[0] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80';
    
    // Sync primary image to be the first in images array
    const allImages = [...formImages];
    if (primaryImage && !allImages.includes(primaryImage)) {
      allImages.unshift(primaryImage);
    }

    const formattedCategory = formCategory.trim()
      ? formCategory.trim().charAt(0).toUpperCase() + formCategory.trim().slice(1)
      : 'Cosmetics';

    const productData: Product = {
      id: isEditing ? isEditing.id : 'p-' + Math.floor(1000 + Math.random() * 9000),
      name: formName,
      category: formattedCategory,
      description: formDescription,
      price: basePriceInNpr,
      discountPercent: Number(formDiscountPercent),
      image: primaryImage,
      images: allImages,
      inStock: formInStock,
      stockCount: Number(formStockCount),
      rating: isEditing ? isEditing.rating : 5.0,
      reviewsCount: isEditing ? isEditing.reviewsCount : 1,
      enteredPrice: Number(formPrice),
      enteredCurrency: formPriceCurrency,
      brand: formBrand,
      costPrice: baseCostPriceInNpr,
      isVisible: formIsVisible
    };

    if (isEditing) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    resetForm();
  };

  // Coupon admin handlers
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponErrorMsg('');

    const trimmedCode = couponCode.trim().toUpperCase();
    if (!trimmedCode) {
      setCouponErrorMsg('Coupon code cannot be empty.');
      return;
    }

    const currentCoupons: Coupon[] = settings?.coupons || [
      { id: 'c1', code: 'WELCOME10', discountPercent: 10, applicableProductId: 'all', isActive: true, usedByPhones: [] },
      { id: 'c2', code: 'LIPSTICK25', discountPercent: 25, applicableProductId: 'p1', isActive: true, usedByPhones: [] },
      { id: 'c3', code: 'GLOW20', discountPercent: 20, applicableProductId: 'p2', isActive: true, usedByPhones: [] }
    ];

    // Check duplicate code
    const duplicate = currentCoupons.find(c => c.code === trimmedCode && c.id !== editingCouponId);
    if (duplicate) {
      setCouponErrorMsg(`A coupon with code "${trimmedCode}" already exists.`);
      return;
    }

    let updatedCoupons: Coupon[];

    if (editingCouponId) {
      updatedCoupons = currentCoupons.map(c => {
        if (c.id === editingCouponId) {
          return {
            ...c,
            code: trimmedCode,
            discountPercent: Number(couponDiscount),
            applicableProductId: couponProduct,
            isActive: couponActive
          };
        }
        return c;
      });
    } else {
      const newCoupon: Coupon = {
        id: 'coupon-' + Math.random().toString(36).substr(2, 9),
        code: trimmedCode,
        discountPercent: Number(couponDiscount),
        applicableProductId: couponProduct,
        isActive: couponActive,
        usedByPhones: []
      };
      updatedCoupons = [...currentCoupons, newCoupon];
    }

    onUpdateSettings({
      ...settings,
      coupons: updatedCoupons
    });

    handleResetCouponForm();
  };

  const handleEditCouponClick = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setCouponCode(coupon.code);
    setCouponDiscount(coupon.discountPercent);
    setCouponProduct(coupon.applicableProductId);
    setCouponActive(coupon.isActive);
    setCouponErrorMsg('');
  };

  const handleDeleteCoupon = (id: string) => {
    const currentCoupons: Coupon[] = settings?.coupons || [
      { id: 'c1', code: 'WELCOME10', discountPercent: 10, applicableProductId: 'all', isActive: true, usedByPhones: [] },
      { id: 'c2', code: 'LIPSTICK25', discountPercent: 25, applicableProductId: 'p1', isActive: true, usedByPhones: [] },
      { id: 'c3', code: 'GLOW20', discountPercent: 20, applicableProductId: 'p2', isActive: true, usedByPhones: [] }
    ];
    const updatedCoupons = currentCoupons.filter(c => c.id !== id);
    onUpdateSettings({
      ...settings,
      coupons: updatedCoupons
    });
  };

  const handleToggleCouponActive = (coupon: Coupon) => {
    const currentCoupons: Coupon[] = settings?.coupons || [
      { id: 'c1', code: 'WELCOME10', discountPercent: 10, applicableProductId: 'all', isActive: true, usedByPhones: [] },
      { id: 'c2', code: 'LIPSTICK25', discountPercent: 25, applicableProductId: 'p1', isActive: true, usedByPhones: [] },
      { id: 'c3', code: 'GLOW20', discountPercent: 20, applicableProductId: 'p2', isActive: true, usedByPhones: [] }
    ];
    const updatedCoupons = currentCoupons.map(c => {
      if (c.id === coupon.id) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    });
    onUpdateSettings({
      ...settings,
      coupons: updatedCoupons
    });
  };

  const handleResetCouponForm = () => {
    setEditingCouponId(null);
    setCouponCode('');
    setCouponDiscount(10);
    setCouponProduct('all');
    setCouponActive(true);
    setCouponErrorMsg('');
  };

  // Shipping management functions
  const handleAddShippingLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    const localFee = parseFloat(newLocFee) || 0;
    
    // Convert entered local currency fee to base NPR fee
    const activeShippingCountry = countries.find(c => c.code === shippingCountryCode) || countries[0];
    const targetCurrency = activeShippingCountry.defaultCurrency;
    const config = CURRENCIES.find(curr => curr.code === targetCurrency) || CURRENCIES[0];
    const feeInNpr = Math.round(localFee / config.rate);

    const updatedCountries = countries.map(c => {
      if (c.code === shippingCountryCode) {
        const newLocation: ShippingLocation = {
          id: `${c.code.toLowerCase()}-${Date.now()}`,
          name: newLocName.trim(),
          feeInNpr: feeInNpr
        };
        return {
          ...c,
          locations: [...c.locations, newLocation]
        };
      }
      return c;
    });

    onUpdateCountries(updatedCountries);
    setNewLocName('');
    setNewLocFee('');
  };

  const handleDeleteShippingLocation = (locId: string) => {
    const updatedCountries = countries.map(c => {
      if (c.code === shippingCountryCode) {
        return {
          ...c,
          locations: c.locations.filter(loc => loc.id !== locId)
        };
      }
      return c;
    });
    onUpdateCountries(updatedCountries);
  };

  const handleStartEditShippingLocation = (loc: ShippingLocation) => {
    const activeShippingCountry = countries.find(c => c.code === shippingCountryCode) || countries[0];
    const targetCurrency = activeShippingCountry.defaultCurrency;
    
    // Display fee converted to local country currency
    const rate = CURRENCIES.find(curr => curr.code === targetCurrency)?.rate || 1.0;
    const convertedFee = targetCurrency === 'USD' || targetCurrency === 'EUR'
      ? Math.round((loc.feeInNpr * rate) * 100) / 100
      : Math.round(loc.feeInNpr * rate);

    setEditingLocId(loc.id);
    setEditingLocName(loc.name);
    setEditingLocFee(String(convertedFee));
  };

  const handleSaveEditShippingLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocName.trim() || !editingLocId) return;
    const localFee = parseFloat(editingLocFee) || 0;

    // Convert local currency fee back to base NPR fee
    const activeShippingCountry = countries.find(c => c.code === shippingCountryCode) || countries[0];
    const targetCurrency = activeShippingCountry.defaultCurrency;
    const config = CURRENCIES.find(curr => curr.code === targetCurrency) || CURRENCIES[0];
    const feeInNpr = Math.round(localFee / config.rate);

    const updatedCountries = countries.map(c => {
      if (c.code === shippingCountryCode) {
        return {
          ...c,
          locations: c.locations.map(loc => {
            if (loc.id === editingLocId) {
              return {
                ...loc,
                name: editingLocName.trim(),
                feeInNpr: feeInNpr
              };
            }
            return loc;
          })
        };
      }
      return c;
    });

    onUpdateCountries(updatedCountries);
    setEditingLocId(null);
    setEditingLocName('');
    setEditingLocFee('');
  };

  const handleToggleFreeDelivery = (locId: string, isFreeNow: boolean) => {
    const activeShippingCountry = countries.find(c => c.code === shippingCountryCode) || countries[0];
    const defaultFeeInNpr = activeShippingCountry.code === 'NP' ? 150 : Math.round(15 / (CURRENCIES.find(curr => curr.code === activeShippingCountry.defaultCurrency)?.rate || 1));

    const updatedCountries = countries.map(c => {
      if (c.code === shippingCountryCode) {
        return {
          ...c,
          locations: c.locations.map(loc => {
            if (loc.id === locId) {
              return {
                ...loc,
                feeInNpr: isFreeNow ? 0 : defaultFeeInNpr
              };
            }
            return loc;
          })
        };
      }
      return c;
    });
    onUpdateCountries(updatedCountries);
  };

  // Advanced Dashboard and Reporting Handlers
  const handleSaveGoal = (val: string) => {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setMonthlyGoal(num);
      localStorage.setItem('mahi_monthly_goal', num.toString());
      setEditingGoal(false);
      setSimulationToast('🎯 Monthly Sales Target Updated!');
      setTimeout(() => setSimulationToast(''), 2500);
    }
  };

  const handleExportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Customer Name', 'Customer Phone', 'Address', 'Status', 'Date', 'Payment Method', 'Subtotal', 'Discount', 'Delivery Fee', 'Total'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerAddress.replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.paymentMethod}"`,
      o.subtotal,
      o.discountAmount,
      o.deliveryFee,
      o.total
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mahi_orders_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSimulationToast('📊 Orders Exported to CSV successfully!');
    setTimeout(() => setSimulationToast(''), 2500);
  };

  const handleExportInventoryCSV = () => {
    if (products.length === 0) return;
    const headers = ['Product ID', 'Name', 'Category', 'Brand', 'Price (NPR)', 'Discount %', 'Sale Price (NPR)', 'Stock Count', 'In Stock'];
    const rows = products.map(p => {
      const salePrice = p.price - (p.price * p.discountPercent / 100);
      return [
        `"${p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category.replace(/"/g, '""')}"`,
        `"${(p.brand || 'Mahi Creations').replace(/"/g, '""')}"`,
        p.price,
        p.discountPercent,
        salePrice,
        p.stockCount !== undefined ? p.stockCount : 10,
        p.inStock ? 'Yes' : 'No'
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mahi_inventory_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSimulationToast('📦 Inventory Exported to CSV successfully!');
    setTimeout(() => setSimulationToast(''), 2500);
  };

  const handleSimulateNewOrder = () => {
    if (!onAddOrder) {
      setSimulationToast("⚠️ Simulation engine is starting up...");
      return;
    }
    if (products.length === 0) return;
    
    // Pick 1-2 random products
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedCount = Math.min(shuffled.length, Math.floor(Math.random() * 2) + 1);
    const selectedProducts = shuffled.slice(0, selectedCount);
    
    const names = ["Kripa Adhikari", "Samir Shrestha", "Alina Thapa", "Rajan Karki", "Sushma Rajbhandari", "Pramod Kharel"];
    const phones = ["9779802058364", "9779841556677", "9779812345678", "9779851020304", "9779801122334", "9779819876543"];
    const addresses = ["Sanepa-2, Lalitpur (Opposite Ring Road)", "New Baneshwor, Kathmandu", "Lakeside Ward 6, Pokhara", "Sauraha, Chitwan", "Main Road, Biratnagar", "Siddharthanagar, Bhairahawa"];
    const payMethods: Array<'eSewa' | 'Khalti' | 'COD' | 'Bank Transfer' | 'Card Payment'> = ["COD", "Card Payment", "eSewa", "Khalti"];
    
    const randIdx = Math.floor(Math.random() * names.length);
    const randCustomer = names[randIdx];
    const randPhone = phones[randIdx];
    const randAddress = addresses[randIdx];
    const randPay = payMethods[Math.floor(Math.random() * payMethods.length)];
    
    const orderItems = selectedProducts.map(p => {
      const discountedPrice = p.price - (p.price * p.discountPercent / 100);
      return {
        productId: p.id,
        productName: p.name,
        price: discountedPrice,
        quantity: Math.floor(Math.random() * 2) + 1,
        discountPercent: p.discountPercent,
        image: p.image
      };
    });
    
    const itemsSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = selectedProducts.reduce((sum, p) => {
      const discountVal = (p.price * p.discountPercent) / 100;
      const match = orderItems.find(it => it.productId === p.id);
      return sum + (discountVal * (match ? match.quantity : 1));
    }, 0);
    
    const deliveryFee = Math.random() > 0.5 ? 150 : 0;
    const finalTotal = itemsSubtotal + deliveryFee;
    
    const simulatedOrder: Order = {
      id: `MC-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: randCustomer,
      customerPhone: randPhone,
      customerAddress: randAddress,
      deliveryLocationId: randAddress.includes("Lalitpur") ? "np-ltp" : "np-ktm",
      deliveryLocationName: randAddress.includes("Lalitpur") ? "Lalitpur (Inside)" : "Kathmandu Valley (Inside)",
      paymentMethod: randPay,
      items: orderItems,
      subtotal: itemsSubtotal + totalDiscount,
      discountAmount: totalDiscount,
      deliveryFee: deliveryFee,
      total: finalTotal,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    onAddOrder(simulatedOrder);
    setSimulationToast(`🎉 New order simulated successfully for ${randCustomer}!`);
    setTimeout(() => setSimulationToast(''), 3000);
  };

  const handleSimulateReview = () => {
    if (!onAddReview) return;
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    const reviewers = ["Riya Sen", "Deepika B.", "Pooja Chhetri", "Fatima Hassan", "Aanya Sharma"];
    const reviewsText = [
      "Incredible premium scent and hydration! Mahi Creations delivers authentic boutique products very quickly.",
      "Stellar glow formula. My dry skin cleared up within three days! Best purchase ever.",
      "Perfect matte lips finish. The gold casing feels extremely luxurious.",
      "Fabulous support over WhatsApp and extremely careful premium bubble-wrap packaging.",
      "100% authentic cosmetic quality. The glow is very natural and gorgeous."
    ];
    
    const randReviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
    const randText = reviewsText[Math.floor(Math.random() * reviewsText.length)];
    const randRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
    
    const simulatedReview: ProductReview = {
      id: `REV-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: randomProduct.id,
      productName: randomProduct.name,
      customerName: randReviewer,
      rating: randRating,
      comment: randText,
      createdAt: new Date().toISOString()
    };
    
    onAddReview(simulatedReview);
    
    // Update the product inline
    const updatedCount = (randomProduct.reviewsCount || 0) + 1;
    const currentRatingSum = (randomProduct.rating || 4.8) * (randomProduct.reviewsCount || 1);
    const newRating = parseFloat(((currentRatingSum + randRating) / updatedCount).toFixed(1));
    
    onUpdateProduct({
      ...randomProduct,
      rating: newRating,
      reviewsCount: updatedCount
    });
    
    setSimulationToast(`⭐ Simulated glowing ${randRating}-Star review on "${randomProduct.name}"!`);
    setTimeout(() => setSimulationToast(''), 3000);
  };

  // Helper to filter orders for Dashboard metrics based on time period
  const getDashboardFilteredOrders = () => {
    return orders.filter(o => {
      if (dashboardTimeFilter === 'all') return true;
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      
      if (dashboardTimeFilter === 'daily') {
        return orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear();
      } else if (dashboardTimeFilter === 'monthly') {
        return orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear();
      } else if (dashboardTimeFilter === 'yearly') {
        return orderDate.getFullYear() === today.getFullYear();
      }
      return true;
    });
  };

  const dbFilteredOrders = getDashboardFilteredOrders();

  // Metrics computations
  const totalRevenue = dbFilteredOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalDiscountDistributed = dbFilteredOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.discountAmount, 0);

  // Cost & Profit calculations
  const totalCostOfGoodsSold = dbFilteredOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => {
      const orderCost = o.items.reduce((itemSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        const unitCost = prod?.costPrice || Math.round((prod?.price || item.price) * 0.6);
        return itemSum + (unitCost * item.quantity);
      }, 0);
      return sum + orderCost;
    }, 0);

  const totalNetProfit = totalRevenue - totalCostOfGoodsSold;
  const overallProfitPercent = totalCostOfGoodsSold > 0 ? (totalNetProfit / totalCostOfGoodsSold) * 100 : 0;

  const pendingOrdersCount = dbFilteredOrders.filter(o => o.status === 'Pending').length;

  // Cart recovery notification sender
  const handleSendCartNotification = (cart: any) => {
    const itemsText = cart.items.map((it: any) => `• ${it.productName} (Qty: ${it.quantity})`).join('\n');
    const totalCartPrice = cart.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);
    const message = `Hello ${cart.customerName}! 💄🌸\n\nWe noticed you left some premium beauty items in your shopping cart at Mahi Creations:\n\n${itemsText}\n\nTotal: Rs. ${totalCartPrice.toLocaleString('en-IN')}\n\nComplete your checkout now and get an exclusive 10% discount! Use coupon code: *MAHI10*\n👉 Link: ${window.location.origin}\n\nThank you! ✨`;
    
    // Open WhatsApp
    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/977${cart.phone}?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
    
    // Show simulation toast
    setSimulationToast(`✉️ Recovery alert successfully sent to ${cart.customerName} (+977 ${cart.phone})!`);
    setTimeout(() => setSimulationToast(''), 4000);
  };

  // Helper to filter and sort customer orders based on time range, status, and custom groupings
  const getFilteredOrders = () => {
    return orders.filter(o => {
      // 1. Search Query
      const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      if (!matchesSearch) return false;

      // 2. Status Filter
      if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) return false;

      // 3. Payment Method Filter
      if (orderPaymentFilter !== 'All' && o.paymentMethod !== orderPaymentFilter) return false;

      // 4. Time Filter: Daily, Monthly, Yearly
      if (orderTimeFilter !== 'all') {
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        
        if (orderTimeFilter === 'daily') {
          const isToday = orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear();
          if (!isToday) return false;
        } else if (orderTimeFilter === 'monthly') {
          const isThisMonth = orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear();
          if (!isThisMonth) return false;
        } else if (orderTimeFilter === 'yearly') {
          const isThisYear = orderDate.getFullYear() === today.getFullYear();
          if (!isThisYear) return false;
        }
      }

      // 5. Group Filter (Active vs Completed vs Cancelled)
      if (orderGroupFilter !== 'all') {
        if (orderGroupFilter === 'active') {
          const isActive = o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Packaging' || o.status === 'Out for Delivery';
          if (!isActive) return false;
        } else if (orderGroupFilter === 'completed') {
          if (o.status !== 'Delivered') return false;
        } else if (orderGroupFilter === 'cancelled') {
          if (o.status !== 'Cancelled') return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort priority: Active (Pending -> Confirmed -> Packaging -> Out for Delivery) first, then Delivered, then Cancelled
      const getStatusPriority = (status: OrderStatus) => {
        switch (status) {
          case 'Pending': return 1;
          case 'Confirmed': return 2;
          case 'Packaging': return 3;
          case 'Out for Delivery': return 4;
          case 'Delivered': return 5;
          case 'Cancelled': return 6;
          default: return 7;
        }
      };
      
      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Secondary sorting: newer first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Build Copyable Caption for Products
  const getProductShareText = (p: Product) => {
    const discountedPrice = p.price - (p.price * p.discountPercent / 100);
    return `✨ Discover the premium cosmetics luxury of Mahi Creations! ✨\n\n💄 Product: ${p.name}\n🌸 Category: ${p.category}\n🏷️ Special Price: Rs. ${discountedPrice.toLocaleString('en-IN')}${p.discountPercent > 0 ? ` (${p.discountPercent}% OFF!)` : ''}\n✨ Details: ${p.description}\n\n📱 Order directly via WhatsApp at https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}\n🛍️ View more on our website!\n\n#MahiCreations #BoutiqueLuxury #CosmeticsNP`;
  };

  const handleCopyShareText = (p: Product) => {
    const text = getProductShareText(p);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Virtualization variables and media queries
  const is2Xl = useMediaQuery('(min-width: 1536px)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Products Virtualization
  const getFilteredProducts = () => {
    return products.filter(p => {
      const pBrand = p.brand || 'Mahi Creations';
      const matchesSearch = p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                            pBrand.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                            p.id.toLowerCase().includes(productSearchQuery.toLowerCase());
      const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      const matchesBrand = productBrandFilter === 'All' || pBrand === productBrandFilter;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  };

  const productCols = 1;
  const productRowHeight = isMobile ? 260 : 70;
  const topFilteredProducts = getFilteredProducts();
  const productRows = chunkArray(topFilteredProducts, productCols);

  const {
    visibleItems: visibleProductRows,
    topPadding: productsTopPadding,
    bottomPadding: productsBottomPadding,
  } = useVirtual({
    items: productRows,
    itemHeight: productRowHeight,
    containerRef: productsScrollContainerRef,
    buffer: 4,
  });

  // Orders Virtualization
  const topFilteredOrders = getFilteredOrders();
  const orderRowHeight = 94; // Fixed height of an order row on desktop/tablet

  const {
    visibleItems: visibleOrders,
    topPadding: ordersTopPadding,
    bottomPadding: ordersBottomPadding,
  } = useVirtual({
    items: topFilteredOrders,
    itemHeight: orderRowHeight,
    containerRef: ordersScrollContainerRef,
    buffer: 6,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 font-sans">
        <div className="bg-white rounded-3xl border border-clay p-8 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 bg-dark text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-dark uppercase tracking-wide">Admin Portal Log In</h2>
            <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed font-light">
              Enter your credentials to manage inventory catalog, change public social media links, configure contact channels, and process pending makeup orders.
            </p>
          </div>

          {/* Hostinger & Domain Authorization Guidance */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-left text-[11px] text-amber-900 space-y-1.5">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>🌐 Hostinger Hosting & Direct Admin Login:</span>
            </p>
            <p className="text-neutral-600 font-light leading-relaxed">
              If Google Sign-In gives a domain authorization error on <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-semibold text-amber-900">mahicreations.xyz</code>, log in directly using your Admin credentials below:
            </p>
            <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60 font-mono text-[10px] space-y-0.5 text-amber-950 font-semibold">
              <p>Username: <span className="text-dark font-bold underline">{settings.adminUser || 'admin'}</span></p>
              <p>Password: <span className="text-dark font-bold underline">{settings.adminPassword || 'mahi123'}</span></p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-3 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Admin Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-clay rounded-xl p-3 bg-bg-warm/30 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-dark"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-clay rounded-xl p-3 bg-bg-warm/30 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-dark"
                />
              </div>
            </div>

            {authError && <p className="text-[11px] text-red-600 font-semibold">{authError}</p>}

            <button
              type="submit"
              className="w-full bg-dark hover:bg-brand text-white text-xs font-bold tracking-widest uppercase py-3.5 rounded-xl transition cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="border-t border-clay pt-5 space-y-2">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Examiner Testing Shortcut:</p>
            <button
              onClick={handleDemoLogin}
              className="inline-flex items-center gap-1.5 bg-clay-light border border-clay text-brand text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-clay transition cursor-pointer"
            >
              ⚡ Quick Demo Access (Bypass)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render SEO Metadata Manager UI
  const renderSeoMetadataManager = () => {
    const titleLen = tempSeoTitle.length;
    const descLen = tempSeoDescription.length;
    const isTitleOptimal = titleLen >= 30 && titleLen <= 65;
    const isDescOptimal = descLen >= 70 && descLen <= 170;
    const hasOgImage = Boolean(tempSeoOgImage.trim());
    const hasCanonical = Boolean(tempSeoCanonicalUrl.trim());
    const hasKeywords = Boolean(tempSeoKeywords.trim());

    // Calculate score out of 100
    let score = 0;
    if (isTitleOptimal) score += 25; else if (titleLen > 0) score += 12;
    if (isDescOptimal) score += 25; else if (descLen > 0) score += 12;
    if (hasOgImage) score += 20;
    if (hasCanonical) score += 15;
    if (hasKeywords) score += 15;

    return (
      <div className="space-y-6 text-xs text-neutral-600 animate-fade-in">
        {/* Top Banner / Health Status Card */}
        <div className="bg-gradient-to-r from-dark via-neutral-900 to-dark text-white p-6 rounded-2xl shadow-xl border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand" />
                <h4 className="font-serif text-lg font-bold uppercase tracking-wider text-white">SEO & Social Metadata Manager</h4>
                <span className="text-[10px] bg-brand/30 text-brand-light border border-brand/50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Site-Wide Meta Engine</span>
              </div>
              <p className="text-neutral-400 text-xs font-light max-w-2xl">
                Dynamically customize your site's search engine titles, open-graph social share cards, meta descriptions, and Google indexing parameters saved directly into your store settings.
              </p>
            </div>

            {/* Score Badge */}
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3.5 rounded-xl flex items-center gap-3 shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-base shadow-inner ${
                score >= 80 ? 'bg-emerald-500 text-white' : score >= 50 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {score}%
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-300 block tracking-wider">SEO Health Index</span>
                <span className="text-xs font-semibold text-white">
                  {score >= 80 ? 'Optimal Meta Tags' : score >= 50 ? 'Needs Optimization' : 'Incomplete Meta Tags'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10 text-[10.5px]">
            <div className="bg-white/5 p-2 rounded-lg flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isTitleOptimal ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-neutral-300 font-medium">Title Length: <strong className="text-white">{titleLen}ch</strong></span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isDescOptimal ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-neutral-300 font-medium">Desc Length: <strong className="text-white">{descLen}ch</strong></span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hasOgImage ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-neutral-300 font-medium">OG Card: <strong className="text-white">{hasOgImage ? 'Active' : 'Missing'}</strong></span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hasCanonical ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-neutral-300 font-medium">Canonical: <strong className="text-white">{hasCanonical ? 'Valid' : 'None'}</strong></span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg flex items-center gap-1.5 col-span-2 sm:col-span-1">
              <span className={`w-2 h-2 rounded-full ${hasKeywords ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-neutral-300 font-medium">Keywords: <strong className="text-white">{tempSeoKeywords.split(',').filter(Boolean).length} tags</strong></span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {seoPresetMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl font-semibold flex items-center gap-2 animate-fade-in text-xs">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{seoPresetMsg}</span>
          </div>
        )}

        {/* Preset Quick Fill Buttons */}
        <div className="bg-white border border-clay/80 p-4 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            Apply Recommended Meta Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applySeoPreset('boutique')}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-dark font-bold text-[11px] rounded-lg transition border border-neutral-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-brand" />
              Default Luxury Boutique
            </button>
            <button
              type="button"
              onClick={() => applySeoPreset('cosmetics')}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-dark font-bold text-[11px] rounded-lg transition border border-neutral-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Cosmetics & Skincare Sourcing
            </button>
            <button
              type="button"
              onClick={() => applySeoPreset('couture')}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-dark font-bold text-[11px] rounded-lg transition border border-neutral-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-brand" />
              Saree & Kundan Jewelry
            </button>
          </div>
        </div>

        {/* SEO Fields Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl">
            <h5 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-clay/80">
              <Globe className="w-4 h-4 text-brand" />
              Site Metadata Configuration
            </h5>

            {/* Site Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-neutral-600 flex items-center gap-1">
                  Site-Wide Meta Title (<code className="text-brand">&lt;title&gt;</code>)
                </label>
                <span className={`text-[10px] font-bold ${isTitleOptimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {titleLen} / 60 chars {isTitleOptimal ? '(Ideal)' : '(30-60 recommended)'}
                </span>
              </div>
              <input
                type="text"
                value={tempSeoTitle}
                onChange={(e) => setTempSeoTitle(e.target.value)}
                placeholder="e.g. Mahi Creations | Luxury Handcrafted Treasures & Apparel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-clay bg-white focus:outline-none focus:ring-2 focus:ring-brand font-medium text-xs text-dark"
              />
              <p className="text-[10.5px] text-neutral-500 font-light">
                Displayed in browser tab titles, search engine results, and social bookmarks.
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-neutral-600">
                  Meta Description (<code className="text-brand">&lt;meta name="description"&gt;</code>)
                </label>
                <span className={`text-[10px] font-bold ${isDescOptimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {descLen} / 160 chars {isDescOptimal ? '(Ideal)' : '(120-160 recommended)'}
                </span>
              </div>
              <textarea
                rows={3}
                value={tempSeoDescription}
                onChange={(e) => setTempSeoDescription(e.target.value)}
                placeholder="Provide a compelling 2-sentence summary of your boutique's products and unique value proposition..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-clay bg-white focus:outline-none focus:ring-2 focus:ring-brand font-light text-xs text-dark leading-relaxed"
              />
              <p className="text-[10.5px] text-neutral-500 font-light">
                Snippet text shown below your title on Google search engine results pages.
              </p>
            </div>

            {/* SEO Keywords */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-600">
                SEO Search Keywords (Comma Separated)
              </label>
              <textarea
                rows={2}
                value={tempSeoKeywords}
                onChange={(e) => setTempSeoKeywords(e.target.value)}
                placeholder="mahi creations, cosmetics nepal, boutique, liquid lipstick, foundation, organza saree"
                className="w-full px-3.5 py-2 rounded-xl border border-clay bg-white focus:outline-none focus:ring-2 focus:ring-brand font-light text-xs text-dark"
              />
              <p className="text-[10.5px] text-neutral-500 font-light">
                Target key phrases for metadata indices and internal search relevance.
              </p>
            </div>

            {/* OG Share Image */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-neutral-600">
                  Open Graph (OG) Social Image Banner URL
                </label>
                {tempSeoOgImage && (
                  <a href={tempSeoOgImage} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand hover:underline flex items-center gap-0.5 font-semibold">
                    <ExternalLink className="w-3 h-3" /> Test URL
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempSeoOgImage}
                  onChange={(e) => setTempSeoOgImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-clay bg-white focus:outline-none focus:ring-2 focus:ring-brand font-mono text-[11px] text-dark"
                />
                <label className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0">
                  <UploadCloud className="w-3.5 h-3.5" />
                  {isUploadingOgImage ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingOgImage(true);
                      try {
                        const url = await uploadImageToServer(file);
                        setTempSeoOgImage(url);
                      } catch (err) {
                        console.error("Failed to upload OG image:", err);
                      } finally {
                        setIsUploadingOgImage(false);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-[10.5px] text-neutral-500 font-light">
                High-resolution landscape image (1200x630px recommended) shown when your website link is shared on WhatsApp, Facebook, iMessage, and X (Twitter).
              </p>
            </div>

            {/* Canonical URL & Brand Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-clay/80">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-600">
                  Canonical Domain Website URL
                </label>
                <input
                  type="text"
                  value={tempSeoCanonicalUrl}
                  onChange={(e) => setTempSeoCanonicalUrl(e.target.value)}
                  placeholder="https://mahicreations.xyz/"
                  className="w-full px-3.5 py-2 rounded-xl border border-clay bg-white focus:outline-none focus:ring-2 focus:ring-brand font-mono text-[11px] text-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-600">
                  Site Author / Publisher Name
                </label>
                <input
                  type="text"
                  value={tempSeoAuthor}
                  onChange={(e) => setTempSeoAuthor(e.target.value)}
                  placeholder="Mahi Creations"
                  className="w-full px-3.5 py-2 rounded-xl border border-clay bg-white focus:outline-none focus:ring-2 focus:ring-brand font-medium text-xs text-dark"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-neutral-600">
                  Twitter / X Creator Handle
                </label>
                <input
                  type="text"
                  value={tempSeoTwitterHandle}
                  onChange={(e) => setTempSeoTwitterHandle(e.target.value)}
                  placeholder="@mahicreations"
                  className="w-full px-3.5 py-2 rounded-xl border border-clay bg-white focus:outline-none focus:ring-2 focus:ring-brand font-medium text-xs text-dark"
                />
              </div>
            </div>

            {/* Save Button inside form */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="bg-dark hover:bg-brand text-white font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Save SEO Metadata Settings
              </button>
            </div>
          </div>

          {/* Right Column: Live Previews (Google SERP & Social Card) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Google Search Result Preview */}
            <div className="bg-white border border-clay/90 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Live Google Search Result Preview
                </span>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">SERP Snippet</span>
              </div>

              {/* SERP Card */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                  <div className="w-4 h-4 rounded-full bg-brand/20 text-brand font-serif text-[10px] flex items-center justify-center font-bold">M</div>
                  <div className="truncate">
                    <span className="font-semibold text-neutral-800">{tempSeoAuthor || tempShopName || 'Mahi Creations'}</span>
                    <span className="text-neutral-400 mx-1">›</span>
                    <span className="text-neutral-500 font-mono text-[10px]">{tempSeoCanonicalUrl || 'https://mahicreations.xyz/'}</span>
                  </div>
                </div>

                <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-700 hover:underline font-serif text-base font-bold leading-tight block truncate">
                  {tempSeoTitle || 'Mahi Creations | Luxury Handcrafted Treasures'}
                </a>

                <p className="text-neutral-600 text-[11.5px] leading-snug line-clamp-2 font-sans font-normal">
                  {tempSeoDescription || 'Explore Mahi Creations\' exclusive collection of luxury cosmetic treasures, handcrafted custom jewelry, and premium traditional clothing.'}
                </p>
              </div>

              <p className="text-[10px] text-neutral-400 font-light">
                This is how your store listing appears when customers discover you on Google or Bing.
              </p>
            </div>

            {/* Live Open Graph Social Share Preview (WhatsApp / Facebook) */}
            <div className="bg-white border border-clay/90 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-brand" />
                  Live Social Share Card Preview (WhatsApp / FB)
                </span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">OG Card</span>
              </div>

              {/* OG Share Card */}
              <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-md">
                <div className="aspect-[1200/630] bg-neutral-800 relative overflow-hidden flex items-center justify-center">
                  {tempSeoOgImage ? (
                    <img
                      src={tempSeoOgImage}
                      alt="OG Share Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center p-6 text-neutral-500">
                      <Globe className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                      <span className="text-xs">No OG Image Provided</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    1200 x 630 OG Preview
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-950 text-white space-y-1 border-t border-neutral-800">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block font-mono">
                    {tempSeoCanonicalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').toUpperCase() || 'MAHICREATIONS.XYZ'}
                  </span>
                  <h6 className="font-serif text-xs font-bold text-white line-clamp-1 leading-snug">
                    {tempSeoTitle || 'Mahi Creations Boutique'}
                  </h6>
                  <p className="text-[10.5px] text-neutral-400 line-clamp-2 leading-relaxed font-light">
                    {tempSeoDescription || 'Luxury cosmetics, handcrafted apparel and fine custom jewelry.'}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-neutral-400 font-light">
                This preview updates live whenever customers share your store link across messaging apps and social feeds.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto pt-14 sm:pt-16 pb-8 px-4 sm:px-8 lg:px-12 font-sans animate-fade-in">
      
      {/* Premium Admin Header Card */}
      <div className="bg-white border border-clay rounded-3xl p-6 sm:p-8 mb-8 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:border-brand/30 hover:shadow-lg transition-all duration-300">
        
        {/* Left Side: Profile Photo & Information Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Circular User Profile Placeholder Image */}
          <div className="relative shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80" 
              alt="Mahi Admin Profile" 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-brand/25 shadow-md bg-neutral-100"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
          </div>

          <div className="space-y-1 text-left">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Username display */}
              <h2 className="font-sans text-xl sm:text-2xl font-black text-dark uppercase tracking-tight">
                {settings.adminUser || 'Mahi Admin'}
              </h2>
              {/* Admin Status Badge next to user's name */}
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Admin
              </span>
            </div>

            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">
              Mahi Creations Executive Boutique Administrator
            </p>

            <div className="flex items-center gap-2 pt-1 text-[9px] sm:text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              <span>Console: Connected</span>
              <span className="text-neutral-300">•</span>
              <span>ID: #MC-2026-ADMIN</span>
            </div>
          </div>
        </div>

        {/* Right Side: Back to Shop / Admin Button */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand-hover text-white rounded-xl transition duration-300 shadow-md hover:shadow-lg hover:shadow-brand/20 cursor-pointer border border-brand/10 text-xs font-black tracking-widest uppercase"
          >
            <span>Back to Shop &rarr;</span>
          </button>
        </div>

      </div>

      {/* Main Panel grid: Sidebar on left (3 cols), Content on right (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-clay p-5 space-y-6 shadow-sm">
            
            {/* Active Admin Identity Badge */}
            <div className="flex items-center gap-3 pb-4 border-b border-clay-light">
              <div className="w-10 h-10 rounded-xl bg-dark text-white flex items-center justify-center font-serif font-black">
                M
              </div>
              <div>
                <p className="text-xs font-bold text-dark truncate">Logged in as: {settings.adminUser}</p>
                <p className="text-[9px] text-brand uppercase font-bold tracking-widest mt-0.5">Boutique Manager</p>
              </div>
            </div>

            {/* Quick-Search & Command Hub */}
            <div className="relative border-b border-clay-light pb-4">
              <label className="block text-[9px] uppercase tracking-wider font-extrabold text-neutral-400 mb-1.5">
                ⚡ Quick Nav & Command Hub
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Type settings, products, orders..."
                  value={globalDashboardSearch}
                  onChange={(e) => setGlobalDashboardSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/50 border border-clay rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-brand font-medium placeholder-neutral-400 transition"
                />
                {globalDashboardSearch && (
                  <button
                    onClick={() => setGlobalDashboardSearch('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-dark cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {globalDashboardSearch.trim().length > 0 && (() => {
                const query = globalDashboardSearch.toLowerCase().trim();
                const navShortcuts = [
                  { label: '📊 Dashboard Summary', tab: 'dashboard' },
                  { label: '💄 Manage Makeup Products', tab: 'products' },
                  { label: '➕ Add Cosmetic Item', tab: 'products', action: 'add-product' },
                  { label: '🚚 Customer Checkout list', tab: 'orders' },
                  { label: '⭐ Customer Comments & Reviews', tab: 'reviews' },
                  { label: '🎟️ Automated Discount Coupons', tab: 'coupons' },
                  { label: '🔐 Security & Admin Credentials', tab: 'settings', subTab: 'credentials' },
                  { label: '📱 WhatsApp, Socials & Branding', tab: 'settings', subTab: 'socials' },
                  { label: '🌟 Homepage Product Showcase', tab: 'settings', subTab: 'showcase' },
                  { label: '📝 Footer Contact & About Details', tab: 'settings', subTab: 'footer' },
                  { label: '🎁 Promo Ads & Banners Slider', tab: 'settings', subTab: 'promo-slides' },
                  { label: '🏠 Homepage Custom Text Layouts', tab: 'settings', subTab: 'homepage' },
                  { label: '💎 VIP Sourcing Contacts', tab: 'settings', subTab: 'sourcing' },
                ];
                const matchedNavs = navShortcuts.filter(item => item.label.toLowerCase().includes(query));
                const matchedProducts = products.filter(p => 
                  p.name.toLowerCase().includes(query) || 
                  p.brand.toLowerCase().includes(query) || 
                  p.id.toLowerCase().includes(query)
                ).slice(0, 4);
                const matchedOrders = orders.filter(o => 
                  o.id.toLowerCase().includes(query) || 
                  o.customerName.toLowerCase().includes(query) || 
                  o.customerPhone.toLowerCase().includes(query)
                ).slice(0, 4);

                const hasResults = matchedNavs.length > 0 || matchedProducts.length > 0 || matchedOrders.length > 0;

                return (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-clay rounded-2xl shadow-xl z-50 max-h-[300px] overflow-y-auto divide-y divide-clay-light">
                    {!hasResults ? (
                      <div className="p-3 text-center text-neutral-400 text-[10px] font-medium leading-normal">
                        No matches found. Try checking spellings!
                      </div>
                    ) : (
                      <>
                        {/* Navigation section */}
                        {matchedNavs.length > 0 && (
                          <div className="p-2">
                            <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-wider text-neutral-400">Settings & Pages</p>
                            <div className="space-y-0.5">
                              {matchedNavs.map((n, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setActiveTab(n.tab as any);
                                    if (n.subTab) {
                                      setSettingsSubTab(n.subTab as any);
                                    }
                                    if (n.action === 'add-product') {
                                      setIsAdding(true);
                                      setIsEditing(null);
                                    } else {
                                      resetForm();
                                    }
                                    setGlobalDashboardSearch('');
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-50 rounded-lg text-[10.5px] font-bold text-dark transition flex items-center justify-between"
                                >
                                  <span>{n.label}</span>
                                  <ChevronRight className="w-3 h-3 text-neutral-300" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Products Section */}
                        {matchedProducts.length > 0 && (
                          <div className="p-2">
                            <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-wider text-neutral-400">Products ({matchedProducts.length})</p>
                            <div className="space-y-0.5">
                              {matchedProducts.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    setActiveTab('products');
                                    setProductSearchQuery(p.name);
                                    setGlobalDashboardSearch('');
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-50 rounded-lg text-[10px] font-medium text-dark transition flex items-center justify-between"
                                >
                                  <span className="truncate pr-2 font-bold text-dark text-xs">{p.name}</span>
                                  <span className="text-[9px] font-black font-mono text-brand bg-brand/5 px-1 rounded flex-shrink-0">Stock: {p.stockCount}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Orders Section */}
                        {matchedOrders.length > 0 && (
                          <div className="p-2">
                            <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-wider text-neutral-400">Orders ({matchedOrders.length})</p>
                            <div className="space-y-0.5">
                              {matchedOrders.map((o) => (
                                <button
                                  key={o.id}
                                  onClick={() => {
                                    setActiveTab('orders');
                                    setOrderSearch(o.id);
                                    setGlobalDashboardSearch('');
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-50 rounded-lg text-[10px] font-medium text-dark transition flex items-center justify-between"
                                >
                                  <div className="truncate flex flex-col">
                                    <span className="font-mono font-black text-dark text-[9px]">{o.id}</span>
                                    <span className="text-neutral-400 text-[9px] truncate">{o.customerName}</span>
                                  </div>
                                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 rounded flex-shrink-0">{o.status}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Sidebar Tab Triggers */}
            <div className="space-y-1.5">
              <button
                onClick={() => { setActiveTab('dashboard'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 stroke-[1.8]" />
                Dashboard Summary
              </button>

              <button
                onClick={() => { setActiveTab('products'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <Package className="w-4.5 h-4.5 stroke-[1.8]" />
                Manage Products ({products.length})
              </button>

              <button
                onClick={() => { setActiveTab('orders'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <ShoppingCart className="w-4.5 h-4.5 stroke-[1.8]" />
                Customer Orders ({orders.length})
              </button>

              <button
                onClick={() => { setActiveTab('reviews'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <Star className="w-4.5 h-4.5 stroke-[1.8] text-brand fill-brand" />
                Customer Reviews ({reviews.length})
              </button>

              <button
                onClick={() => { setActiveTab('subscribers'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'subscribers'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <Users className="w-4.5 h-4.5 stroke-[1.8] text-brand" />
                Newsletter Subscribers ({subscribers.length})
              </button>

              <button
                onClick={() => { setActiveTab('settings'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <Settings className="w-4.5 h-4.5 stroke-[1.8]" />
                Boutique Settings
              </button>

              <button
                onClick={() => { setActiveTab('seo'); resetForm(); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'seo'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Globe className="w-4.5 h-4.5 stroke-[1.8] text-brand" />
                  SEO Metadata Manager
                </span>
                <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black">ACTIVE</span>
              </button>

              <button
                onClick={() => { setActiveTab('payments'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <CreditCard className="w-4.5 h-4.5 stroke-[1.8] text-brand" />
                Payment Settings
              </button>

              <button
                onClick={() => { setActiveTab('shipping'); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'shipping'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-600 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <MapPin className="w-4.5 h-4.5 stroke-[1.8] text-brand" />
                Manage Delivery Fees
              </button>

              <button
                onClick={() => { setActiveTab('future'); resetForm(); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeTab === 'future'
                    ? 'bg-dark text-white shadow-md'
                    : 'bg-transparent text-neutral-500 hover:bg-clay-light hover:text-dark'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Ticket className="w-4.5 h-4.5 text-brand stroke-[1.8]" />
                  Discount Coupons
                </span>
                <span className="text-[8px] bg-brand text-white px-1.5 py-0.5 rounded font-black">ACTIVE</span>
              </button>
            </div>

            {/* Quick status cards */}
            <div className="pt-4 border-t border-clay-light space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <span>System Health</span>
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Optimal
                </span>
              </div>
              <div className="text-[10px] text-neutral-500 leading-normal font-light">
                WhatsApp Chat routing to +{settings.whatsappNumber} with standard checkout parameters.
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE DETAILS AREA */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-clay p-6 sm:p-8 shadow-sm min-h-[500px]">
          
          {/* DASHBOARD SUMMARY TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Simulation feedback toast */}
              {simulationToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl border border-brand/50 shadow-2xl flex items-center gap-3.5 animate-bounce font-sans text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping"></span>
                  <p className="font-bold">{simulationToast}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-clay-light pb-5">
                <div>
                  <h3 className="font-serif text-2xl font-black text-dark uppercase tracking-wide">Live Metrics & Performance</h3>
                  <p className="text-neutral-500 text-xs mt-1.5 font-light">Real-time boutique sales metrics, automated geographic conversions, and catalog trackers.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleExportOrdersCSV}
                    className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition cursor-pointer border border-clay-light"
                    title="Export all orders to Microsoft Excel/CSV document"
                  >
                    📊 Export Orders CSV
                  </button>
                  <button
                    onClick={handleExportInventoryCSV}
                    className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition cursor-pointer border border-clay-light"
                    title="Export entire cosmetics inventory catalog to CSV"
                  >
                    💄 Export Stock CSV
                  </button>
                </div>
              </div>

              {/* Period Selector Tabs for Dashboard Metrics */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 bg-bg-warm/60 border border-clay rounded-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Metrics Period:</span>
                  <div className="flex gap-1 bg-white p-1 rounded-xl border border-clay-light">
                    {[
                      { key: 'all', label: 'All Time' },
                      { key: 'daily', label: 'Today (Daily)' },
                      { key: 'monthly', label: 'This Month' },
                      { key: 'yearly', label: 'This Year' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setDashboardTimeFilter(opt.key as any)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                          dashboardTimeFilter === opt.key
                            ? 'bg-dark text-white shadow-sm font-extrabold'
                            : 'text-neutral-500 hover:text-dark hover:bg-neutral-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">
                  Active Filter: <span className="font-bold text-dark uppercase">{dashboardTimeFilter}</span> (showing {dbFilteredOrders.length} orders matching)
                </div>
              </div>

              {/* Bento analytics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="bg-clay-light/35 p-5 rounded-3xl border border-clay/60 flex items-center gap-4 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-white text-brand flex items-center justify-center shadow-sm flex-shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Gross Revenue</p>
                    <p className="text-lg font-black text-dark mt-1">AED {convertPrice(totalRevenue, 'AED').toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-clay-light/35 p-5 rounded-3xl border border-clay/60 flex items-center gap-4 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-white text-dark flex items-center justify-center shadow-sm flex-shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Orders Logged</p>
                    <p className="text-lg font-black text-dark mt-1">{orders.length} orders</p>
                  </div>
                </div>

                <div className="bg-clay-light/35 p-5 rounded-3xl border border-clay/60 flex items-center gap-4 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Package className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Pending Delivery</p>
                    <p className="text-lg font-black text-dark mt-1">{pendingOrdersCount} dispatches</p>
                  </div>
                </div>

                <div className="bg-clay-light/35 p-5 rounded-3xl border border-clay/60 flex items-center gap-4 shadow-sm">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Total Saved</p>
                    <p className="text-lg font-black text-dark mt-1">AED {convertPrice(totalDiscountDistributed, 'AED').toLocaleString()}</p>
                  </div>
                </div>

              </div>

              {/* Sourcing Cost & Net Profit Ledger - Admin Only */}
              <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    <div>
                      <h4 className="font-serif text-xs font-black text-emerald-900 uppercase tracking-widest">Boutique Profitability Ledger (व्यवसाय नाफा र लागत बही)</h4>
                      <p className="text-[10px] text-neutral-500">Live cost metrics based on active orders & configured catalog buying costs.</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center bg-emerald-600/10 text-emerald-800 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-600/20 font-mono">
                    🔒 Admin Only View
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-lg">
                      📥
                    </div>
                    <div>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Total Buying Cost (हामीलाई परेको कुल रकम)</p>
                      <p className="text-base font-black text-dark mt-0.5">AED {convertPrice(totalCostOfGoodsSold, 'AED').toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                      💸
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Total Net Profit (हामीलाई आएको खुद नाफा)</p>
                      <p className="text-base font-black text-emerald-800 mt-0.5 font-mono">AED {convertPrice(totalNetProfit, 'AED').toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
                      📈
                    </div>
                    <div>
                      <p className="text-[9px] text-brand font-bold uppercase tracking-wider">Overall Margin / Markup</p>
                      <p className="text-base font-black text-brand mt-0.5 font-mono">
                        {totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : '0'}% / {overallProfitPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SMART ADVANCED CONTROL CENTER: 7-DAY RECHARTS LINE CHART & COMMAND CONSOLE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. 7-Day Total Orders Placed Line Chart (8 cols) */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-clay shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-clay-light pb-4 mb-4 gap-2">
                      <div>
                        <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wide flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-brand" />
                          7-Day Orders Placed (गत ७ दिनको अर्डर चार्ट)
                        </h4>
                        <p className="text-neutral-400 text-[10px] font-light">Interactive Recharts line chart tracking daily total orders placed over the past week.</p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[9px] bg-brand/10 text-brand px-2.5 py-1 rounded-md font-bold uppercase tracking-wider font-mono">
                          Recharts Analytics
                        </span>
                      </div>
                    </div>

                    {/* Recharts Line Chart for Total Orders */}
                    {(() => {
                      const last7DaysData = getLast7DaysSales().map(d => ({
                        date: d.label,
                        day: d.dayName,
                        orders: d.orderCount,
                        sales: convertPrice(d.sales, 'AED'),
                        fullLabel: `${d.dayName}, ${d.label}`
                      }));

                      const total7DayOrders = last7DaysData.reduce((acc, curr) => acc + curr.orders, 0);

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs px-2">
                            <span className="text-neutral-500 font-medium">7-Day Total Orders: <strong className="text-dark font-extrabold">{total7DayOrders} orders</strong></span>
                            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              ● Live Orders Trend
                            </span>
                          </div>

                          <div className="w-full h-60 pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={last7DaysData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece1" vertical={false} />
                                <XAxis 
                                  dataKey="day" 
                                  tick={{ fontSize: 11, fill: '#666666', fontWeight: 600 }} 
                                  axisLine={{ stroke: '#e5e0d8' }}
                                  tickLine={false}
                                />
                                <YAxis 
                                  allowDecimals={false} 
                                  tick={{ fontSize: 11, fill: '#888888' }} 
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-dark text-white p-3 rounded-2xl shadow-2xl border border-brand/40 text-xs space-y-1 font-sans">
                                          <p className="font-serif font-bold text-amber-300 uppercase tracking-wider text-[11px]">{data.fullLabel}</p>
                                          <div className="pt-1 border-t border-white/10 space-y-1">
                                            <p className="text-white font-bold flex items-center justify-between gap-4">
                                              <span>📦 Total Orders Placed:</span>
                                              <span className="font-extrabold text-amber-400 text-sm">{data.orders} {data.orders === 1 ? 'order' : 'orders'}</span>
                                            </p>
                                            <p className="text-neutral-300 flex items-center justify-between gap-4 text-[11px]">
                                              <span>💰 Sales Revenue:</span>
                                              <span className="font-semibold text-emerald-300">AED {data.sales.toLocaleString()}</span>
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="orders" 
                                  name="Total Orders" 
                                  stroke="#c5a880" 
                                  strokeWidth={3} 
                                  activeDot={{ r: 7, fill: '#111111', stroke: '#c5a880', strokeWidth: 2 }}
                                  dot={{ r: 4, fill: '#ffffff', stroke: '#c5a880', strokeWidth: 2.5 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="border-t border-clay-light pt-4 mt-4 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                    <span>💡 Interactive Recharts visualization: Hover over data nodes for detailed daily order counts</span>
                    <span className="font-bold text-emerald-600">Recharts Engine</span>
                  </div>
                </div>

                {/* 2. Smart Boutique Command Center (4 cols) */}
                <div className="lg:col-span-4 bg-dark text-white p-6 rounded-3xl border border-neutral-800 shadow-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                      <Zap className="w-5 h-5 text-brand animate-pulse" />
                      <div>
                        <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">Smart Boutique Control</h4>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5">Execute administrative macros instantly</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {/* Macro 1: Bulk Restock Low-Stock Items */}
                      <button
                        onClick={() => {
                          let count = 0;
                          products.forEach(p => {
                            if (p.stockCount !== undefined && p.stockCount < 5) {
                              onUpdateProduct({
                                ...p,
                                stockCount: (p.stockCount || 0) + 15,
                                inStock: true
                              });
                              count++;
                            }
                          });
                          setSimulationToast(`⚡ Restocked +15 units for ${count} low-stock products!`);
                          setTimeout(() => setSimulationToast(''), 3000);
                        }}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-left text-[11px] font-bold p-3 rounded-2xl transition border border-white/5 flex items-center justify-between group cursor-pointer"
                        title="Search cosmetics with low quantities and top up to standard levels"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-brand" />
                          <div>
                            <p className="text-white">Replenish All Stock</p>
                            <p className="text-[9px] text-neutral-400 font-light">Set all low-stock counts to +15</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Macro 2: Auto-Approve Pending Orders */}
                      <button
                        onClick={() => {
                          let count = 0;
                          orders.forEach(o => {
                            if (o.status === 'Pending') {
                              onUpdateOrderStatus(o.id, 'Confirmed');
                              count++;
                            }
                          });
                          setSimulationToast(`✅ Instantly approved & confirmed ${count} pending boutique orders!`);
                          setTimeout(() => setSimulationToast(''), 3000);
                        }}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-left text-[11px] font-bold p-3 rounded-2xl transition border border-white/5 flex items-center justify-between group cursor-pointer"
                        title="Instantly shift all incoming orders to Confirmed status to prepare for luxury wrapping"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="text-white">Auto-Verify Orders</p>
                            <p className="text-[9px] text-neutral-400 font-light">Approve all 'Pending Review' checkouts</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Macro 3: Simulate Premium Golden VIP Order */}
                      <button
                        onClick={() => {
                          if (products.length === 0) return;
                          const randId = `MC-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
                          const firstProd = products[0];
                          const secondProd = products[1] || products[0];
                          
                          const vipOrder: Order = {
                            id: randId,
                            customerName: 'Aishwarya Shah (VIP Privilege Client)',
                            customerPhone: '9801122334',
                            customerAddress: 'Jhamsikhel Lane 4, Lalitpur (Boutique Hub)',
                            deliveryLocationId: 'loc-ktm',
                            deliveryLocationName: 'Kathmandu Valley Ringroad',
                            deliveryFee: 100,
                            paymentMethod: 'Bank Transfer',
                            items: [
                              {
                                productId: firstProd.id,
                                productName: firstProd.name,
                                price: firstProd.price,
                                discountPercent: firstProd.discountPercent || 15,
                                quantity: 2,
                                image: firstProd.image
                              },
                              {
                                productId: secondProd.id,
                                productName: secondProd.name,
                                price: secondProd.price,
                                discountPercent: secondProd.discountPercent || 20,
                                quantity: 3,
                                image: secondProd.image
                              }
                            ],
                            subtotal: 0,
                            discountAmount: 0,
                            total: 0,
                            status: 'Pending',
                            createdAt: new Date().toISOString(),
                            notes: 'Simulated high-net-worth client acquisition. Package with luxury silk ribbons and standard authenticity guarantee cards.',
                            paymentStatus: 'Verified',
                            statusLogs: [
                              {
                                status: 'Pending',
                                note: 'Simulated VIP order generated on boutique admin console.',
                                timestamp: new Date().toISOString()
                              }
                            ]
                          };

                          // Compute financial parameters
                          let sub = 0;
                          let disc = 0;
                          vipOrder.items.forEach(it => {
                            const itemSub = it.price * it.quantity;
                            const itemDisc = Math.round(itemSub * (it.discountPercent / 100));
                            sub += itemSub;
                            disc += itemDisc;
                          });
                          vipOrder.subtotal = sub;
                          vipOrder.discountAmount = disc;
                          vipOrder.total = sub - disc + vipOrder.deliveryFee;

                          if (onAddOrder) {
                            onAddOrder(vipOrder);
                          } else {
                            orders.push(vipOrder);
                          }
                          setSimulationToast(`👑 Generated Simulated VIP Order: AED ${convertPrice(vipOrder.total, 'AED').toLocaleString()}!`);
                          setTimeout(() => setSimulationToast(''), 3000);
                        }}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-left text-[11px] font-bold p-3 rounded-2xl transition border border-white/5 flex items-center justify-between group cursor-pointer"
                        title="Generate a high-value simulated custom order to populate charts and ledgers"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingCart className="w-4 h-4 text-brand" />
                          <div>
                            <p className="text-white">Simulate VIP Purchase</p>
                            <p className="text-[9px] text-neutral-400 font-light">Generate sample order worth &gt; AED 400</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Macro 4: Dynamic Campaign Toggler (-25% Discount) */}
                      <button
                        onClick={() => {
                          products.forEach(p => {
                            onUpdateProduct({
                              ...p,
                              discountPercent: 25
                            });
                          });
                          setSimulationToast('🎈 Campaign Launch: Automatically set all catalog discounts to 25%!');
                          setTimeout(() => setSimulationToast(''), 3000);
                        }}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-left text-[11px] font-bold p-3 rounded-2xl transition border border-white/5 flex items-center justify-between group cursor-pointer"
                        title="Instantly set 25% off across all active cosmetics products to simulate high-conversion sales"
                      >
                        <div className="flex items-center gap-2.5">
                          <Percent className="w-4 h-4 text-amber-400" />
                          <div>
                            <p className="text-white">Launch Monsoon Sale</p>
                            <p className="text-[9px] text-neutral-400 font-light">Set 25% discount across all products</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-1 transition-transform" />
                      </button>

                    </div>
                  </div>

                  <div className="border-t border-neutral-800 pt-3 mt-4 flex items-center justify-between text-[9px] text-neutral-500 font-mono">
                    <span>Engine Status: Active</span>
                    <span className="text-brand font-bold">Admin Console Connected</span>
                  </div>
                </div>

              </div>

              {/* Advanced Middle Section: Target Goal Progress and Category Performance split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Monthly Target Sales Tracker widget */}
                <div className="bg-gradient-to-br from-bg-warm to-white p-6 rounded-3xl border border-clay shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-brand text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Monthly Target Goal</span>
                        <h4 className="font-serif text-lg font-bold text-dark mt-2.5">Boutique Revenue Goal</h4>
                      </div>
                      
                      {!editingGoal ? (
                        <button
                          onClick={() => { setTempGoal(monthlyGoal.toString()); setEditingGoal(true); }}
                          className="text-[10px] text-brand hover:underline font-bold"
                        >
                          ⚙️ Adjust Target
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(e.target.value)}
                            className="w-24 px-2 py-1 text-xs border border-clay rounded-lg bg-white"
                          />
                          <button
                            onClick={() => handleSaveGoal(tempGoal)}
                            className="bg-dark text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-brand"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingGoal(false)}
                            className="text-[9px] text-neutral-400 px-1 hover:text-dark"
                          >
                            X
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-5">
                      <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                        {/* Custom SVG dynamic donut dial chart */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            className="stroke-neutral-200 fill-none"
                            strokeWidth="8"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            className="stroke-brand fill-none transition-all duration-1000"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(100, (totalRevenue / monthlyGoal)) / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-base font-black text-dark">
                            {Math.round((totalRevenue / monthlyGoal) * 100)}%
                          </span>
                          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wide">Achieved</span>
                        </div>
                      </div>

                      <div className="space-y-1 font-sans">
                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Current Achievement</p>
                        <p className="text-lg font-black text-dark">AED {convertPrice(totalRevenue, 'AED').toLocaleString()}</p>
                        <p className="text-xs text-neutral-500 font-light">
                          Target Goal: <span className="font-bold text-neutral-700">AED {convertPrice(monthlyGoal, 'AED').toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-clay-light pt-4.5 mt-5">
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-light">
                      {totalRevenue >= monthlyGoal 
                        ? '🎉 Amazing! The boutique has fully surpassed this month\'s target. Excellent marketing coordination!' 
                        : `We are AED ${convertPrice(Math.max(0, monthlyGoal - totalRevenue), 'AED').toLocaleString()} away from our monthly threshold.`}
                    </p>
                  </div>
                </div>

                {/* 2. Cosmetics Category Sales Breakdown widget */}
                <div className="bg-white p-6 rounded-3xl border border-clay shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wide">Sales Contribution by Category</h4>
                    <p className="text-neutral-400 text-[10px] font-light mt-0.5">AED subtotal values mapped directly from active retail customer checkouts.</p>
                    
                    <div className="mt-4.5 space-y-3.5">
                      {Array.from(new Set(products.map(p => p.category))).map((cat) => {
                        // Calculate specific subtotal for this category
                        let catTotal = 0;
                        orders.filter(o => o.status !== 'Cancelled').forEach(o => {
                          o.items.forEach(it => {
                            const match = products.find(p => p.id === it.productId || p.name === it.productName);
                            if (match && match.category === cat) {
                              catTotal += it.price * it.quantity;
                            } else if (!match && cat === 'Cosmetics') {
                              // Fallback for demo products matching Cosmetics default
                              catTotal += it.price * it.quantity;
                            }
                          });
                        });

                        const ratio = totalRevenue > 0 ? (catTotal / totalRevenue) * 100 : 0;
                        
                        return (
                          <div key={cat} className="space-y-1 font-sans text-xs">
                            <div className="flex justify-between font-bold text-dark text-[11px]">
                              <span>{cat}</span>
                              <span className="font-mono text-neutral-500">Rs. {catTotal.toLocaleString('en-IN')} ({Math.round(ratio)}%)</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-brand h-full rounded-full transition-all duration-700" 
                                style={{ width: `${Math.max(3, ratio)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Actionable Low Stock Notification Center & Simulation Playground */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Low Stock Alerts Center */}
                <div className="bg-white p-6 rounded-3xl border border-clay shadow-sm">
                  <div className="flex items-center justify-between border-b border-clay-light pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                      <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wide">Live Low-Stock Alerts</h4>
                    </div>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-black">
                      {products.filter(p => p.stockCount !== undefined && p.stockCount < 5).length} Warning
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {products.filter(p => p.stockCount !== undefined && p.stockCount < 5).length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto" />
                        <p className="text-xs text-neutral-500 font-bold mt-2">All Products Fully Stocked!</p>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5">No immediate cosmetic items require restock replenishment.</p>
                      </div>
                    ) : (
                      products
                        .filter(p => p.stockCount !== undefined && p.stockCount < 5)
                        .map((p) => (
                          <div key={p.id} className="flex justify-between items-center bg-clay-light/25 p-3 rounded-2xl border border-clay/50 text-xs">
                            <div className="min-w-0 flex-grow">
                              <p className="font-bold text-dark truncate">{p.name}</p>
                              <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                                Current Stock: <span className="font-mono text-red-600 font-bold">{p.stockCount} left</span>
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                onUpdateProduct({
                                  ...p,
                                  stockCount: (p.stockCount || 0) + 10,
                                  inStock: true
                                });
                                setSimulationToast(`📈 Restocked +10 Units for "${p.name}"!`);
                                setTimeout(() => setSimulationToast(''), 2500);
                              }}
                              className="bg-dark hover:bg-brand text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition"
                            >
                              ⚡ Restock +10
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* 2. Simulation Playground controls (Highly useful for testing) */}
                <div className="bg-neutral-900 text-white p-6 rounded-3xl border border-neutral-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand" />
                      <h4 className="font-serif text-base font-bold text-white uppercase tracking-wide">Boutique Testing Playground</h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-light mt-1.5">
                      Simulate real-time business activities instantly. Ideal for validating WhatsApp alerts, invoice PDF generation, currency ratios, and rating recalculations.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <button
                        onClick={handleSimulateNewOrder}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase tracking-wider py-3 px-2 rounded-xl transition border border-white/5 text-center flex flex-col items-center justify-center gap-1.5"
                        title="Inject a random simulated incoming checkout order"
                      >
                        <ShoppingCart className="w-4 h-4 text-brand" />
                        <span>Simulate Order</span>
                      </button>

                      <button
                        onClick={handleSimulateReview}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase tracking-wider py-3 px-2 rounded-xl transition border border-white/5 text-center flex flex-col items-center justify-center gap-1.5"
                        title="Inject a random simulated positive customer review"
                      >
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>Simulate Review</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4.5 mt-5 flex justify-between items-center text-[9px] text-neutral-400 font-mono">
                    <span>Engine: Local Live Mode</span>
                    <span className="text-brand">Active & Ready</span>
                  </div>
                </div>

              </div>

              {/* 3. Live Customer Carts Tracker (Abandoned Cart Recovery Hub) */}
              <div className="bg-white p-6 rounded-3xl border border-clay shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-clay-light pb-4 gap-2">
                  <div>
                    <h4 className="font-serif text-lg font-black text-dark uppercase tracking-wide flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-brand" />
                      Live Customer Carts Tracker
                    </h4>
                    <p className="text-neutral-500 text-[11px] font-light mt-0.5">Track products added to carts by active visitors and send instant recovery notifications.</p>
                  </div>
                  <span className="text-[10px] bg-brand/10 text-brand px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    {activeCarts.length} Active Shopping Sessions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeCarts.map((cart) => {
                    const totalCartPrice = cart.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);
                    return (
                      <div key={cart.id} className="bg-clay-light/20 border border-clay rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:shadow-md transition">
                        <div className="space-y-3">
                          {/* Top row */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-bold text-dark text-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                {cart.customerName}
                              </p>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">+{cart.phone}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] bg-white border border-clay-light px-2 py-0.5 rounded-md text-neutral-500 font-medium block">
                                {cart.lastStep}
                              </span>
                              <span className="text-[9px] text-neutral-400 font-light mt-1 block font-mono">{cart.updatedAt}</span>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-2 border-t border-dashed border-clay-light pt-2.5">
                            {cart.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-600">
                                <img src={item.image} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded object-cover border border-clay-light" />
                                <div className="min-w-0 flex-grow">
                                  <p className="font-medium text-dark truncate">{item.productName}</p>
                                  <p className="text-[10px] text-neutral-400">Rs. {item.price.toLocaleString('en-IN')} x {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total & Action */}
                        <div className="border-t border-clay-light pt-3 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold block">Estimated Total</span>
                            <span className="font-extrabold text-dark text-sm">Rs. {totalCartPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <button
                            onClick={() => handleSendCartNotification(cart)}
                            className="inline-flex items-center gap-1.5 bg-dark hover:bg-brand text-white text-[9px] font-bold uppercase tracking-wider py-2 px-3 rounded-xl transition cursor-pointer shadow-sm"
                            title="Send discount coupon & recovery reminder via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Notify Client</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Multi-currency instructions card */}
              <div className="bg-bg-warm/40 border border-clay rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand" />
                  <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wide">Automated Checkout and Shipping rules</h4>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Mahi Creations uses an intelligent multi-currency system to serve clients in Nepal, UAE, India, Europe, and the US simultaneously. When you add a new cosmetic product, input its base price in NPR (Nepali Rupees). The system automatically converts and formats prices dynamically using real-time currency ratios on the client storefront. Delivery fees are applied according to the customer's selected geographical area!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="inline-flex items-center gap-2 bg-dark hover:bg-brand text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    Manage Makeup Inventory &rarr;
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* MANAGE PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-dark uppercase tracking-wide">Registered Makeup Products</h3>
                  <p className="text-neutral-500 text-xs font-light">Add, edit, or delete items from the public e-commerce store catalog.</p>
                </div>
                {!isAdding && !isEditing && (
                  <button
                    onClick={handleOpenAddForm}
                    className="inline-flex items-center gap-2 bg-dark hover:bg-brand text-white text-xs font-bold uppercase tracking-widest px-4.5 py-3 rounded-xl cursor-pointer transition-all self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Cosmetic Item
                  </button>
                )}
              </div>

              {/* Add/Edit Product form overlay card */}
              {(isAdding || isEditing) && (
                <div className="bg-bg-warm p-6 rounded-3xl border border-clay shadow-inner max-w-2xl">
                  <div className="flex items-center justify-between border-b border-clay pb-3 mb-5">
                    <h5 className="font-serif text-base font-bold text-dark uppercase tracking-wide">
                      {isEditing ? `Edit Item: ${isEditing.name}` : 'Add Premium Cosmetic Item'}
                    </h5>
                    <button onClick={resetForm} className="text-neutral-400 hover:text-dark cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Name */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Product Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mahi Waterproof Lash Extender"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Category</label>
                        <input
                          type="text"
                          required
                          list="category-suggestions"
                          placeholder="e.g. Cosmetics"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                        />
                        <datalist id="category-suggestions">
                          {Array.from(new Set(products.map(p => p.category))).map(cat => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>

                      {/* Brand / Company */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Brand / Company Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Mahi Creations"
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                      {/* Price input strictly in AED */}
                      <div className="space-y-1 col-span-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">
                          Price (AED)
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={formPrice}
                          onChange={(e) => setFormPrice(Number(e.target.value))}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                          placeholder="Price in AED"
                        />
                      </div>

                      {/* Buying Cost strictly in AED */}
                      <div className="space-y-1 col-span-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">
                          Buying Cost (AED)
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={formCostPrice}
                          onChange={(e) => setFormCostPrice(Number(e.target.value))}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                          placeholder="Cost in AED"
                        />
                      </div>

                      {/* Discount percent */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Discount (%)</label>
                        <input
                          type="number"
                          required
                          min={0}
                          max={100}
                          value={formDiscountPercent}
                          onChange={(e) => setFormDiscountPercent(Number(e.target.value))}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                        />
                      </div>

                      {/* In Stock toggle */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Availability</label>
                        <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={formInStock}
                            onChange={(e) => setFormInStock(e.target.checked)}
                            className="w-4.5 h-4.5 accent-brand rounded cursor-pointer"
                          />
                          <span className="font-semibold text-dark text-xs uppercase tracking-wider">In Stock</span>
                        </label>
                      </div>

                      {/* Visibility toggle */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Visibility</label>
                        <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={formIsVisible}
                            onChange={(e) => setFormIsVisible(e.target.checked)}
                            className="w-4.5 h-4.5 accent-brand rounded cursor-pointer"
                          />
                          <span className="font-semibold text-dark text-xs uppercase tracking-wider">Show on Web</span>
                        </label>
                      </div>

                      {/* Stock Inventory Count */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 block mb-1">Inventory Stock</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={formStockCount}
                          onChange={(e) => setFormStockCount(Number(e.target.value))}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                          placeholder="e.g. 10"
                        />
                      </div>
                    </div>

                    {/* Live Profitability Projection Banner */}
                    {(() => {
                      const originalPrice = Number(formPrice) || 0;
                      const cost = Number(formCostPrice) || 0;
                      const discountVal = (originalPrice * Number(formDiscountPercent || 0)) / 100;
                      const activeSellingPrice = originalPrice - discountVal;
                      const profit = activeSellingPrice - cost;
                      const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;
                      const marginPercent = activeSellingPrice > 0 ? (profit / activeSellingPrice) * 100 : 0;
                      
                      return (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-1 animate-fade-in">
                          <div className="flex items-center gap-3">
                            <span className="bg-emerald-600 text-white rounded-full p-2 text-xs flex items-center justify-center">
                              📊
                            </span>
                            <div>
                              <p className="font-black text-emerald-900 uppercase text-[9px] tracking-widest">Auto profit percentage calculator</p>
                              <p className="text-neutral-500 text-[10px] mt-0.5">
                                Unit Sell: <span className="font-semibold text-dark">{formPriceCurrency} {activeSellingPrice.toLocaleString()}</span> | 
                                Unit Cost: <span className="font-semibold text-dark">{formPriceCurrency} {cost.toLocaleString()}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-5 items-center text-right sm:border-l sm:border-emerald-200 sm:pl-5 w-full sm:w-auto justify-between sm:justify-end">
                            <div>
                              <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Profit Amount</p>
                              <p className="font-mono font-black text-emerald-800 text-xs sm:text-sm">
                                {formPriceCurrency} {profit.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Markup / Profit Margin</p>
                              <p className="font-mono font-black text-brand text-xs sm:text-sm">
                                {markupPercent.toFixed(1)}% / {marginPercent.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Formulation & Description Details</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Enter short makeup formulation details..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand resize-none font-medium text-dark"
                      />
                    </div>

                    {/* Multiple Product Images & Photo Upload */}
                    <div className="space-y-2 border border-clay bg-clay-light/20 rounded-2xl p-4.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 block font-bold">
                          Product Photos (Multiple Photos Support)
                        </label>
                        <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold">
                          {formImages.length} photo(s) added
                        </span>
                      </div>

                      {/* File Upload & URL Addition Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* File Upload Block */}
                        <div className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center bg-white text-center transition relative cursor-pointer group ${
                          isFileUploading 
                            ? 'border-brand/80 bg-brand/5 pointer-events-none' 
                            : 'border-clay-dark/60 hover:bg-clay-light/30'
                        }`}>
                          {!isFileUploading && (
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setIsFileUploading(true);
                                  const filesArray = Array.from(e.target.files) as File[];
                                  try {
                                    for (const file of filesArray) {
                                      try {
                                        const uploadedUrl = await uploadImageToServer(file);
                                        setFormImages(prev => {
                                          if (prev.includes(uploadedUrl)) return prev;
                                          return [...prev, uploadedUrl];
                                        });
                                      } catch (error) {
                                        alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
                                      }
                                    }
                                  } finally {
                                    setIsFileUploading(false);
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                          )}
                          
                          {isFileUploading ? (
                            <>
                              <RefreshCw className="w-5 h-5 text-brand animate-spin mb-1" />
                              <span className="text-[10px] font-extrabold text-brand block animate-pulse">Compressing & Saving...</span>
                              <span className="text-[8px] text-neutral-500 block mt-0.5">Please wait, optimizing photo sizes</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📸</span>
                              <span className="text-[10px] font-bold text-dark block">Upload Local Photos</span>
                              <span className="text-[9px] text-neutral-400 block mt-0.5">Drag & drop or click to select</span>
                            </>
                          )}
                        </div>

                        {/* URL input box */}
                        <div className="flex flex-col justify-between space-y-1.5 bg-white border border-clay p-3 rounded-xl">
                          <span className="text-[10px] font-bold text-neutral-600">Add Photo from Unsplash / Web URL</span>
                          <div className="flex gap-1">
                            <input
                              type="url"
                              id="temp_url_input"
                              placeholder="Paste image URL..."
                              className="flex-grow text-[11px] border border-clay rounded-lg p-1.5 bg-neutral-50 focus:bg-white focus:outline-none focus:border-brand font-mono text-dark"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const val = input.value.trim();
                                  if (val) {
                                    setFormImages(prev => {
                                      if (prev.includes(val)) return prev;
                                      return [...prev, val];
                                    });
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById('temp_url_input') as HTMLInputElement;
                                if (el && el.value.trim()) {
                                  const val = el.value.trim();
                                  setFormImages(prev => {
                                    if (prev.includes(val)) return prev;
                                    return [...prev, val];
                                  });
                                  el.value = '';
                                }
                              }}
                              className="bg-dark hover:bg-brand text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                          <span className="text-[8px] text-neutral-400 leading-normal">Press Enter or click Add to append the photo URL to this product.</span>
                        </div>
                      </div>

                      {/* Displaying Current Added Images as Thumbnails */}
                      {formImages.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Manage added photos (Click cover badge to set as Primary photo)</p>
                          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-clay shadow-inner">
                            {formImages.map((img, idx) => {
                              const isPrimary = formImage === img || (idx === 0 && !formImage);
                              return (
                                <div key={idx} className="relative w-14 h-16 rounded-lg border border-clay overflow-hidden group/thumb flex-shrink-0 bg-neutral-100">
                                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                  
                                  {/* Delete Photo Badge */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormImages(prev => prev.filter((_, i) => i !== idx));
                                      if (formImage === img) {
                                        setFormImage(''); // Reset primary so first remaining or fallback will be picked
                                      }
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] shadow opacity-0 group-hover/thumb:opacity-100 transition duration-150 cursor-pointer z-20"
                                    title="Remove photo"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>

                                  {/* Primary Selector Indicator */}
                                  <button
                                    type="button"
                                    onClick={() => setFormImage(img)}
                                    className={`absolute inset-x-0 bottom-0 py-0.5 text-[8px] text-center font-bold transition z-10 cursor-pointer ${
                                      isPrimary 
                                        ? 'bg-brand text-white' 
                                        : 'bg-black/60 text-white/80 opacity-0 group-hover/thumb:opacity-100 hover:bg-brand'
                                    }`}
                                  >
                                    {isPrimary ? 'Cover ★' : 'Set Cover'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form CTA Actions */}
                    <div className="flex gap-2 justify-end pt-3.5 border-t border-clay">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-clay hover:bg-clay-dark text-neutral-700 px-4 py-2 rounded-lg cursor-pointer transition uppercase tracking-wider font-bold text-[10px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-dark hover:bg-brand text-white px-5 py-2 rounded-lg cursor-pointer font-bold transition uppercase tracking-widest text-[10px]"
                      >
                        {isEditing ? 'Update Makeup Item' : 'Add to Catalog'}
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Aligned listing with search filters, brand tags, and currency flag logos */}
              {(() => {
                const getCurrencyVisual = (code?: string) => {
                  const cleanCode = code || 'NPR';
                  switch (cleanCode) {
                    case 'AED': return { flag: '🇦🇪', label: 'UAE Dirham', symbol: 'AED' };
                    case 'USD': return { flag: '🇺🇸', label: 'US Dollar', symbol: '$' };
                    case 'EUR': return { flag: '🇪🇺', label: 'Euro', symbol: '€' };
                    case 'NPR': return { flag: '🇳🇵', label: 'Nepalese Rupee', symbol: 'Rs.' };
                    case 'INR': return { flag: '🇮🇳', label: 'Indian Rupee', symbol: '₹' };
                    default: return { flag: '🪙', label: cleanCode, symbol: 'Rs.' };
                  }
                };

                const availableBrands = Array.from(new Set(products.map(p => p.brand || 'Mahi Creations')));
                const filteredProducts = products.filter(p => {
                  const pBrand = p.brand || 'Mahi Creations';
                  const matchesSearch = p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                        pBrand.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                        p.category.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                        p.id.toLowerCase().includes(productSearchQuery.toLowerCase());
                  const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
                  const matchesBrand = productBrandFilter === 'All' || pBrand === productBrandFilter;
                  return matchesSearch && matchesCategory && matchesBrand;
                });

                return (
                  <div className="space-y-4">
                    {/* Search & Brand/Category Filters */}
                    {!isAdding && !isEditing && (
                      <div className="bg-bg-warm/40 p-4.5 rounded-2xl border border-clay grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center mb-4">
                        {/* Search Bar */}
                        <div className="relative">
                          <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Search Products / Brands</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={productSearchQuery}
                              onChange={(e) => setProductSearchQuery(e.target.value)}
                              placeholder="Search name, brand, category..."
                              className="w-full text-xs border border-clay rounded-lg pl-8 pr-3 py-2.5 bg-white focus:outline-none focus:border-brand font-medium text-dark"
                            />
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Filter by Category</label>
                          <select
                            value={productCategoryFilter}
                            onChange={(e) => setProductCategoryFilter(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand cursor-pointer font-semibold text-dark"
                          >
                            <option value="All">All Categories</option>
                            {Array.from(new Set(products.map(p => p.category))).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Brand / Company Filter */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Filter by Brand / Company</label>
                          <select
                            value={productBrandFilter}
                            onChange={(e) => setProductBrandFilter(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:border-brand cursor-pointer font-semibold text-dark"
                          >
                            <option value="All">All Brands / Companies</option>
                            {availableBrands.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Info summary */}
                    {!isAdding && !isEditing && (
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider px-1">
                        <span>Showing {filteredProducts.length} of {products.length} products</span>
                        {productBrandFilter !== 'All' && (
                          <span className="text-brand">Matching Brand: {productBrandFilter}</span>
                        )}
                      </div>
                    )}

                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-2xl border border-clay">
                        <p className="text-xs font-bold text-neutral-400">No matching products found.</p>
                      </div>
                    ) : (
                      <div 
                        ref={productsScrollContainerRef}
                        className="max-h-[680px] overflow-y-auto border border-clay rounded-3xl bg-neutral-50/55 p-4.5 scrollbar-thin"
                      >
                        <div style={{ paddingTop: productsTopPadding, paddingBottom: productsBottomPadding }}>
                          <div className="space-y-3">
                            {visibleProductRows.flatMap(row => row).map((p) => {
                              const discountedPrice = p.price - (p.price * p.discountPercent / 100);
                              const prodBrand = p.brand || 'Mahi Creations';

                              return (
                                <div
                                  key={p.id}
                                  className="bg-white p-3.5 rounded-2xl border border-clay hover:border-brand hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in"
                                >
                                  {/* Left: Thumbnail & Info (Image, ID, Title, Brand, Category) */}
                                  <div className="flex items-center gap-3.5 flex-grow min-w-0 w-full md:w-auto">
                                    <div className="w-11 h-14 bg-clay-light/45 border border-clay rounded-xl overflow-hidden flex-shrink-0 relative shadow-xs">
                                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-0.5 left-0.5 text-[7px] bg-black/75 text-white px-1 rounded font-mono font-black">
                                        {p.id}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                      <h5 className="font-serif text-[12.5px] font-black text-dark tracking-tight leading-tight truncate" title={p.name}>
                                        {p.name}
                                      </h5>
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-brand bg-brand/5 border border-brand/10 px-1 rounded-md">
                                          {p.category}
                                        </span>
                                        <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-neutral-500 bg-neutral-50 border border-clay px-1 rounded-md">
                                          {prodBrand}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Middle-Left: Stock availability */}
                                  <div className="flex items-center gap-3.5 justify-between w-full md:w-32 flex-shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-dashed border-clay-light">
                                    <span className={`inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider ${
                                      p.inStock ? 'text-emerald-700' : 'text-rose-700'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                      {p.inStock ? 'In Stock' : 'Sold Out'}
                                    </span>
                                    {p.stockCount !== undefined && (
                                      <span className="font-mono font-bold text-[9.5px] text-neutral-400">
                                        Stock: {p.stockCount}
                                      </span>
                                    )}
                                  </div>

                                  {/* Middle: AED Price & Discount info */}
                                  <div className="flex flex-col items-start md:items-end w-full md:w-32 flex-shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-dashed border-clay-light">
                                    <div className="text-[11.5px] font-black text-dark font-mono">
                                      AED {convertPrice(discountedPrice, 'AED').toLocaleString()}
                                    </div>
                                    {p.discountPercent > 0 ? (
                                      <div className="text-[8px] font-bold text-rose-600 line-through font-mono">
                                        AED {convertPrice(p.price, 'AED').toLocaleString()} (-{p.discountPercent}%)
                                      </div>
                                    ) : (
                                      <div className="text-[8px] text-neutral-400 font-medium tracking-wide uppercase">Standard Price</div>
                                    )}
                                  </div>

                                  {/* Middle-Right: Cost & Profit analysis in AED only */}
                                  {(() => {
                                    const costNpr = p.costPrice || Math.round(p.price * 0.6);
                                    const profitNpr = discountedPrice - costNpr;
                                    const markup = costNpr > 0 ? (profitNpr / costNpr) * 100 : 0;
                                    
                                    // AED conversions directly
                                    const costAed = convertPrice(costNpr, 'AED');
                                    const saleAed = convertPrice(discountedPrice, 'AED');
                                    const profitAed = saleAed - costAed;

                                    return (
                                      <div className="flex items-center gap-4 justify-between w-full md:w-56 flex-shrink-0 bg-emerald-50/50 border border-emerald-100/60 px-3 py-1.5 rounded-xl text-[10px] border-t md:border-t-0 pt-2 md:pt-0">
                                        <div className="text-left">
                                          <span className="text-[7.5px] text-neutral-400 block uppercase tracking-wider font-extrabold">Cost (AED)</span>
                                          <span className="font-bold text-neutral-600 font-mono">
                                            {costAed.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[7.5px] text-emerald-600 block uppercase tracking-wider font-extrabold">Net Profit (नाफा)</span>
                                          <span className="font-mono font-black text-emerald-700">
                                            AED {profitAed.toLocaleString()} ({markup.toFixed(0)}%)
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Right: Actions */}
                                  <div className="flex items-center gap-3 justify-end w-full md:w-52 flex-shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-dashed border-clay-light">
                                    <button
                                      onClick={() => handleOpenEditForm(p)}
                                      className="text-brand hover:text-dark inline-flex items-center gap-1 cursor-pointer transition-colors font-bold text-[9px] uppercase tracking-wider"
                                    >
                                      <Edit className="w-3 h-3" />
                                      Edit
                                    </button>

                                    <button
                                      onClick={() => {
                                        onUpdateProduct({
                                          ...p,
                                          isVisible: p.isVisible !== false ? false : true
                                        });
                                      }}
                                      className={`inline-flex items-center gap-1 cursor-pointer transition-colors font-bold text-[9px] uppercase tracking-wider ${
                                        p.isVisible !== false ? 'text-emerald-600 hover:text-emerald-800' : 'text-neutral-400 hover:text-neutral-600'
                                      }`}
                                      title={p.isVisible !== false ? "Visible on shop. Click to Hide" : "Hidden from shop. Click to Show"}
                                    >
                                      {p.isVisible !== false ? (
                                        <>
                                          <Eye className="w-3 h-3" />
                                          Show
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="w-3 h-3" />
                                          Hide
                                        </>
                                      )}
                                    </button>
                                    
                                    <button
                                      onClick={() => setSharingProduct(p)}
                                      className="text-neutral-500 hover:text-dark inline-flex items-center gap-1 cursor-pointer transition-colors font-bold text-[9px] uppercase tracking-wider"
                                      title="Social Sharing"
                                    >
                                      <Share2 className="w-3 h-3 text-brand" />
                                      Share
                                    </button>

                                    <button
                                      onClick={() => onDeleteProduct(p.id)}
                                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 cursor-pointer transition-colors font-bold text-[9px] uppercase tracking-wider"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Del
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          )}

          {/* CUSTOMER ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-dark uppercase tracking-wide">Customer Checkout List</h3>
                  <p className="text-neutral-500 text-xs font-light">Track incoming payments, delivery states, and customer contact parameters.</p>
                </div>
              </div>

              {/* ADVANCED MULTI-LEVEL FILTER CONTROL FOR CUSTOMER ORDERS */}
              <div className="bg-bg-warm/40 border border-clay rounded-2xl p-4.5 space-y-4">
                
                {/* Row 1: Search and Standard Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  <div className="md:col-span-6 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search Order ID, Client name, phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-clay rounded-xl text-xs text-dark focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-clay rounded-xl text-xs text-dark font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-clay rounded-xl text-xs text-dark font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      <option value="All">All Payments</option>
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="eSewa">eSewa Wallet</option>
                      <option value="Khalti">Khalti Wallet</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Premium Group Separators and Time Period Filters */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t border-clay-light/80 pt-4">
                  {/* Status Group Filters */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] uppercase tracking-wider font-black text-neutral-400">Delivery Group Separation</p>
                    <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-clay-light max-w-max">
                      {[
                        { key: 'all', label: '🗂️ All' },
                        { key: 'active', label: '🚚 Active Deliveries' },
                        { key: 'completed', label: '✅ Completed' },
                        { key: 'cancelled', label: '❌ Cancelled' }
                      ].map((grp) => (
                        <button
                          key={grp.key}
                          type="button"
                          onClick={() => setOrderGroupFilter(grp.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                            orderGroupFilter === grp.key
                              ? 'bg-brand text-white shadow-sm font-extrabold'
                              : 'text-neutral-500 hover:text-dark hover:bg-neutral-50'
                          }`}
                        >
                          {grp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Filters */}
                  <div className="space-y-1.5 xl:text-right">
                    <p className="text-[9px] uppercase tracking-wider font-black text-neutral-400 xl:pr-1">Order Time Period</p>
                    <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-clay-light max-w-max xl:ml-auto">
                      {[
                        { key: 'all', label: 'All Time' },
                        { key: 'daily', label: 'Today (Daily)' },
                        { key: 'monthly', label: 'This Month' },
                        { key: 'yearly', label: 'This Year' }
                      ].map((tm) => (
                        <button
                          key={tm.key}
                          type="button"
                          onClick={() => setOrderTimeFilter(tm.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                            orderTimeFilter === tm.key
                              ? 'bg-dark text-white shadow-sm font-extrabold'
                              : 'text-neutral-500 hover:text-dark hover:bg-neutral-50'
                          }`}
                        >
                          {tm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 font-medium flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-clay-light">
                  <span>Showing <strong className="text-dark font-black">{getFilteredOrders().length}</strong> of {orders.length} total orders logged</span>
                  <button 
                    onClick={() => {
                      setOrderSearch('');
                      setOrderStatusFilter('All');
                      setOrderPaymentFilter('All');
                      setOrderGroupFilter('all');
                      setOrderTimeFilter('all');
                    }}
                    className="text-brand hover:underline font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Filters
                  </button>
                </div>

              </div>

              {getFilteredOrders().length === 0 ? (
                <div className="text-center py-16 bg-clay-light/35 border border-clay rounded-3xl space-y-3">
                  <p className="font-serif text-lg font-bold text-dark">No Matching Orders Found</p>
                  <p className="text-neutral-500 text-xs font-light max-w-md mx-auto">No custom makeup checkouts meet your currently active filter selections. Try resetting the filters or typing a different search term!</p>
                </div>
              ) : (
                <div 
                  ref={ordersScrollContainerRef}
                  className="max-h-[600px] overflow-y-auto border border-clay rounded-2xl bg-white shadow-sm scrollbar-thin relative"
                >
                  <table className="min-w-full text-xs text-neutral-600 text-left relative">
                    <thead className="bg-clay-light border-b border-clay uppercase tracking-[0.15em] text-[10px] text-neutral-500 font-bold sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Location & Address</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Progress State</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-clay-light font-medium">
                      {ordersTopPadding > 0 && (
                        <tr>
                          <td colSpan={6} style={{ height: ordersTopPadding }} />
                        </tr>
                      )}
                      {visibleOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-bg-warm/30 transition">
                          
                          {/* Order ID */}
                          <td className="p-4 font-mono font-black text-dark">
                            {o.id}
                          </td>

                          {/* Customer info */}
                          <td className="p-4 space-y-0.5">
                            <p className="font-bold text-dark">{o.customerName}</p>
                            <p className="text-neutral-400 font-mono text-[11px]">{o.customerPhone}</p>
                            <p className="text-[10px] text-neutral-500 italic truncate max-w-[150px]">
                              {o.items.map(it => `${it.productName} (x${it.quantity})`).join(', ')}
                            </p>
                          </td>

                          {/* Location details */}
                          <td className="p-4 space-y-0.5">
                            <p className="font-semibold text-dark">{o.deliveryLocationName}</p>
                            <p className="text-neutral-400 font-light text-[10px] truncate max-w-[150px]">{o.customerAddress}</p>
                          </td>

                          {/* NPR Total */}
                          <td className="p-4">
                            <p className="font-bold text-dark">Rs. {o.total.toLocaleString('en-IN')}</p>
                            <p className="text-[9px] text-brand font-bold">Saved: -Rs. {o.discountAmount.toLocaleString('en-IN')}</p>
                            <p className="text-[9px] text-neutral-400 font-medium">Method: {o.paymentMethod}</p>
                          </td>

                          {/* Current progress */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              o.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : o.status === 'Cancelled'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-brand/10 text-brand animate-pulse'
                            }`}>
                              ● {o.status}
                            </span>
                          </td>

                          {/* Status progression triggers */}
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <select
                                value={o.status}
                                onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                                className="text-[10px] font-bold bg-white border border-clay rounded p-1.5 focus:outline-none focus:border-brand cursor-pointer text-dark font-sans"
                              >
                                <option value="Pending">Pending Review</option>
                                <option value="Confirmed">Confirm Order</option>
                                <option value="Packaging">Pack order</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Deliver Saman</option>
                                <option value="Cancelled">Cancel order</option>
                              </select>

                              <button
                                onClick={() => openTrackingManagement(o)}
                                title="Manage Detailed Tracking Logs & Courier"
                                className="inline-flex items-center gap-1 bg-brand hover:bg-dark text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer font-sans"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                Track
                              </button>

                              <button
                                onClick={() => setPrintingOrder(o)}
                                title="Print Luxury Boutique Invoice"
                                className="inline-flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-clay transition cursor-pointer font-sans"
                              >
                                <Printer className="w-3.5 h-3.5 text-neutral-500" />
                                Invoice
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                      {ordersBottomPadding > 0 && (
                        <tr>
                          <td colSpan={6} style={{ height: ordersBottomPadding }} />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* CUSTOMER REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-dark uppercase tracking-wide">Customer Feedback & Reviews</h3>
                  <p className="text-neutral-500 text-xs font-light">
                    Monitor, audit, and inspect client comments and star ratings submitted for Mahi Creations boutique.
                  </p>
                </div>
                
                {/* Stats box inside tab */}
                <div className="flex gap-4 bg-clay-light/20 border border-clay p-3 rounded-2xl">
                  <div className="text-center px-4 py-1.5 border-r border-clay/60">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Feedbacks</p>
                    <p className="text-lg font-black text-dark">{reviews.length}</p>
                  </div>
                  <div className="text-center px-4 py-1.5">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Average Rating</p>
                    <p className="text-lg font-black text-brand flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter and Sort Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-clay-light/20 p-3 rounded-2xl border border-clay">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search reviews by name, product, or comment..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-clay rounded-xl text-xs focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                  {reviewSearch && (
                    <button 
                      onClick={() => setReviewSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="review-sort-select" className="text-neutral-500 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                    Sort By:
                  </label>
                  <select
                    id="review-sort-select"
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value as any)}
                    className="bg-white border border-clay rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:ring-2 focus:ring-brand focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Date: Newest First</option>
                    <option value="oldest">Date: Oldest First</option>
                    <option value="rating-desc">Rating: Highest to Lowest (5★ → 1★)</option>
                    <option value="rating-asc">Rating: Lowest to Highest (1★ → 5★)</option>
                  </select>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-bg-warm/10 rounded-2xl border border-clay/80 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-clay-light flex items-center justify-center text-neutral-400 mx-auto">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark uppercase tracking-wide">No reviews submitted yet</h4>
                    <p className="text-neutral-400 text-xs max-w-xs mx-auto leading-normal font-light">
                      Customer feedback posted via the VIP portal will automatically list here for your boutique audit!
                    </p>
                  </div>
                </div>
              ) : filteredAndSortedReviews.length === 0 ? (
                <div className="text-center py-12 bg-bg-warm/10 rounded-2xl border border-clay/80 space-y-2">
                  <p className="font-bold text-dark text-sm">No reviews matching "{reviewSearch}"</p>
                  <button 
                    onClick={() => setReviewSearch('')}
                    className="text-xs text-brand underline font-semibold hover:text-amber-700"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-clay rounded-2xl bg-white shadow-sm">
                  <table className="min-w-full text-xs text-neutral-600 text-left">
                    <thead className="bg-clay-light/40 border-b border-clay uppercase tracking-[0.15em] text-[10px] text-neutral-500 font-bold">
                      <tr>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Rating Star</th>
                        <th className="p-4">Detailed Comment</th>
                        <th className="p-4">Show on Home/Shop?</th>
                        <th className="p-4">Submitted At</th>
                        {onDeleteReview && <th className="p-4 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-clay-light">
                      {filteredAndSortedReviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-bg-warm/30 transition">
                          
                          {/* Customer name */}
                          <td className="p-4 font-bold text-dark flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-clay-light text-neutral-700 flex items-center justify-center font-bold">
                              {rev.customerName[0]?.toUpperCase() || 'U'}
                            </div>
                            <span>{rev.customerName}</span>
                          </td>

                          {/* Product name */}
                          <td className="p-4 font-semibold text-neutral-800 max-w-[150px] truncate">
                            {rev.productName}
                          </td>

                          {/* Rating Star */}
                          <td className="p-4">
                            <div className="flex items-center gap-0.5 text-brand">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-neutral-200'}`} />
                              ))}
                            </div>
                          </td>

                          {/* Comment text */}
                          <td className="p-4 text-neutral-500 font-light italic max-w-xs whitespace-normal break-words">
                            "{rev.comment}"
                          </td>

                          {/* Approved Tick Switch */}
                          <td className="p-4">
                            <label className="relative inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!rev.approved}
                                onChange={() => onToggleReviewApproval && onToggleReviewApproval(rev.id)}
                                className="w-4 h-4 rounded text-brand focus:ring-brand border-clay cursor-pointer"
                              />
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${rev.approved ? 'text-green-600' : 'text-neutral-400'}`}>
                                {rev.approved ? 'Ticked (Live)' : 'Unticked (Hidden)'}
                              </span>
                            </label>
                          </td>

                          {/* Date */}
                          <td className="p-4 text-neutral-400 font-mono text-[10px]">
                            {new Date(rev.createdAt).toLocaleString()}
                          </td>

                          {/* Action */}
                          {onDeleteReview && (
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  if (confirm('Delete this customer feedback review permanently?')) {
                                    onDeleteReview(rev.id);
                                  }
                                }}
                                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Remove feedback"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* BOUTIQUE SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-xl font-bold text-dark uppercase tracking-wide">Boutique & Profile Settings</h3>
                <p className="text-neutral-500 text-xs font-light">Configure credentials, dynamic WhatsApp contact number, and public social profile channels.</p>
              </div>

              {settingsSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {settingsSuccess}
                </div>
              )}

              {/* Settings Sub-Tabs Navigation to minimize scrolling - Single line, scrollable */}
              <div className="flex flex-nowrap overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-center gap-1.5 p-1 bg-neutral-100 rounded-xl w-full border border-clay-light/80 pb-2">
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('credentials')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'credentials'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Credentials</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('socials')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'socials'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp, Socials & Branding</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('showcase')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'showcase'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Showcase Display</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('footer')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'footer'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Footer & Colors</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('promo-slides')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'promo-slides'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
                  <span>Promo Posts & Ads</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('homepage')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'homepage'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Homepage Copy & Texts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('sourcing')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'sourcing'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-brand" />
                  <span>Sourcing VIP Banner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('payments')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'payments'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-brand" />
                  <span>Payments & Accounts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('seo')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    settingsSubTab === 'seo'
                      ? 'bg-white text-brand shadow-sm font-extrabold'
                      : 'text-neutral-500 hover:text-dark'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-brand" />
                  <span>SEO & Meta Tags</span>
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs text-neutral-600">
                
                {/* Credentials section */}
                {settingsSubTab === 'credentials' && (
                  <div id="settings-credentials" className="scroll-mt-24 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-4 animate-fade-in">
                  <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4 text-brand" />
                    Admin Authentication Credentials
                  </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">Admin Login Username</label>
                        <input
                          type="text"
                          required
                          value={tempUser}
                          onChange={(e) => setTempUser(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">Admin Login Password</label>
                        <input
                          type="password"
                          required
                          value={tempPassword}
                          onChange={(e) => setTempPassword(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Enabled Currencies Config Section */}
                    <div className="border-t border-clay/60 pt-5 mt-4 space-y-3">
                      <h5 className="font-serif text-xs font-bold text-dark uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-brand" />
                        Enabled Boutique Currencies (सक्षम गरिएका मुद्राहरू)
                      </h5>
                      <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
                        Select which currencies are active in your boutique. By default only <strong>AED</strong> is active. You can enable multiple currencies; customers can select their preferred currency from the navbar dropdown.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(['AED', 'USD', 'EUR', 'NPR', 'INR'] as CurrencyCode[]).map((code) => {
                          const isChecked = tempEnabledCurrencies.includes(code);
                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={() => {
                                let updated: CurrencyCode[];
                                if (isChecked) {
                                  if (tempEnabledCurrencies.length <= 1) return; // Maintain at least 1 currency
                                  updated = tempEnabledCurrencies.filter(c => c !== code);
                                } else {
                                  updated = [...tempEnabledCurrencies, code];
                                }
                                setTempEnabledCurrencies(updated);
                              }}
                              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                                isChecked
                                  ? 'bg-dark text-brand border-dark shadow-md scale-105'
                                  : 'bg-white text-neutral-400 border-clay/70 hover:text-neutral-700 hover:border-neutral-400'
                              }`}
                            >
                              <span className="text-sm">
                                {code === 'NPR' ? '🇳🇵' : code === 'AED' ? '🇦🇪' : code === 'USD' ? '🇺🇸' : code === 'EUR' ? '🇪🇺' : '🇮🇳'}
                              </span>
                              <span>{code}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                </div>
                )}

                {/* Primary Contact channel (WhatsApp number) & Social Profiles */}
                {settingsSubTab === 'socials' && (
                <div id="settings-socials" className="scroll-mt-24 space-y-6 animate-fade-in">
                    <div className="bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-4">
                      <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        Primary Contact Number (WhatsApp)
                      </h4>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">WhatsApp Mobile Number (With Country Code, No Spaces or +)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9779802058364"
                          value={tempWhatsapp}
                          onChange={(e) => setTempWhatsapp(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-semibold text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                        />
                        <p className="text-[10px] text-neutral-400 mt-1">This number will automatically power all floating chat bubbles and order summary direct redirection parameters.</p>
                      </div>
                    </div>

                    <div className="bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-4">
                      <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-brand" />
                        Official Social Profiles Directory Links
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Facebook */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                            <Facebook className="w-3.5 h-3.5 text-blue-600" />
                            Facebook Link
                          </label>
                          <input
                            type="url"
                            value={tempFb}
                            onChange={(e) => setTempFb(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-medium text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="e.g. https://facebook.com/..."
                          />
                        </div>

                        {/* TikTok */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                            <span className="font-sans font-black text-xs text-dark">🎵</span>
                            TikTok Profile Link
                          </label>
                          <input
                            type="url"
                            value={tempTiktok}
                            onChange={(e) => setTempTiktok(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-medium text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="e.g. https://tiktok.com/@..."
                          />
                        </div>

                        {/* Instagram */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                            <Instagram className="w-3.5 h-3.5 text-pink-600" />
                            Instagram Profile Link
                          </label>
                          <input
                            type="url"
                            value={tempInsta}
                            onChange={(e) => setTempInsta(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-medium text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="e.g. https://instagram.com/..."
                          />
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                            <Linkedin className="w-3.5 h-3.5 text-blue-700" />
                            LinkedIn Profile Link
                          </label>
                          <input
                            type="url"
                            value={tempLinkedin}
                            onChange={(e) => setTempLinkedin(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-medium text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="e.g. https://linkedin.com/in/..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brand Logo & Web Favicon Settings */}
                    <div className="bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-6">
                      <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand" />
                        Boutique Branding Assets (Logo & Favicon Web Icon)
                      </h4>
                      <p className="text-[11px] text-neutral-500 -mt-2 leading-relaxed">
                        Configure your boutique logo and website favicon tab icon (febction logo). Images are fully <strong>auto-adjusted</strong> to preserve their proportions and display perfectly.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* 1. Logo Customization */}
                        <div className="bg-white p-4 rounded-xl border border-clay/60 space-y-3">
                          <div>
                            <p className="text-[11px] font-bold text-dark uppercase tracking-wider flex items-center gap-1">
                              <span>Shop Header Logo</span>
                              <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-full normal-case">Auto-Adjusted</span>
                            </p>
                            <p className="text-[9px] text-neutral-400 font-light mt-0.5">Upload or paste an image URL to change your store's primary logo.</p>
                          </div>
                          
                          {/* Upload logo */}
                          <div className="border border-dashed border-clay-dark/50 rounded-xl p-3 flex flex-col items-center justify-center bg-white text-center hover:bg-clay-light/20 transition relative cursor-pointer min-h-[90px] group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const uploadedUrl = await uploadImageToServer(e.target.files[0]);
                                    setTempLogoUrl(uploadedUrl);
                                  } catch (err) {
                                    alert('Failed to upload logo: ' + (err instanceof Error ? err.message : 'Unknown error'));
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <span className="text-lg mb-1 group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-[9px] font-bold text-dark block">Upload Shop Logo</span>
                            <span className="text-[8px] text-neutral-400 block">Click or drag & drop</span>
                          </div>

                          {/* Paste logo URL */}
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase font-bold text-neutral-400">Or Paste Logo Image Link</label>
                            <input
                              type="text"
                              value={tempLogoUrl.startsWith('data:image/') ? '' : tempLogoUrl}
                              onChange={(e) => setTempLogoUrl(e.target.value)}
                              className="w-full text-[10px] border border-clay rounded-lg p-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand font-mono text-dark"
                              placeholder="Paste logo URL"
                            />
                          </div>

                          {/* Live logo preview */}
                          <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg border border-clay-light">
                            <div className="w-12 h-12 rounded border border-clay-light bg-white flex items-center justify-center overflow-hidden">
                              <img
                                src={tempLogoUrl}
                                alt="Logo Preview"
                                referrerPolicy="no-referrer"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/src/assets/images/mahi_logo_new_1783763329444.jpg';
                                }}
                              />
                            </div>
                            <div className="text-[9px] text-neutral-500 leading-normal">
                              <p className="font-bold text-dark">Auto-Fit System Active</p>
                              <p>Landscape, square, or custom shape logos will fit in the navbar and footer automatically.</p>
                            </div>
                          </div>
                        </div>

                        {/* 2. Favicon Customization */}
                        <div className="bg-white p-4 rounded-xl border border-clay/60 space-y-3">
                          <div>
                            <p className="text-[11px] font-bold text-dark uppercase tracking-wider flex items-center gap-1">
                              <span>Website Favicon (Web Icon)</span>
                              <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full normal-case">Browser Tab</span>
                            </p>
                            <p className="text-[9px] text-neutral-400 font-light mt-0.5">Upload or paste an image URL to change the browser tab favicon icon.</p>
                          </div>
                          
                          {/* Upload favicon */}
                          <div className="border border-dashed border-clay-dark/50 rounded-xl p-3 flex flex-col items-center justify-center bg-white text-center hover:bg-clay-light/20 transition relative cursor-pointer min-h-[90px] group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const uploadedUrl = await uploadImageToServer(e.target.files[0]);
                                    setTempFaviconUrl(uploadedUrl);
                                  } catch (err) {
                                    alert('Failed to upload favicon: ' + (err instanceof Error ? err.message : 'Unknown error'));
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🌐</span>
                            <span className="text-[9px] font-bold text-dark block">Upload Favicon Icon</span>
                            <span className="text-[8px] text-neutral-400 block">Click or drag & drop</span>
                          </div>

                          {/* Paste favicon URL */}
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase font-bold text-neutral-400">Or Paste Favicon Web Link</label>
                            <input
                              type="text"
                              value={tempFaviconUrl.startsWith('data:image/') ? '' : tempFaviconUrl}
                              onChange={(e) => setTempFaviconUrl(e.target.value)}
                              className="w-full text-[10px] border border-clay rounded-lg p-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand font-mono text-dark"
                              placeholder="Paste favicon URL"
                            />
                          </div>

                          {/* Live favicon preview */}
                          <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg border border-clay-light">
                            <div className="w-12 h-12 rounded border border-clay-light bg-white flex items-center justify-center overflow-hidden">
                              <img
                                src={tempFaviconUrl}
                                alt="Favicon Preview"
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/src/assets/images/mahi_logo_new_1783763329444.jpg';
                                }}
                              />
                            </div>
                            <div className="text-[9px] text-neutral-500 leading-normal">
                              <p className="font-bold text-dark">Live Browser Injection</p>
                              <p>Applied dynamically on save, auto-updated in document link elements.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
                )}

                {/* HOMEPAGE & SLIDER DISPLAY CONTROLS */}
                {settingsSubTab === 'showcase' && (
                <div id="settings-showcase" className="scroll-mt-24 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-6 animate-fade-in">
                    <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand" />
                      Boutique Showcase Display Controls
                    </h4>

                    {/* Showroom / About Me Photo URL Input */}
                    <div className="bg-white p-4 rounded-xl border border-clay/60 space-y-3 text-left">
                      <div>
                        <p className="text-[11px] font-bold text-dark uppercase tracking-wider">Main Boutique / Showroom Banner Photo</p>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5">Upload a local image from your device or paste a web URL to change the main boutique showroom photo.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Upload Area */}
                        <div className="md:col-span-5 border border-dashed border-clay-dark/50 rounded-xl p-3 flex flex-col items-center justify-center bg-white text-center hover:bg-clay-light/20 transition relative cursor-pointer group min-h-[110px]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                try {
                                  const uploadedUrl = await uploadImageToServer(file);
                                  setTempAboutImageUrl(uploadedUrl);
                                } catch (error) {
                                  alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
                                }
                              }
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                          />
                          <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📸</span>
                          <span className="text-[10px] font-bold text-dark block">Upload Local Image</span>
                          <span className="text-[8px] text-neutral-400 block mt-0.5">Click or drag & drop</span>
                        </div>

                        {/* Link Area */}
                        <div className="md:col-span-5 flex flex-col justify-center space-y-1.5 bg-white border border-clay/85 p-3 rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">Or Paste Web URL / Link</span>
                          <input
                            type="text"
                            value={tempAboutImageUrl.startsWith('data:image/') ? '' : tempAboutImageUrl}
                            onChange={(e) => setTempAboutImageUrl(e.target.value)}
                            className="w-full text-[11px] border border-clay rounded-lg p-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand font-mono text-dark"
                            placeholder="Paste https://... image link"
                          />
                          {tempAboutImageUrl.startsWith('data:image/') ? (
                            <p className="text-[8px] text-brand font-semibold leading-none">Currently using uploaded local file</p>
                          ) : (
                            <p className="text-[8px] text-neutral-400 leading-none">Enter standard web link</p>
                          )}
                        </div>

                        {/* Live Preview Area */}
                        <div className="md:col-span-2 flex flex-col items-center justify-center p-2 bg-neutral-50 rounded-xl border border-clay-light">
                          <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-extrabold mb-1 block">Preview</span>
                          <div className="w-full h-14 overflow-hidden rounded-md border border-clay-light bg-white flex items-center justify-center relative">
                            {tempAboutImageUrl ? (
                              <>
                                <img
                                  src={tempAboutImageUrl}
                                  alt="Showroom Preview"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                                {tempAboutImageUrl.startsWith('data:image/') && (
                                  <button
                                    type="button"
                                    onClick={() => setTempAboutImageUrl('/src/assets/images/mahi_about_me_1783496157685.jpg')}
                                    className="absolute top-0.5 right-0.5 bg-neutral-900/80 hover:bg-neutral-900 text-white p-0.5 rounded text-[8px]"
                                    title="Reset to default image"
                                  >
                                    Reset
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[8px] text-neutral-400 font-bold">Empty</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-neutral-400 font-light mt-1">Tap 'Save Boutique Settings' below to publish your changes permanently.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Home page list */}
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-clay/60">
                        <div>
                          <p className="text-[11px] font-bold text-dark uppercase tracking-wider">Home Page Products Catalog</p>
                          <p className="text-[10px] text-neutral-400 font-light mt-0.5">Check/tick products that should list on the home page gallery catalog.</p>
                        </div>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {products.map((p) => {
                            const isChecked = tempHomeProductIds.includes(p.id);
                            return (
                              <label key={`home-${p.id}`} className="flex items-center justify-between p-2 hover:bg-bg-warm/30 rounded-lg cursor-pointer border border-transparent hover:border-clay-light transition">
                                <div className="flex items-center gap-2.5">
                                  <img src={p.image} alt="" className="w-8 h-10 object-cover rounded border border-clay" referrerPolicy="no-referrer" />
                                  <div className="text-left">
                                    <p className="font-bold text-dark text-[11px] truncate max-w-[150px]">{p.name}</p>
                                    <p className="text-[9px] text-neutral-400 font-medium">{p.category}</p>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTempHomeProductIds([...tempHomeProductIds, p.id]);
                                    } else {
                                      setTempHomeProductIds(tempHomeProductIds.filter(id => id !== p.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand cursor-pointer"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Slider list */}
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-clay/60">
                        <div>
                          <p className="text-[11px] font-bold text-dark uppercase tracking-wider">Hero Slider / Carousel Products</p>
                          <p className="text-[10px] text-neutral-400 font-light mt-0.5">Check/tick products to highlight in the homepage top animated sliding slider.</p>
                        </div>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {products.map((p) => {
                            const isChecked = tempSliderProductIds.includes(p.id);
                            return (
                              <label key={`slider-${p.id}`} className="flex items-center justify-between p-2 hover:bg-bg-warm/30 rounded-lg cursor-pointer border border-transparent hover:border-clay-light transition">
                                <div className="flex items-center gap-2.5">
                                  <img src={p.image} alt="" className="w-8 h-10 object-cover rounded border border-clay" referrerPolicy="no-referrer" />
                                  <div className="text-left">
                                    <p className="font-bold text-dark text-[11px] truncate max-w-[150px]">{p.name}</p>
                                    <p className="text-[9px] text-neutral-400 font-medium">{p.category}</p>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTempSliderProductIds([...tempSliderProductIds, p.id]);
                                    } else {
                                      setTempSliderProductIds(tempSliderProductIds.filter(id => id !== p.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand cursor-pointer"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                </div>
                )}

                {/* CUSTOM FOOTER STYLING CONTROLS */}
                {settingsSubTab === 'footer' && (
                <div id="settings-footer" className="scroll-mt-24 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-4 animate-fade-in">
                    <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                      <Settings className="w-4 h-4 text-brand" />
                      Custom Footer Branding & Colors
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">Footer Background Color (Hex code or CSS)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={tempFooterBgColor}
                            onChange={(e) => setTempFooterBgColor(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-mono text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="e.g. #f9f6f4"
                          />
                          <input
                            type="color"
                            value={tempFooterBgColor.startsWith('#') && tempFooterBgColor.length === 7 ? tempFooterBgColor : '#f9f6f4'}
                            onChange={(e) => setTempFooterBgColor(e.target.value)}
                            className="w-10 h-10 border border-clay rounded-lg p-1 bg-white cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">Footer Text Color (Hex code or CSS)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={tempFooterTextColor}
                            onChange={(e) => setTempFooterTextColor(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-mono text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="e.g. #525252"
                          />
                          <input
                            type="color"
                            value={tempFooterTextColor.startsWith('#') && tempFooterTextColor.length === 7 ? tempFooterTextColor : '#525252'}
                            onChange={(e) => setTempFooterTextColor(e.target.value)}
                            className="w-10 h-10 border border-clay rounded-lg p-1 bg-white cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">Footer "About Us" Description Paragraph</label>
                        <textarea
                          required
                          rows={3}
                          value={tempFooterAbout}
                          onChange={(e) => setTempFooterAbout(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white font-medium text-dark focus:ring-1 focus:ring-brand focus:outline-none resize-none leading-relaxed"
                          placeholder="Describe your brand for footer..."
                        />
                      </div>
                    </div>

                    {/* Preset Buttons for footer color */}
                    <div className="flex flex-wrap gap-2.5 pt-1 items-center">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Presets:</span>
                      <button
                        type="button"
                        onClick={() => { setTempFooterBgColor('#f9f6f4'); setTempFooterTextColor('#525252'); }}
                        className="text-[9px] font-bold px-2.5 py-1 rounded border border-clay-light hover:bg-clay-light transition bg-[#f9f6f4] text-[#525252]"
                      >
                        Default Soft Warm Cream
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTempFooterBgColor('#171717'); setTempFooterTextColor('#eaded7'); }}
                        className="text-[9px] font-bold px-2.5 py-1 rounded border border-transparent hover:opacity-90 transition bg-[#171717] text-[#eaded7]"
                      >
                        Boutique Midnight Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTempFooterBgColor('#eaded7'); setTempFooterTextColor('#171717'); }}
                        className="text-[9px] font-bold px-2.5 py-1 rounded border border-transparent hover:opacity-90 transition bg-[#eaded7] text-[#171717]"
                      >
                        Boutique Clay Rose
                      </button>
                    </div>
                </div>
                )}

                {/* PROMO POSTS & ADS SECTION */}
                {settingsSubTab === 'promo-slides' && (
                <div id="settings-promo-slides" className="scroll-mt-24 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-6 animate-fade-in text-xs text-left">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-clay-light pb-3 gap-2">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand" />
                          Manage Homepage Promo Posts & Ads
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5 text-left">
                          Create, edit, or delete slide posts (usually 5 to 6) displayed in the homepage spotlight carousel.
                        </p>
                      </div>
                      
                      {!isAddingSlide && !editingSlideId && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingSlide(true);
                            setEditingSlideId(null);
                            setSlideFormTitle('');
                            setSlideFormSubtitle('');
                            setSlideFormDescription('');
                            setSlideFormImage('');
                            setSlideFormImageFit('cover');
                            setSlideFormLinkText('Explore Catalog');
                            setSlideFormLinkUrl('#shop-catalog');
                          }}
                          className="bg-brand text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-brand-hover shadow-xs cursor-pointer self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Post / Ad</span>
                        </button>
                      )}
                    </div>

                    {/* SLIDE ADD / EDIT FORM CONTAINER */}
                    {(isAddingSlide || editingSlideId) ? (
                      <div className="bg-white p-4.5 rounded-xl border border-clay-light/80 space-y-4 animate-fade-in shadow-xs text-left">
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                          <h5 className="font-serif text-xs font-bold uppercase tracking-wider text-brand">
                            {editingSlideId ? '✏️ Edit Spotlight Post' : '➕ Create New Spotlight Post'}
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSlide(false);
                              setEditingSlideId(null);
                            }}
                            className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-dark transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 block">Post Title *</label>
                            <input
                              type="text"
                              value={slideFormTitle}
                              onChange={(e) => setSlideFormTitle(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-medium focus:ring-1 focus:ring-brand focus:outline-none"
                              placeholder="e.g. Imperial Velvet Matte Lipstick"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 block">Subtitle / Offer Highlights *</label>
                            <input
                              type="text"
                              value={slideFormSubtitle}
                              onChange={(e) => setSlideFormSubtitle(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-medium focus:ring-1 focus:ring-brand focus:outline-none"
                              placeholder="e.g. 16-Hour Hydration Comfort Formulation"
                              required
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 block">Post Description Text *</label>
                            <textarea
                              rows={3}
                              value={slideFormDescription}
                              onChange={(e) => setSlideFormDescription(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-medium focus:ring-1 focus:ring-brand focus:outline-none resize-none leading-relaxed"
                              placeholder="Describe this post or ad beautifully..."
                              required
                            />
                          </div>

                           <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] uppercase font-bold text-neutral-500 block">Post Image / Ad Banner *</label>
                              <span className="text-[9px] text-brand font-black">PHOTO AUTOMATIC ADJUSTMENT SYSTEM</span>
                            </div>

                            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 mb-2 text-[10px] text-amber-900 leading-relaxed text-left">
                              <strong>📷 Banner Dimensions & Auto-Adjustment Guide:</strong>
                              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[9px]">
                                <li>Ideal size: <strong className="font-mono">1360 × 600 px</strong> or <strong className="font-mono">1200 × 520 px</strong> for wide banners.</li>
                                <li><em>नेपाली:</em> ब्यानरको फोटो राम्रो देखाउनको लागि चौडाई (width) <strong>1360 px</strong> र उचाई (height) <strong>600 px</strong> भएको फोटो राख्नुहोला।</li>
                                <li>Our system automatically scales, centers, and adjusts any photo you upload to fit flawlessly without distorting!</li>
                              </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Drag & Drop Upload Container */}
                              <div className="space-y-2">
                                <div 
                                  className="border-2 border-dashed border-clay hover:border-brand bg-neutral-50/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group min-h-[160px]"
                                  onClick={() => document.getElementById('slide-image-file-input')?.click()}
                                >
                                  <input
                                    id="slide-image-file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          if (typeof reader.result === 'string') {
                                            setSlideFormImage(reader.result);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <UploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-brand transition-colors mb-2" />
                                  <span className="text-[10px] font-bold text-dark uppercase tracking-wider block">
                                    Upload Banner Photo
                                  </span>
                                  <p className="text-[9px] text-neutral-400 mt-0.5">
                                    Drag & drop or click to select image (PNG, JPG, WebP)
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Or Paste Custom Image URL instead:</label>
                                  <input
                                    type="text"
                                    value={slideFormImage}
                                    onChange={(e) => setSlideFormImage(e.target.value)}
                                    className="w-full text-xs border border-clay rounded-lg p-2 bg-white text-dark font-mono focus:ring-1 focus:ring-brand focus:outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                  />
                                </div>
                              </div>

                              {/* Live Preview & Fitting Modes */}
                              <div className="flex flex-col justify-between border border-clay-light bg-neutral-50/50 p-4 rounded-2xl text-left">
                                <div className="space-y-3">
                                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Live Banner Aspect Preview:</span>
                                  
                                  {slideFormImage ? (
                                    <div className="relative aspect-[2.1/1] w-full rounded-xl overflow-hidden border border-neutral-200/60 bg-neutral-100 flex items-center justify-center">
                                      {slideFormImageFit === 'contain' ? (
                                        <>
                                          <div 
                                            className="absolute inset-0 bg-cover bg-center blur-md opacity-30 saturate-[1.2]"
                                            style={{ backgroundImage: `url(${slideFormImage})` }}
                                          />
                                          <img 
                                            src={slideFormImage} 
                                            alt="Preview" 
                                            className="relative max-h-full max-w-full object-contain z-10" 
                                          />
                                        </>
                                      ) : (
                                        <img 
                                          src={slideFormImage} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover object-center" 
                                        />
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setSlideFormImage('')}
                                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition z-20 cursor-pointer"
                                        title="Clear Image"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="aspect-[2.1/1] w-full rounded-xl border border-dashed border-clay flex flex-col items-center justify-center bg-white text-neutral-400 text-[10px] italic">
                                      No image selected or uploaded yet
                                    </div>
                                  )}

                                  {/* FIT CHOICE */}
                                  <div className="space-y-1 text-left">
                                    <label className="text-[9.5px] uppercase font-bold text-neutral-500 block">
                                      🔄 Banner Fit Mode (Auto-Adjust System)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setSlideFormImageFit('cover')}
                                        className={`py-1.5 px-3 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                                          slideFormImageFit === 'cover'
                                            ? 'bg-brand border-brand text-white shadow-xs'
                                            : 'bg-white border-clay text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                      >
                                        Cover (Auto-Crop)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSlideFormImageFit('contain')}
                                        className={`py-1.5 px-3 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition cursor-pointer text-center ${
                                          slideFormImageFit === 'contain'
                                            ? 'bg-brand border-brand text-white shadow-xs'
                                            : 'bg-white border-clay text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                      >
                                        Contain (Full Fit)
                                      </button>
                                    </div>
                                    <p className="text-[8.5px] text-neutral-400 mt-1 leading-normal">
                                      * <strong>Cover</strong> fills the slide beautifully. <strong>Contain</strong> scales the whole photo without cropping.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Preset Unsplash high-resolution recommendations */}
                            <div className="pt-2 text-left">
                              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Quick Premium Image Recommendations:</span>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSlideFormImage('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=90')}
                                  className="text-[9px] font-bold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-dark transition cursor-pointer"
                                >
                                  🎨 Eyeshadow Palette
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSlideFormImage('https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=90')}
                                  className="text-[9px] font-bold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-dark transition cursor-pointer"
                                >
                                  💄 Velvet Lipstick
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSlideFormImage('https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=90')}
                                  className="text-[9px] font-bold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-dark transition cursor-pointer"
                                >
                                  🧴 Glowing Base / Hydra
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSlideFormImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90')}
                                  className="text-[9px] font-bold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-dark transition cursor-pointer"
                                >
                                  👗 Traditional Organza Silk
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSlideFormImage('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=90')}
                                  className="text-[9px] font-bold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-dark transition cursor-pointer"
                                >
                                  💍 Bridal Kundan Jewels
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSlideFormImage('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=90')}
                                  className="text-[9px] font-bold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-dark transition cursor-pointer"
                                >
                                  🌸 Luxe Scent Perfumes
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 block">CTA Button Text</label>
                            <input
                              type="text"
                              value={slideFormLinkText}
                              onChange={(e) => setSlideFormLinkText(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-medium focus:ring-1 focus:ring-brand focus:outline-none"
                              placeholder="e.g. Explore Catalog / Order Now"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 block">Target Link URL or Section Anchor</label>
                            <input
                              type="text"
                              value={slideFormLinkUrl}
                              onChange={(e) => setSlideFormLinkUrl(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-mono focus:ring-1 focus:ring-brand focus:outline-none"
                              placeholder="#shop-catalog or custom external link"
                            />
                          </div>
                        </div>

                        {/* Slide form action buttons */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSlide(false);
                              setEditingSlideId(null);
                            }}
                            className="px-4 py-2 border border-clay rounded-xl hover:bg-neutral-50 transition cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!slideFormTitle.trim() || !slideFormSubtitle.trim() || !slideFormDescription.trim() || !slideFormImage.trim()) {
                                alert('Please fill in all starred (*) fields to save the promotional post.');
                                return;
                              }
                              
                              if (editingSlideId) {
                                // Update existing slide
                                setTempPromoSlides(prev =>
                                  prev.map(s => s.id === editingSlideId ? {
                                    id: editingSlideId,
                                    title: slideFormTitle.trim(),
                                    subtitle: slideFormSubtitle.trim(),
                                    description: slideFormDescription.trim(),
                                    image: slideFormImage.trim(),
                                    imageFit: slideFormImageFit,
                                    linkText: slideFormLinkText.trim(),
                                    linkUrl: slideFormLinkUrl.trim()
                                  } : s)
                                );
                              } else {
                                // Add new slide
                                const newSlide: PromoSlide = {
                                  id: 'slide_' + Date.now(),
                                  title: slideFormTitle.trim(),
                                  subtitle: slideFormSubtitle.trim(),
                                  description: slideFormDescription.trim(),
                                  image: slideFormImage.trim(),
                                  imageFit: slideFormImageFit,
                                  linkText: slideFormLinkText.trim(),
                                  linkUrl: slideFormLinkUrl.trim()
                                };
                                setTempPromoSlides(prev => [...prev, newSlide]);
                              }
                              
                              setIsAddingSlide(false);
                              setEditingSlideId(null);
                            }}
                            className="bg-brand text-white px-5 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-brand-hover shadow-xs cursor-pointer"
                          >
                            Apply Post
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* LIST OF DYNAMIC CAROUSEL SLIDES */
                      <div className="space-y-4 text-left">
                        {tempPromoSlides.length === 0 ? (
                          <div className="text-center py-10 bg-white border border-dashed border-clay rounded-2xl text-neutral-400 font-light space-y-2 text-xs">
                            <span>No promotional posts created yet.</span>
                            <p className="text-[10px]">Add slides to showcase custom advertisements on the homepage carousel!</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {tempPromoSlides.map((slide, index) => (
                              <div
                                key={slide.id}
                                className="bg-white border border-clay-light/80 rounded-2xl p-4 shadow-sm relative group flex flex-col justify-between text-left"
                              >
                                <div>
                                  {/* PHOTO FIRST visual representation */}
                                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 border border-neutral-100 bg-neutral-900 flex items-center justify-center">
                                    {slide.imageFit === 'contain' ? (
                                      <>
                                        <div 
                                          className="absolute inset-0 bg-cover bg-center blur-sm opacity-35"
                                          style={{ backgroundImage: `url(${slide.image})` }}
                                        />
                                        <img
                                          src={slide.image}
                                          alt={slide.title}
                                          className="relative max-h-full max-w-full object-contain z-10"
                                        />
                                      </>
                                    ) : (
                                      <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover object-center"
                                      />
                                    )}
                                    <div className="absolute top-2 left-2 bg-dark/70 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md z-20">
                                      Slide #{index + 1}
                                    </div>
                                  </div>

                                  <div className="space-y-1 text-left">
                                    <span className="text-[8px] font-bold text-brand uppercase tracking-wider block">
                                      {slide.subtitle}
                                    </span>
                                    <h5 className="font-serif text-xs font-bold text-dark uppercase truncate">
                                      {slide.title}
                                    </h5>
                                    <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                                      {slide.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="border-t border-neutral-100 mt-3 pt-3 flex items-center justify-between">
                                  <span className="text-[9px] font-mono text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded">
                                    {slide.linkText || 'Inquire Now'}
                                  </span>
                                  
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSlideId(slide.id);
                                        setSlideFormTitle(slide.title);
                                        setSlideFormSubtitle(slide.subtitle);
                                        setSlideFormDescription(slide.description);
                                        setSlideFormImage(slide.image);
                                        setSlideFormImageFit(slide.imageFit || 'cover');
                                        setSlideFormLinkText(slide.linkText || 'Explore Catalog');
                                        setSlideFormLinkUrl(slide.linkUrl || '#shop-catalog');
                                        setIsAddingSlide(false);
                                      }}
                                      className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-dark transition cursor-pointer"
                                      title="Edit Slide"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm('Are you sure you want to delete this promotional slide?')) {
                                          setTempPromoSlides(prev => prev.filter(s => s.id !== slide.id));
                                        }
                                      }}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition cursor-pointer"
                                      title="Delete Slide"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bg-brand/5 border border-brand/10 p-4 rounded-2xl flex items-start gap-2.5 text-left text-brand text-xs">
                          <Sparkles className="w-4 h-4 mt-0.5 animate-pulse flex-shrink-0" />
                          <div>
                            <span className="font-bold text-[10px] uppercase tracking-wider block">Live Persistence Warning</span>
                            <p className="text-[10px] text-brand/85 mt-0.5 leading-relaxed">
                              After managing your promo slides in this list, remember to click the main <strong>"SAVE BOUTIQUE SETTINGS"</strong> button below to save and synchronize all changes immediately onto your live homepage!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* HOMEPAGE COPY & TEXTS STYLING CONTROLS */}
                {settingsSubTab === 'homepage' && (
                <div id="settings-homepage" className="scroll-mt-24 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-6 animate-fade-in text-left">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                        <Home className="w-4 h-4 text-brand" />
                        Homepage Copy & Core Text Customizer
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                        Customize titles, descriptions, welcome slogans, and announcements of your boutique front page. Save settings to publish.
                      </p>
                    </div>

                    {/* INTERACTIVE BRAND PRESETS PANEL */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/80 p-5 rounded-2xl space-y-4">
                      <div>
                        <h5 className="font-serif text-xs font-black text-orange-900 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
                          Instant Sourcing & Copywriting Presets (द्रुत ब्रान्ड लेखन खाका)
                        </h5>
                        <p className="text-[10px] text-orange-700/80 font-medium mt-0.5 leading-relaxed">
                          Click any of the cards below to instantly load optimized premium copywriting into the fields. You can customize them further before saving!
                        </p>
                      </div>

                      {presetAppliedMessage && (
                        <div className="bg-orange-600 text-white p-3.5 rounded-xl text-[11px] font-black tracking-wide flex items-center gap-2 shadow-md animate-bounce">
                          <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
                          <span>{presetAppliedMessage}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* Preset 1: Dubai Luxury Sourcing (Primary) */}
                        <button
                          type="button"
                          onClick={() => applyHomepagePreset('dubai')}
                          className="group bg-white p-4 rounded-xl border border-orange-200 hover:border-orange-500 hover:shadow-lg transition-all duration-300 text-left space-y-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-black tracking-widest text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                              🇦🇪 Sourced in Dubai
                            </span>
                            <span className="text-xs group-hover:scale-125 transition-transform">💎</span>
                          </div>
                          <span className="block font-serif text-xs font-bold text-neutral-900">Dubai Hub & Worldwide Delivery</span>
                          <span className="block text-[10px] text-neutral-500 font-light leading-normal">
                            Loads high-end cosmetic formulations, bespoke jewelry, and bridal couture direct from Dubai distributing centers with global tracked delivery.
                          </span>
                          <span className="block text-[9px] font-extrabold text-orange-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                            Apply Dubai Theme &rarr;
                          </span>
                        </button>

                        {/* Preset 2: Kathmandu Traditional Boutique */}
                        <button
                          type="button"
                          onClick={() => applyHomepagePreset('kathmandu')}
                          className="group bg-white p-4 rounded-xl border border-neutral-200 hover:border-brand hover:shadow-lg transition-all duration-300 text-left space-y-1.5 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-black tracking-widest text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
                              🇳🇵 Jhamsikhel Boutique
                            </span>
                            <span className="text-xs group-hover:scale-125 transition-transform">🌸</span>
                          </div>
                          <span className="block font-serif text-xs font-bold text-neutral-900">Lalitpur Flagship Showroom</span>
                          <span className="block text-[10px] text-neutral-500 font-light leading-normal">
                            Loads standard traditional custom apparel, couture, and global cosmetics with focus on local Kathmandu Valley hand-delivery and regional express.
                          </span>
                          <span className="block text-[9px] font-extrabold text-brand uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                            Apply Kathmandu Theme &rarr;
                          </span>
                        </button>

                        {/* Preset 3: Clinical Skincare & Labs */}
                        <button
                          type="button"
                          onClick={() => applyHomepagePreset('skincare')}
                          className="group bg-white p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 text-left space-y-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              🔬 Clinical Skincare
                            </span>
                            <span className="text-xs group-hover:scale-125 transition-transform">🧪</span>
                          </div>
                          <span className="block font-serif text-xs font-bold text-neutral-900">Lab-Certified Science</span>
                          <span className="block text-[10px] text-neutral-500 font-light leading-normal">
                            Loads copy focusing strictly on batch verifications, dermaceutical certifications, anti-aging sciences, and medical skincare solutions.
                          </span>
                          <span className="block text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                            Apply Skincare Theme &rarr;
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Section 1: General Shop Settings */}
                    <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-neutral-500" />
                        1. Store Metadata & Top Announcements
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Store / Boutique Name</label>
                          <input
                            type="text"
                            value={tempShopName}
                            onChange={(e) => setTempShopName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="Mahi Creations"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Boutique Address & Sourcing Capitals</label>
                          <input
                            type="text"
                            value={tempShopAddress}
                            onChange={(e) => setTempShopAddress(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="Lalitpur, Jhamsikhel, Nepal"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Official Store Email</label>
                          <input
                            type="email"
                            value={tempAdminEmail}
                            onChange={(e) => setTempAdminEmail(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold text-brand"
                            placeholder="mahicreations369@gmail.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Top Header Announcement Bar Promo Text</label>
                        <input
                          type="text"
                          value={tempHeaderPromo}
                          onChange={(e) => setTempHeaderPromo(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                          placeholder="Announcements or promo codes to display at the top of the store..."
                        />
                      </div>
                    </div>

                    {/* Section 2: Top Hero Section Brand Copy */}
                    <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-neutral-500 animate-pulse" />
                        2. Hero Brand Welcome & Showcase Frame
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Hero Section Badge Tag</label>
                          <input
                            type="text"
                            value={tempHeroBadge}
                            onChange={(e) => setTempHeroBadge(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="Mahi Creations Boutique"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Showroom Photo Caption Overlay</label>
                          <input
                            type="text"
                            value={tempHeroImageCaption}
                            onChange={(e) => setTempHeroImageCaption(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                            placeholder="Mahi Creations Lalitpur, Jhamsikhel"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 bg-neutral-50/50 p-4 rounded-xl border border-clay-light text-left">
                        <label className="text-[9px] uppercase font-bold text-neutral-500 flex items-center gap-1.5">
                          <span>Main Showroom / Boutique Banner Photo</span>
                          <span className="text-[8px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-full font-bold">Upload or Link</span>
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Upload Area */}
                          <div className="md:col-span-5 border border-dashed border-clay-dark/50 rounded-xl p-3 flex flex-col items-center justify-center bg-white text-center hover:bg-clay-light/20 transition relative cursor-pointer group min-h-[110px]">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  try {
                                    const uploadedUrl = await uploadImageToServer(file);
                                    setTempAboutImageUrl(uploadedUrl);
                                  } catch (error) {
                                    alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-[10px] font-bold text-dark block">Upload Local Image</span>
                            <span className="text-[8px] text-neutral-400 block mt-0.5">Click or drag & drop</span>
                          </div>

                          {/* Link Area */}
                          <div className="md:col-span-5 flex flex-col justify-center space-y-1.5 bg-white border border-clay/80 p-3 rounded-xl">
                            <span className="text-[9px] uppercase font-bold text-neutral-500 block">Or Paste Web URL / Link</span>
                            <input
                              type="text"
                              value={tempAboutImageUrl.startsWith('data:image/') ? '' : tempAboutImageUrl}
                              onChange={(e) => setTempAboutImageUrl(e.target.value)}
                              className="w-full text-[11px] border border-clay rounded-lg p-2 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand font-mono text-dark"
                              placeholder="Paste https://... image link"
                            />
                            {tempAboutImageUrl.startsWith('data:image/') ? (
                              <p className="text-[8px] text-brand font-semibold leading-none">Currently using uploaded local file</p>
                            ) : (
                              <p className="text-[8px] text-neutral-400 leading-none">Enter standard web link</p>
                            )}
                          </div>

                          {/* Live Preview Area */}
                          <div className="md:col-span-2 flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-clay-light">
                            <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-extrabold mb-1 block">Preview</span>
                            <div className="w-full h-14 overflow-hidden rounded-md border border-clay-light bg-neutral-50 flex items-center justify-center relative">
                              {tempAboutImageUrl ? (
                                <>
                                  <img
                                    src={tempAboutImageUrl}
                                    alt="Showroom Preview"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80';
                                    }}
                                  />
                                  {tempAboutImageUrl.startsWith('data:image/') && (
                                    <button
                                      type="button"
                                      onClick={() => setTempAboutImageUrl('/src/assets/images/mahi_about_me_1783496157685.jpg')}
                                      className="absolute top-0.5 right-0.5 bg-neutral-900/80 hover:bg-neutral-900 text-white p-0.5 rounded text-[8px]"
                                      title="Reset to default image"
                                    >
                                      Reset
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-[8px] text-neutral-400">Empty</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-[9px] text-neutral-400 font-light mt-1">You can either upload an image directly from your phone/computer, or paste any Unsplash/online image link to change the main Boutique Showroom Photo.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Hero Slogan / Main Welcome Heading</label>
                        <textarea
                          rows={2}
                          value={tempHeroTitle}
                          onChange={(e) => setTempHeroTitle(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-serif font-semibold"
                          placeholder="e.g. Bridging Authenticity & Global Sourcing Luxury"
                        />
                        <p className="text-[9px] text-neutral-400 font-light">Tip: You can press enter to start a new line in the heading.</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Hero Section Sourcing Long Description</label>
                        <textarea
                          rows={3}
                          value={tempHeroDescription}
                          onChange={(e) => setTempHeroDescription(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none leading-relaxed"
                          placeholder="Welcome description explaining products and boutique values..."
                        />
                      </div>
                    </div>

                    {/* Section 3: Premium Catalog Heading */}
                    <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-neutral-500" />
                        3. Product Catalog Header texts
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Catalog Main Header Title</label>
                          <input
                            type="text"
                            value={tempCatalogTitle}
                            onChange={(e) => setTempCatalogTitle(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-serif font-bold"
                            placeholder="Our Premium Curations"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Catalog Subtitle Tagline</label>
                          <input
                            type="text"
                            value={tempCatalogSubtitle}
                            onChange={(e) => setTempCatalogSubtitle(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark"
                            placeholder="Showing authentic cosmetics displaying real-time stock levels"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Brand Story / About Us Elements */}
                    <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-500" />
                        4. About Us Section Content Paragraphs
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">About Section Badge tag</label>
                          <input
                            type="text"
                            value={tempAboutBadge}
                            onChange={(e) => setTempAboutBadge(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark"
                            placeholder="Our Legacy"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">About Section Main Heading Title</label>
                          <input
                            type="text"
                            value={tempAboutTitle}
                            onChange={(e) => setTempAboutTitle(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-serif font-bold"
                            placeholder="About Mahi Creations"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">About Section Subtitle Tagline</label>
                        <input
                          type="text"
                          value={tempAboutSubtitle}
                          onChange={(e) => setTempAboutSubtitle(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark"
                          placeholder="About description tagline..."
                        />
                      </div>
                      <div className="space-y-3 pt-2 border-t border-clay-light">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Paragraph 1 (Boutique Story Origins)</label>
                          <textarea
                            rows={3}
                            value={tempAboutPara1}
                            onChange={(e) => setTempAboutPara1(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark leading-relaxed font-light"
                            placeholder="Describe boutique origins, locations, standards..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Paragraph 2 (Skincare & Sourcing standards)</label>
                          <textarea
                            rows={3}
                            value={tempAboutPara2}
                            onChange={(e) => setTempAboutPara2(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark leading-relaxed font-light"
                            placeholder="Describe skincare safety standards, designer apparel selection..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Paragraph 3 (Delivery Guarantee & Assurance)</label>
                          <textarea
                            rows={3}
                            value={tempAboutPara3}
                            onChange={(e) => setTempAboutPara3(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark leading-relaxed font-light"
                            placeholder="Describe dispatch speed, compliance, support..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-brand/5 border border-brand/10 p-4 rounded-2xl flex items-start gap-2.5 text-left text-brand text-xs">
                      <Sparkles className="w-4 h-4 mt-0.5 animate-pulse flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider block">Unsaved Changes Notice</span>
                        <p className="text-[10px] text-brand/85 mt-0.5 leading-relaxed">
                          All changes edited on this tab are stored temporarily. Please click the main <strong>"SAVE ALL SETTINGS"</strong> button below to apply and publish them live to your storefront!
                        </p>
                      </div>
                    </div>
                </div>
                )}

                {/* Sourcing VIP Settings section */}
                {settingsSubTab === 'sourcing' && (
                <div id="settings-sourcing" className="scroll-mt-24 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-6 animate-fade-in text-left">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand" />
                        Exclusive Sourcing VIP Banner Customizer
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                        Customize the VIP Privilege Newsletter section. Set background photos, colors, apply a premium blur, and customize layout colors.
                      </p>
                    </div>

                    {/* Sourcing Texts */}
                    <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                        1. Section Titles & Description
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Banner Badge / Tagline</label>
                          <input
                            type="text"
                            value={tempSourcingBadge}
                            onChange={(e) => setTempSourcingBadge(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="Exclusive Sourcing Access"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Main Title Heading</label>
                          <input
                            type="text"
                            value={tempSourcingTitle}
                            onChange={(e) => setTempSourcingTitle(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-serif font-bold"
                            placeholder="Mahi Privilege List"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Long Sourcing Invite Description</label>
                        <textarea
                          rows={3}
                          value={tempSourcingDescription}
                          onChange={(e) => setTempSourcingDescription(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-light leading-relaxed"
                          placeholder="Subscribe for private invitations to global cosmetics..."
                        />
                      </div>
                    </div>

                    {/* Sourcing Background & Image Visuals */}
                    <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        2. Background Wallpaper, Sizing, & Blur Customizer
                      </h5>

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Custom Background Image URL</label>
                        <input
                          type="url"
                          value={tempSourcingBgUrl}
                          onChange={(e) => setTempSourcingBgUrl(e.target.value)}
                          className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-mono"
                          placeholder="e.g. https://images.unsplash.com/... (Leave empty for flat background)"
                        />
                      </div>

                      {/* Premium presets */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Quick Premium Background Wallpaper Presets</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { name: 'None (Solid Color)', url: '' },
                            { name: 'Luxury Cosmetic Sourcing', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200' },
                            { name: 'High-End Vanity Flatlay', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200' },
                            { name: 'Artisan Textile Studio', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200' }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setTempSourcingBgUrl(preset.url)}
                              className={`p-2 rounded-lg border text-left transition text-[10px] truncate flex flex-col justify-between ${
                                tempSourcingBgUrl === preset.url
                                  ? 'border-brand bg-brand/5 text-brand font-bold'
                                  : 'border-clay hover:bg-clay-light text-neutral-600'
                              }`}
                            >
                              <span className="block truncate">{preset.name}</span>
                              {preset.url ? (
                                <div className="w-full h-8 rounded-md mt-1 overflow-hidden">
                                  <img src={preset.url} alt="" className="w-full h-full object-cover animate-fade-in animate-duration-300" />
                                </div>
                              ) : (
                                <div className="w-full h-8 rounded-md mt-1 bg-neutral-100 border border-clay/40" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Same size / Sizing layout & Blur Customizer */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        {/* Background Color */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Fallback / Background Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={tempSourcingBgColor}
                              onChange={(e) => setTempSourcingBgColor(e.target.value)}
                              className="w-10 h-10 border border-clay rounded-lg cursor-pointer animate-fade-in"
                            />
                            <input
                              type="text"
                              value={tempSourcingBgColor}
                              onChange={(e) => setTempSourcingBgColor(e.target.value)}
                              className="text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-mono uppercase w-full"
                            />
                          </div>
                        </div>

                        {/* Text Color */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Text Content Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={tempSourcingTextColor}
                              onChange={(e) => setTempSourcingTextColor(e.target.value)}
                              className="w-10 h-10 border border-clay rounded-lg cursor-pointer animate-fade-in"
                            />
                            <input
                              type="text"
                              value={tempSourcingTextColor}
                              onChange={(e) => setTempSourcingTextColor(e.target.value)}
                              className="text-xs border border-clay rounded-lg p-2.5 bg-white text-dark font-mono uppercase w-full"
                            />
                          </div>
                        </div>

                        {/* Blur Amount */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Background Blur (Blor Effect)</label>
                            <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">{tempSourcingBgBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={tempSourcingBgBlur}
                            onChange={(e) => setTempSourcingBgBlur(Number(e.target.value))}
                            className="w-full h-1 bg-clay-light rounded-lg appearance-none cursor-pointer accent-brand mt-4"
                          />
                          <p className="text-[9px] text-neutral-400 mt-1">
                            {tempSourcingBgBlur === 0 ? 'No Blur (Pristine Photo)' : 'Beautiful frosted aesthetic. Content text is 100% sharp.'}
                          </p>
                        </div>
                      </div>

                      {/* Same Size Photo Sizing & Live Preview */}
                      <div className="bg-neutral-50 p-4 rounded-xl border border-clay-light space-y-2">
                        <span className="text-[9px] uppercase font-bold text-neutral-500 block">Live Banner Background Sizing Preview</span>
                        <div 
                          className="relative h-28 rounded-lg overflow-hidden flex items-center justify-center text-center border border-clay/60 shadow-xs animate-fade-in"
                          style={{ backgroundColor: tempSourcingBgColor }}
                        >
                          {tempSourcingBgUrl && (
                            <div 
                              className="absolute inset-0 transition-all duration-300 pointer-events-none"
                              style={{
                                backgroundImage: `url(${tempSourcingBgUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: `blur(${tempSourcingBgBlur}px)`,
                                transform: tempSourcingBgBlur > 0 ? 'scale(1.05)' : 'none',
                              }}
                            />
                          )}
                          {tempSourcingBgUrl && (
                            <div className="absolute inset-0 bg-white/70 pointer-events-none" />
                          )}
                          <div className="relative z-10 px-4" style={{ color: tempSourcingTextColor }}>
                            <span className="block text-[8px] font-bold uppercase tracking-widest">{tempSourcingBadge || 'EXCLUSIVE SOURCING ACCESS'}</span>
                            <span className="block font-serif text-sm font-bold uppercase mt-0.5">{tempSourcingTitle || 'Mahi Privilege List'}</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-neutral-400 italic">
                          * Photo uses full container dimensions ('cover' auto-scaling) to guarantee consistent visual proportions (same size) across all devices.
                        </p>
                      </div>
                    </div>

                    <div className="bg-brand/5 border border-brand/10 p-4 rounded-2xl flex items-start gap-2.5 text-left text-brand text-xs">
                      <Sparkles className="w-4 h-4 mt-0.5 animate-pulse flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider block">Unsaved Changes Notice</span>
                        <p className="text-[10px] text-brand/85 mt-0.5 leading-relaxed">
                          All changes edited on this tab are stored temporarily. Please click the main <strong>"SAVE ALL SETTINGS"</strong> button below to apply and publish them live to your storefront!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments & Accounts section */}
                {settingsSubTab === 'payments' && (
                  <div id="settings-payments" className="scroll-mt-24 bg-clay-light/30 border border-clay/70 p-5 rounded-2xl space-y-6 animate-fade-in text-left">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand" />
                        Boutique Payment Gateways & Accounts Config
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                        Enable payment gateways and configure your merchant account details. Customers will see these instructions upon checking out.
                      </p>
                    </div>

                    {/* Enable/Disable payment methods */}
                    <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                      <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-neutral-500" />
                        1. Active Payment Options
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {['eSewa', 'Khalti', 'Bank Transfer', 'PayPal', 'COD', 'Card Payment'].map((method) => {
                          const isEnabled = tempEnabledPayments.includes(method);
                          return (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                if (isEnabled) {
                                  setTempEnabledPayments(tempEnabledPayments.filter(m => m !== method));
                                } else {
                                  setTempEnabledPayments([...tempEnabledPayments, method]);
                                }
                              }}
                              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                isEnabled
                                  ? 'border-brand bg-brand/5 text-brand font-extrabold shadow-sm'
                                  : 'border-clay hover:bg-neutral-50 text-neutral-500'
                              }`}
                            >
                              <span className="text-[10px] uppercase tracking-wider font-bold">{method}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                isEnabled ? 'bg-brand/20 text-brand' : 'bg-neutral-100 text-neutral-400'
                              }`}>
                                {isEnabled ? 'Active' : 'Disabled'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* eSewa Details */}
                    {tempEnabledPayments.includes('eSewa') && (
                      <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                        <h5 className="font-bold text-[11px] uppercase tracking-wider text-[#60bb46] border-b border-clay-light pb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#60bb46]" />
                          eSewa Wallet Merchant Account
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">eSewa ID / Mobile Number</label>
                            <input
                              type="text"
                              value={tempEsewaPhone}
                              onChange={(e) => setTempEsewaPhone(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. 9802058364"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Registered Account Name</label>
                            <input
                              type="text"
                              value={tempEsewaName}
                              onChange={(e) => setTempEsewaName(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. Mahi Creations"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Khalti Details */}
                    {tempEnabledPayments.includes('Khalti') && (
                      <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                        <h5 className="font-bold text-[11px] uppercase tracking-wider text-[#5c2d91] border-b border-clay-light pb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#5c2d91]" />
                          Khalti Wallet Merchant Account
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Khalti ID / Mobile Number</label>
                            <input
                              type="text"
                              value={tempKhaltiPhone}
                              onChange={(e) => setTempKhaltiPhone(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. 9802058364"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Registered Account Name</label>
                            <input
                              type="text"
                              value={tempKhaltiName}
                              onChange={(e) => setTempKhaltiName(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. Mahi Creations"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer Details */}
                    {tempEnabledPayments.includes('Bank Transfer') && (
                      <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                        <h5 className="font-bold text-[11px] uppercase tracking-wider text-[#0a2540] border-b border-clay-light pb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0a2540]" />
                          Boutique Settlement Bank Account
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Bank Name</label>
                            <input
                              type="text"
                              value={tempBankName}
                              onChange={(e) => setTempBankName(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. Nabil Bank Limited"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Account Number</label>
                            <input
                              type="text"
                              value={tempBankAccountNumber}
                              onChange={(e) => setTempBankAccountNumber(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-mono font-semibold"
                              placeholder="e.g. 0110017500369"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Account Holder Name</label>
                            <input
                              type="text"
                              value={tempBankAccountName}
                              onChange={(e) => setTempBankAccountName(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. Mahi Creations Pvt. Ltd."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Branch Location</label>
                            <input
                              type="text"
                              value={tempBankBranch}
                              onChange={(e) => setTempBankBranch(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. Jhamsikhel Branch"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal Details */}
                    {tempEnabledPayments.includes('PayPal') && (
                      <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                        <h5 className="font-bold text-[11px] uppercase tracking-wider text-[#003087] border-b border-clay-light pb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#003087]" />
                          PayPal Merchant Account (Global Sourcing Settlement)
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">PayPal Email Address</label>
                            <input
                              type="email"
                              value={tempPaypalEmail}
                              onChange={(e) => setTempPaypalEmail(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. paypal@mahicreations.com"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-500">Registered Name</label>
                            <input
                              type="text"
                              value={tempPaypalName}
                              onChange={(e) => setTempPaypalName(e.target.value)}
                              className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                              placeholder="e.g. Mahi Creations Luxury"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COD Details */}
                    {tempEnabledPayments.includes('COD') && (
                      <div className="bg-white p-5 rounded-2xl border border-clay/60 space-y-4">
                        <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-800 border-b border-clay-light pb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-neutral-800" />
                          Cash on Delivery (COD) Instructions
                        </h5>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Customer Payment Instructions</label>
                          <textarea
                            rows={2}
                            value={tempCodInstructions}
                            onChange={(e) => setTempCodInstructions(e.target.value)}
                            className="w-full text-xs border border-clay rounded-lg p-2.5 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-light leading-relaxed animate-fade-in"
                            placeholder="e.g. Pay cash or scan dynamic Fonepay QR upon delivery."
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-brand/5 border border-brand/10 p-4 rounded-2xl flex items-start gap-2.5 text-left text-brand text-xs">
                      <Sparkles className="w-4 h-4 mt-0.5 animate-pulse flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider block">Unsaved Changes Notice</span>
                        <p className="text-[10px] text-brand/85 mt-0.5 leading-relaxed">
                          All changes edited on this tab are stored temporarily. Please click the main <strong>"SAVE ALL SETTINGS"</strong> button below to apply and publish them live to your storefront!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Metadata Manager Subtab */}
                {settingsSubTab === 'seo' && (
                  <div id="settings-seo" className="scroll-mt-24">
                    {renderSeoMetadataManager()}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-dark hover:bg-brand text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow cursor-pointer"
                  >
                    Save All Settings
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* STANDALONE SEO METADATA MANAGER TAB */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-xl font-bold text-dark uppercase tracking-wide">SEO & Social Metadata Engine</h3>
                <p className="text-neutral-500 text-xs font-light">Optimize site titles, social card banners, and Google search indexing snippets saved directly to store settings.</p>
              </div>

              {settingsSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {settingsSuccess}
                </div>
              )}

              {renderSeoMetadataManager()}
            </div>
          )}

          {/* SHIPPING & DELIVERY LOCATIONS TAB */}
          {activeTab === 'shipping' && (() => {
            const activeShippingCountry = countries.find(c => c.code === shippingCountryCode) || countries[0];
            const targetCurrency = activeShippingCountry.defaultCurrency;
            const config = CURRENCIES.find(curr => curr.code === targetCurrency) || CURRENCIES[0];
            const currencySymbol = config.symbol;

            return (
              <div className="space-y-8 animate-fade-in text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand font-bold bg-brand/10 px-2.5 py-1 rounded">
                  Logistics & Delivery Settings
                </span>
                <h3 className="font-serif text-2xl font-bold text-dark uppercase tracking-wide mt-2">
                  Configure Delivery Locations & Fees
                </h3>
                <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed font-light">
                  Add custom regions, configure regional shipping delivery costs, or set free delivery regions for dynamic client-side calculations during checkout.
                </p>
              </div>

              {/* Select country to edit */}
              <div className="bg-bg-warm/30 rounded-2xl border border-clay p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                      Active Configuration Country
                    </label>
                    <p className="text-[11px] text-neutral-400 font-light">
                      Choose country to modify cities/emigrates and delivery fees.
                    </p>
                  </div>
                  <select
                    value={shippingCountryCode}
                    onChange={(e) => {
                      setShippingCountryCode(e.target.value);
                      setEditingLocId(null);
                    }}
                    className="sm:w-64 border border-clay rounded-xl p-3 bg-white focus:outline-none focus:ring-1 focus:ring-brand font-semibold text-dark cursor-pointer shadow-sm"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.defaultCurrency})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add New Shipping Location Form */}
              <div className="bg-white rounded-2xl border border-clay p-5 space-y-4.5">
                <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wide border-b border-clay-light pb-2">
                  📍 Add New Delivery Location / Zone
                </h4>
                <form onSubmit={handleAddShippingLocation} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">
                      Location / Zone Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pokhara, Lalitpur, Bhaktapur"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      className="w-full text-xs border border-clay rounded-xl p-3 bg-bg-warm/30 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-dark"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">
                      Delivery Fee ({targetCurrency})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder={`e.g. ${targetCurrency === 'AED' ? '15' : '150'} (Set 0 for FREE delivery)`}
                        value={newLocFee}
                        onChange={(e) => setNewLocFee(e.target.value)}
                        className="w-full text-xs border border-clay rounded-xl p-3 pl-12 bg-bg-warm/30 focus:outline-none focus:ring-1 focus:ring-brand font-medium text-dark font-mono"
                      />
                      <span className="absolute left-3 top-3.5 text-neutral-400 font-bold text-[10px]">{currencySymbol}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-dark hover:bg-brand text-white text-[11px] font-bold tracking-widest uppercase py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Location
                  </button>
                </form>
              </div>

              {/* Current Locations Table List */}
              <div className="bg-white rounded-2xl border border-clay overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-clay-light/20 border-b border-clay-light flex justify-between items-center">
                  <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wide">
                    Current Configured Locations for {countries.find(c => c.code === shippingCountryCode)?.name}
                  </h4>
                  <span className="bg-dark text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                    {countries.find(c => c.code === shippingCountryCode)?.locations.length || 0} Registered Locations
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-clay-light/10 text-[9px] uppercase tracking-wider font-bold text-neutral-500 border-b border-clay-light">
                        <th className="px-5 py-3">Location Name</th>
                        <th className="px-5 py-3">Shipping Cost</th>
                        <th className="px-5 py-3">Free Delivery Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-clay-light/60">
                      {(countries.find(c => c.code === shippingCountryCode)?.locations || []).map((loc) => {
                        const isEditing = editingLocId === loc.id;
                        return (
                          <tr key={loc.id} className="hover:bg-bg-warm/15 transition-colors">
                            {/* Name col */}
                            <td className="px-5 py-4 font-semibold text-dark">
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="border border-clay rounded-lg p-2 bg-white text-xs w-full focus:ring-1 focus:ring-brand font-medium text-dark focus:outline-none"
                                  value={editingLocName}
                                  onChange={(e) => setEditingLocName(e.target.value)}
                                />
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                  {loc.name}
                                </span>
                              )}
                            </td>

                            {/* Fee col */}
                            <td className="px-5 py-4 font-mono font-bold text-dark">
                              {isEditing ? (
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    className="border border-clay rounded-lg p-2 pl-12 bg-white text-xs w-36 focus:ring-1 focus:ring-brand font-medium text-dark focus:outline-none"
                                    value={editingLocFee}
                                    onChange={(e) => setEditingLocFee(e.target.value)}
                                  />
                                  <span className="absolute left-2.5 top-2.5 text-neutral-400 text-[10px]">{currencySymbol}</span>
                                </div>
                              ) : (
                                <span>
                                  {loc.feeInNpr === 0 ? `${currencySymbol} 0 (FREE)` : formatPrice(loc.feeInNpr, targetCurrency)}
                                </span>
                              )}
                            </td>

                            {/* Status col */}
                            <td className="px-5 py-4">
                              {loc.feeInNpr === 0 ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                                  FREE Delivery Active
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleFreeDelivery(loc.id, true)}
                                  className="text-[9px] font-bold text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-clay-light transition cursor-pointer"
                                >
                                  Make Free Delivery
                                </button>
                              )}
                            </td>

                            {/* Actions col */}
                            <td className="px-5 py-4 text-right">
                              {isEditing ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={handleSaveEditShippingLocation}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg transition text-[10px] uppercase tracking-wider cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingLocId(null)}
                                    className="bg-neutral-400 hover:bg-neutral-500 text-white font-bold px-3 py-1.5 rounded-lg transition text-[10px] uppercase tracking-wider cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2.5">
                                  <button
                                    onClick={() => handleStartEditShippingLocation(loc)}
                                    className="text-neutral-500 hover:text-dark p-1.5 rounded bg-clay-light/20 hover:bg-clay-light transition cursor-pointer"
                                    title="Edit location name or delivery fee"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShippingLocation(loc.id)}
                                    className="text-red-500 hover:text-red-700 p-1.5 rounded bg-red-50 hover:bg-red-100 transition cursor-pointer"
                                    title="Delete Location"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

          {/* NEWSLETTER SUBSCRIBERS PANEL */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-dark uppercase tracking-wide">Mahi Privilege Club Subscribers</h3>
                  <p className="text-neutral-500 text-xs font-light">Manage and email customers who have subscribed to your newsletters and product updates.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (subscribers.length === 0) return;
                      navigator.clipboard.writeText(subscribers.join(', '));
                      alert('Copied all subscriber emails to clipboard!');
                    }}
                    className="flex items-center gap-2 bg-clay-light hover:bg-clay text-dark text-[11px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition cursor-pointer border border-clay/60 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy All Emails
                  </button>
                  <button
                    onClick={() => {
                      if (subscribers.length === 0) return;
                      window.location.href = `mailto:${settings.adminEmail || 'mahicreations369@gmail.com'}?bcc=${encodeURIComponent(subscribers.join(','))}&subject=Mahi%20Creations%20Exclusive%20Updates&body=Hello%20valued%20customer%2C%0A%0AWe%20have%20exciting%20new%20cosmetics%20and%20luxury%20fashion%20arrivals%20at%20Mahi%20Creations!%0A%0AVisit%20our%20online%20boutique%20now%20to%20explore%20fresh%20Korean%20skincare%2C%20designer%20makeup%2C%20and%20master-crafted%20traditional%20wear%20sourced%20directly%20from%20Seoul%2C%20Paris%2C%20and%20New%20York.%0A%0AThank%20you%20for%20being%20a%20part%20of%20the%20Mahi%20Creations%20Privilege%20Circle!%0A%0ABest%20Regards%2C%0AMahi%20Creations%20Team`;
                    }}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-[11px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-brand/15 hover:shadow-lg font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email All Subscribers
                  </button>
                </div>
              </div>

              {/* Add Subscriber Form */}
              <div className="bg-white p-5 rounded-2xl border border-clay/60">
                <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 border-b border-clay-light pb-2 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-brand" />
                  Add Subscriber Manually
                </h5>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const emailInput = form.elements.namedItem('subEmail') as HTMLInputElement;
                    const newEmail = emailInput.value.trim().toLowerCase();
                    if (!newEmail) return;
                    if (subscribers.includes(newEmail)) {
                      alert('This email is already subscribed!');
                      return;
                    }
                    const updated = [newEmail, ...subscribers];
                    if (onUpdateSubscribers) {
                      onUpdateSubscribers(updated);
                    }
                    emailInput.value = '';
                    alert('Subscriber added successfully!');
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    name="subEmail"
                    type="email"
                    required
                    placeholder="Enter customer email address (e.g. srijana@outlook.com)"
                    className="flex-grow text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-dark hover:bg-brand text-white text-[11px] font-bold tracking-wider uppercase px-6 py-3 rounded-xl transition cursor-pointer"
                  >
                    Add Subscriber
                  </button>
                </form>
              </div>

              {/* Subscribers List Table */}
              <div className="bg-white rounded-2xl border border-clay/60 overflow-hidden shadow-xs">
                <div className="p-4 bg-neutral-50 border-b border-clay/50 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Mailing List ({subscribers.length} total)</span>
                  <span className="text-[10px] text-brand bg-brand/10 font-bold px-2 py-0.5 rounded-full uppercase">Synced to Local DB</span>
                </div>
                
                {subscribers.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="text-xs font-semibold">No subscribers found.</p>
                    <p className="text-[11px] text-neutral-400 font-light">Add someone manually above or promote the subscription form on your boutique home page.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/70 border-b border-clay/40 font-bold text-neutral-500 text-[10px] uppercase">
                          <th className="p-4 w-16">#</th>
                          <th className="p-4">Email Address</th>
                          <th className="p-4 w-32">Status</th>
                          <th className="p-4 w-48 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-clay-light text-neutral-700 font-medium">
                        {subscribers.map((email, idx) => (
                          <tr key={email} className="hover:bg-neutral-50/50 transition">
                            <td className="p-4 font-bold text-neutral-400">{idx + 1}</td>
                            <td className="p-4 text-dark font-semibold break-all">{email}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active Member
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  window.location.href = `mailto:${email}?subject=Exclusive%20Update%20from%20Mahi%20Creations&body=Hi%20there%2C%0A%0AWe%20hope%20you%20are%20enjoying%20our%20exclusive%20sourcing%20drops!%20We%20wanted%20to%20send%20you%20a%20personal%20update%20on%20our%20latest%20curations.%0A%0ABest%20Regards%2C%0AMahi%20Creations`;
                                }}
                                className="inline-flex items-center gap-1 bg-clay-light hover:bg-brand hover:text-white text-dark text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                title="Send individual direct email"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Email</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${email} from your subscriber list?`)) {
                                    handleDeleteSubscriber(email);
                                  }
                                }}
                                className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                title="Remove subscriber"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DISCOUNT COUPONS ENGINE TAB */}
          {activeTab === 'future' && (() => {
            const currentCoupons: Coupon[] = settings?.coupons || [
              { id: 'c1', code: 'WELCOME10', discountPercent: 10, applicableProductId: 'all', isActive: true, usedByPhones: [] },
              { id: 'c2', code: 'LIPSTICK25', discountPercent: 25, applicableProductId: 'p1', isActive: true, usedByPhones: [] },
              { id: 'c3', code: 'GLOW20', discountPercent: 20, applicableProductId: 'p2', isActive: true, usedByPhones: [] }
            ];

            return (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-clay pb-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-dark uppercase tracking-wide flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-brand" />
                      Promo & Discount Coupons Engine
                    </h3>
                    <p className="text-neutral-500 text-xs font-light">Create, configure, and monitor promotional voucher codes for your boutique storefront.</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    Anti-Tamper Active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Add / Edit Coupon Form */}
                  <div className="lg:col-span-1 bg-bg-warm/30 p-5 rounded-2xl border border-clay">
                    <h4 className="text-xs font-extrabold tracking-wider text-dark uppercase mb-4 flex items-center gap-1.5">
                      {editingCouponId ? '✏️ Edit Coupon Code' : '➕ Create Promo Coupon'}
                    </h4>

                    <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
                      {couponErrorMsg && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                          ⚠️ {couponErrorMsg}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Promo Code</label>
                        <input
                          type="text"
                          placeholder="e.g. SPECIAL30"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full border border-clay rounded-lg p-2.5 bg-white font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <span className="text-[9px] text-neutral-400">Letters and numbers only. Case insensitive.</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Discount Percent (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={couponDiscount}
                          onChange={(e) => setCouponDiscount(Number(e.target.value))}
                          className="w-full border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-600">Applicable Product Scope</label>
                        <select
                          value={couponProduct}
                          onChange={(e) => setCouponProduct(e.target.value)}
                          className="w-full border border-clay rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                        >
                          <option value="all">Apply to All Products (Subtotal)</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>Strictly on: {p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="couponActiveCheckbox"
                          checked={couponActive}
                          onChange={(e) => setCouponActive(e.target.checked)}
                          className="rounded border-clay text-brand focus:ring-brand w-4 h-4 accent-brand cursor-pointer"
                        />
                        <label htmlFor="couponActiveCheckbox" className="text-[11px] font-bold text-neutral-700 cursor-pointer select-none">
                          Active & Redeemable by customers
                        </label>
                      </div>

                      <div className="flex gap-2 pt-3">
                        {editingCouponId && (
                          <button
                            type="button"
                            onClick={handleResetCouponForm}
                            className="flex-1 bg-clay hover:bg-clay-dark text-neutral-700 font-bold py-2 px-3 rounded-lg uppercase tracking-wider text-[10px]"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 bg-dark hover:bg-brand text-white font-bold py-2 px-3 rounded-lg uppercase tracking-widest text-[10px]"
                        >
                          {editingCouponId ? 'Update Coupon' : 'Create Coupon'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column - Coupon list table */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-clay overflow-hidden shadow-sm">
                      <div className="px-5 py-4 bg-bg-warm/30 border-b border-clay flex items-center justify-between">
                        <span className="text-xs font-bold text-dark uppercase tracking-wider">Configured Coupons</span>
                        <span className="text-[10px] font-bold text-neutral-400">{currentCoupons.length} total codes</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-neutral-50/80 border-b border-clay text-neutral-400 font-bold text-[10px] uppercase tracking-wider">
                              <th className="px-5 py-3">Code</th>
                              <th className="px-5 py-3">Discount</th>
                              <th className="px-5 py-3">Product Scope</th>
                              <th className="px-5 py-3">Redeemed</th>
                              <th className="px-5 py-3">Status</th>
                              <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-clay/50">
                            {currentCoupons.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-8 text-neutral-400 font-light">
                                  No promotional coupons found. Create one using the form on the left!
                                </td>
                              </tr>
                            ) : (
                              currentCoupons.map((coupon) => {
                                const scopeProduct = products.find(p => p.id === coupon.applicableProductId);
                                const redemptions = coupon.usedByPhones?.length || 0;

                                return (
                                  <tr key={coupon.id} className="hover:bg-neutral-50/40 transition">
                                    <td className="px-5 py-3.5 font-mono font-bold text-dark text-xs tracking-wider">
                                      {coupon.code}
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-brand text-xs">
                                      {coupon.discountPercent}% OFF
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-600 font-light max-w-[150px] truncate">
                                      {coupon.applicableProductId === 'all' ? (
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded">All Products</span>
                                      ) : (
                                        scopeProduct?.name || 'Specific Product'
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-neutral-500">
                                      <span className="inline-flex items-center gap-1" title={coupon.usedByPhones?.join(', ') || 'No redemptions yet'}>
                                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                                        {redemptions} {redemptions === 1 ? 'user' : 'users'}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <button
                                        onClick={() => handleToggleCouponActive(coupon)}
                                        className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold tracking-widest uppercase px-2 py-1 rounded-full transition ${
                                          coupon.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                                        }`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`}></span>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                      </button>
                                    </td>
                                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                                      <button
                                        onClick={() => handleEditCouponClick(coupon)}
                                        className="inline-flex items-center gap-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 p-1.5 rounded-lg transition"
                                        title="Edit Coupon"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
                                            handleDeleteCoupon(coupon.id);
                                          }
                                        }}
                                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition"
                                        title="Delete Coupon"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="p-4 bg-clay-light/20 border border-clay rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs mt-0.5 shrink-0">
                        🛡️
                      </div>
                      <div>
                        <h5 className="text-[11px] font-extrabold text-dark uppercase tracking-wide">Security Enforcement & Hacking Mitigation</h5>
                        <p className="text-[10px] text-neutral-500 leading-normal mt-0.5 font-light">
                          Each coupon has a strict validation process tied to the master catalog prices. Any client-side price modification (HTML/Inspect Element) is automatically rejected. Coupons are strictly limited to **one use per phone number/account** to prevent redemption exploits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* PAYMENT SETTINGS & MERCHANT ACCOUNT INTEGRATIONS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-clay-light pb-5">
                <div>
                  <h3 className="font-serif text-2xl font-black text-dark uppercase tracking-wide">Nepal Gateway & Payment Configurations</h3>
                  <p className="text-neutral-500 text-xs mt-1.5 font-light">
                    Manage active payment gateways, upload scan-to-pay merchant QR codes, configure account details, and integrate API credentials.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Save Payment Configurations
                  </button>
                </div>
              </div>

              {settingsSuccess && (
                <div className="bg-emerald-500 text-white p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-md animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {/* Toggles for payment methods */}
              <div className="bg-white p-6 rounded-3xl border border-clay space-y-4">
                <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2 border-b border-clay-light pb-2">
                  <CreditCard className="w-4.5 h-4.5 text-brand" />
                  1. Active Storefront Payment Methods
                </h4>
                <p className="text-[11px] text-neutral-400 font-light mt-1">
                  Toggle which payment options are displayed to customers during checkout. Enabled methods will request appropriate verification details.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                  {[
                    { id: 'COD', label: 'Cash on Delivery (COD)' },
                    { id: 'eSewa', label: 'eSewa' },
                    { id: 'Khalti', label: 'Khalti' },
                    { id: 'IPS', label: 'Connect IPS' },
                    { id: 'Bank Transfer', label: 'Bank Transfer' },
                    { id: 'Card Payment', label: 'Card Payment' },
                    { id: 'PayPal', label: 'PayPal' },
                  ].map((method) => {
                    const isEnabled = tempEnabledPayments.includes(method.id);
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          if (isEnabled) {
                            setTempEnabledPayments(tempEnabledPayments.filter((m) => m !== method.id));
                          } else {
                            setTempEnabledPayments([...tempEnabledPayments, method.id]);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                          isEnabled
                            ? 'border-brand bg-brand/5 text-brand font-extrabold shadow-sm'
                            : 'border-clay hover:bg-neutral-50 text-neutral-500'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">{method.label}</span>
                        <span
                          className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                            isEnabled ? 'bg-brand/20 text-brand' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QR Upload and Account Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* eSewa Configuration */}
                {tempEnabledPayments.includes('eSewa') && (
                  <div className="bg-white p-6 rounded-3xl border border-clay space-y-4">
                    <div className="flex items-center justify-between border-b border-clay-light pb-2">
                      <h4 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#60bb46] shrink-0" />
                        eSewa Wallet Setup
                      </h4>
                      <span className="text-[9px] text-[#60bb46] bg-[#60bb46]/10 px-2 py-0.5 rounded font-black uppercase">eSewa Active</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">eSewa ID / Phone</label>
                          <input
                            type="text"
                            value={tempEsewaPhone}
                            onChange={(e) => setTempEsewaPhone(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. 9802058364"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Registered Name</label>
                          <input
                            type="text"
                            value={tempEsewaName}
                            onChange={(e) => setTempEsewaName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Mahi Creations"
                          />
                        </div>
                      </div>

                      {/* eSewa QR File Upload Area */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Merchant eSewa Scan-to-Pay QR</label>
                        <div
                          className="border-2 border-dashed border-clay rounded-2xl p-4 text-center cursor-pointer hover:border-brand transition bg-clay-light/10 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px]"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') setTempEsewaQr(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        >
                          {tempEsewaQr ? (
                            <div className="space-y-3 w-full flex flex-col items-center">
                              <img src={tempEsewaQr} alt="eSewa QR Code" className="h-28 w-28 object-contain rounded border border-clay" />
                              <button
                                type="button"
                                onClick={() => setTempEsewaQr('')}
                                className="text-[9px] bg-red-50 text-red-600 hover:bg-red-100 font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition"
                              >
                                Remove QR Photo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 flex flex-col items-center">
                              <UploadCloud className="w-8 h-8 text-neutral-400 stroke-[1.5]" />
                              <span className="text-[10px] text-neutral-500 font-semibold">Drag & drop eSewa QR code image here</span>
                              <span className="text-[9px] text-neutral-400 font-light">or click to browse from computer</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') setTempEsewaQr(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Khalti Configuration */}
                {tempEnabledPayments.includes('Khalti') && (
                  <div className="bg-white p-6 rounded-3xl border border-clay space-y-4">
                    <div className="flex items-center justify-between border-b border-clay-light pb-2">
                      <h4 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5c2d91] shrink-0" />
                        Khalti Wallet Setup
                      </h4>
                      <span className="text-[9px] text-[#5c2d91] bg-[#5c2d91]/10 px-2 py-0.5 rounded font-black uppercase">Khalti Active</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Khalti ID / Phone</label>
                          <input
                            type="text"
                            value={tempKhaltiPhone}
                            onChange={(e) => setTempKhaltiPhone(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. 9802058364"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Registered Name</label>
                          <input
                            type="text"
                            value={tempKhaltiName}
                            onChange={(e) => setTempKhaltiName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Mahi Creations"
                          />
                        </div>
                      </div>

                      {/* Khalti QR File Upload Area */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Merchant Khalti Scan-to-Pay QR</label>
                        <div
                          className="border-2 border-dashed border-clay rounded-2xl p-4 text-center cursor-pointer hover:border-brand transition bg-clay-light/10 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px]"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') setTempKhaltiQr(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        >
                          {tempKhaltiQr ? (
                            <div className="space-y-3 w-full flex flex-col items-center">
                              <img src={tempKhaltiQr} alt="Khalti QR Code" className="h-28 w-28 object-contain rounded border border-clay" />
                              <button
                                type="button"
                                onClick={() => setTempKhaltiQr('')}
                                className="text-[9px] bg-red-50 text-red-600 hover:bg-red-100 font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition"
                              >
                                Remove QR Photo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 flex flex-col items-center">
                              <UploadCloud className="w-8 h-8 text-neutral-400 stroke-[1.5]" />
                              <span className="text-[10px] text-neutral-500 font-semibold">Drag & drop Khalti QR code image here</span>
                              <span className="text-[9px] text-neutral-400 font-light">or click to browse from computer</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') setTempKhaltiQr(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connect IPS Configuration */}
                {tempEnabledPayments.includes('IPS') && (
                  <div className="bg-white p-6 rounded-3xl border border-clay space-y-4">
                    <div className="flex items-center justify-between border-b border-clay-light pb-2">
                      <h4 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#004f80] shrink-0" />
                        Connect IPS Setup
                      </h4>
                      <span className="text-[9px] text-[#004f80] bg-[#004f80]/10 px-2 py-0.5 rounded font-black uppercase">IPS Active</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">IPS Account ID/Phone</label>
                          <input
                            type="text"
                            value={tempIpsPhone}
                            onChange={(e) => setTempIpsPhone(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. 9802058364"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Account Name</label>
                          <input
                            type="text"
                            value={tempIpsName}
                            onChange={(e) => setTempIpsName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Mahi Creations"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">IPS Settlement Bank</label>
                          <input
                            type="text"
                            value={tempIpsBankName}
                            onChange={(e) => setTempIpsBankName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Global IME Bank"
                          />
                        </div>
                      </div>

                      {/* IPS QR File Upload Area */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Connect IPS Scan-to-Pay QR</label>
                        <div
                          className="border-2 border-dashed border-clay rounded-2xl p-4 text-center cursor-pointer hover:border-brand transition bg-clay-light/10 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px]"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') setTempIpsQr(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        >
                          {tempIpsQr ? (
                            <div className="space-y-3 w-full flex flex-col items-center">
                              <img src={tempIpsQr} alt="IPS QR Code" className="h-28 w-28 object-contain rounded border border-clay" />
                              <button
                                type="button"
                                onClick={() => setTempIpsQr('')}
                                className="text-[9px] bg-red-50 text-red-600 hover:bg-red-100 font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition"
                              >
                                Remove QR Photo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 flex flex-col items-center">
                              <UploadCloud className="w-8 h-8 text-neutral-400 stroke-[1.5]" />
                              <span className="text-[10px] text-neutral-500 font-semibold">Drag & drop IPS QR code image here</span>
                              <span className="text-[9px] text-neutral-400 font-light">or click to browse from computer</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') setTempIpsQr(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Configuration */}
                {tempEnabledPayments.includes('Bank Transfer') && (
                  <div className="bg-white p-6 rounded-3xl border border-clay space-y-4">
                    <div className="flex items-center justify-between border-b border-clay-light pb-2">
                      <h4 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0a2540] shrink-0" />
                        Bank Account setup
                      </h4>
                      <span className="text-[9px] text-[#0a2540] bg-[#0a2540]/10 px-2 py-0.5 rounded font-black uppercase">Bank Active</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Bank Name</label>
                          <input
                            type="text"
                            value={tempBankName}
                            onChange={(e) => setTempBankName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Nabil Bank"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Account Number</label>
                          <input
                            type="text"
                            value={tempBankAccountNumber}
                            onChange={(e) => setTempBankAccountNumber(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold font-mono"
                            placeholder="e.g. 0110017500369"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Account Holder Name</label>
                          <input
                            type="text"
                            value={tempBankAccountName}
                            onChange={(e) => setTempBankAccountName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Mahi Creations Pvt Ltd"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Branch Location</label>
                          <input
                            type="text"
                            value={tempBankBranch}
                            onChange={(e) => setTempBankBranch(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Jhamsikhel"
                          />
                        </div>
                      </div>

                      {/* Bank QR File Upload Area */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Bank QR Code (e.g. Fonepay QR)</label>
                        <div
                          className="border-2 border-dashed border-clay rounded-2xl p-4 text-center cursor-pointer hover:border-brand transition bg-clay-light/10 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px]"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') setTempBankQr(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        >
                          {tempBankQr ? (
                            <div className="space-y-3 w-full flex flex-col items-center">
                              <img src={tempBankQr} alt="Bank QR Code" className="h-28 w-28 object-contain rounded border border-clay" />
                              <button
                                type="button"
                                onClick={() => setTempBankQr('')}
                                className="text-[9px] bg-red-50 text-red-600 hover:bg-red-100 font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition"
                              >
                                Remove QR Photo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 flex flex-col items-center">
                              <UploadCloud className="w-8 h-8 text-neutral-400 stroke-[1.5]" />
                              <span className="text-[10px] text-neutral-500 font-semibold">Drag & drop Bank/Fonepay QR here</span>
                              <span className="text-[9px] text-neutral-400 font-light">or click to browse from computer</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') setTempBankQr(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Configuration */}
                {tempEnabledPayments.includes('PayPal') && (
                  <div className="bg-white p-6 rounded-3xl border border-clay space-y-4">
                    <div className="flex items-center justify-between border-b border-clay-light pb-2">
                      <h4 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#003087] shrink-0" />
                        PayPal setup
                      </h4>
                      <span className="text-[9px] text-[#003087] bg-[#003087]/10 px-2 py-0.5 rounded font-black uppercase">PayPal Active</span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">PayPal Email Address</label>
                          <input
                            type="email"
                            value={tempPaypalEmail}
                            onChange={(e) => setTempPaypalEmail(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. paypal@mahicreations.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-500">Registered Name</label>
                          <input
                            type="text"
                            value={tempPaypalName}
                            onChange={(e) => setTempPaypalName(e.target.value)}
                            className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-semibold"
                            placeholder="e.g. Mahi Creations"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* COD Configuration */}
                {tempEnabledPayments.includes('COD') && (
                  <div className="bg-white p-6 rounded-3xl border border-clay space-y-4">
                    <div className="flex items-center justify-between border-b border-clay-light pb-2">
                      <h4 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 shrink-0" />
                        Cash on Delivery (COD) Instructions
                      </h4>
                      <span className="text-[9px] text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded font-black uppercase">COD Active</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-500">Instructions for customer upon delivery</label>
                        <textarea
                          rows={4}
                          value={tempCodInstructions}
                          onChange={(e) => setTempCodInstructions(e.target.value)}
                          className="w-full text-xs border border-clay rounded-xl p-3 bg-white text-dark focus:ring-1 focus:ring-brand focus:outline-none font-medium leading-relaxed"
                          placeholder="Instructions displayed to customers when choosing Cash on Delivery..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Online Payment Integrations Panel */}
              <div className="bg-white p-6 rounded-3xl border border-clay space-y-6">
                <div>
                  <h4 className="font-serif text-sm font-bold text-dark uppercase tracking-wider flex items-center gap-2 border-b border-clay-light pb-2">
                    <Zap className="w-4.5 h-4.5 text-brand animate-pulse" />
                    2. Online Payment Gateway API Integrations (अनलाइन भुक्तानी एकीकरण)
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-light mt-1.5 leading-relaxed">
                    Integrate live online payment gateways with real-time settlement APIs. Turn on Sandbox mode to test eSewa/Khalti SDK simulations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* eSewa API Integration Card */}
                  <div className="bg-neutral-50/50 p-5 rounded-2xl border border-clay/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-[#60bb46] uppercase tracking-wider">eSewa Merchant SDK Integration</span>
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-emerald-100">SIMULATED READY</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Enable Automated API Redirection</span>
                        <input type="checkbox" defaultChecked className="accent-brand cursor-pointer h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-400">Merchant Service Code</label>
                        <input
                          type="text"
                          defaultValue="EPAYTEST"
                          className="w-full text-xs border border-clay rounded-lg p-2 bg-white text-dark font-mono font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-400">Callback / Success URL</label>
                        <input
                          type="text"
                          defaultValue="https://mahicreations.com/api/payment/esewa/success"
                          className="w-full text-xs border border-clay rounded-lg p-2 bg-white text-dark font-mono"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khalti API Integration Card */}
                  <div className="bg-neutral-50/50 p-5 rounded-2xl border border-clay/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-[#5c2d91] uppercase tracking-wider">Khalti Merchant SDK Integration</span>
                      <span className="text-[8px] bg-[#5c2d91]/10 text-[#5c2d91] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-[#5c2d91]/20">SIMULATED READY</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Enable Automated API Checkout Widget</span>
                        <input type="checkbox" defaultChecked className="accent-brand cursor-pointer h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-400">Live Public Key</label>
                        <input
                          type="password"
                          defaultValue="Key_Live_Public_Mahi_7c8a1b2d"
                          className="w-full text-xs border border-clay rounded-lg p-2 bg-white text-dark font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-neutral-400">Webhook Secret Key</label>
                        <input
                          type="password"
                          defaultValue="whsec_khalti_1a2b3c4d5e"
                          className="w-full text-xs border border-clay rounded-lg p-2 bg-white text-dark font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* General API Integrations Checklist */}
                <div className="bg-brand/5 border border-brand/15 p-4 rounded-2xl flex items-start gap-3 text-brand">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wide block">Real-Time Gateway Webhooks & Sandboxes</span>
                    <p className="text-[10px] text-brand/85 leading-relaxed font-light">
                      The boutique is fully configured with an automated checkout fallback system. If direct online API redirects are disabled or failure occurs, clients are routed cleanly onto WhatsApp with their order summaries and scan-to-pay QRs for instant offline validation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* DETAILED INTERACTIVE PRODUCT SHARING SUITE (MODAL DIALOG) */}
      {sharingProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-[3px]" onClick={() => setSharingProduct(null)} />
          
          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-clay overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-clay-light bg-clay-light/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-brand" />
                <h3 className="font-serif text-lg font-bold text-dark uppercase tracking-wide">Interactive Product Sharing Suite</h3>
              </div>
              <button onClick={() => setSharingProduct(null)} className="p-1 rounded-full hover:bg-clay-light text-neutral-400 hover:text-dark transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-600">
              
              <div className="flex items-start gap-4 p-4 bg-bg-warm/35 rounded-2xl border border-clay/70">
                <img src={sharingProduct.image} alt={sharingProduct.name} className="w-16 h-20 object-cover rounded-xl border border-clay" />
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-brand bg-clay-light px-2 py-0.5 rounded-full">{sharingProduct.category}</span>
                  <h4 className="font-bold text-dark">{sharingProduct.name}</h4>
                  <p className="text-[10px] text-neutral-400 line-clamp-2">{sharingProduct.description}</p>
                </div>
              </div>

              {/* Direct share shortcuts */}
              <div className="space-y-2">
                <h5 className="font-bold text-dark uppercase tracking-wider text-[10px] text-neutral-500">1. Instant Social Redirection Links</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-bold">
                  
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(getProductShareText(sharingProduct))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl border border-emerald-200/50 flex flex-col items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '?product=' + sharingProduct.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-2xl border border-blue-200/50 flex flex-col items-center gap-1.5 transition"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </a>

                  {/* TikTok link or profile fallback */}
                  <a
                    href={settings.tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 rounded-2xl border border-zinc-200 flex flex-col items-center gap-1.5 transition"
                  >
                    <span className="text-lg">🎵</span>
                    <span>TikTok Link</span>
                  </a>

                  {/* Instagram link or profile fallback */}
                  <a
                    href={settings.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-2xl border border-pink-200/50 flex flex-col items-center gap-1.5 transition"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>Instagram</span>
                  </a>

                </div>
              </div>

              {/* Copy Caption Engine */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-dark uppercase tracking-wider text-[10px] text-neutral-500">2. Copy Formatted Marketing Caption</h5>
                  <button
                    onClick={() => handleCopyShareText(sharingProduct)}
                    className="inline-flex items-center gap-1.5 text-brand hover:text-dark font-black tracking-wider uppercase text-[10px]"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        Copied Successfully!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy text
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-dark/5 p-4 rounded-2xl font-mono text-[10px] text-neutral-700 whitespace-pre-wrap border border-clay-light max-h-40 overflow-y-auto leading-relaxed">
                  {getProductShareText(sharingProduct)}
                </div>
              </div>

              {/* simulated post visual preview */}
              <div className="bg-clay-light/30 border border-clay rounded-2xl p-4.5 space-y-3">
                <h5 className="font-bold text-dark uppercase tracking-wider text-[10px] text-neutral-500 flex items-center gap-1">
                  <Eye className="w-4 h-4 text-brand" />
                  Live Social Feed Post Simulation
                </h5>
                <div className="bg-white border border-clay rounded-xl overflow-hidden p-3 shadow-sm space-y-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-dark text-white font-serif font-black text-center flex items-center justify-center text-[10px]">M</div>
                    <div>
                      <p className="font-bold text-dark text-[11px]">Mahi Creations</p>
                      <p className="text-[8px] text-neutral-400">Sponsored</p>
                    </div>
                  </div>
                  <p className="text-neutral-700 leading-relaxed font-light line-clamp-3">
                    {getProductShareText(sharingProduct).split('\n\n')[0]}...
                  </p>
                  <div className="aspect-video w-full rounded-lg bg-clay-light/30 overflow-hidden border border-clay-light relative">
                    <img src={sharingProduct.image} alt="Simulation" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-[2px] p-2 rounded-lg border border-clay/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-dark text-[10px]">{sharingProduct.name}</p>
                        <p className="text-[9px] text-emerald-600 font-bold">Rs. {(sharingProduct.price - (sharingProduct.price * sharingProduct.discountPercent / 100)).toLocaleString('en-IN')}</p>
                      </div>
                      <span className="text-[9px] bg-brand text-white px-2 py-1 rounded font-black uppercase tracking-wider">Shop Now</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-clay-light/20 border-t border-clay-light text-right">
              <button
                onClick={() => setSharingProduct(null)}
                className="bg-dark hover:bg-brand text-white font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-lg cursor-pointer transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED ORDER TRACKING CONTROL MODAL */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-clay w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-dark text-white px-6 py-4.5 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand" />
                <div>
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider">Shipment Dispatch Control</h4>
                  <p className="text-[10px] text-neutral-400 font-mono font-bold mt-0.5">Order ID: {trackingOrder.id} • Customer: {trackingOrder.customerName}</p>
                </div>
              </div>
              <button 
                onClick={() => setTrackingOrder(null)}
                className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] text-xs font-sans">
              
              {/* Courier & Logistics Details */}
              <div className="bg-clay-light/20 p-4.5 rounded-2xl border border-clay/60 space-y-4">
                <h5 className="font-serif font-extrabold text-dark uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-clay/80 pb-2">
                  <Package className="w-4 h-4 text-brand" />
                  Courier & Delivery Partners Assignment
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Courier Service Name</label>
                    <input 
                      type="text"
                      value={courName}
                      onChange={(e) => setCourName(e.target.value)}
                      placeholder="e.g. Pathao, Upaya, Mahi Express Rider"
                      className="w-full bg-white border border-clay rounded-xl px-3 py-2 text-dark font-medium focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Rider Phone Number</label>
                    <input 
                      type="text"
                      value={courPhone}
                      onChange={(e) => setCourPhone(e.target.value)}
                      placeholder="e.g. 9841XXXXXX"
                      className="w-full bg-white border border-clay rounded-xl px-3 py-2 text-dark font-mono font-medium focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Courier Tracking Code</label>
                    <input 
                      type="text"
                      value={courTrackCode}
                      onChange={(e) => setCourTrackCode(e.target.value)}
                      placeholder="e.g. EXP-10025A"
                      className="w-full bg-white border border-clay rounded-xl px-3 py-2 text-dark font-mono font-medium focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Estimated Delivery timeframe</label>
                    <input 
                      type="text"
                      value={estDelivery}
                      onChange={(e) => setEstDelivery(e.target.value)}
                      placeholder="e.g. Within 24 Hours, Today 6 PM"
                      className="w-full bg-white border border-clay rounded-xl px-3 py-2 text-dark font-medium focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Remarks */}
              <div className="bg-clay-light/20 p-4.5 rounded-2xl border border-clay/60 space-y-4">
                <h5 className="font-serif font-extrabold text-dark uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-clay/80 pb-2">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  Payment Verification & Boutique Remarks
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Payment Status</label>
                    <select
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value as any)}
                      className="w-full bg-white border border-clay rounded-xl px-3 py-2 text-dark font-bold focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="Pending">Pending Verification</option>
                      <option value="Verified">Verified / Received</option>
                      <option value="Failed">Payment Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Message from Boutique Manager (Seller Notes)</label>
                    <textarea 
                      rows={2}
                      value={selNotes}
                      onChange={(e) => setSelNotes(e.target.value)}
                      placeholder="e.g. Your premium packing is verified. Handed over to pathao hub."
                      className="w-full bg-white border border-clay rounded-xl px-3 py-2 text-dark font-serif italic focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Append Custom Status Timeline Log */}
              <div className="bg-brand/5 p-4.5 rounded-2xl border border-brand/20 space-y-4">
                <div className="flex justify-between items-center border-b border-brand/20 pb-2">
                  <h5 className="font-serif font-extrabold text-brand uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Publish Real-Time Activity Log Update
                  </h5>
                  <span className="text-[9px] text-brand/80 font-bold italic">Appears immediately on Customer tracking page</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">For Order status</label>
                    <select
                      value={newLogStatus}
                      onChange={(e) => setNewLogStatus(e.target.value as OrderStatus)}
                      className="w-full bg-white border border-clay rounded-xl px-2.5 py-2 text-dark font-bold focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="Pending">Pending Review</option>
                      <option value="Confirmed">Boutique Confirmed</option>
                      <option value="Packaging">Premium Packaging</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered Successfully</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">Log Note Description (English / Nepali)</label>
                    <input 
                      type="text"
                      value={newLogNote}
                      onChange={(e) => setNewLogNote(e.target.value)}
                      placeholder="e.g. Saman is packed with extra gift ribbons and is waiting for dispatcher."
                      className="w-full bg-white border border-clay rounded-xl px-3 py-2 text-dark font-medium focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Log preview timeline */}
              <div className="space-y-3.5">
                <h5 className="font-serif font-bold text-dark uppercase tracking-wider text-[10px] border-b border-clay pb-2">
                  Active Tracking Timeline Updates History
                </h5>
                
                {trackingOrder.statusLogs && trackingOrder.statusLogs.length > 0 ? (
                  <div className="space-y-3 pl-4 border-l-2 border-clay/60">
                    {trackingOrder.statusLogs.map((log, lidx) => (
                      <div key={lidx} className="relative group text-[11px]">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand" />
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-dark uppercase bg-clay-light px-1.5 py-0.5 rounded text-[8px] tracking-wider">
                            {log.status}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString('en-US') : 'N/A'}
                          </span>
                        </div>
                        <p className="text-neutral-500 font-light italic">"{log.note}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-xs italic">
                    No custom chronological timeline logs logged yet. A dynamic template timeline corresponding to '{trackingOrder.status}' is currently active for this customer.
                  </p>
                )}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-clay-light/20 border-t border-clay-light flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-lg cursor-pointer transition"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveTrackingDetails}
                className="bg-brand hover:bg-dark text-white font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-lg cursor-pointer transition shadow"
              >
                Save Dispatch Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LUXURY BOUTIQUE INVOICE PRINT MODAL */}
      {printingOrder && (
        <div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white border border-clay w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh] print:max-h-full print:border-none print:shadow-none print:rounded-none print:my-0">
            
            {/* Modal Header Controls (Hidden in print) */}
            <div className="bg-dark text-white px-6 py-4 flex justify-between items-center flex-shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand" />
                <div>
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider">Luxury Boutique Invoice</h4>
                  <p className="text-[10px] text-neutral-400 font-mono font-bold mt-0.5">Order ID: {printingOrder.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="bg-brand hover:bg-white hover:text-dark text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Invoice
                </button>
                <button 
                  onClick={() => setPrintingOrder(null)}
                  className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Invoice Content */}
            <div id="printable-invoice-content" className="p-8 space-y-8 overflow-y-auto max-h-[75vh] print:max-h-full print:overflow-visible print:p-0 text-dark font-sans text-xs">
              
              {/* PRINT STYLE OVERRIDES */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-invoice-content, #printable-invoice-content * {
                    visibility: visible;
                  }
                  #printable-invoice-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                  }
                }
              `}} />

              {/* Invoice Brand Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-clay pb-6">
                <div>
                  <h2 className="font-serif text-2xl font-black text-dark uppercase tracking-wide">{settings.shopName || 'Mahi Creations'}</h2>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-serif font-bold mt-0.5">Luxury Certified Sourcing & Skincare</p>
                  <p className="text-[10px] text-neutral-400 mt-1.5 font-mono">{settings.shopAddress || 'Lalitpur, Jhamsikhel, Nepal'}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Email: {settings.adminEmail || 'mahicreations369@gmail.com'}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">WhatsApp: +977 {settings.whatsappNumber || '9801122334'}</p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="inline-block bg-brand/10 text-brand px-3 py-1 rounded-full font-serif font-extrabold tracking-widest text-[10px] uppercase mb-3">
                    Boutique Invoice
                  </span>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Invoice / Bill No</p>
                  <p className="text-base font-mono font-black text-dark">{printingOrder.id}</p>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-2">Date of Issue</p>
                  <p className="text-xs font-mono font-medium text-neutral-600">
                    {printingOrder.createdAt ? new Date(printingOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Bill To & Dispatch Partners info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-clay pb-6">
                <div>
                  <h5 className="font-serif font-extrabold text-neutral-500 uppercase tracking-widest text-[9px] mb-2.5">BILL TO (गाहकको विवरण):</h5>
                  <p className="text-sm font-black text-dark">{printingOrder.customerName}</p>
                  <p className="text-neutral-600 mt-1 font-medium">{printingOrder.customerAddress}</p>
                  <p className="text-neutral-500 mt-0.5 font-mono">Phone: {printingOrder.customerPhone}</p>
                  <p className="text-neutral-400 text-[10px] mt-2 font-mono">Location ID: {printingOrder.deliveryLocationId} • Location: {printingOrder.deliveryLocationName}</p>
                </div>
                <div className="bg-clay-light/20 p-4 rounded-2xl border border-clay/60">
                  <h5 className="font-serif font-extrabold text-brand uppercase tracking-widest text-[9px] mb-2.5">DISPATCH & LOGISTICS (ढुवानी विवरण):</h5>
                  <div className="space-y-1 text-neutral-600 font-medium">
                    <p>
                      <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider block">Courier Service:</span>
                      {printingOrder.courierName || 'Pending Courier Dispatch Assignment'}
                    </p>
                    {printingOrder.courierPhone && (
                      <p>
                        <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider block mt-1">Rider Phone:</span>
                        <span className="font-mono">{printingOrder.courierPhone}</span>
                      </p>
                    )}
                    {printingOrder.courierTrackingCode && (
                      <p>
                        <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider block mt-1">Tracking Code:</span>
                        <span className="font-mono bg-white px-1.5 py-0.5 border border-clay/50 rounded">{printingOrder.courierTrackingCode}</span>
                      </p>
                    )}
                    <p>
                      <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider block mt-1">Delivery Timeframe:</span>
                      {printingOrder.estimatedDelivery || 'Standard 24-48 Hours'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h5 className="font-serif font-extrabold text-neutral-500 uppercase tracking-widest text-[9px]">PURCHASED BOUTIQUE ITEMS (खरिद गरिएका सामानहरू):</h5>
                <div className="border border-clay rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-clay-light/30 border-b border-clay text-[9px] font-serif font-extrabold uppercase tracking-widest text-neutral-600">
                        <th className="py-3 px-4 w-12 text-center">S.N.</th>
                        <th className="py-3 px-4">Particular (Item Name)</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-center w-16">Qty</th>
                        <th className="py-3 px-4 text-right w-24">Discount</th>
                        <th className="py-3 px-4 text-right w-28">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-clay/50">
                      {printingOrder.items.map((item, idx) => {
                        const itemSub = item.price * item.quantity;
                        const itemDiscount = Math.round(itemSub * ((item.discountPercent || 0) / 100));
                        const itemTotal = itemSub - itemDiscount;
                        return (
                          <tr key={idx} className="hover:bg-neutral-50/50 text-neutral-700 font-medium">
                            <td className="py-3.5 px-4 text-center font-mono text-neutral-400">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <p className="font-serif text-dark font-bold text-xs">{item.productName}</p>
                              {item.discountPercent > 0 && (
                                <span className="inline-block bg-brand/10 text-brand text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5">
                                  {item.discountPercent}% Off Promo Applied
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono">
                              {formatPrice(item.price, 'NPR')}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono">{item.quantity}</td>
                            <td className="py-3.5 px-4 text-right text-amber-700 font-mono">
                              {itemDiscount > 0 ? `-${formatPrice(itemDiscount, 'NPR')}` : 'Rs. 0'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-serif font-bold text-dark font-mono">
                              {formatPrice(itemTotal, 'NPR')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial calculations summary */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4">
                <div className="sm:col-span-7 space-y-4">
                  <div>
                    <h6 className="font-serif font-extrabold text-neutral-500 uppercase tracking-widest text-[9px] mb-1.5">PAYMENT METHOD & STATUS (भुक्तानी विधि):</h6>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase bg-neutral-100 border border-clay px-2.5 py-1 rounded-lg">
                        {printingOrder.paymentMethod}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        printingOrder.paymentStatus === 'Verified' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : printingOrder.paymentStatus === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {printingOrder.paymentStatus || 'Pending Verification'}
                      </span>
                    </div>
                  </div>

                  {printingOrder.notes && (
                    <div>
                      <h6 className="font-serif font-extrabold text-neutral-500 uppercase tracking-widest text-[9px] mb-1">CUSTOMER SPECIAL INSTRUCTIONS:</h6>
                      <p className="italic text-neutral-500 font-serif leading-relaxed">"{printingOrder.notes}"</p>
                    </div>
                  )}

                  {printingOrder.sellerNotes && (
                    <div className="bg-brand/5 border border-brand/20 p-3 rounded-xl">
                      <h6 className="font-serif font-extrabold text-brand uppercase tracking-widest text-[9px] mb-1">BOUTIQUE MANAGER MEMO / SELLER REMARKS:</h6>
                      <p className="italic text-brand font-serif leading-relaxed font-bold">"{printingOrder.sellerNotes}"</p>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-5 space-y-2.5 text-xs font-medium">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500">Subtotal (कुल रकम):</span>
                    <span className="font-mono font-bold text-neutral-800">
                      {formatPrice(printingOrder.subtotal, 'NPR')}
                    </span>
                  </div>
                  {printingOrder.discountAmount > 0 && (
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span className="text-neutral-500">Discount Saved (बचत रकम):</span>
                      <span className="font-mono font-bold text-amber-700">
                        -{formatPrice(printingOrder.discountAmount, 'NPR')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500">Delivery Charge (ढुवानी शुल्क):</span>
                    <span className="font-mono font-bold text-neutral-800">
                      {printingOrder.deliveryFee === 0 ? 'FREE (नि:शुल्क)' : formatPrice(printingOrder.deliveryFee, 'NPR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-dark text-white p-3 rounded-xl">
                    <span className="font-serif font-bold uppercase tracking-wider text-[10px]">Grand Total (जम्मा तिर्नुपर्ने):</span>
                    <span className="font-mono text-sm font-black text-brand">
                      {formatPrice(printingOrder.total, 'NPR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thank you note & Sign-off seal */}
              <div className="pt-8 border-t border-clay flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
                <div className="space-y-1.5">
                  <p className="font-serif font-extrabold text-[10px] text-dark uppercase tracking-widest">AUTHENTICITY GUARANTEE & CARE</p>
                  <p className="text-neutral-400 text-[10px] max-w-md leading-relaxed">
                    This document certifies that the items listed above have been verified by the Certified Luxury Desk at {settings.shopName || 'Mahi Creations'}. Thank you for choosing standard cosmetics and premium care.
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 border border-brand/30 rounded-full flex flex-col items-center justify-center p-2 text-center border-dashed mb-1 select-none">
                    <span className="font-serif font-extrabold text-[8px] text-brand uppercase tracking-widest">MAHI CREATIONS</span>
                    <div className="w-10 h-0.5 bg-brand my-1" />
                    <span className="text-[7px] text-neutral-400 uppercase font-bold tracking-widest">BOUTIQUE SEAL</span>
                    <span className="text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-wider mt-1">VERIFIED</span>
                  </div>
                  <p className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider">Authorized Signature</p>
                </div>
              </div>

            </div>

            {/* Modal Footer (Hidden in print) */}
            <div className="px-6 py-4 bg-clay-light/20 border-t border-clay-light flex justify-end gap-3 flex-shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-lg cursor-pointer transition"
              >
                Close Window
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-brand hover:bg-dark text-white font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-lg cursor-pointer transition shadow flex items-center gap-1"
              >
                <Printer className="w-4 h-4" />
                Print/Download Invoice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
