import { fetcher } from "@/app/lib/fetcher";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
    images: { url: string }[];
  };
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

export async function getCart() {
  const res = await fetcher("/cart");

  if (!res.ok) {
    throw new Error("Failed to fetch cart");
  }

  return res.json();
}

export async function addToCart(productId: number, quantity: number) {
  const res = await fetcher("/cart/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to add to cart");
  }

  return res.json();
}

export async function updateCartItem(productId: number, quantity: number) {
  const res = await fetcher(`/cart/items/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to update cart item");
  }

  return res.json();
}

export async function removeFromCart(productId: number) {
  const res = await fetcher(`/cart/items/${productId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to remove from cart");
  }

  return res.json();
}