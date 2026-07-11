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

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryLocationId: string;
  deliveryLocationName: string;
  deliveryFee: number;
  paymentMethod: 'eSewa' | 'Khalti' | 'COD' | 'Bank Transfer' | 'Card Payment';
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
}

