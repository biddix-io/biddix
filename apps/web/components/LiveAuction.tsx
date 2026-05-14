import React, { useState, useEffect, useCallback } from 'react';
import { useAuctionRealtime } from '../hooks/useAuctionRealtime';

interface LiveAuctionProps {
  lotId: string;
  userId: string;
}

export const LiveAuction: React.FC<LiveAuctionProps> = ({ lotId, userId }) => {
  const { lot, bids, loading, placeBid } = useAuctionRealtime(lotId);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronized countdown timer
  useEffect(() => {
    if (!lot) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(lot.ends_at).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Auction Ended');
        return;
      }

      if (lot.status !== 'active') {
        setTimeLeft(lot.status === 'closed' ? 'Closed' : 'Paused');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const hDisplay = hours > 0 ? `${hours}h ` : '';
      const mDisplay = `${minutes}m `;
      const sDisplay = `${seconds}s`;

      setTimeLeft(`${hDisplay}${mDisplay}${sDisplay}`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [lot]);

  // Set default bid amount when lot updates
  useEffect(() => {
    if (lot && !isSubmitting) {
      setBidAmount(Number(lot.current_bid_amount) + Number(lot.min_increment));
    }
  }, [lot, isSubmitting]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await placeBid(userId, bidAmount);
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <AuctionSkeleton />;
  if (!lot) return <div className="text-center py-10 text-muted-foreground">Lot not found.</div>;

  return (
    <div className="luxury-card rounded-xl overflow-hidden max-w-2xl mx-auto">
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              Lot #{lot.id.slice(0, 8)}
            </span>
            <h1 className="text-3xl font-serif font-bold text-foreground leading-tight">{lot.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Time Remaining</p>
            <p className={`text-xl font-mono font-bold ${timeLeft.includes('Ended') ? 'text-destructive' : 'text-primary'}`}>
              {timeLeft}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Current Bid</p>
            <p className="text-3xl font-bold text-foreground">
              ${Number(lot.current_bid_amount).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Min. Increment</p>
            <p className="text-3xl font-bold text-foreground">
              ${Number(lot.min_increment).toLocaleString()}
            </p>
          </div>
        </div>

        {lot.status === 'active' && (
          <form onSubmit={handleBid} className="space-y-4 mb-8">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={Number(lot.current_bid_amount) + Number(lot.min_increment)}
                step={lot.min_increment}
                className="w-full pl-8 pr-4 py-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xl font-bold"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 gold-gradient text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-widest"
            >
              {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
            </button>
            {error && <p className="text-destructive text-sm text-center font-medium">{error}</p>}
          </form>
        )}

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Bid History</h3>
          <div className="space-y-3">
            {bids.map((bid) => (
              <div key={bid.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                    ID
                  </div>
                  <div>
                    <p className="text-sm font-medium">User {bid.bidder_id.slice(0, 8)}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(bid.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">${Number(bid.amount).toLocaleString()}</span>
              </div>
            ))}
            {bids.length === 0 && (
              <p className="text-muted-foreground text-sm italic text-center py-4">No bids have been placed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuctionSkeleton = () => (
  <div className="luxury-card rounded-xl overflow-hidden max-w-2xl mx-auto animate-pulse">
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded"></div>
          <div className="h-8 w-64 bg-muted rounded"></div>
        </div>
        <div className="w-24 h-12 bg-muted rounded"></div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="h-20 bg-muted rounded-lg"></div>
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
      <div className="h-14 bg-muted rounded-lg mb-8"></div>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted rounded"></div>
        <div className="h-10 bg-muted rounded"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
    </div>
  </div>
);
