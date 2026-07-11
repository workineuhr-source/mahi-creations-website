export type CurrencyCode = 'AED' | 'USD' | 'EUR' | 'NPR' | 'INR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Conversion rate relative to NPR (NPR is base 1.0)
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'NPR', symbol: 'Rs.', name: 'Nepalese Rupee', rate: 1.0 }, // Base
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0075 },   // 1 NPR = 0.0075 USD
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.0069 },        // 1 NPR = 0.0069 EUR
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 0.625 }  // 1 NPR = 0.625 INR
];

export interface ShippingLocation {
  id: string;
  name: string;
  feeInNpr: number;
}

export interface CountryConfig {
  code: string;
  name: string;
  defaultCurrency: CurrencyCode;
  locations: ShippingLocation[];
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'NP',
    name: 'Nepal',
    defaultCurrency: 'NPR',
    locations: [
      { id: 'np-ktm', name: 'Kathmandu Valley (Inside)', feeInNpr: 0 },
      { id: 'np-ltp', name: 'Lalitpur (Inside)', feeInNpr: 0 },
      { id: 'np-bkt', name: 'Bhaktapur (Inside)', feeInNpr: 0 },
      { id: 'np-pkr', name: 'Pokhara City Hub', feeInNpr: 150 },
      { id: 'np-btw', name: 'Butwal Logistics Center', feeInNpr: 150 },
      { id: 'np-brt', name: 'Biratnagar', feeInNpr: 180 },
      { id: 'np-ctw', name: 'Chitwan Delivery Zone', feeInNpr: 120 },
      { id: 'np-drn', name: 'Dharan / Itahari', feeInNpr: 180 },
      { id: 'np-out', name: 'Other Outside Cities (Sajha Courier)', feeInNpr: 200 }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    defaultCurrency: 'INR',
    locations: [
      { id: 'in-metro', name: 'Delhi / Mumbai / Bangalore Metro', feeInNpr: 240 }, // ~150 INR
      { id: 'in-tier2', name: 'Tier 2 Cities & Others', feeInNpr: 400 } // ~250 INR
    ]
  },
  {
    code: 'US',
    name: 'United States',
    defaultCurrency: 'USD',
    locations: [
      { id: 'us-std', name: 'US Standard Postal Shipping', feeInNpr: 1333 }, // ~10 USD
      { id: 'us-exp', name: 'US Priority DHL Express', feeInNpr: 3333 } // ~25 USD
    ]
  },
  {
    code: 'EU',
    name: 'European Union / Germany',
    defaultCurrency: 'EUR',
    locations: [
      { id: 'eu-std', name: 'Europe Standard DHL Shipping', feeInNpr: 1160 }, // ~8 EUR
      { id: 'eu-exp', name: 'Europe Express Courier', feeInNpr: 2900 } // ~20 EUR
    ]
  }
];

/**
 * Convert price from NPR base to the target currency
 */
export function convertPrice(priceInNpr: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
  // Calculate raw conversion
  const converted = priceInNpr * config.rate;
  // If target currency is USD or EUR, round to 2 decimal places, else round to integer for whole rupees/dirhams
  if (targetCurrency === 'USD' || targetCurrency === 'EUR') {
    return Math.round(converted * 100) / 100;
  }
  return Math.round(converted);
}

/**
 * Formats a given price (in NPR base) into a beautiful string representation of the target currency
 */
export function formatPrice(priceInNpr: number, currency: CurrencyCode): string {
  const config = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const converted = convertPrice(priceInNpr, currency);
  
  if (currency === 'USD') {
    return `$${converted.toFixed(2)}`;
  }
  if (currency === 'EUR') {
    return `€${converted.toFixed(2)}`;
  }
  if (currency === 'AED') {
    return `AED ${converted.toLocaleString('en-US')}`;
  }
  if (currency === 'INR') {
    return `₹${converted.toLocaleString('en-IN')}`;
  }
  return `Rs. ${converted.toLocaleString('en-NP')}`;
}

/**
 * Gets customized shipping countries and locations from localStorage, falling back to defaults.
 */
export function getCustomCountries(): CountryConfig[] {
  if (typeof window === 'undefined') return COUNTRIES;
  const saved = localStorage.getItem('mahi_countries_v2');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Return default if error
    }
  }
  return COUNTRIES;
}

/**
 * Saves customized shipping countries and locations to localStorage.
 */
export function saveCustomCountries(countries: CountryConfig[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mahi_countries_v2', JSON.stringify(countries));
  }
}

