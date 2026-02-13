import { fetcher } from "@/app/lib/fetcher";

export async function getMyProfile() {
  const res = await fetcher("/users/me");

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return res.json();
}

export async function getAllUsers() {
  const response = await fetcher(`/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}