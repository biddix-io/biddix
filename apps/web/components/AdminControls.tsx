import React from 'react';
import { useAuctionRealtime } from '../hooks/useAuctionRealtime';

interface AdminControlsProps {
  lotId: string;
}

export const AdminControls: React.FC<AdminControlsProps> = ({ lotId }) => {
  const { lot, updateStatus, loading } = useAuctionRealtime(lotId);

  if (loading || !lot) return null;

  return (
    <div className="luxury-card p-6 rounded-xl mt-8">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Admin Controls</h3>
      <div className="flex flex-wrap gap-3">
        {lot.status === 'active' && (
          <button
            onClick={() => updateStatus('paused')}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded hover:bg-amber-600 transition uppercase tracking-wider"
          >
            Pause Lot
          </button>
        )}
        {lot.status === 'paused' && (
          <button
            onClick={() => updateStatus('active')}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition uppercase tracking-wider"
          >
            Resume Lot
          </button>
        )}
        {lot.status !== 'closed' && (
          <button
            onClick={() => updateStatus('closed')}
            className="px-4 py-2 bg-destructive text-white text-xs font-bold rounded hover:bg-destructive/90 transition uppercase tracking-wider"
          >
            Close Lot
          </button>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Current Status: <span className="text-foreground font-bold">{lot.status}</span>
        </p>
      </div>
    </div>
  );
};
