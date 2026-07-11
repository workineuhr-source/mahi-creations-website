import { Product, LocationConfig, PromoSlide } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Mahi Velvet Matte Liquid Lipstick',
    category: 'Cosmetics',
    description: 'An ultra-comfortable, transfer-proof liquid lipstick with a luxurious velvet matte finish that lasts for up to 16 hours. Infused with hydrating Shea Butter and Vitamin E.',
    price: 1850,
    discountPercent: 15,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 124,
    stockCount: 3,
    costPrice: 1100
  },
  {
    id: 'p2',
    name: 'Mahi Radiant Glow Liquid Foundation',
    category: 'Cosmetics',
    description: 'A buildable, medium-to-full coverage liquid foundation with a radiant, skin-like finish. Provides 24-hour hydration, SPF 30 protection, and controls excess oil production.',
    price: 3200,
    discountPercent: 20,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 198,
    stockCount: 15,
    costPrice: 1800
  },
  {
    id: 'p3',
    name: 'Mahi Imperial Eyeshadow Palette (18 Shades)',
    category: 'Cosmetics',
    description: 'A masterpiece eyeshadow palette featuring 18 highly pigmented, ultra-blendable shades in rose golds, rich coppers, and warm neutral mattes and dazzling shimmers.',
    price: 4500,
    discountPercent: 10,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1590156546746-c58d2fa3167c?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 4.7,
    reviewsCount: 86,
    stockCount: 8,
    costPrice: 2600
  },
  {
    id: 'cl1',
    name: 'Mahi Organza Saree with Handwork Embroidery',
    category: 'Clothing',
    description: 'A breathtakingly beautiful pure organza silk saree, intricately hand-embroidered with fine zari, sequins, and pearl handwork along the borders. Comes with a premium heavy silk unstitched blouse piece.',
    price: 14500,
    discountPercent: 12,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 42,
    stockCount: 2,
    costPrice: 8500
  },
  {
    id: 'cl2',
    name: 'Mahi Royal Velvet Georgette Lehenga Set',
    category: 'Clothing',
    description: 'A masterpiece royal lehenga choli crafted in premium micro-velvet and georgette with exhaustive gold resham threadwork, dori work, and multi-thread floral embroidery. Perfect for brides and grand occasions.',
    price: 24900,
    discountPercent: 15,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 5.0,
    reviewsCount: 28,
    stockCount: 12,
    costPrice: 14000
  },
  {
    id: 'jw1',
    name: 'Mahi Kundan Traditional Bridal Choker Set',
    category: 'Jewelry',
    description: 'Exquisite 22k gold plated Kundan choker necklace set decorated with hand-cut polki stones, emerald beads, and high-shine fresh water pearls. Set includes matching royal chandelier jhumkas and maang tikka.',
    price: 9500,
    discountPercent: 8,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 39,
    stockCount: 4,
    costPrice: 5500
  },
  {
    id: 'kt1',
    name: 'Mahi Ultimate Bridal Glow Hamper Kit',
    category: 'Kits',
    description: 'An ultimate luxury beauty hamper curated for perfect bridal radiance. Includes Mahi Liquid Foundation, Eyeshadow Palette, Soft-Focus Cream Blush, Hydrating Lip Oil, Matte Setting Spray, and a 12-Piece Premium Brush set inside a velvet makeup trunk.',
    price: 16500,
    discountPercent: 18,
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 5.0,
    reviewsCount: 56,
    stockCount: 1,
    costPrice: 10000
  },
  {
    id: 'ac1',
    name: 'Mahi Premium Vegan Brush Set (12-Piece)',
    category: 'Accessories',
    description: 'A complete collection of 12 ultra-soft, professional-grade makeup brushes crafted with premium synthetic fibers and elegant rose gold metal ferrules.',
    price: 3800,
    discountPercent: 15,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1000&q=90',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=90'
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 78,
    stockCount: 20,
    costPrice: 2200
  }
];

export const DELIVERY_LOCATIONS: LocationConfig[] = [
  { id: 'loc-ktm', name: 'Kathmandu Valley (Inside)', fee: 0, isFree: true },
  { id: 'loc-ltp', name: 'Lalitpur (Inside)', fee: 0, isFree: true },
  { id: 'loc-bkt', name: 'Bhaktapur (Inside)', fee: 0, isFree: true },
  { id: 'loc-pkr', name: 'Pokhara', fee: 150, isFree: false },
  { id: 'loc-btw', name: 'Butwal', fee: 150, isFree: false },
  { id: 'loc-brt', name: 'Biratnagar', fee: 180, isFree: false },
  { id: 'loc-ctw', name: 'Chitwan', fee: 120, isFree: false },
  { id: 'loc-drn', name: 'Dharan', fee: 180, isFree: false },
  { id: 'loc-out', name: 'Other (Outside Valley)', fee: 200, isFree: false }
];

export const SHOP_WHATSAPP_NUMBER = '9779800000000'; // Standard placeholder, adjustable in Admin panel

export const DEFAULT_PROMO_SLIDES: PromoSlide[] = [
  {
    id: 's1',
    title: 'Exclusive Festive Glow Couture',
    subtitle: 'Mahi Premium Cosmetics & Traditional Attire',
    description: 'Unrivaled global elegance meets rich Nepalese heritage. Explore our long-lasting active formulations and custom-tailored boutique sarees designed to make you shine.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=90',
    linkText: 'Explore Makeup',
    linkUrl: '#shop-catalog'
  },
  {
    id: 's2',
    title: 'Imperial Velvet Matte Lipstick',
    subtitle: '16-Hour Hydration Comfort Formulation',
    description: 'Specially crafted liquid lipstick infused with rich organic Shea Butter and Vitamin E for luscious velvet-matte lips that stay flawless all day long.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=90',
    linkText: 'View Shades',
    linkUrl: '#shop-catalog'
  },
  {
    id: 's3',
    title: 'Royal Organza & Silk Saree',
    subtitle: 'Exquisite Hand- Embroidered Zari Couture',
    description: 'A mesmerizing pure organza silk saree hand-decorated with fine pearl borders and intricate silver zari threadwork. Beautifully crafted for wedding highlights.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90',
    linkText: 'Browse Couture',
    linkUrl: '#shop-catalog'
  },
  {
    id: 's4',
    title: 'Radiant Glow Liquid Foundation',
    subtitle: 'Global Sourced Hydra-Base Base with SPF-30',
    description: 'Reveal flawless, skin-like radiance with our buildable-coverage foundation formulas. Features deep multi-layer hydration and sebum control.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=90',
    linkText: 'Find Your Shade',
    linkUrl: '#shop-catalog'
  },
  {
    id: 's5',
    title: 'Kundan Traditional Bridal Jewels',
    subtitle: 'Royal Meenakari Handcrafted Accessories',
    description: 'Adorn yourself in timeless luxury with our premium 22K gold-plated Kundan choker jewelry sets and hand-set teardrop pearls.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=90',
    linkText: 'Explore Jewelry',
    linkUrl: '#shop-catalog'
  },
  {
    id: 's6',
    title: 'Luxe Imported Fragrances',
    subtitle: 'Authentic European Perfumes & Scents',
    description: 'Immerse your senses in rare lingering floral oils and original high-end perfumes imported directly from Paris and Milan.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=90',
    linkText: 'Browse Fragrances',
    linkUrl: '#shop-catalog'
  }
];

