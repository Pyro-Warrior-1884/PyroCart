import { fetcher } from "@/app/lib/fetcher";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  console.log(`Inside reguser`);
  const res = await fetcher("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res?.ok) {
    const err = await res?.json();
    throw new Error(err.message || "Registration failed");
  }

  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const res = await fetcher("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res?.ok) {
    const err = await res?.json();
    throw new Error(err.message || "Login failed");
  }

  return res.json();
}
