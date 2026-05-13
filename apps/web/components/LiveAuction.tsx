import React, { useState, useEffect } from 'react';
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

  // Synchronized countdown timer
  useEffect(() => {
    if (!lot || lot.status !== 'active') {
      setTimeLeft(lot?.status === 'closed' ? 'Closed' : 'Paused');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(lot.ends_at).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('Ended');
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lot]);

  // Set default bid amount when lot updates
  useEffect(() => {
    if (lot) {
      setBidAmount(Number(lot.current_bid_amount) + Number(lot.min_increment));
    }
  }, [lot]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await placeBid(userId, bidAmount);
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    }
  };

  if (loading) return <div>Loading auction...</div>;
  if (!lot) return <div>Lot not found.</div>;

  return (
    <div className="auction-container p-4 border rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">{lot.title}</h1>

      <div className="status-grid grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Current Bid</p>
          <p className="text-xl font-semibold">${lot.current_bid_amount}</p>
        </div>
        <div className="stat-card p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Time Left</p>
          <p className="text-xl font-semibold text-red-600">{timeLeft}</p>
        </div>
      </div>

      {lot.status === 'active' && (
        <form onSubmit={handleBid} className="bidding-panel mb-6">
          <div className="flex gap-2">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={Number(lot.current_bid_amount) + Number(lot.min_increment)}
              step={lot.min_increment}
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Place Bid
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </form>
      )}

      <div className="bid-history">
        <h3 className="font-semibold mb-2">Recent Bids</h3>
        <ul className="space-y-1">
          {bids.map((bid) => (
            <li key={bid.id} className="text-sm border-b py-1 flex justify-between">
              <span>User {bid.bidder_id.slice(0, 8)}...</span>
              <span className="font-medium">${bid.amount}</span>
            </li>
          ))}
          {bids.length === 0 && <p className="text-gray-500 text-sm italic">No bids yet.</p>}
        </ul>
      </div>
    </div>
  );
};
