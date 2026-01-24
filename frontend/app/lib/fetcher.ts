export async function fetcher(
  url: string,
  options: RequestInit = {},
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
}
