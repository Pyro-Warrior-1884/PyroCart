'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, createReview } from '@/app/services/product.service';
import { addToCart } from '@/app/services/cart.service';
import '../../shop.css';
import Breadcrumb from '@/app/components/layout/BreadCrumb';

interface ProductImage {
  id: number;
  url: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  userId: number;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: {
    id: number;
    name: string;
  };
  images: ProductImage[];
  reviews: Review[];
  ratingAvg: number | null;
  ratingCount: number | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const id = parseInt(params.id as string);
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      console.log('Product added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      console.log('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    
    setSubmittingReview(true);
    try {
      await createReview(product.id, reviewRating, reviewComment || undefined);
      console.log('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment('');
      
      const data = await getProductById(product.id);
      setProduct(data);
    } catch (error) {
      console.error('Failed to submit review:', error);
      console.log('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="star-full">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star-half">★</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star-empty">★</span>
      );
    }

    return stars;
  };

  const renderInteractiveStars = (rating: number, onRate: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star-interactive ${i <= rating ? 'star-full' : 'star-empty'}`}
          onClick={() => onRate(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state">
        <h2>Product Not Found</h2>
        <p>The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <button onClick={() => router.push('/shop')} className="shop-now-btn">
          Back to Shop
        </button>
      </div>
    );
  }

  const productImages = product.images.length > 0 
    ? product.images 
    : [{ id: 0, url: '' }];

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <>
      <Breadcrumb items={[
        { label: 'Main', href: '/shop' }, 
        { label: product.category.name, href: `/shop/category/${product.category.name.toLowerCase().replace(/\s+/g, '-')}`},
        { label: 'Product', href: `/shop/product/${product.id}`}
      ]} />
      
      <main className="product-detail-page">
        <div className="product-detail-container">
          <div className="product-images-section">
            <div className="product-image-thumbnails">
              {productImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  {image.url ? (
                    <img src={image.url} alt={`${product.title} - View ${index + 1}`} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="product-image-main">
              {productImages[selectedImage].url ? (
                <img 
                  src={productImages[selectedImage].url} 
                  alt={product.title}
                />
              ) : (
                <div className="no-image-placeholder">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="product-info-section">
            <div className="product-category-tag">{product.category.name}</div>
            
            <h1 className="product-detail-title">{product.title}</h1>
            
            {product.ratingAvg && (
              <div className="product-rating-section">
                <div className="rating-stars">
                  {renderStars(product.ratingAvg)}
                </div>
                <span className="rating-text">
                  {product.ratingAvg.toFixed(1)} out of 5
                </span>
                <span className="rating-count">
                  ({product.ratingCount} {product.ratingCount === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            )}

            <div className="product-price-section">
              <div className="price-main">
                <span className="currency">$</span>
                <span className="price-value">{product.price.toString().split('.')[0]}</span>
                <span className="price-cents">{product.price.toString().split('.')[1] || '00'}</span>
              </div>
            </div>

            <div className="product-stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#10b981"/>
                    <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#ef4444"/>
                    <path d="M5 8h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Out of Stock
                </span>
              )}
            </div>

            <div className="product-description-section">
              <h2 className="section-heading">About this item</h2>
              <p className="product-description-text">{product.description}</p>
            </div>

            <div className="product-reviews-section">
              <div className="reviews-header">
                <h2 className="section-heading">Customer Reviews</h2>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="write-review-btn"
                >
                  Write a Review
                </button>
              </div>
              
              {product.reviews && product.reviews.length > 0 ? (
                <div className="reviews-list">
                  {product.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-stars">
                          {renderStars(review.rating)}
                        </div>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>

          <div className="product-purchase-section">
            <div className="purchase-card">
              <div className="purchase-price">
                <span className="price-label">Total Price:</span>
                <span className="price-amount">${totalPrice}</span>
              </div>

              {product.stock > 0 && (
                <div className="delivery-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0v-6m4 6v-6m0 0h8m0 0a2 2 0 104 0m-4 0a2 2 0 114 0" 
                      stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div className="delivery-title">FREE Delivery</div>
                    <div className="delivery-date">Tomorrow, {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              )}

              <div className="quantity-section">
                <label className="quantity-label">Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="quantity-btn"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="purchase-actions">
                <button 
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                  disabled={product.stock === 0 || addingToCart}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>

              <div className="security-badges">
                <div className="badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Secure transaction</span>
                </div>
                
                <div className="badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Buyer Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a Review</h2>
              <button 
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="review-form-group">
                <label>Rating</label>
                <div className="review-stars-input">
                  {renderInteractiveStars(reviewRating, setReviewRating)}
                </div>
              </div>
              
              <div className="review-form-group">
                <label>Comment (Optional)</label>
                <textarea
                  className="review-textarea"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn-cancel"
                onClick={() => setShowReviewModal(false)}
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button 
                className="modal-btn-submit"
                onClick={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}