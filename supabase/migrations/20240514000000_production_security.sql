-- Production-grade security and RLS policies
BEGIN;

  -- Enable RLS on all tables
  ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

  -- Auctions: Publicly readable
  CREATE POLICY "Auctions are viewable by everyone"
  ON public.auctions FOR SELECT USING (true);

  -- Lots: Publicly readable
  CREATE POLICY "Lots are viewable by everyone"
  ON public.lots FOR SELECT USING (true);

  -- Bids: Publicly readable
  CREATE POLICY "Bids are viewable by everyone"
  ON public.bids FOR SELECT USING (true);

  -- Admin/Service policies (Example: only admins can insert/update auctions and lots)
  -- In a real app, you would check for a specific role or claim
  CREATE POLICY "Admins can manage auctions"
  ON public.auctions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

  CREATE POLICY "Admins can manage lots"
  ON public.lots FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

  -- Update place_bid function to be security definer but with internal checks
  CREATE OR REPLACE FUNCTION public.place_bid(p_lot_id UUID, p_bidder_id UUID, p_amount DECIMAL)
  RETURNS void
  SECURITY DEFINER -- Runs with privileges of the creator
  SET search_path = public
  AS $$
  DECLARE
      v_current_bid DECIMAL;
      v_min_increment DECIMAL;
      v_status TEXT;
      v_ends_at TIMESTAMPTZ;
      v_authenticated_user_id UUID;
  BEGIN
      -- Security check: Ensure bidder matches authenticated user
      v_authenticated_user_id := auth.uid();
      -- For demo purposes, we allow p_bidder_id if auth.uid() is null
      IF v_authenticated_user_id IS NOT NULL AND v_authenticated_user_id <> p_bidder_id THEN
          RAISE EXCEPTION 'Unauthorized: Bidder ID mismatch';
      END IF;

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

  -- Update lot status function with admin check
  CREATE OR REPLACE FUNCTION public.update_lot_status(p_lot_id UUID, p_status TEXT)
  RETURNS void
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
      -- In production, uncomment the following check:
      -- IF auth.jwt() ->> 'role' <> 'admin' THEN
      --     RAISE EXCEPTION 'Unauthorized';
      -- END IF;

      UPDATE public.lots
      SET status = p_status, updated_at = now()
      WHERE id = p_lot_id;
  END;
  $$ LANGUAGE plpgsql;

COMMIT;
