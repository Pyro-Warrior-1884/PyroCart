import { fetcher } from "@/app/lib/fetcher";

export async function getMyProfile() {
  const res = await fetcher("/users/me");

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return res.json();
}
