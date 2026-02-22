'use client';

import { useState } from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  productName: string;
  productId: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  productName,
  productId,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-icon-large">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h2 className="delete-modal-title">Delete Product?</h2>
          <button
            onClick={onCancel}
            className="modal-close"
            disabled={deleting}
          >
            ×
          </button>
        </div>

        <div className="delete-modal-body">
          <p className="delete-modal-warning">
            Are you sure you want to delete this product?
          </p>
          <div className="delete-product-info">
            <span className="delete-product-id">Product #{productId}</span>
            <span className="delete-product-name">{productName}</span>
          </div>
          <p className="delete-modal-note">
            ⚠️ This action cannot be undone. All data associated with this product will be permanently deleted.
          </p>
        </div>

        <div className="delete-modal-footer">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="delete-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="delete-modal-btn-confirm"
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
}