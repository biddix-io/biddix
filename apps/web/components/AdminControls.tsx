import React from 'react';
import { useAuctionRealtime } from '../hooks/useAuctionRealtime';

interface AdminControlsProps {
  lotId: string;
}

export const AdminControls: React.FC<AdminControlsProps> = ({ lotId }) => {
  const { lot, updateStatus, loading } = useAuctionRealtime(lotId);

  if (loading || !lot) return null;

  return (
    <div className="admin-controls p-4 border rounded bg-gray-50 mt-4">
      <h3 className="font-bold mb-2">Admin Controls</h3>
      <div className="flex gap-2">
        {lot.status === 'active' && (
          <button
            onClick={() => updateStatus('paused')}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            Pause Lot
          </button>
        )}
        {lot.status === 'paused' && (
          <button
            onClick={() => updateStatus('active')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Resume Lot
          </button>
        )}
        {lot.status !== 'closed' && (
          <button
            onClick={() => updateStatus('closed')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Close Lot
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Current Status: <span className="uppercase font-semibold">{lot.status}</span>
      </p>
    </div>
  );
};
