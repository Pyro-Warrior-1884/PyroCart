'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/app/components/product/ProductCard';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import { getAllProducts } from '@/app/services/product.service';
import '@/app/shop/shop.css';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;

  const [categoryName, setCategoryName] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryProducts() {
      try {
        setLoading(true);
        const allProducts = await getAllProducts();

        const normalizedSlug = categorySlug.toLowerCase().replace(/-/g, ' ');

        const categoryProducts = allProducts.filter((p: any) => {
          const categoryNameNormalized = p.category.name.toLowerCase().replace(/-/g, ' ');
          return categoryNameNormalized === normalizedSlug;
        });

        if (categoryProducts.length > 0) {
          setCategoryName(categoryProducts[0].category.name);
          
          const formattedProducts = categoryProducts.map((p: any) => ({
            id: String(p.id),
            name: p.title,
            price: Number(p.price),
            rating: p.ratingAvg ?? 0,
            image: decodeURIComponent(
              p.images?.[0]?.url?.split("/product-images/")[1] || ""
            )
          }));

          setProducts(formattedProducts);
        } else {
          const fallbackName = categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setCategoryName(fallbackName);
        }
      } catch (err) {
        console.log('Failed to load category products', err);
        const fallbackName = categorySlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setCategoryName(fallbackName);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [categorySlug]);

  return (
    <>
      <Breadcrumb items={[
        { label: 'Main', href: '/shop' }, 
        { label: categoryName, href: `/shop/category/${categorySlug}` }
      ]} />

      <main className="shop-main">
        <div className="category-page-header">
          <h1 className="category-page-title">{categoryName}</h1>
          <p className="category-product-count">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                rating={product.rating}
                path='../product'
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No Products Found in {categoryName}.</p>
          </div>
        )}
      </main>
    </>
  );
}