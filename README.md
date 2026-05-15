# Biddix

Biddix is a premium real-time auction marketplace for luxury antiquities and rare collectibles.

## Features

- **Real-time Bidding**: Instant updates powered by Supabase Realtime.
- **Luxury UI/UX**: Elegant, minimal design focused on high-end antiquities.
- **Mobile Responsive**: Optimized for seamless bidding on all devices.
- **Secure**: Server-side bid validation and Row Level Security (RLS).
- **Production Ready**: Optimized Next.js 14 architecture with monorepo support.

## Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), React, Tailwind CSS.
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Auth).
- **Monorepo Management**: NPM Workspaces.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- NPM 9.x or later
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/biddix-io/biddix.git
   cd biddix
   ```

2. Install dependencies from the root:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `apps/web/.env.local` and fill in your Supabase credentials.

4. Initialize the database:
   Run the SQL migration found in `supabase/migrations/20240513000000_init_realtime_auctions.sql` in your Supabase SQL Editor.

### Development

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## Architecture

```text
biddix/
├── apps/
│   └── web/                # Next.js 14 Application
├── packages/               # Shared logic (future growth)
├── supabase/
│   └── migrations/         # Database schema and RLS policies
└── package.json            # Root workspace config
```

## Security

- **RLS Policies**: All tables have Row Level Security enabled.
- **Atomic Bidding**: Bids are processed via a Postgres function (`place_bid`) with a `FOR UPDATE` lock to prevent race conditions.
- **Validation**: Server-side checks for bid amount, lot status, and auction end times.

## Deployment Checklist

### Supabase
1. **Database Schema**: Apply the migration in `supabase/migrations`.
2. **Environment Variables**: Get `API URL` and `anon key` from Supabase Project Settings -> API.
3. **Realtime**: Ensure Realtime is enabled for `lots` and `bids` tables (handled by migration).

### Vercel
1. **Framework Preset**: Select `Next.js`.
2. **Root Directory**: Select `/` (monorepo root) or `/apps/web` if deploying only the web app.
3. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Build Command**: `npm run build` (if from root, it uses workspaces).

## License

Private / Proprietary.
