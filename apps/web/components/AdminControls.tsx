'use client';

import React from 'react';
import { useAuctionRealtime } from '../hooks/useAuctionRealtime';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface AdminControlsProps {
  lotId: string;
}

export const AdminControls: React.FC<AdminControlsProps> = ({ lotId }) => {
  const { lot, updateStatus, loading } = useAuctionRealtime(lotId);

  if (loading || !lot) return null;

  return (
    <Card title="Admin Controls" className="bg-gray-50 border-dashed">
      <div className="flex flex-wrap gap-2">
        {lot.status === 'active' && (
          <Button
            variant="warning"
            onClick={() => updateStatus('paused')}
            aria-label="Pause lot"
          >
            Pause Lot
          </Button>
        )}
        {lot.status === 'paused' && (
          <Button
            variant="primary"
            onClick={() => updateStatus('active')}
            aria-label="Resume lot"
          >
            Resume Lot
          </Button>
        )}
        {lot.status !== 'closed' && (
          <Button
            variant="danger"
            onClick={() => updateStatus('closed')}
            aria-label="Close lot"
          >
            Close Lot
          </Button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Status:</span>
        <Badge variant={lot.status === 'active' ? 'success' : lot.status === 'paused' ? 'warning' : 'gray'}>
          {lot.status.toUpperCase()}
        </Badge>
      </div>
    </Card>
  );
};
