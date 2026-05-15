import React from 'react';
import { DealerCard } from '../../components/DealerCard';

const MOCK_DEALERS = [
  { id: '1', name: 'Imperial Arts', location: 'Rome, Italy', specialty: 'Roman Sculpture & Coins', rating: 4.9, inventoryCount: 142 },
  { id: '2', name: 'Attica Antiquities', location: 'Athens, Greece', specialty: 'Hellenistic Pottery', rating: 5.0, inventoryCount: 86 },
  { id: '3', name: 'Nile Gallery', location: 'London, UK', specialty: 'Egyptian Dynasty Relics', rating: 4.8, inventoryCount: 210 },
  { id: '4', name: 'Gothic Relics', location: 'Paris, France', specialty: 'Medieval Artifacts', rating: 4.7, inventoryCount: 54 },
];

export default function DealersPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <section className="space-y-4">
        <h1 className="text-4xl font-serif font-bold">Verified Dealers</h1>
        <p className="text-muted-foreground">The world&apos;s most reputable antiquities experts, strictly vetted for authenticity and provenance.</p>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {MOCK_DEALERS.map(dealer => (
          <DealerCard key={dealer.id} dealer={dealer} />
        ))}
      </div>
    </div>
  );
}
