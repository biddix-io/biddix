import React from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  dealer: string;
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="luxury-card group rounded-lg overflow-hidden flex flex-col">
      <div className="aspect-[4/5] relative overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
        {/* Placeholder for real image */}
        <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-xs">
          Image Placeholder
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            {product.category}
          </span>
          <span className="text-sm font-bold">${product.price.toLocaleString()}</span>
        </div>
        <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-auto">
          Dealer: <span className="text-foreground font-medium">{product.dealer}</span>
        </p>
      </div>
    </div>
  );
};
