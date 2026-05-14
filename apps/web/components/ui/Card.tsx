import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white border rounded-lg shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
