'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CalendarCheck2 } from 'lucide-react';

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (requireAdmin && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white shadow-lg shadow-navy/20">
          <CalendarCheck2 className="h-6 w-6" />
        </span>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
        <p className="text-sm text-muted">Memuat...</p>
      </div>
    );
  }

  if (!user || (requireAdmin && user.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}
