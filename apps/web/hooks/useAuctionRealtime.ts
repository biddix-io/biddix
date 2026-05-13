import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type Lot = {
  id: string;
  title: string;
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

export type ConnectionState = 'INITIALIZING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export function useAuctionRealtime(lotId: string, userId?: string) {
  const [lot, setLot] = useState<Lot | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('INITIALIZING');
  const [onlineBidders, setOnlineBidders] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const [lotRes, bidsRes] = await Promise.all([
          supabase.from('lots').select('*').eq('id', lotId).single(),
          supabase.from('bids').select('*').eq('lot_id', lotId).order('created_at', { ascending: false }).limit(10)
        ]);

        if (lotRes.data) setLot(lotRes.data);
        if (bidsRes.data) setBids(bidsRes.data);
      } catch (err) {
        console.error('Error fetching initial auction data:', err);
        setConnectionState('ERROR');
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [lotId]);

  // Subscribe to realtime updates and presence
  useEffect(() => {
    if (!lotId) return;

    const channel = supabase.channel(`lot:${lotId}`, {
      config: {
        presence: {
          key: userId || 'anonymous',
        },
      },
    });

    channel
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
            // Optimistic update check: only update if data is newer
            if (new Date(newLot.updated_at) <= new Date(currentLot.updated_at)) {
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
            if (currentBids.some((b) => b.id === newBid.id)) return currentBids;
            return [newBid, ...currentBids].slice(0, 10);
          });
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineBidders(Object.keys(state).length);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('CONNECTED');
          channel.track({ online_at: new Date().toISOString() });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionState('ERROR');
        } else if (status === 'TIMED_OUT') {
          setConnectionState('DISCONNECTED');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lotId, userId]);

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

  return {
    lot,
    bids,
    loading,
    connectionState,
    onlineBidders,
    placeBid,
    updateStatus
  };
}
