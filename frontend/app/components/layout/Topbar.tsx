'use client';

import Image from 'next/image';
import { useEffect, useState } from "react";
import { getMyProfile } from "@/app/services/user.service";
import Link from "next/link";
import { searchProducts } from "@/app/services/product.service";
import { ProductSearchResult } from '@/app/services/product.service';

interface TopbarProps {
  onProfileClick: () => void;
}

export default function Topbar({ onProfileClick }: TopbarProps) {
  const [userName, setUserName] = useState("User");
  const firstLetter = userName.charAt(0).toUpperCase();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchProducts(query);
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMyProfile();
        setUserName(data.name);
      } catch {
        console.log("Failed to load user");
      }
    }

    loadUser();
  }, []);

  return (
    <div className="shop-topbar">
      <div className="topbar-left">
        <Link href="/shop" className="logo-container">
          <Image
            src="/PyroCart.png"
            alt="PyroCart Logo"
            width={45}
            height={45}
            className="logo-image"
          />
          <span className="logo-text">PyroCart</span>
        </Link>
      </div>

      <div className="topbar-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Products by Name"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>

          {query && (
            <div className="search-dropdown">
              {loading && (
                <div className="search-loading">Searching...</div>
              )}

              {!loading && results.length === 0 && (
                <div className="search-empty">No products found</div>
              )}

              {!loading &&
                results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/product/${product.id}`}
                    className="search-item"
                    onClick={() => setQuery("")}
                  >
                    <span className="search-name">{product.name}</span>
                    <span className="search-price">₹{product.price}</span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <div className="profile-circle" onClick={onProfileClick}>
          {firstLetter}
        </div>
      </div>
    </div>
  );
}
