export async function fetcher(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const backend = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${backend}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }
  );

  return res;
}

async function refreshToken() {
  const refresh = localStorage.getItem("refreshToken");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    }
  );

  if (!res.ok) return null;

  return res.json();
}

