import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: { default: 'ShopAI — Your Agentic Shopping Assistant', template: '%s — ShopAI' },
  description:
    'An agentic Retail & E-commerce platform built on Google Cloud. Multimodal AI shopping, smart bundles, and retailer insights powered by Gemini.',
  keywords: ['ai shopping', 'gemini', 'retail', 'e-commerce', 'personalization', 'cloud run'],
  authors: [{ name: 'Pranay' }],
  openGraph: {
    title: 'ShopAI',
    description: 'Agentic shopping powered by Gemini on Google Cloud.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#ff6600',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
