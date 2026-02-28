'use client';

import { useState } from 'react';
import { createProduct } from '@/app/services/product.service';

interface ProductCreateFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface CreateProductFormDto {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  categoryId: number;
}

export default function ProductCreateForm({ onBack, onSuccess }: ProductCreateFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
  });

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        setSaving(true);

        const dto: CreateProductFormDto = {
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
          category: formData.category,
          categoryId: 0,
        };

        await createProduct(dto);

        alert('Product created successfully!');
        onSuccess();
    } catch (err) {
        console.error('Failed to create product:', err);
        alert('Failed to create product. Please try again.');
    } finally {
        setSaving(false);
    }
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      imageUrl: '',
    });
  };

  return (
    <div className="edit-form-container">
      <div className="edit-form-header">
        <button onClick={onBack} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Operations
        </button>
        <h2 className="edit-form-title">Create New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Product Name *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            rows={4}
            placeholder="Enter product description"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price" className="form-label">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock" className="form-label">Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-input"
              min="0"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">Category *</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., electronics, clothing, books"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl" className="form-label">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-cancel">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleReset} 
            className="btn-reset"
            disabled={saving}
          >
            Reset Form
          </button>
          <button type="submit" disabled={saving} className="btn-submit">
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}