import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Ensure persistent folders exist
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Enable large JSON payloads (critical for base64 file uploading)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_DIR));

// Default data seed configurations
const SEED_PRODUCTS = [
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

const SEED_SETTINGS = {
  adminUser: 'Mahi123@',
  adminPassword: 'Mahi1234567@',
  adminEmail: 'mahicreations369@gmail.com',
  shopName: 'Mahi Creations',
  shopAddress: 'Lalitpur, Jhamsikhel, Nepal',
  logoUrl: '/src/assets/images/mahi_logo_new_1783763329444.jpg',
  faviconUrl: '/src/assets/images/mahi_logo_new_1783763329444.jpg',
  headerPromo: 'Monsoon Glow Offer: Automatically save up to 25% + Free delivery inside Kathmandu Valley!',
  enabledPayments: ['eSewa', 'Khalti', 'COD', 'Bank Transfer', 'Card Payment'],
  enabledCurrencies: ['AED'],
  whatsappNumber: '9779802058364',
  facebookLink: 'https://facebook.com/mahicreations',
  tiktokLink: 'https://tiktok.com/@mahicreations',
  instagramLink: 'https://instagram.com/mahicreations_nepal',
  linkedinLink: 'https://linkedin.com/company/mahicreations',
  homeProductIds: ['p1', 'p2', 'p3', 'cl1', 'cl2', 'jw1', 'kt1', 'ac1'],
  sliderProductIds: ['p1', 'p2', 'p3'],
  footerBgColor: '#fff0f1',
  footerTextColor: '#1a1a1a',
  footerAbout: 'Mahi Creations is Nepal’s premier luxury digital boutique, bridging authentic global formulations and high-end cosmetics directly from Paris, Seoul, Tokyo, and New York.',
  aboutImageUrl: '/src/assets/images/mahi_about_me_1783496157685.jpg',
  heroBadge: 'Mahi Creations Boutique',
  heroTitle: 'Bridging Authenticity & Global Sourcing Luxury',
  heroImageCaption: 'Mahi Creations Lalitpur, Jhamsikhel',
  heroDescription: "Welcome to Mahi Creations, Nepal's premier digital gateway to high-end certified products. We specialize in curating premium global cosmetic formulations, traditional custom-crafted apparel, and bespoke fine jewelry directly from fashion capitals.",
  catalogTitle: 'Our Premium Curations',
  catalogSubtitle: 'Showing authentic cosmetics displaying real-time stock levels',
  aboutBadge: 'Our Legacy',
  aboutTitle: 'About Mahi Creations',
  aboutSubtitle: 'Nepal’s premier luxury digital boutique, bridging authentic global formulations and high-end apparel directly to your doorstep.',
  aboutPara1: 'Founded with a vision of blending luxury cosmetic formulations, custom-crafted fine jewelry, and premium traditional apparel, Mahi Creations serves as an exclusive gateway to authentic luxury. Operating from Lalitpur, Jhamsikhel, we curate only the finest certified treasures.',
  aboutPara2: 'Every cosmetic bottle we carry represents genuine global standards of safety, hydration, and glow. Our traditional apparel lines are hand-stitched by boutique master artisans, preserving timeless cultural heritages while adapting them for the contemporary modern aesthetic.',
  aboutPara3: 'Whether you are searching for premium Korean skincare regimes, custom makeup, or bespoke boutique jewelry, Mahi Creations ensures standard compliance, real-time stock levels, and expedited courier delivery across Nepal.',
  sourcingBgUrl: '',
  sourcingBgColor: '#fcfaf9',
  sourcingBgBlur: 0,
  sourcingTextColor: '#1a1a1a',
  sourcingTitle: 'Mahi Privilege List',
  sourcingDescription: 'Subscribe for private invitations to global cosmetics drops, traditional apparel pre-orders, and exclusive beauty coupons directly from our certified international houses.',
  sourcingBadge: 'Exclusive Sourcing Access',
  promoSlides: [
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
    }
  ]
};

const SEED_REVIEWS = [
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

// Seed Helper
function getJsonOrSeed(filename: string, seed: any) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    fs.writeFileSync(filepath, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

// REST endpoints for Full State Load & Save
app.get('/api/state', (req, res) => {
  try {
    const products = getJsonOrSeed('products.json', SEED_PRODUCTS);
    const settings = getJsonOrSeed('settings.json', SEED_SETTINGS);
    const orders = getJsonOrSeed('orders.json', []);
    const reviews = getJsonOrSeed('reviews.json', SEED_REVIEWS);
    const subscribers = getJsonOrSeed('subscribers.json', []);
    const registeredUsers = getJsonOrSeed('registered_users.json', []);
    const countries = getJsonOrSeed('countries.json', []);

    res.json({
      products,
      settings,
      orders,
      reviews,
      subscribers,
      registeredUsers,
      countries
    });
  } catch (err) {
    console.error('Failed to load backend state:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/save', (req, res) => {
  try {
    const { key, data } = req.body;
    
    // Whitelist allowed storage keys to prevent path traversal
    const allowedKeys = [
      'products',
      'orders',
      'settings',
      'reviews',
      'subscribers',
      'registered_users',
      'countries'
    ];

    if (!key || !allowedKeys.includes(key)) {
      return res.status(400).json({ error: 'Invalid or missing key parameter' });
    }

    const filename = `${key}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, message: `Successfully stored ${key}` });
  } catch (err) {
    console.error('Failed to save state on server:', err);
    res.status(500).json({ error: 'Failed to write server data' });
  }
});

// Binary Image Upload Endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { name, dataUrl } = req.body;
    if (!name || !dataUrl) {
      return res.status(400).json({ error: 'Missing file name or dataUrl' });
    }

    // Match data url base64 encoding scheme
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 DataUrl format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Extract appropriate file extension
    let ext = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';

    // Build unique safe file name
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const filename = `uploaded_${timestamp}_${random}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    // Return relative path to retrieve image statically
    res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Server upload failed:', err);
    res.status(500).json({ error: 'Failed to upload image file' });
  }
});

async function startServer() {
  // Vite Dev Server middleware in local development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving compiled static client-side bundle
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK ROUTER] Host Server active on port ${PORT}`);
  });
}

startServer();
