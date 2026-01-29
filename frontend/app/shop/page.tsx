'use client';

import React from 'react';
import ProductCard from '../components/product/ProductCard';
import './shop.css';

// Mock data for demonstration
const categories = [
  {
    id: 'men',
    name: 'Men',
    products: [
      { id: '1', name: 'Product 1', price: 49.99, rating: 4 },
      { id: '2', name: 'Product 2', price: 79.99, rating: 5 },
      { id: '3', name: 'Product 1', price: 59.99, rating: 4 },
      { id: '4', name: 'Product 1', price: 89.99, rating: 5 },
      { id: '5', name: 'Product 1', price: 69.99, rating: 4 },
      { id: '6', name: 'Product 3', price: 99.99, rating: 5 },
    ]
  },
  {
    id: 'women',
    name: 'Women',
    products: [
      { id: '7', name: 'Product 1', price: 54.99, rating: 5 },
      { id: '8', name: 'Product 2', price: 74.99, rating: 4 },
      { id: '9', name: 'Product 1', price: 64.99, rating: 5 },
      { id: '10', name: 'Product 1', price: 84.99, rating: 4 },
      { id: '11', name: 'Product 1', price: 94.99, rating: 5 },
      { id: '12', name: 'Product 3', price: 104.99, rating: 5 },
    ]
  }
];

export default function ShopPage() {
  const handleViewAll = (categoryId: string) => {
    console.log('View all clicked for:', categoryId);
    // TODO: Navigate to category page
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-text">
          <span className="breadcrumb-current">Main</span> &gt;
        </span>
      </div>

      {/* Main Content */}
      <main className="shop-main">
        {/* Category Sections */}
        {categories.map((category) => (
          <section key={category.id} className="category-section">
            {/* Category Header */}
            <div className="category-header">
              <h2 className="category-title">{category.name}</h2>
              <button 
                className="view-all-btn"
                onClick={() => handleViewAll(category.id)}
              >
                View All
              </button>
            </div>

            {/* Product Slider */}
            <div className="product-slider">
              <div className="product-slider-container">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    rating={product.rating}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}