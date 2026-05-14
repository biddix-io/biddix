import React from 'react';

interface Dealer {
  id: string;
  name: string;
  location: string;
  specialty: string;
  rating: number;
  inventoryCount: number;
}

export const DealerCard: React.FC<{ dealer: Dealer }> = ({ dealer }) => {
  return (
    <div className="luxury-card p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
      <div className="w-20 h-20 shrink-0 rounded-full bg-muted flex items-center justify-center font-serif text-2xl font-bold border border-border">
        {dealer.name.charAt(0)}
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-1 sm:gap-0">
          <h3 className="text-xl font-serif font-bold">{dealer.name}</h3>
          <div className="flex items-center gap-1 text-primary">
            <span className="text-sm font-bold">{dealer.rating}</span>
            <span className="text-xs">★</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{dealer.location} • {dealer.specialty}</p>
        <div className="flex justify-center sm:justify-start gap-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            {dealer.inventoryCount} pieces in collection
          </span>
        </div>
      </div>
      <button className="w-full sm:w-auto px-4 py-2 border border-border rounded text-sm font-bold hover:bg-muted transition shrink-0">
        View Profile
      </button>
    </div>
  );
};
