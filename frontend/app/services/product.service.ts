import { fetcher } from "@/app/lib/fetcher";

export interface ProductSearchResult {
  id: number;
  name: string;
  price: number;
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

export async function getAllProducts() {
  const res = await fetcher("/products");

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
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