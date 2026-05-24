'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  function validate(): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setStatus('error'); setMessage(validationError); return; }

    setStatus('loading');
    setMessage('');
    try {
      const res = await api.auth.resetPassword(token, password);
      setMessage(res.message);
      setStatus('success');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  const strength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const score = strength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#1a7a4a'][score];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: '#1a7a4a' }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Choose a strong password for your account
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Password updated!</h2>
              <p className="text-sm text-gray-500 mb-4">{message}</p>
              <p className="text-xs text-gray-400">Redirecting to sign in...</p>
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
                  <span>{message}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    disabled={!token}
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm
                               focus:outline-none focus:ring-2 focus:border-transparent
                               placeholder-gray-400 transition disabled:opacity-50"
                    style={{ '--tw-ring-color': '#1a7a4a' } as React.CSSProperties}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: i <= score ? strengthColor : '#e5e7eb' }} />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  disabled={!token}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm
                             focus:outline-none focus:ring-2 focus:border-transparent
                             placeholder-gray-400 transition disabled:opacity-50"
                  style={{
                    borderColor: confirm.length > 0
                      ? (confirm === password ? '#1a7a4a' : '#ef4444')
                      : '#e5e7eb',
                    '--tw-ring-color': '#1a7a4a',
                  } as React.CSSProperties}
                />
                {confirm.length > 0 && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !token}
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
                    Updating password...
                  </span>
                ) : 'Update password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200"
          style={{ borderTopColor: '#1a7a4a' }} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
