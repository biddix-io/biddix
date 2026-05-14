import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type Lot = {
  id: string;
  title: string;
  image_url: string | null;
  current_bid_amount: number;
  min_increment: number;
  status: 'active' | 'paused' | 'closed';
  ends_at: string;
  highest_bidder_id: string | null;
  updated_at: string;
};

export type Bid = {
  id: string;
  lot_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
};

export function useAuctionRealtime(lotId: string) {
  const [lot, setLot] = useState<Lot | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    const { data: lotData } = await supabase
      .from('lots')
      .select('*')
      .eq('id', lotId)
      .single();

    const { data: bidsData } = await supabase
      .from('bids')
      .select('*')
      .eq('lot_id', lotId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (lotData) setLot(lotData);
    if (bidsData) setBids(bidsData);
    setLoading(false);
  }, [lotId]);

  // Fetch initial data
  useEffect(() => {
    setLoading(true);
    fetchInitialData();
  }, [fetchInitialData]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`lot:${lotId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lots',
          filter: `id=eq.${lotId}`,
        },
        (payload) => {
          const newLot = payload.new as Lot;
          setLot((currentLot) => {
            if (!currentLot) return newLot;
            // Only update if the new data is actually newer
            if (new Date(newLot.updated_at) < new Date(currentLot.updated_at)) {
              return currentLot;
            }
            return newLot;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `lot_id=eq.${lotId}`,
        },
        (payload) => {
          const newBid = payload.new as Bid;
          setBids((currentBids) => {
            // Idempotency check: prevent duplicate bid events
            if (currentBids.some((b) => b.id === newBid.id)) {
              return currentBids;
            }
            return [newBid, ...currentBids].slice(0, 10);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lotId, fetchInitialData]);

  const placeBid = useCallback(async (bidderId: string, amount: number) => {
    const { error } = await supabase.rpc('place_bid', {
      p_lot_id: lotId,
      p_bidder_id: bidderId,
      p_amount: amount,
    });

    if (error) throw error;
  }, [lotId]);

  const updateStatus = useCallback(async (status: Lot['status']) => {
    const { error } = await supabase.rpc('update_lot_status', {
      p_lot_id: lotId,
      p_status: status,
    });

    if (error) throw error;
  }, [lotId]);

  return { lot, bids, loading, placeBid, updateStatus };
}
