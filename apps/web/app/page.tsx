'use client';

import { LiveAuction } from '../components/LiveAuction';
import { AdminControls } from '../components/AdminControls';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function AuctionPage() {
  // Demo IDs
  const lotId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
  const userId = '7c9e66ab-0e86-4444-9640-5e3e2646b96e'; // Sample UUID

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Biddix Live Auction</h1>
          <p className="text-gray-600 mt-2">MVP Real-time Bidding Demo</p>
        </header>

        <ErrorBoundary>
          <LiveAuction lotId={lotId} userId={userId} />
        </ErrorBoundary>

        <div className="border-t pt-8">
          <AdminControls lotId={lotId} />
        </div>

        <footer className="text-center text-sm text-gray-500">
          <p>Powered by Supabase Realtime</p>
        </footer>
      </div>
    </main>
  );
}
