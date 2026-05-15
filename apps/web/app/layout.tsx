import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Biddix | Luxury Antiquities Auction',
  description: 'The premier marketplace for authentic luxury antiquities and rare collectibles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="text-2xl font-serif font-bold tracking-tighter">BIDDIX</div>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-primary transition">Live Auctions</Link>
              <Link href="/marketplace" className="hover:text-primary transition">Marketplace</Link>
              <Link href="/dealers" className="hover:text-primary transition">Dealers</Link>
            </nav>
            <div className="flex gap-4 items-center">
              <button className="text-sm font-medium hover:text-primary transition">Log in</button>
              <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition">Join</button>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">© 2024 Biddix Technologies. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
