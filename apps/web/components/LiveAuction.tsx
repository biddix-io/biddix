import React, { useState, useEffect } from 'react';
import { useAuctionRealtime } from '../hooks/useAuctionRealtime';

interface LiveAuctionProps {
  lotId: string;
  userId: string;
}

export const LiveAuction: React.FC<LiveAuctionProps> = ({ lotId, userId }) => {
  const { lot, bids, loading, connectionState, onlineBidders, placeBid } = useAuctionRealtime(lotId, userId);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Synchronized countdown timer
  useEffect(() => {
    if (!lot || lot.status !== 'active') {
      setTimeLeft(lot?.status === 'closed' ? 'Closed' : lot?.status === 'paused' ? 'Paused' : '');
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

  if (loading) return <div className="p-4 text-center">Loading auction...</div>;
  if (!lot) return <div className="p-4 text-center">Lot not found.</div>;

  return (
    <div className="auction-container p-4 border rounded shadow-md max-w-md mx-auto bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{lot.title}</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`} title={connectionState}></span>
          <span className="text-xs text-gray-500">{onlineBidders} online</span>
        </div>
      </div>

      <div className="status-grid grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card p-3 bg-gray-50 rounded border">
          <p className="text-xs text-gray-500 uppercase">Current Bid</p>
          <p className="text-lg font-bold">${lot.current_bid_amount}</p>
        </div>
        <div className="stat-card p-3 bg-gray-50 rounded border">
          <p className="text-xs text-gray-500 uppercase">Time Left</p>
          <p className={`text-lg font-bold ${lot.status === 'active' ? 'text-red-600' : 'text-gray-500'}`}>{timeLeft}</p>
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
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition active:scale-95"
            >
              Bid
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </form>
      )}

      <div className="bid-history">
        <h3 className="text-sm font-bold mb-2 uppercase text-gray-500">Recent Bids</h3>
        <div className="max-h-40 overflow-y-auto">
          <ul className="space-y-1">
            {bids.map((bid) => (
              <li key={bid.id} className={`text-sm border-b py-2 flex justify-between ${bid.bidder_id === userId ? 'bg-blue-50' : ''}`}>
                <span className="text-gray-600">
                  {bid.bidder_id === userId ? 'You' : `User ${bid.bidder_id.slice(0, 4)}`}
                </span>
                <span className="font-bold">${bid.amount}</span>
              </li>
            ))}
            {bids.length === 0 && <p className="text-gray-400 text-sm italic py-2">No bids yet. Be the first!</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};
