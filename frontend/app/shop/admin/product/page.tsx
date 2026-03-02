'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import { getMyProfile } from '@/app/services/user.service';
import { getAllProducts, Product, deleteProduct } from '@/app/services/product.service';
import ProductEditForm from '@/app/components/admin/ProductEditForm';
import ProductCreateForm from '@/app/components/admin/ProductCreateForm';
import DeleteConfirmationModal from '@/app/components/admin/DeleteConfirmationModal';
import Toast, { ToastType } from '@/app/components/layout/Toast';
import '../../shop.css';
import '../../create.css';
import '../../dropdown.css';
import '../../delete.css';
import '../../toast.css';

type Operation = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
type SortField = 'title' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
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
  title: 'Name',
  price: 'Price',
  stock: 'Stock',
  createdAt: 'Created',
  updatedAt: 'Updated',
};

const COLUMNS: { field: SortField; label: string; align: 'left' | 'center' }[] = [
  { field: 'title',     label: 'Product Name', align: 'left'   },
  { field: 'price',     label: 'Price',        align: 'center' },
  { field: 'stock',     label: 'Stock',        align: 'center' },
  { field: 'createdAt', label: 'Created At',   align: 'center' },
  { field: 'updatedAt', label: 'Updated At',   align: 'center' },
];

const COL_WIDTHS = ['60px', '35%', '110px', '100px', '160px', '160px'];

function SortIcon({ priority, direction }: { priority: number | null; direction: SortDirection | null }) {
  const isActive = priority !== null;
  return (
    <span className="sort-icon-wrapper">
      {isActive && (
        <span className="sort-priority-badge">{priority! + 1}</span>
      )}
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

export default function AdminOperationsPage() {
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<Operation>('READ');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [sortEntries, setSortEntries] = useState<SortEntry[]>([]);
  const [readRefreshKey, setReadRefreshKey] = useState(0);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const profile = await getMyProfile();
        if (profile.role !== 'ADMIN') {
          router.push('/shop');
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        console.log('Failed to verify admin');
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if ((selectedOperation === 'READ' || selectedOperation === 'UPDATE' || selectedOperation === 'DELETE') && isAdmin) {
      loadProducts();
    }
  }, [selectedOperation, isAdmin]);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Failed to load products', 'error');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const handleSort = (field: SortField) => {
    setSortEntries((prev) => {
      const idx = prev.findIndex((e) => e.field === field);
      if (idx === -1) return [...prev, { field, direction: 'asc' }];
      if (prev[idx].direction === 'asc') return prev.map((e, i) => i === idx ? { ...e, direction: 'desc' } : e);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleRemoveSortEntry = (field: SortField) => {
    setSortEntries((prev) => prev.filter((e) => e.field !== field));
  };

  const handleResetSort = () => setSortEntries([]);

  const getSortInfo = (field: SortField): { priority: number | null; direction: SortDirection | null } => {
    const idx = sortEntries.findIndex((e) => e.field === field);
    if (idx === -1) return { priority: null, direction: null };
    return { priority: idx, direction: sortEntries[idx].direction };
  };

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return products;
    const query = debouncedSearch.toLowerCase();
    return products.filter(p => p.title.toLowerCase().includes(query));
  }, [products, debouncedSearch]);

  const sortedProducts = useMemo(() => {
    if (sortEntries.length === 0) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      for (const { field, direction } of sortEntries) {
        const dir = direction === 'asc' ? 1 : -1;
        let cmp = 0;
        switch (field) {
          case 'title':     cmp = a.title.localeCompare(b.title);                                                    break;
          case 'price':     cmp = a.price - b.price;                                                                 break;
          case 'stock':     cmp = a.stock - b.stock;                                                                 break;
          case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();                 break;
          case 'updatedAt': cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();                 break;
        }
        if (cmp !== 0) return dir * cmp;
      }
      return 0;
    });
  }, [filteredProducts, sortEntries]);

  const handleOperationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Operation;
    setSelectedOperation(value);
    setEditingProductId(null);
    setSearchQuery('');
    setSortEntries([]);
    setShowCreateForm(false);

    if (value === 'READ') {
      setReadRefreshKey((k) => k + 1);
    }
  };

  const handleProductClick = (productId: number) => {
    if (selectedOperation === 'READ') {
      router.push(`/shop/product/${productId}`);
    } else if (selectedOperation === 'UPDATE') {
      setEditingProductId(productId);
    } else if (selectedOperation === 'DELETE') {
      const product = products.find(p => p.id === productId);
      if (product) {
        setProductToDelete({ id: product.id, name: product.title });
        setDeleteModalOpen(true);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deleted successfully!`, 'success');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      showToast('Failed to delete product. Please try again.', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleBackFromEdit = (success?: boolean, message?: string) => {
    setEditingProductId(null);
    if (success && message) {
      showToast(message, 'success');
    }
    loadProducts();
  };

  const handleBackFromCreate = () => {
    setShowCreateForm(false);
  };

  const handleCreateSuccess = (message?: string) => {
    setShowCreateForm(false);
    if (message) {
      showToast(message, 'success');
    }
    loadProducts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => `₹${parseFloat(price.toString()).toFixed(2)}`;

  const renderProductsTable = (isUpdateMode: boolean = false, isDeleteMode: boolean = false) => {
    return (
      <div className="operation-content-full">
        <div className="products-table-header">
          <div className="products-table-header-left">
            <h2 className="products-table-title">
              {isUpdateMode ? 'Select Product to Edit' : isDeleteMode ? 'Select Product to Delete' : 'All Products'}
            </h2>
            <p className="products-table-count">
              {sortedProducts.length} of {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </p>
          </div>

          {(isUpdateMode || isDeleteMode) && (
            <div className="search-bar-container">
              <svg className="search-bar-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="search-bar-clear"
                >
                  ×
                </button>
              )}
            </div>
          )}

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
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button className="sort-reset-btn" onClick={handleResetSort}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Reset all
              </button>
            </div>
          )}
        </div>

        {productsLoading ? (
          <div className="products-loading">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : sortedProducts.length > 0 ? (
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
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="product-row"
                  >
                    <td className="product-id col-center">#{product.id}</td>

                    <td className="product-name-cell col-left">
                      <div className="product-name-wrapper">
                        <span className="product-icon">📦</span>
                        <span className="product-name-text">{product.title}</span>
                      </div>
                    </td>

                    <td className="product-price-cell col-center">
                      <span className="product-price-badge">{formatPrice(product.price)}</span>
                    </td>

                    <td className="product-stock-cell col-center">
                      <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
                      </span>
                    </td>

                    <td className="product-date col-center">{formatDate(product.createdAt)}</td>
                    <td className="product-date col-center">{formatDate(product.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="products-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <h3>No Products Found</h3>
            <p>{searchQuery ? 'No products match your search.' : 'There are no products in the database yet.'}</p>
          </div>
        )}
      </div>
    );
  };

  const renderOperationContent = () => {
    switch (selectedOperation) {
      case 'CREATE':
        if (showCreateForm) {
          return <ProductCreateForm onBack={handleBackFromCreate} onSuccess={handleCreateSuccess} showToast={showToast} />;
        }
        return (
          <div className="operation-content">
            <div className="operation-icon create-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h2 className="operation-title">Create New Product</h2>
            <p className="operation-description">Add a new product to your inventory with all necessary details.</p>
            <button onClick={() => setShowCreateForm(true)} className="create-product-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Product
            </button>
          </div>
        );

      case 'READ':
        return renderProductsTable(false);

      case 'UPDATE':
        if (editingProductId) {
          return <ProductEditForm productId={editingProductId} onBack={handleBackFromEdit} showToast={showToast} />;
        }
        return renderProductsTable(true);

      case 'DELETE':
        return (
          <>
            {renderProductsTable(false, true)}
            <DeleteConfirmationModal
              isOpen={deleteModalOpen}
              productName={productToDelete?.name || ''}
              productId={productToDelete?.id || 0}
              onConfirm={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
            />
          </>
        );

      default:
        return null;
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Main', href: '/shop' }, { label: 'CRUD', href: `/shop/admin/product` }]} />
        <main className="shop-main">
          <div className="loading-state">Loading...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={closeToast}
      />
      <Breadcrumb items={[{ label: 'Main', href: '/shop' }, { label: 'CRUD', href: `/shop/admin/product` }]} />
      <main className="shop-main">
        <div className="operations-header">
          <h1 className="operations-page-title">Admin Operations</h1>
          <p className="operations-subtitle">Manage system data and records</p>
        </div>
        <div className="operations-selector-container">
          <label htmlFor="operation-select" className="operation-label">Select Operation:</label>
          <select
            id="operation-select"
            value={selectedOperation}
            onChange={handleOperationChange}
            className="operation-dropdown"
          >
            <option value="READ">Read - View Data</option>
            <option value="CREATE">Create - Add New Records</option>
            <option value="UPDATE">Update - Edit Existing Records</option>
            <option value="DELETE">Delete - Remove Records</option>
          </select>
        </div>
        {renderOperationContent()}
      </main>
    </>
  );
}