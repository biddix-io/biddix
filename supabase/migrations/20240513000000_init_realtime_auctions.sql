-- Enable Realtime for the public schema
-- Note: In a real Supabase environment, this might be done via the dashboard or a specific SQL command
-- but for the migration we'll use the standard way to add tables to the realtime publication.
BEGIN;
  -- Create publication if it doesn't exist (Supabase usually has one called supabase_realtime)
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;

  -- Create Auctions table
  CREATE TABLE public.auctions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Create Lots table
  CREATE TABLE public.lots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      image_url TEXT,
      current_bid_amount DECIMAL(12, 2) DEFAULT 0,
      min_increment DECIMAL(12, 2) DEFAULT 1,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
      ends_at TIMESTAMPTZ NOT NULL,
      highest_bidder_id UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Create Bids table
  CREATE TABLE public.bids (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
      bidder_id UUID NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Add tables to Realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.lots;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

  -- Function to place a bid with server-side validation
  CREATE OR REPLACE FUNCTION public.place_bid(p_lot_id UUID, p_bidder_id UUID, p_amount DECIMAL)
  RETURNS void AS $$
  DECLARE
      v_current_bid DECIMAL;
      v_min_increment DECIMAL;
      v_status TEXT;
      v_ends_at TIMESTAMPTZ;
  BEGIN
      -- Select lot details with a lock to prevent race conditions
      SELECT current_bid_amount, min_increment, status, ends_at
      INTO v_current_bid, v_min_increment, v_status, v_ends_at
      FROM public.lots
      WHERE id = p_lot_id
      FOR UPDATE;

      -- Validation
      IF v_status <> 'active' THEN
          RAISE EXCEPTION 'Lot is not active';
      END IF;

      IF v_ends_at < now() THEN
          RAISE EXCEPTION 'Auction has ended';
      END IF;

      IF p_amount < v_current_bid + v_min_increment THEN
          RAISE EXCEPTION 'Bid amount too low';
      END IF;

      -- Update lot
      UPDATE public.lots
      SET
          current_bid_amount = p_amount,
          highest_bidder_id = p_bidder_id,
          updated_at = now()
      WHERE id = p_lot_id;

      -- Insert bid
      INSERT INTO public.bids (lot_id, bidder_id, amount)
      VALUES (p_lot_id, p_bidder_id, p_amount);
  END;
  $$ LANGUAGE plpgsql;

  -- Admin functions
  CREATE OR REPLACE FUNCTION public.update_lot_status(p_lot_id UUID, p_status TEXT)
  RETURNS void AS $$
  BEGIN
      UPDATE public.lots
      SET status = p_status, updated_at = now()
      WHERE id = p_lot_id;
  END;
  $$ LANGUAGE plpgsql;

COMMIT;
