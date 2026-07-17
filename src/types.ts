import { CurrencyCode } from './utils/currency';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number; // Original Price in NPR (Nepali Rupees)
  discountPercent: number; // e.g., 15 for 15% off
  image: string; // URL of high-resolution makeup image
  images?: string[]; // Multiple high-resolution images for slides
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  stockCount?: number;
  enteredCurrency?: string;
  enteredPrice?: number;
  brand?: string;
  costPrice?: number;
  isVisible?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packaging' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderLog {
  status: OrderStatus;
  note: string;
  timestamp: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryLocationId: string;
  deliveryLocationName: string;
  deliveryFee: number;
  paymentMethod: 'eSewa' | 'Khalti' | 'COD' | 'Bank Transfer' | 'Card Payment' | 'PayPal' | 'IPS';
  items: {
    productId: string;
    productName: string;
    price: number;
    discountPercent: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
  currency?: string; // e.g. 'AED', 'USD'
  countryCode?: string; // e.g. 'AE', 'NP'
  estimatedDelivery?: string;
  courierName?: string;
  courierPhone?: string;
  courierTrackingCode?: string;
  sellerNotes?: string;
  paymentStatus?: 'Pending' | 'Verified' | 'Failed' | 'Refunded';
  statusLogs?: OrderLog[];
  couponCode?: string;
  couponDiscount?: number;
}

export interface LocationConfig {
  id: string;
  name: string;
  fee: number; // Delivery fee in NPR (0 means FREE)
  isFree: boolean;
}

export interface PromoSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  linkText?: string;
  linkUrl?: string;
  imageFit?: 'cover' | 'contain';
}

export interface BoutiqueSettings {
  adminUser: string;
  adminPassword: string;
  whatsappNumber: string;
  facebookLink: string;
  tiktokLink: string;
  instagramLink: string;
  linkedinLink: string;
  homeProductIds?: string[];
  sliderProductIds?: string[];
  footerBgColor?: string;
  footerTextColor?: string;
  footerAbout?: string;
  adminEmail?: string;
  shopName?: string;
  shopAddress?: string;
  logoUrl?: string;
  faviconUrl?: string;
  headerPromo?: string;
  enabledPayments?: string[];
  enabledCurrencies?: CurrencyCode[];
  esewaAccountPhone?: string;
  esewaAccountName?: string;
  khaltiAccountPhone?: string;
  khaltiAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankBranch?: string;
  paypalEmail?: string;
  paypalAccountName?: string;
  codInstructions?: string;
  esewaQrUrl?: string;
  khaltiQrUrl?: string;
  ipsQrUrl?: string;
  bankQrUrl?: string;
  ipsAccountPhone?: string;
  ipsAccountName?: string;
  ipsBankName?: string;
  promoSlides?: PromoSlide[];
  aboutImageUrl?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroImageCaption?: string;
  heroDescription?: string;
  catalogTitle?: string;
  catalogSubtitle?: string;
  aboutBadge?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutPara1?: string;
  aboutPara2?: string;
  aboutPara3?: string;
  sourcingBgUrl?: string;
  sourcingBgColor?: string;
  sourcingBgBlur?: number;
  sourcingTextColor?: string;
  sourcingTitle?: string;
  sourcingDescription?: string;
  sourcingBadge?: string;
  coupons?: Coupon[];
}

export interface Coupon {
  id: string;
  code: string; // Uppercase coupon code, e.g., WELCOME15
  discountPercent: number; // Percentage off, e.g., 15 for 15%
  applicableProductId: string; // "all" or a specific product ID (e.g. "p1")
  isActive: boolean;
  usedByPhones?: string[]; // Phone numbers of customers who already redeemed it, ensuring 1 use per customer/phone
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved?: boolean;
  photoUrl?: string;
}

export interface UserSession {
  fullName: string;
  phone: string;
  address: string;
  country?: string;
  whatsapp?: string;
  location?: string;
}

