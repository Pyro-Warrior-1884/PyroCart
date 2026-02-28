import { fetcher } from "@/app/lib/fetcher";

export interface ProductSearchResult {
  id: number;
  name: string;
  price: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ratingAvg: number;
  category: {
    id: number;
    name: string;
  };
  images: Array<{
    id: number;
    url: string;
  }>;
}

export async function searchProducts(
  query: string
): Promise<ProductSearchResult[]> {
  if (!query.trim()) return [];

  const res = await fetcher(
    `/products/search?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
}

export async function getAllProducts(): Promise<Product[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const response = await fetcher(`/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

export async function getProductById(id: number) {
  const res = await fetcher(`/products/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export async function createReview(productId: number, rating: number, comment?: string) {
  const res = await fetcher(`/products/${productId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating, comment }),
  });

  if (!res.ok) {
    throw new Error("Failed to create review");
  }

  return res.json();
}

export async function updateReview(productId: number, reviewId: number, rating: number, comment?: string) {
  const res = await fetcher(`/products/${productId}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating, comment }),
  });

  if (!res.ok) {
    throw new Error("Failed to update review");
  }

  return res.json();
}

export async function deleteReview(productId: number, reviewId: number) {
  const res = await fetcher(`/products/${productId}/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete review");
  }

  return res.json();
}

export async function createProduct(dto: {
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  isActive?: boolean;
}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const res = await fetcher("/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(dto),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to create product");
  }

  return res.json();
}

export async function updateProduct(
  id: number,
  dto: Partial<{
    title: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    isActive: boolean;
  }>
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const res = await fetcher(`/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(dto),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Backend error:', res.status, text);
    throw new Error('Failed to update product');
  }

  return res.json();
}

export async function deleteProduct(id: number) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const res = await fetcher(`/products/${id}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete product");
  }

  return res.json();
}