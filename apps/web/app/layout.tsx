import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biddix | Real-time Auction Platform',
  description: 'Experience live bidding like never before with Biddix. Fast, secure, and real-time.',
  metadataBase: new URL('https://biddix.io'),
  openGraph: {
    title: 'Biddix | Real-time Auction Platform',
    description: 'Real-time bidding platform for live auctions.',
    url: 'https://biddix.io',
    siteName: 'Biddix',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biddix | Real-time Auction Platform',
    description: 'Real-time bidding platform for live auctions.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
