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
  {
    id: 'p-013',
    name: 'UltraSlim 14" Laptop',
    description: 'Intel Core Ultra 7, 16GB RAM, 1TB SSD, 14-inch OLED. All-day battery, fanless.',
    price: 89999,
    category: 'electronics',
    tags: ['laptop', 'computer', 'notebook', 'ultrabook', 'work'],
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    rating: 4.7,
    stock: 25,
  },
  {
    id: 'p-014',
    name: 'Gaming Laptop Pro 16"',
    description: 'RTX 4070, 32GB RAM, 240Hz QHD. Ideal for gaming, 3D, and ML workloads.',
    price: 149999,
    category: 'electronics',
    tags: ['laptop', 'gaming', 'computer', 'rtx', 'notebook'],
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
    rating: 4.6,
    stock: 12,
  },
  {
    id: 'p-015',
    name: 'Terracotta Planter Set (3-pack)',
    description: 'Handmade terracotta pots with drainage. Perfect for herbs, succulents, and flowers.',
    price: 799,
    category: 'home',
    tags: ['planter', 'pots', 'garden', 'gardening', 'plants', 'gift', 'mom'],
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
    rating: 4.7,
    stock: 140,
    sustainable: true,
  },
  {
    id: 'p-016',
    name: 'Bonsai Starter Kit',
    description: 'Live juniper bonsai with pruning shears, ceramic pot, and beginner care guide.',
    price: 1699,
    category: 'home',
    tags: ['bonsai', 'plant', 'garden', 'gardening', 'gift', 'mom', 'hobby'],
    image: 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=800',
    rating: 4.8,
    stock: 40,
    sustainable: true,
  },
  {
    id: 'p-017',
    name: 'Stainless Steel Gardening Tool Set',
    description: '8-piece rust-proof hand tools with ergonomic grips and a canvas carry bag.',
    price: 1299,
    category: 'home',
    tags: ['gardening', 'tools', 'garden', 'gift', 'mom', 'outdoor'],
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800',
    rating: 4.6,
    stock: 95,
  },
  {
    id: 'p-018',
    name: 'Insulated Water Bottle 750ml',
    description: 'Double-wall vacuum steel. Keeps cold 24h / hot 12h. BPA-free, leak-proof.',
    price: 899,
    category: 'sports',
    tags: ['bottle', 'water', 'steel', 'fitness', 'gym', 'sustainable'],
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    rating: 4.7,
    stock: 220,
    sustainable: true,
  },
  {
    id: 'p-019',
    name: 'Mechanical Keyboard TKL',
    description: 'Hot-swap switches, RGB per-key, PBT keycaps. Tenkeyless for more desk space.',
    price: 6499,
    category: 'electronics',
    tags: ['keyboard', 'mechanical', 'gaming', 'typing', 'work', 'tkl'],
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    rating: 4.7,
    stock: 50,
  },
  {
    id: 'p-020',
    name: 'Mirrorless Camera 24MP',
    description: 'APS-C sensor, 4K60 video, dual-pixel AF. Includes 18-55mm kit lens.',
    price: 59999,
    category: 'electronics',
    tags: ['camera', 'photography', 'mirrorless', '4k', 'travel'],
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    rating: 4.6,
    stock: 18,
  },
  {
    id: 'p-021',
    name: 'Scented Soy Candle Trio',
    description: 'Lavender, sandalwood, and jasmine. 100% soy wax, cotton wicks, 40h burn each.',
    price: 1099,
    category: 'beauty',
    tags: ['candle', 'soy', 'scented', 'gift', 'mom', 'home', 'aromatherapy'],
    image: 'https://images.unsplash.com/photo-1602874801006-e26c4f6a5e45?w=800',
    rating: 4.7,
    stock: 160,
    sustainable: true,
  },
  {
    id: 'p-022',
    name: 'Silk Pillowcase — Queen',
    description: '22-momme pure mulberry silk. Gentler on skin and hair. Hypoallergenic.',
    price: 1899,
    category: 'home',
    tags: ['pillow', 'silk', 'bedding', 'gift', 'mom', 'beauty'],
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
    rating: 4.6,
    stock: 70,
  },
];

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','has','have','i','in','is','it','its','my','me','of','on','or','so','that','the','this','to','was','were','with','you','your','who','what','when','where','why','how','under','over','any','some','all','can','will','want','need','get','give','show','find','please','just','like','also','should','would','could','about','into','onto','up','down','out','off','more','less','then','than','but','if','after','before','while','during','using','use','make','made','new','best','good','great','nice','cool','loves','love','loved','birthday','gift','gifts','present','mom','dad','her','his','him','us','they','them'
]);

function tokenize(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
}

export function searchProducts(
  query: string,
  opts: { category?: string; maxPrice?: number; sustainable?: boolean } = {}
): Product[] {
  const tokens = tokenize(query);

  const candidates = PRODUCTS.filter((p) => {
    if (opts.category && p.category !== opts.category) return false;
    if (opts.maxPrice && p.price > opts.maxPrice) return false;
    if (opts.sustainable && !p.sustainable) return false;
    return true;
  });

  if (tokens.length === 0) {
    // No meaningful query — return highest-rated candidates.
    return [...candidates].sort((a, b) => b.rating - a.rating);
  }

  const scored = candidates
    .map((p) => {
      const name = p.name.toLowerCase();
      const tags = p.tags.map((t) => t.toLowerCase());
      const desc = p.description.toLowerCase();
      const cat = p.category.toLowerCase();
      let score = 0;
      let matchedAny = false;
      for (const t of tokens) {
        if (name.includes(t)) { score += 5; matchedAny = true; }
        if (tags.some((tg) => tg === t)) { score += 4; matchedAny = true; }
        else if (tags.some((tg) => tg.includes(t))) { score += 2; matchedAny = true; }
        if (cat === t) { score += 3; matchedAny = true; }
        if (desc.includes(t)) { score += 1; matchedAny = true; }
      }
      score += p.rating * 0.1; // tiny tiebreaker
      return { p, score, matchedAny };
    })
    .filter((x) => x.matchedAny);

  if (scored.length === 0) {
    // No token hit the catalog — surface top-rated candidates so the UI isn't empty.
    return [...candidates].sort((a, b) => b.rating - a.rating);
  }

  return scored.sort((a, b) => b.score - a.score).map((x) => x.p);
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
