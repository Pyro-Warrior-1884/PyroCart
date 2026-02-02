'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import { getMyOrders } from '@/app/services/order.service';
import '../shop.css';

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await getMyOrders();
        
        const formattedOrders = data.map((order: any) => ({
          id: order.id,
          total: Number(order.total),
          status: order.status,
          createdAt: order.createdAt,
          itemCount: order.items?.length || 0
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.log('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleOrderClick = (orderId: number) => {
    router.push(`/shop/orders/${orderId}`);
  };

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
      day: 'numeric'
    });
  };

  return (
    <>
      <Breadcrumb 
      items={[
        { label: 'Main', href: '/shop' }, 
        { label: 'Orders', href: `/shop/orders` }
      ]} />

      <main className="shop-main">
        <div className="orders-page-header">
          <h1 className="orders-page-title">My Orders</h1>
          <p className="orders-count">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div
                key={order.id}
                className="order-card"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="order-card-header">
                  <div className="order-info-left">
                    <h3 className="order-id">Order #{order.id}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-info-right">
                    <span className={`order-status ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-detail-row">
                    <span className="order-detail-label">Items:</span>
                    <span className="order-detail-value">{order.itemCount}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Total:</span>
                    <span className="order-total">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button className="view-order-btn">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <h2>No Orders Yet</h2>
            <p>You haven&apos;t placed any orders yet. Start shopping to see your orders here!</p>
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