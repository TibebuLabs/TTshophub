import type { AppConfig, Product } from './types';
import {
  Banknote,
  Coffee,
  CreditCard,
  Dumbbell,
  Gift,
  House,
  Shirt,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export const etb = (n: number) => 'ETB ' + Math.round(n).toLocaleString('en-US');

/** Return the percentage discount between the current and original price. */
export const discount = (p: { price: number; oldPrice: number }) =>
  Math.max(0, Math.round((1 - p.price / p.oldPrice) * 100));

export const FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'] as const;

export const CAT_ICON: Record<string, LucideIcon> = {
  'Coffee & Food': Coffee,
  Fashion: Shirt,
  Electronics: Smartphone,
  Home: House,
  Beauty: Sparkles,
  Sports: Dumbbell,
  'Gift Finds': Gift,
};

export const PAYMENTS = [
  {
    id: 'telebirr',
    icon: Smartphone,
    name: 'Telebirr',
    hint: 'SuperApp QR & USSD (*127#) instant pay',
  },
  {
    id: 'cbe',
    icon: Banknote,
    name: 'CBE Birr',
    hint: 'Commercial Bank of Ethiopia mobile money',
  },
  {
    id: 'chapa',
    icon: CreditCard,
    name: 'Card / Chapa',
    hint: 'Debit card & online bank transfer',
  },
  {
    id: 'cod',
    icon: Banknote,
    name: 'Cash on delivery',
    hint: 'Pay cash or mobile transfer upon arrival',
  },
];

/** Used until /config loads (or if the API is offline) */
export const FALLBACK: AppConfig = {
  categories: ['Coffee & Food', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports', 'Gift Finds'],
  freeShippingOver: 5000,
  cities: {
    'Addis Ababa': { fee: 120, eta: 'Same day' },
    Adama: { fee: 220, eta: '1–2 days' },
    Hawassa: { fee: 260, eta: '2–3 days' },
    'Bahir Dar': { fee: 300, eta: '2–4 days' },
    'Dire Dawa': { fee: 320, eta: '2–4 days' },
    Mekelle: { fee: 350, eta: '3–5 days' },
    Gondar: { fee: 330, eta: '3–5 days' },
  },
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'coffee-1',
    name: 'Abyssinian Sunrise Coffee',
    nameAm: 'አብይሲንያን ፀሐይ ቡና',
    category: 'Coffee & Food',
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80'],
    price: 1750,
    oldPrice: 2350,
    stock: 24,
    seller: 'Bole Roasters',
    description: 'Single-origin Ethiopian coffee with a bright berry finish and caramel sweetness.',
    rating: 4.9,
    ratingCount: 428,
    featured: true,
  },
  {
    id: 'fashion-1',
    name: 'Habesha Kemis Delight',
    nameAm: 'ሀበሻ ኬሚስ የምትወደው',
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'],
    price: 4200,
    oldPrice: 5600,
    stock: 12,
    seller: 'Aster Studio',
    description: 'Tailored Habesha-inspired comfort with elegant detailing for everyday celebration.',
    rating: 4.8,
    ratingCount: 189,
    featured: true,
  },
  {
    id: 'tech-1',
    name: 'SolarReady 5000mAh Power Bank',
    nameAm: 'ሶላር ፓወር ባንክ',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'],
    price: 6200,
    oldPrice: 8200,
    stock: 18,
    seller: 'PowerHub ET',
    description: 'Fast-charge USB-C power bank built for busy city travel and power outages.',
    rating: 4.7,
    ratingCount: 245,
    featured: true,
  },
  {
    id: 'home-1',
    name: 'Handwoven Basket Set',
    nameAm: 'በእጅ የተጠለፈ ሳጥን',
    category: 'Home',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'],
    price: 2800,
    oldPrice: 3900,
    stock: 15,
    seller: 'Ethiopian Looms',
    description: 'Natural woven accents for warm homes, gifting and everyday storage.',
    rating: 4.6,
    ratingCount: 144,
    featured: false,
  },
  {
    id: 'beauty-1',
    name: 'Botanical Skin Ritual Kit',
    nameAm: 'የአትክልት ሥርዓት ኪት',
    category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'],
    price: 3400,
    oldPrice: 4700,
    stock: 22,
    seller: 'Aynalem Care',
    description: 'Nourishing Ethiopian plant-based skincare for bright, healthy skin.',
    rating: 4.7,
    ratingCount: 201,
    featured: true,
  },
  {
    id: 'sport-1',
    name: 'Trail Runner Sneakers',
    nameAm: 'የጉዞ ጫማ',
    category: 'Sports',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
    price: 4500,
    oldPrice: 6100,
    stock: 10,
    seller: 'RoadFit',
    description: 'Comfort-first sneakers for city walks, quick runs and daily movement.',
    rating: 4.8,
    ratingCount: 166,
    featured: false,
  },
  {
    id: 'gift-1',
    name: 'Gift Box Surprise Bundle',
    nameAm: 'የበለጠ ስጦታ የማክበር ጥቅል',
    category: 'Gift Finds',
    images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'],
    price: 2900,
    oldPrice: 4100,
    stock: 30,
    seller: 'Giftora ET',
    description: 'Curated gifting box with artisan snacks, home accents and custom notes.',
    rating: 4.9,
    ratingCount: 320,
    featured: true,
  },
  {
    id: 'food-1',
    name: 'Teff Delight Snack Pack',
    nameAm: 'እርሾ የደንበኞች ስነ-ምግብ ጥቅል',
    category: 'Coffee & Food',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'],
    price: 2200,
    oldPrice: 3100,
    stock: 26,
    seller: 'Ethiopian Pantry',
    description: 'Nutritious family-friendly snack set with roasted teff and spice blends.',
    rating: 4.6,
    ratingCount: 97,
    featured: false,
  },
];

/** Return a human-friendly relative time string for the supplied ISO timestamp. */
export const ago = (iso: string) => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h ago`;

  return new Date(iso).toLocaleDateString();
};

/** Trigger a brief browser click sound when the interface changes state. */
export function beep() {
  try {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio is optional; ignore browser or autoplay restrictions.
  }
}
