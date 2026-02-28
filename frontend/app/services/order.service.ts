import { fetcher } from "@/app/lib/fetcher";

export interface OrderProduct {
  id: number;
  title: string;
  images: { url: string }[];
}

export interface OrderItem {
  productId: number;
  price: number;
  quantity: number;
  product?: OrderProduct;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutAnalytics {
  attempts: number;
  success: number;
  failed: number;
  cancelled: number;
}

async function safeRequest(endpoint: string, options: RequestInit = {}) {
  const res = await fetcher(endpoint, options);

  if (res.status === 401) {
    const refreshed = await refreshAndRetry(endpoint, options);
    if (!refreshed) throw new Error("Unauthorized");
    return refreshed;
  }

  return res;
}

async function refreshAndRetry(endpoint: string, options: RequestInit) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: localStorage.getItem("refreshToken"),
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);

  return fetcher(endpoint, options);
}

export async function checkoutOrder() {
  const res = await safeRequest("/orders/checkout", {
    method: "POST",
  });

  if (!res.ok) throw new Error("Checkout failed");

  return res.json();
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await safeRequest("/orders");

  if (!res.ok) throw new Error("Failed to load orders");

  return res.json();
}

export async function getOrderById(id: number): Promise<Order> {
  const res = await safeRequest(`/orders/${id}`);

  if (!res.ok) throw new Error("Failed to load order");

  return res.json();
}

export async function getOrderAnalytics():Promise<CheckoutAnalytics> {
  const res = await safeRequest("/orders/analytics");

  if (!res.ok) throw new Error("Failed to load analytics");

  return res.json();
}
