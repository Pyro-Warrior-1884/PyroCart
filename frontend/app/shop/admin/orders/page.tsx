'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import Toast, { ToastType } from '@/app/components/layout/Toast';
import { getMyProfile } from '@/app/services/user.service';
import { getAllOrders, UserWithOrders, updateOrderStatus } from '@/app/services/order.service';
import '../../shop.css';
import '../../dropdown.css';
import '../../toast.css';
import '../../status.css';

type SortField = 'email' | 'orderCount' | 'totalSpent' | 'latestOrder';
type SortDirection = 'asc' | 'desc';

interface SortEntry {
  field: SortField;
  direction: SortDirection;
}

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

const FIELD_LABELS: Record<SortField, string> = {
  email:       'User',
  orderCount:  'Orders',
  totalSpent:  'Total Spent',
  latestOrder: 'Latest Order',
};

const COLUMNS: { field: SortField; label: string; align: 'left' | 'center' }[] = [
  { field: 'email',       label: 'User',         align: 'left'   },
  { field: 'orderCount',  label: 'Orders',       align: 'center' },
  { field: 'totalSpent',  label: 'Total Spent',  align: 'center' },
  { field: 'latestOrder', label: 'Latest Order', align: 'center' },
];

const COL_WIDTHS = ['60px', '35%', '100px', '130px', '170px', '180px'];

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'status-pending',
  PAID:      'status-paid',
  SHIPPED:   'status-shipped',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
};

const ORDER_STATUS_FLOW: Record<string, string | null> = {
  PENDING: 'PAID',
  PAID: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: null, 
  CANCELLED: null, 
};

const STATUS_ACTION_LABELS: Record<string, string> = {
  PENDING: 'Mark as Paid',
  PAID: 'Mark as Shipped',
  SHIPPED: 'Mark as Delivered',
  DELIVERED: 'Completed ✓',
  CANCELLED: 'Cancelled',
};

function SortIcon({ priority, direction }: { priority: number | null; direction: SortDirection | null }) {
  const isActive = priority !== null;
  return (
    <span className="sort-icon-wrapper">
      {isActive && <span className="sort-priority-badge">{priority! + 1}</span>}
      <span className="sort-chevrons">
        <svg
          className={`sort-chevron ${isActive && direction === 'asc' ? 'sort-chevron-active' : ''}`}
          width="10" height="6" viewBox="0 0 10 6" fill="none"
        >
          <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg
          className={`sort-chevron ${isActive && direction === 'desc' ? 'sort-chevron-active' : ''}`}
          width="10" height="6" viewBox="0 0 10 6" fill="none"
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

interface FlatUser {
  id: number;
  email: string;
  orderCount: number;
  totalSpent: number;
  latestOrder: string | null;
  statusSummary: Record<string, number>;
  raw: UserWithOrders;
}

function flattenUsers(users: UserWithOrders[]): FlatUser[] {
  return users.map((u) => {
    const orderCount = u.orders.length;
    const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.total), 0);
    const latestOrder = u.orders.length > 0 ? u.orders[0].createdAt : null;

    const statusSummary: Record<string, number> = {};
    for (const order of u.orders) {
      statusSummary[order.status] = (statusSummary[order.status] ?? 0) + 1;
    }

    return { id: u.id, email: u.email, orderCount, totalSpent, latestOrder, statusSummary, raw: u };
  });
}

export default function AdminAllOrdersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [users, setUsers]               = useState<FlatUser[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sortEntries, setSortEntries]   = useState<SortEntry[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [toast, setToast]               = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const showToast = (message: string, type: ToastType) =>
    setToast({ show: true, message, type });

  const closeToast = () =>
    setToast((t) => ({ ...t, show: false }));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const profile = await getMyProfile();
        if (profile.role !== 'ADMIN') { router.push('/shop'); return; }
        setIsAdmin(true);
      } catch {
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const data = await getAllOrders();
      setUsers(flattenUsers(data));
    } catch (err) {
      console.error('Failed to load orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadOrders();
  }, [isAdmin, loadOrders]);

  const handleStatusUpdate = async (orderId: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const nextStatus = ORDER_STATUS_FLOW[currentStatus];
    
    if (!nextStatus) {
      showToast(`Order #${orderId} is already in terminal state: ${currentStatus}`, 'info');
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      
      await updateOrderStatus(orderId, nextStatus);
      
      showToast(`Order #${orderId} updated: ${currentStatus} → ${nextStatus}`, 'success');
      
      await loadOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast(`Failed to update order #${orderId} status`, 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSort = (field: SortField) => {
    setSortEntries((prev) => {
      const idx = prev.findIndex((e) => e.field === field);
      if (idx === -1) return [...prev, { field, direction: 'asc' }];
      if (prev[idx].direction === 'asc')
        return prev.map((e, i) => (i === idx ? { ...e, direction: 'desc' } : e));
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleRemoveSortEntry = (field: SortField) =>
    setSortEntries((prev) => prev.filter((e) => e.field !== field));

  const handleResetSort = () => setSortEntries([]);

  const getSortInfo = (field: SortField): { priority: number | null; direction: SortDirection | null } => {
    const idx = sortEntries.findIndex((e) => e.field === field);
    if (idx === -1) return { priority: null, direction: null };
    return { priority: idx, direction: sortEntries[idx].direction };
  };

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch.trim()) return users;
    const q = debouncedSearch.toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, debouncedSearch]);

  const sortedUsers = useMemo(() => {
    if (sortEntries.length === 0) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      for (const { field, direction } of sortEntries) {
        const dir = direction === 'asc' ? 1 : -1;
        let cmp = 0;
        switch (field) {
          case 'email':
            cmp = a.email.localeCompare(b.email);
            break;
          case 'orderCount':
            cmp = a.orderCount - b.orderCount;
            break;
          case 'totalSpent':
            cmp = a.totalSpent - b.totalSpent;
            break;
          case 'latestOrder':
            cmp =
              (a.latestOrder ? new Date(a.latestOrder).getTime() : 0) -
              (b.latestOrder ? new Date(b.latestOrder).getTime() : 0);
            break;
        }
        if (cmp !== 0) return dir * cmp;
      }
      return 0;
    });
  }, [filteredUsers, sortEntries]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const formatPrice = (price: number) =>
    `₹${parseFloat(price.toString()).toFixed(2)}`;

  const totalOrdersCount = users.reduce((s, u) => s + u.orderCount, 0);

  if (!isAdmin) return null;

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Main', href: '/shop' }, { label: 'All Orders', href: '/shop/admin/orders' }]} />
        <main className="shop-main">
          <div className="loading-state">Loading...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={closeToast} />
      <Breadcrumb items={[{ label: 'Main', href: '/shop' }, { label: 'All Orders', href: '/shop/admin/orders' }]} />

      <main className="shop-main">
        {/* ── Page header ── */}
        <div className="operations-header">
          <h1 className="operations-page-title">All Orders</h1>
          <p className="operations-subtitle">View and manage every customer order</p>
        </div>

        {/* ── Table card ── */}
        <div className="operation-content-full">
          <div className="products-table-header">
            <div className="products-table-header-left">
              <h2 className="products-table-title">Customer Orders</h2>
              <p className="products-table-count">
                {sortedUsers.length} of {users.length} {users.length === 1 ? 'User' : 'Users'}
                {' · '}
                {totalOrdersCount} {totalOrdersCount === 1 ? 'Order' : 'Orders'} total
              </p>
            </div>

            <div className="search-bar-container">
              <svg className="search-bar-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="search-bar-clear">×</button>
              )}
            </div>

            {/* Sort chips */}
            {sortEntries.length > 0 && (
              <div className="sort-status-bar">
                <span className="sort-status-bar-label">Sorted by:</span>
                <div className="sort-chips">
                  {sortEntries.map((entry, idx) => (
                    <span key={entry.field} className="sort-chip">
                      <span className="sort-chip-priority">{idx + 1}</span>
                      <span className="sort-chip-label">{FIELD_LABELS[entry.field]}</span>
                      <span className="sort-chip-dir">{entry.direction === 'asc' ? '↑' : '↓'}</span>
                      <button
                        className="sort-chip-remove"
                        onClick={(e) => { e.stopPropagation(); handleRemoveSortEntry(entry.field); }}
                        title={`Remove ${FIELD_LABELS[entry.field]} sort`}
                      >×</button>
                    </span>
                  ))}
                </div>
                <button className="sort-reset-btn" onClick={handleResetSort}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Reset all
                </button>
              </div>
            )}
          </div>

          {/* ── Table body ── */}
          {ordersLoading ? (
            <div className="products-loading">
              <div className="loading-spinner" />
              <p>Loading orders...</p>
            </div>
          ) : sortedUsers.length > 0 ? (
            <div className="products-table-container">
              <table className="products-table">
                <colgroup>
                  {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
                </colgroup>

                <thead>
                  <tr>
                    <th className="col-center">ID</th>
                    {COLUMNS.map(({ field, label, align }) => {
                      const { priority, direction } = getSortInfo(field);
                      const isActive = priority !== null;
                      return (
                        <th
                          key={field}
                          className={`col-${align} th-sortable ${isActive ? 'th-sorted' : ''}`}
                          onClick={() => handleSort(field)}
                          title={`Click to sort by ${FIELD_LABELS[field]}`}
                        >
                          <span className={`th-inner th-inner-${align}`}>
                            {label}
                            <SortIcon priority={priority} direction={direction} />
                          </span>
                        </th>
                      );
                    })}
                    <th className="col-center">Status Breakdown</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedUsers.map((user) => (
                    <>
                      {/* ── User row ── */}
                      <tr
                        key={user.id}
                        className={`product-row ${expandedUserId === user.id ? 'row-expanded' : ''}`}
                        onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                        title="Click to toggle orders"
                      >
                        <td className="product-id col-center">#{user.id}</td>

                        <td className="product-name-cell col-left">
                          <div className="product-name-wrapper">
                            <span className="product-icon">👤</span>
                            <span className="product-name-text">{user.email}</span>
                          </div>
                        </td>

                        <td className="col-center">
                          <span className="product-price-badge">{user.orderCount}</span>
                        </td>

                        <td className="col-center">
                          <span className="product-price-badge">{formatPrice(user.totalSpent)}</span>
                        </td>

                        <td className="product-date col-center">
                          {user.latestOrder ? formatDate(user.latestOrder) : '—'}
                        </td>

                        <td className="col-center">
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {Object.entries(user.statusSummary).map(([status, count]) => (
                              <span
                                key={status}
                                className={`stock-badge ${STATUS_COLORS[status] ?? 'in-stock'}`}
                                style={{ fontSize: '11px', padding: '2px 8px' }}
                              >
                                {status} ×{count}
                              </span>
                            ))}
                            {user.orderCount === 0 && (
                              <span className="stock-badge out-of-stock">No orders</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded orders sub-table ── */}
                      {expandedUserId === user.id && user.raw.orders.length > 0 && (
                        <tr key={`${user.id}-expanded`} className="expanded-row">
                          <td colSpan={6} style={{ padding: '0 0 12px 48px', background: 'var(--surface-secondary, #f9f9f9)' }}>
                            <table className="products-table" style={{ marginTop: '8px', fontSize: '13px' }}>
                              <thead>
                                <tr>
                                  <th className="col-center" style={{ width: '70px' }}>Order ID</th>
                                  <th className="col-center" style={{ width: '120px' }}>Status</th>
                                  <th className="col-center" style={{ width: '120px' }}>Total</th>
                                  <th className="col-center" style={{ width: '160px' }}>Date</th>
                                  <th className="col-left">Items</th>
                                  <th className="col-center" style={{ width: '150px' }}>Update Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {user.raw.orders.map((order) => {
                                  const nextStatus = ORDER_STATUS_FLOW[order.status];
                                  const isTerminal = !nextStatus;
                                  const isUpdating = updatingOrderId === order.id;

                                  return (
                                    <tr key={order.id} className="product-row">
                                      <td 
                                        className="product-id col-center"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/shop/admin/orders/${order.id}`);
                                        }}
                                      >
                                        #{order.id}
                                      </td>
                                      <td className="col-center">
                                        <span className={`stock-badge ${STATUS_COLORS[order.status] ?? 'in-stock'}`}>
                                          {order.status}
                                        </span>
                                      </td>
                                      <td className="col-center">
                                        <span className="product-price-badge">{formatPrice(Number(order.total))}</span>
                                      </td>
                                      <td className="product-date col-center">{formatDate(order.createdAt)}</td>
                                      <td className="product-name-cell col-left">
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                          {order.items.map((item, i) => (
                                            <span key={i} style={{ fontSize: '12px', opacity: 'revert-layer' }}>
                                              {item.product?.title ?? `Product #${item.productId}`}
                                              {' '}×{item.quantity}
                                              {i < order.items.length - 1 ? ',' : ''}
                                            </span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="col-center">
                                        <button
                                          onClick={(e) => handleStatusUpdate(order.id, order.status, e)}
                                          disabled={isTerminal || isUpdating}
                                          className={`status-update-btn ${isTerminal ? 'terminal' : ''}`}
                                          title={isTerminal ? 'Cannot update terminal status' : `Update to ${nextStatus}`}
                                        >
                                          {isUpdating ? (
                                            <>
                                              <div className="btn-spinner"></div>
                                              Updating
                                            </>
                                          ) : (
                                            <>
                                              {isTerminal ? (
                                                <>
                                                  {order.status === 'DELIVERED' ? '✓' : '✕'} {STATUS_ACTION_LABELS[order.status]}
                                                </>
                                              ) : (
                                                <>
                                                  →  {STATUS_ACTION_LABELS[order.status]}
                                                </>
                                              )}
                                            </>
                                          )}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="products-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <h3>No Orders Found</h3>
              <p>{searchQuery ? 'No users match your search.' : 'There are no orders in the system yet.'}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}