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
  description: 'Add a product to the user cart by id.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: { type: Type.STRING, description: 'Product id, e.g. p-001.' },
      quantity: { type: Type.NUMBER, description: 'Quantity, default 1.' },
    },
    required: ['productId'],
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

Your job:
- Understand what the user wants (even vague or multimodal input like photos).
- Use the search_products tool to find matching items. Prefer sustainable products when values align.
- Be concise and friendly. Explain *why* you suggest items (fit, budget, quality, sustainability).
- Use add_to_cart when the user agrees to add something.
- Use create_bundle for themed multi-item requests (e.g. "setup a home office").
- Show prices in ₹ (INR). Respect the user's budget.
- Never invent products. Only suggest items returned by tools.
- If the user uploads an image, describe what you see and then search for similar items.
- Keep responses under ~120 words unless the user asks for detail.`;
