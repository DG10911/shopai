// Demo product catalog. In production this is Firestore — for the hackathon
// demo we ship a seeded in-memory catalog so the app is fully functional
// without any external dependencies beyond Gemini.

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in INR
  category: 'apparel' | 'electronics' | 'home' | 'beauty' | 'sports' | 'books';
  tags: string[];
  image: string;
  rating: number;
  stock: number;
  sustainable?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: 'p-001',
    name: 'AeroKnit Running Shoes',
    description: 'Breathable knit upper with carbon-infused midsole. Made from 60% recycled ocean plastic.',
    price: 5499,
    category: 'sports',
    tags: ['running', 'shoes', 'sustainable', 'performance'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    rating: 4.7,
    stock: 42,
    sustainable: true,
  },
  {
    id: 'p-002',
    name: 'Linen Summer Shirt',
    description: '100% European flax linen, relaxed fit. Perfect for warm weather.',
    price: 2299,
    category: 'apparel',
    tags: ['shirt', 'linen', 'summer', 'sustainable'],
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
    rating: 4.5,
    stock: 120,
    sustainable: true,
  },
  {
    id: 'p-003',
    name: 'Pro Noise-Cancelling Headphones',
    description: '40h battery, adaptive ANC, Hi-Res audio, spatial sound.',
    price: 18999,
    category: 'electronics',
    tags: ['audio', 'headphones', 'wireless', 'premium'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    rating: 4.8,
    stock: 17,
  },
  {
    id: 'p-004',
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Handmade in Jaipur. Includes dripper, server, and two cups.',
    price: 3499,
    category: 'home',
    tags: ['coffee', 'ceramic', 'handmade', 'gift'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    rating: 4.6,
    stock: 34,
    sustainable: true,
  },
  {
    id: 'p-005',
    name: 'Smart Fitness Watch Gen 5',
    description: 'AMOLED, ECG, SpO2, 14-day battery. Pair with any phone.',
    price: 12499,
    category: 'electronics',
    tags: ['watch', 'fitness', 'wearable', 'health'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    rating: 4.4,
    stock: 88,
  },
  {
    id: 'p-006',
    name: 'Organic Cotton Throw Blanket',
    description: 'GOTS-certified organic cotton, natural dyes, 130x170cm.',
    price: 1799,
    category: 'home',
    tags: ['blanket', 'cotton', 'organic', 'cosy'],
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
    rating: 4.7,
    stock: 200,
    sustainable: true,
  },
  {
    id: 'p-007',
    name: 'Vitamin-C Brightening Serum',
    description: '15% L-ascorbic acid + ferulic acid. Cruelty-free, vegan.',
    price: 899,
    category: 'beauty',
    tags: ['skincare', 'serum', 'vitamin-c', 'vegan'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
    rating: 4.6,
    stock: 150,
    sustainable: true,
  },
  {
    id: 'p-008',
    name: 'Yoga Mat — 6mm Grip+',
    description: 'Non-slip TPE mat. Extra cushioning for joints.',
    price: 1499,
    category: 'sports',
    tags: ['yoga', 'fitness', 'mat', 'wellness'],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    rating: 4.5,
    stock: 75,
  },
  {
    id: 'p-009',
    name: 'Leather Weekender Bag',
    description: 'Full-grain vegetable-tanned leather. Handcrafted.',
    price: 7999,
    category: 'apparel',
    tags: ['bag', 'leather', 'travel', 'premium'],
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    rating: 4.9,
    stock: 22,
  },
  {
    id: 'p-010',
    name: 'The Psychology of Money (Hardcover)',
    description: 'Morgan Housel. Timeless lessons on wealth, greed, and happiness.',
    price: 499,
    category: 'books',
    tags: ['book', 'finance', 'bestseller'],
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
    rating: 4.8,
    stock: 300,
  },
  {
    id: 'p-011',
    name: 'Cold-Brew Coffee Beans 500g',
    description: 'Single-origin Chikmagalur. Medium roast. Fair-trade.',
    price: 649,
    category: 'home',
    tags: ['coffee', 'beans', 'fair-trade', 'gift'],
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
    rating: 4.5,
    stock: 180,
    sustainable: true,
  },
  {
    id: 'p-012',
    name: 'Minimalist Desk Lamp',
    description: 'Adjustable warm/cool LED. USB-C charging port included.',
    price: 2199,
    category: 'home',
    tags: ['lamp', 'desk', 'lighting', 'workspace'],
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
    rating: 4.3,
    stock: 60,
  },
];

export function searchProducts(query: string, opts: { category?: string; maxPrice?: number; sustainable?: boolean } = {}): Product[] {
  const q = query.toLowerCase().trim();
  return PRODUCTS.filter((p) => {
    if (opts.category && p.category !== opts.category) return false;
    if (opts.maxPrice && p.price > opts.maxPrice) return false;
    if (opts.sustainable && !p.sustainable) return false;
    if (!q) return true;
    const haystack = `${p.name} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
    return haystack.includes(q) || q.split(/\s+/).some((token) => token && haystack.includes(token));
  });
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function topCategories(): { category: Product['category']; count: number; revenue: number }[] {
  const map = new Map<Product['category'], { count: number; revenue: number }>();
  for (const p of PRODUCTS) {
    const cur = map.get(p.category) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += p.price * Math.max(1, 100 - p.stock); // synthesized demand
    map.set(p.category, cur);
  }
  return Array.from(map.entries()).map(([category, v]) => ({ category, ...v }));
}
