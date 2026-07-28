'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth-context';
import { FullscreenSpinner } from './components/ui/Spinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? `/${user.role}` : '/login');
  }, [user, loading, router]);

  return <FullscreenSpinner />;
}
