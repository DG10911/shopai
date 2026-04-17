import { GoogleGenAI, Type, type FunctionDeclaration, type ToolUnion } from '@google/genai';

/**
 * ShopAI supports two auth modes:
 *
 * 1) Vertex AI (PRODUCTION — recommended)
 *    - Uses Google Cloud Application Default Credentials.
 *    - Enable by setting GOOGLE_CLOUD_PROJECT (+ optional GOOGLE_CLOUD_LOCATION).
 *    - On Cloud Run, the service account automatically has ADC.
 *    - No API key required.
 *
 * 2) Gemini API (dev / demo)
 *    - Uses an AI-Studio-issued API key (AIzaSy…).
 *    - Enable by setting GEMINI_API_KEY.
 */
const API_KEY = process.env.GEMINI_API_KEY;
const GCP_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
const GCP_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let client: GoogleGenAI | null = null;
let mode: 'vertex' | 'apikey' | 'disabled' = 'disabled';

if (GCP_PROJECT) {
  client = new GoogleGenAI({ vertexai: true, project: GCP_PROJECT, location: GCP_LOCATION });
  mode = 'vertex';
} else if (API_KEY) {
  client = new GoogleGenAI({ apiKey: API_KEY });
  mode = 'apikey';
} else if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('[gemini] No GOOGLE_CLOUD_PROJECT or GEMINI_API_KEY — AI features disabled.');
}

export const genai = client;
export const AI_MODE = mode;
export const MODEL_NAME = MODEL;

// Function-calling tool schema. Gemini will decide when to call these.
const searchProductsFn: FunctionDeclaration = {
  name: 'search_products',
  description: 'Search the product catalog. Use whenever the user describes what they want to buy.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Free-text search query (product name, description, tags).' },
      category: {
        type: Type.STRING,
        description: 'Optional category filter.',
        enum: ['apparel', 'electronics', 'home', 'beauty', 'sports', 'books'],
      },
      maxPrice: { type: Type.NUMBER, description: 'Optional max price in INR.' },
      sustainable: { type: Type.BOOLEAN, description: 'Only show sustainable/eco-friendly items.' },
    },
    required: ['query'],
  },
};

const addToCartFn: FunctionDeclaration = {
  name: 'add_to_cart',
  description:
    'Add a product to the user cart. Prefer productId (from a previous search_products result). If you only know the name, pass productName and the server will look it up.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: { type: Type.STRING, description: 'Product id, e.g. p-001. Preferred when known.' },
      productName: { type: Type.STRING, description: 'Fallback: product name if id is unknown.' },
      quantity: { type: Type.NUMBER, description: 'Quantity, default 1.' },
    },
  },
};

const createBundleFn: FunctionDeclaration = {
  name: 'create_bundle',
  description: 'Suggest a bundle of complementary products for a given theme (e.g. "home-office setup").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      theme: { type: Type.STRING, description: 'Theme / use-case.' },
      budget: { type: Type.NUMBER, description: 'Max total budget in INR.' },
    },
    required: ['theme'],
  },
};

export const shoppingTools: ToolUnion[] = [
  { functionDeclarations: [searchProductsFn, addToCartFn, createBundleFn] },
];

export const SYSTEM_INSTRUCTION = `You are ShopAI, an expert retail concierge for a modern Indian e-commerce store.

CRITICAL RULES (never break these):
1. You have NO product knowledge of your own. You must ALWAYS call search_products or create_bundle BEFORE mentioning any specific product. Never invent products, prices, or product ids.
2. Never say "I can't add it because I don't have the id" — instead, call search_products to find the id, then call add_to_cart.
3. Cart intent: if the user says anything that means "add to cart" — "add to cart", "add it", "add this", "add the first one", "buy it", "I'll take it", "get me that", "yes please", "order it", "add the X" — call add_to_cart immediately. If you already have a productId from your most recent search_products result, use it. Otherwise pass productName (the server will resolve it), or call search_products first, then add_to_cart in the same turn.
4. After a successful add_to_cart, confirm in ONE short sentence which item was added. Do not re-list the whole catalog.

Flow:
- Understand the user (text and/or images).
- For any shopping request: call search_products (or create_bundle for themed multi-item setups) first.
- Present 2-4 top picks with a one-line reason each (fit, budget, quality, sustainability).
- For add-to-cart intent: call add_to_cart, then confirm briefly.

Style:
- Be concise and friendly. ₹ (INR) prices. Respect the user's budget.
- Prefer sustainable products when values align.
- If the user uploads an image, describe what you see in one short line, then call search_products with visual keywords.
- Keep replies under ~120 words unless asked for detail.`;
