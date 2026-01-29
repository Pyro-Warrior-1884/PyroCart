'use client';

import ProductCard from '../components/product/ProductCard';
import './shop.css';
import { useEffect, useState } from "react";
import { getAllProducts } from "@/app/services/product.service";
import { useRouter } from "next/navigation";

export default function ShopPage() {

  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await getAllProducts();
        const grouped: Record<string, any[]> = {};

        products.forEach((p: any) => {
          const categoryName = p.category.name;

          if (!grouped[categoryName]) {
            grouped[categoryName] = [];
          }

          grouped[categoryName].push({
            id: String(p.id),
            name: p.title,
            price: Number(p.price),
            rating: p.ratingAvg ?? 0,
            image: decodeURIComponent(
              p.images?.[0]?.url?.split("/product-images/")[1] || ""
            )
          });
        });

        const formatted = Object.keys(grouped).map((key) => ({
          id: key.toLowerCase(),
          name: key,
          products: grouped[key],
        }));

        setCategories(formatted);
      } catch (err) {
        console.log("Failed to load products");
      }
    }

    loadProducts();
  }, []);


  const handleViewAll = (categoryId: string) => {
    console.log('View all clicked for:', categoryId);
    router.push(`/shop/category/${categoryId}`);
  };


  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-text">
          <span className="breadcrumb-current">Main</span> &gt;
        </span>
      </div>

      {/* Main Content */}
      <main className="shop-main">
        {/* Category Sections */}
        {categories.map((category) => (
          <section key={category.id} className="category-section">
            {/* Category Header */}
            <div className="category-header">
              <h2 className="category-title">{category.name}</h2>
              <button 
                className="view-all-btn"
                onClick={() => handleViewAll(category.id)}
              >
                View All
              </button>
            </div>

            {/* Product Slider */}
            <div className="product-slider">
              <div className="product-slider-container">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    rating={product.rating}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}