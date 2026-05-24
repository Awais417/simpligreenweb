'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.auth.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: '#1a7a4a' }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SimpliGreen CRM</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700
                              rounded-xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z"
                    clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:border-transparent
                           placeholder-gray-400 transition"
                style={{ '--tw-ring-color': '#1a7a4a' } as React.CSSProperties}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#1a7a4a' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:border-transparent
                           placeholder-gray-400 transition"
                style={{ '--tw-ring-color': '#1a7a4a' } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold
                         transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed mt-2"
              style={{ background: loading ? '#145f3a' : '#1a7a4a' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} SimpliGreen CRM
        </p>
      </div>
    </div>
  );
}
