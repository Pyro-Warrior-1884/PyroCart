'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import CartItem from '@/app/components/cart/CartItem';
import { getCart, updateCartItem, removeFromCart } from '@/app/services/cart.service';
import '../shop.css';

interface CartItemData {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();

      const formattedItems = data.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.title || 'Product',
        price: Number(item.product?.price || 0),
        quantity: item.quantity,
        image: item.product?.images?.[0]?.url
      })) || [];

      setCartItems(formattedItems);
    } catch (err) {
      console.log('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      setUpdating(true);
      await updateCartItem(productId, quantity);
      
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.log('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setUpdating(true);
      await removeFromCart(productId);
      
      setCartItems(prevItems =>
        prevItems.filter(item => item.productId !== productId)
      );
    } catch (err) {
      console.log('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handlePlaceOrder = () => {
    console.log('Place order clicked');
    router.push('/shop/checkout');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const total = calculateTotal();

  return (
    <>
      <Breadcrumb items={[
        { label: 'Main', href: '/shop' }, 
        { label: 'My Cart', href: `/shop/cart` }
      ]} />

      <main className="shop-main">
        <div className="cart-page-header">
          <h1 className="cart-page-title">Shopping Cart</h1>
          <p className="cart-items-count">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading cart...</div>
        ) : cartItems.length > 0 ? (
          <div className="cart-container">
            <div className="cart-items-section">
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    productId={item.productId}
                    name={item.productName}
                    price={item.price}
                    quantity={item.quantity}
                    image={item.image}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>

            <div className="cart-summary-section">
              <div className="cart-summary-card">
                <h2 className="cart-summary-title">Order Summary</h2>
                
                <div className="cart-summary-details">
                  <div className="summary-row">
                    <span className="summary-label">Subtotal</span>
                    <span className="summary-value">${total.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value">Free</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Tax</span>
                    <span className="summary-value">$0.00</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row summary-total">
                    <span className="summary-label">Total</span>
                    <span className="summary-value">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={updating}
                >
                  {updating ? 'Processing...' : 'Place Order'}
                </button>
              </div>

              <button 
                className="continue-shopping-btn"
                onClick={() => router.push('/shop')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2>Your Cart is Empty</h2>
            <p>Add some products to your cart to see them here!</p>
            <button 
              className="shop-now-btn"
              onClick={() => router.push('/shop')}
            >
              Start Shopping
            </button>
          </div>
        )}
      </main>
    </>
  );
}