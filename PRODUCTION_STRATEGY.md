# Biddix Production Strategy

## Scaling Strategy
1. **Database**:
    - Move to a dedicated Supabase instance as traffic grows.
    - Monitor `lots` table bloat; implement archiving for closed auctions.
2. **Realtime**:
    - Scale Supabase Realtime nodes if concurrent connection limits are reached.
    - Consider moving to a dedicated WebSocket cluster only if custom logic requirements exceed Supabase capabilities.
3. **Frontend**:
    - Use Edge Middleware for Geo-routing and localized content.
    - Implement ISR (Incremental Static Regeneration) for auction lot pages that don't change frequently.

## Maintenance
- **Backups**: Standard Supabase PITR (Point-in-Time Recovery).
- **Monitoring**: Integration with Sentry for error tracking and PostHog for advanced analytics.
