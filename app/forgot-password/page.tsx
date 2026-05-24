'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await api.auth.forgotPassword(email);
      setMessage(res.message);
      setStatus('success');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: '#e6f4ec' }}>
                <svg className="w-8 h-8" style={{ color: '#1a7a4a' }} fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-6">{message}</p>
              <p className="text-xs text-gray-400">
                Didn&apos;t receive it?{' '}
                <button
                  onClick={() => { setStatus('idle'); setEmail(''); }}
                  className="font-medium hover:underline"
                  style={{ color: '#1a7a4a' }}>
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {status === 'error' && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700
                                rounded-xl px-4 py-3 text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z"
                      clipRule="evenodd" />
                  </svg>
                  {message}
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

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold
                           transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                style={{ background: '#1a7a4a' }}
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </span>
                ) : 'Send reset link'}
              </button>

            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="font-medium hover:underline inline-flex items-center gap-1"
            style={{ color: '#1a7a4a' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to sign in
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-3">
          © {new Date().getFullYear()} SimpliGreen CRM
        </p>
      </div>
    </div>
  );
}
