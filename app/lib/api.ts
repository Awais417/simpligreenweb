const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://simpligreen.netlify.app';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: Record<string, unknown> }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    forgotPassword: (email: string) =>
      request<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, password: string) =>
      request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }),
  },
};
