'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import type { Role } from '../lib/types';
import { FullscreenSpinner } from './ui/Spinner';

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(`/${user.role}`);
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) return <FullscreenSpinner />;

  return <>{children}</>;
}
