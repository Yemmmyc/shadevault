import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShadeVault | Precision Luxury Eyewear',
  description: 'Handcrafted sunglasses featuring aerospace titanium, Italian bio-acetate, and polarized optics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-zinc-950 text-zinc-100 antialiased">
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
