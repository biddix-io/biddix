'use client';

import { LiveAuction } from '../components/LiveAuction';
import { AuctionErrorBoundary } from '../components/AuctionErrorBoundary';

export default function Home() {
  // Demo ID for showcase purposes
  const DEMO_LOT_ID = "00000000-0000-0000-0000-000000000000";
  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <section className="text-center space-y-4">
        <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">Exhibition</h2>
        <h1 className="text-5xl font-serif font-bold text-foreground">Active Auctions</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore our curated selection of rare antiquities and participate in real-time global bidding.
        </p>
      </section>

      <div className="flex justify-between items-center border-b border-border pb-4">
        <div className="flex gap-4">
          <button className="text-xs font-bold uppercase tracking-widest border-b-2 border-primary pb-1">All Auctions</button>
          <button className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition pb-1">Ending Soon</button>
          <button className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition pb-1">Featured</button>
        </div>
        <div className="text-xs font-bold text-muted-foreground">
          Sort by: <span className="text-foreground">Recent</span>
        </div>
      </div>

      <AuctionErrorBoundary>
        <LiveAuction lotId={DEMO_LOT_ID} userId={DEMO_USER_ID} />
      </AuctionErrorBoundary>
    </div>
  );
}
