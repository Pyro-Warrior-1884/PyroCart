'use client';

import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import '../shop.css';

export default function CheckoutPage() {
  const router = useRouter();

  const handleReturnToShopping = () => {
    router.push('/shop');
  };

  return (
    <>
      <Breadcrumb items={[
        { label: 'Main', href: '/shop' }, 
        { label: 'My Cart', href: `/shop/cart` }
      ]} />

      <main className="shop-main">
        <div className="checkout-success-container">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 className="success-title">Order Placed Successfully!</h1>
          
          <p className="success-message">
            Your order has been placed and will reach your destination soon.
          </p>

          <p className="success-submessage">
            Thank you for shopping with PyroCart!
          </p>

          <button 
            className="return-shopping-btn"
            onClick={handleReturnToShopping}
          >
            Return to Shopping
          </button>
        </div>
      </main>
    </>
  );
}