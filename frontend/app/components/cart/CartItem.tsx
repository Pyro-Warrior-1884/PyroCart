'use client';

import React from 'react';

interface CartItemProps {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({
  id,
  productId,
  name,
  price,
  quantity,
  image,
  onUpdateQuantity,
  onRemove
}: CartItemProps) {

  const handleIncrease = () => {
    onUpdateQuantity(productId, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(productId, quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(productId);
  };

  const itemTotal = price * quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span>No Image</span>
        )}
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-name">{name}</h3>
        <p className="cart-item-price">${price.toFixed(2)}</p>
      </div>

      <div className="cart-item-quantity">
        <button 
          className="quantity-btn" 
          onClick={handleDecrease}
          disabled={quantity <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span className="quantity-value">{quantity}</span>
        <button 
          className="quantity-btn" 
          onClick={handleIncrease}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="cart-item-total">
        <p className="item-total-price">${itemTotal.toFixed(2)}</p>
      </div>

      <button 
        className="remove-item-btn" 
        onClick={handleRemove}
        aria-label="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );
}