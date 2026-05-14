'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAuctionRealtime } from '../hooks/useAuctionRealtime';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface LiveAuctionProps {
  lotId: string;
  userId: string;
}

export const LiveAuction: React.FC<LiveAuctionProps> = ({ lotId, userId }) => {
  const { lot, bids, loading, connectionState, onlineBidders, placeBid } = useAuctionRealtime(lotId, userId);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('Calculating...');
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`);
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

  const handleBid = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await placeBid(userId, bidAmount);
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    }
  }, [placeBid, userId, bidAmount]);

  const bidHistory = useMemo(() => (
    <ul className="space-y-1" aria-live="polite">
      {bids.map((bid) => (
        <li key={bid.id} className={`text-sm border-b border-gray-100 py-2 flex justify-between animate-fadeIn ${bid.bidder_id === userId ? 'bg-blue-50/50' : ''}`}>
          <span className="text-gray-600 font-mono text-xs">
            {bid.bidder_id === userId ? 'YOU' : `ID: ${bid.bidder_id.slice(0, 8)}...`}
          </span>
          <span className="font-bold text-gray-900">${bid.amount}</span>
        </li>
      ))}
      {bids.length === 0 && <p className="text-gray-400 text-sm italic py-4 text-center">No bids yet. Be the first!</p>}
    </ul>
  ), [bids, userId]);

  if (loading || !isMounted) {
    return <Card className="animate-pulse h-64 flex items-center justify-center text-gray-400">Loading auction...</Card>;
  }

  if (!lot) {
    return <Card className="text-center py-12 text-gray-500">Lot not found.</Card>;
  }

  return (
    <Card className="auction-container shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={lot.status === 'active' ? 'success' : lot.status === 'paused' ? 'warning' : 'gray'}>
            {lot.status.toUpperCase()}
          </Badge>
          <div className="flex items-center gap-1.5 ml-2" title={`Connection: ${connectionState}`}>
            <span className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs text-gray-500 font-medium">{onlineBidders} online</span>
          </div>
        </div>
      </div>

      {lot.image_url && (
        <div className="relative w-full h-48 sm:h-64 mb-4 rounded-md overflow-hidden bg-gray-100 border">
          <Image
            src={lot.image_url}
            alt={lot.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-4">{lot.title}</h1>

      <div className="status-grid grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card p-3 bg-gray-50 rounded border">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Bid</p>
          <p className="text-2xl font-bold text-gray-900">${lot.current_bid_amount}</p>
        </div>
        <div className="stat-card p-3 bg-gray-50 rounded border">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Time Left</p>
          <p className="text-2xl font-bold text-red-600" aria-label={`Time remaining: ${timeLeft}`}>{timeLeft}</p>
        </div>
      </div>

      {lot.status === 'active' && (
        <form onSubmit={handleBid} className="bidding-panel mb-6">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <Input
              label="Place your bid"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={Number(lot.current_bid_amount) + Number(lot.min_increment)}
              step={lot.min_increment}
              error={error || undefined}
              required
            />
            <Button
              type="submit"
              className="w-full sm:w-auto"
              aria-label="Place Bid"
            >
              Place Bid
            </Button>
          </div>
        </form>
      )}

      <div className="bid-history">
        <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider mb-2">Recent Bids</h3>
        {bidHistory}
      </div>
    </Card>
  );
};
