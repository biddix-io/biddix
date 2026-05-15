'use client';

import React, { useState } from 'react';
import { ProductCard } from '../../components/ProductCard';

const CATEGORIES = ['All', 'Ancient Rome', 'Greece', 'Egypt', 'Middle Ages', 'Coins', 'Jewelry'];

const MOCK_PRODUCTS = [
  { id: '1', title: 'Roman Bronze Fibula', category: 'Ancient Rome', price: 1200, dealer: 'Imperial Arts', imageUrl: '' },
  { id: '2', title: 'Attic Black-Figure Lekythos', category: 'Greece', price: 4500, dealer: 'Attica Antiquities', imageUrl: '' },
  { id: '3', title: 'Egyptian Faience Amulet', category: 'Egypt', price: 850, dealer: 'Nile Gallery', imageUrl: '' },
  { id: '4', title: 'Byzantine Gold Solidus', category: 'Coins', price: 2100, dealer: 'Imperial Arts', imageUrl: '' },
  { id: '5', title: 'Medieval Silver Signet Ring', category: 'Jewelry', price: 3200, dealer: 'Gothic Relics', imageUrl: '' },
  { id: '6', title: 'Hellenistic Marble Fragment', category: 'Greece', price: 12000, dealer: 'Attica Antiquities', imageUrl: '' },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <section className="space-y-4">
        <h1 className="text-4xl font-serif font-bold">The Marketplace</h1>
        <p className="text-muted-foreground">Browse our curated collection of authenticated antiquities from verified dealers.</p>
      </section>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-border pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat ? 'bg-primary text-white' : 'bg-muted hover:bg-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search antiquities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <p className="text-xl font-serif text-muted-foreground italic">No pieces found matching your criteria.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="text-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
