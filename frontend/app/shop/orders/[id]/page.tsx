'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import Toast, { ToastType } from '@/app/components/layout/Toast';
import { getOrderById, updateOrderStatus } from '@/app/services/order.service';
import '../../shop.css';
import '../../toast.css';
import '../../cancel.css';

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

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: ToastType) =>
    setToast({ show: true, message, type });

  const closeToast = () =>
    setToast((t) => ({ ...t, show: false }));

  function resolveImageUrl(url?: string) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  }

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await getOrderById(Number(orderId));

      const formattedOrder = {
        id: data.id,
        total: Number(data.total),
        status: data.status,
        createdAt: data.createdAt,
        items: data.items.map((item) => ({
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
      showToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  }

  const canCancelOrder = (status: string): boolean => {
    // Can only cancel if order is PENDING or PAID
    return status === 'PENDING' || status === 'PAID';
  };

  const handleCancelClick = () => {
    if (!order) return;

    if (!canCancelOrder(order.status)) {
      showToast(`Cannot cancel order in ${order.status} status`, 'warning');
      return;
    }

    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!order) return;

    try {
      setCancelling(true);
      await updateOrderStatus(order.id, 'CANCELLED');
      
      showToast(`Order #${order.id} cancelled successfully`, 'success');
      setShowCancelModal(false);
      
      // Reload order to show updated status
      await loadOrder();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      showToast('Failed to cancel order. Please try again.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
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
        <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={closeToast} />
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
      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={closeToast} />
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
                    <p className="order-item-price">₹{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="order-item-total">
                    <p className="order-item-total-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
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
                <span className="summary-value">₹{order.total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span className="summary-label">Total</span>
                <span className="summary-value">₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Cancel Order Button */}
            {canCancelOrder(order.status) && (
              <button 
                className="cancel-order-btn"
                onClick={handleCancelClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Cancel Order
              </button>
            )}

            {!canCancelOrder(order.status) && order.status !== 'CANCELLED' && (
              <div className="cancel-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Order cannot be cancelled once {order.status.toLowerCase()}</span>
              </div>
            )}

            <button 
              className="back-to-orders-btn"
              onClick={() => router.push('/shop/orders')}
            >
              Back to Orders
            </button>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={handleCancelModalClose}>
            <div className="cancel-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="cancel-modal-header">
                <div className="cancel-icon-large">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2 className="cancel-modal-title">Cancel Order?</h2>
                <button
                  onClick={handleCancelModalClose}
                  className="modal-close"
                  disabled={cancelling}
                >
                  ×
                </button>
              </div>

              <div className="cancel-modal-body">
                <p className="cancel-modal-warning">
                  Are you sure you want to cancel this order?
                </p>
                <div className="cancel-order-info">
                  <span className="cancel-order-id">Order #{order.id}</span>
                  <span className="cancel-order-total">Total: ₹{order.total.toFixed(2)}</span>
                </div>
                <p className="cancel-modal-note">
                  ⚠️ This action cannot be undone. Your order will be marked as cancelled.
                </p>
              </div>

              <div className="cancel-modal-footer">
                <button
                  onClick={handleCancelModalClose}
                  disabled={cancelling}
                  className="cancel-modal-btn-back"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelling}
                  className="cancel-modal-btn-confirm"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}