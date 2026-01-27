import React from 'react';
import "./shop.css";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-container">
      {children}
    </div>
  );
}