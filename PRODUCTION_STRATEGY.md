# Production Strategy: Biddix Realtime Auctions

This document outlines the strategy for testing, scaling, and optimizing the Biddix auction platform.

## 1. Stress Testing Checklist
Before a high-traffic live auction, perform the following tests:
- [ ] **Concurrent Bidding**: Simulate 50+ users placing bids on the same lot within a 1-second window to verify `FOR UPDATE` lock performance.
- [ ] **Network Throttling**: Simulate "Flaky" connections (3G/High Latency) to verify the UI handles the `DISCONNECTED` state and re-fetches data gracefully.
- [ ] **Presence Load**: Verify the `onlineBidders` count remains accurate with 500+ concurrent connections on a single lot.
- [ ] **Admin Override**: Test the "Pause" and "Extend" functions during active bidding to ensure the frontend timers react within <200ms.

## 2. Realtime Scalability Notes
- **Supabase Realtime Limits**: Monitor the number of concurrent connections. Supabase projects have tiers; ensure the production tier supports the expected number of simultaneous bidders.
- **Database Connection Pool**: High-frequency bidding via RPCs consumes database connections. Ensure `Prisma` or the Supabase connection pooler is configured to handle the peak transaction load.
- **Horizontal Scaling**: Since we are using Supabase (BaaS), the primary scalability concern is the client-side state management. The current hook architecture is lightweight enough for thousands of clients per lot.

## 3. Future Optimization Recommendations
- **Server-Time Sync**: Implement a "Time Sync" hook that fetches the server's current time once and calculates the offset to eliminate local clock drift issues.
- **Optimistic UI**: Implement immediate UI feedback for the bidder while the `place_bid` RPC is in flight, with a rollback mechanism on failure.
- **Extended History**: Implement pagination for bid history using Supabase `range()` for auctions with hundreds of bids.
- **Batch Updates**: For extremely high-velocity auctions, consider "throttling" the UI updates to 2-3 times per second to reduce CPU usage on mobile devices.
- **Edge Functions**: Move admin validation and complex business logic to Supabase Edge Functions if the Postgres function logic becomes too complex.
