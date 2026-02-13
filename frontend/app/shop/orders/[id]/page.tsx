'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import { getOrderById } from '@/app/services/order.service';
import '../../shop.css';

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderDetail {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  function resolveImageUrl(url?: string) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  }

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await getOrderById(Number(orderId));

        const formattedOrder = {
          id: data.id,
          total: Number(data.total),
          status: data.status,
          createdAt: data.createdAt,
          items: data.items.map((item: any) => ({
            productId: item.productId,
            productName: item.product?.title || 'Product',
            price: Number(item.price),
            quantity: item.quantity,
            image: resolveImageUrl(item.product?.images?.[0]?.url),
          }))
        };

        setOrder(formattedOrder);
      } catch (err) {
        console.log('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'PAID':
        return 'status-paid';
      case 'SHIPPED':
        return 'status-shipped';
      case 'DELIVERED':
        return 'status-delivered';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Breadcrumb 
        items={[
          { label: 'Main', href: '/shop' }, 
          { label: 'Orders', href: `/shop/orders` },
          { label: 'My Order', href: `/shop/orders/${orderId}` }
        ]} />
        <main className="shop-main">
          <div className="loading-state">Loading order details...</div>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Breadcrumb 
        items={[
          { label: 'Main', href: '/shop' }, 
          { label: 'Orders', href: `/shop/orders` },
          { label: 'My Order', href: `/shop/orders/${orderId}` }
        ]} />
        <main className="shop-main">
          <div className="empty-state">
            <h2>Order Not Found</h2>
            <p>The order you&apos;re looking for doesn&apos;t exist.</p>
            <button className="shop-now-btn" onClick={() => router.push('/shop/orders')}>
              Back to Orders
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Breadcrumb 
      items={[
        { label: 'Main', href: '/shop' }, 
        { label: 'Orders', href: `/shop/orders` },
        { label: 'My Order', href: `/shop/orders/${orderId}` }
      ]} />

      <main className="shop-main">
        <div className="order-detail-header">
          <div className="order-detail-title-section">
            <h1 className="order-detail-title">Order #{order.id}</h1>
            <span className={`order-status ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="order-detail-date">{formatDate(order.createdAt)}</p>
        </div>

        <div className="order-detail-container">
          <div className="order-items-section">
            <h2 className="section-title">Order Items</h2>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-card">
                  <div className="order-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} />
                    ) : (
                      <span>No Image</span>
                    )}
                  </div>
                  <div className="order-item-details">
                    <h3 className="order-item-name">{item.productName}</h3>
                    <p className="order-item-price">${item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="order-item-total">
                    <p className="order-item-total-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary-section">
            <h2 className="section-title">Order Summary</h2>
            <div className="order-summary-card">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${order.total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span className="summary-label">Total</span>
                <span className="summary-value">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="back-to-orders-btn"
              onClick={() => router.push('/shop/orders')}
            >
              Back to Orders
            </button>
          </div>
        </div>
      </main>
    </>
  );
}