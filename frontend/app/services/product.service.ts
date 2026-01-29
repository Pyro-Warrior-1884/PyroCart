import { fetcher } from "@/app/lib/fetcher";

export async function getAllProducts() {
  const res = await fetcher("/products");

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}
