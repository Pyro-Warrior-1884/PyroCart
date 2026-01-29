'use client';

import React from 'react';
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
}

export default function ProductCard({ id, name, price, image, rating = 4.5 }: ProductCardProps) {
  const router = useRouter();
  const handleClick = () => {
    console.log('Product clicked:', id);
    router.push(`../shop/product/${id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          'Photo'
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <div className="product-rating">
          {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
        </div>
        <p className="product-price">${price.toFixed(2)}</p>
      </div>
    </div>
  );
}