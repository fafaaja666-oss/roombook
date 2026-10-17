'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin, isStaff } from '@/lib/domain';
import { APP_NAME } from '@/constants/data';
import { Hotel } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Hanya staf (admin/resepsionis) yang boleh masuk. */
  requireStaff?: boolean;
  /** Hanya admin yang boleh masuk. */
  requireAdmin?: boolean;
  /** Daftar role yang diizinkan; meng-override flag requireStaff/requireAdmin. */
  allowRoles?: Array<'admin' | 'receptionist' | 'guest'>;
}

export function ProtectedRoute({
  children,
  requireStaff = false,
  requireAdmin = false,
  allowRoles,
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const allowed =
    allowRoles ??
    (requireAdmin
      ? (['admin'] as const)
      : requireStaff
        ? (['admin', 'receptionist'] as const)
        : null);

  const roleOk = !allowed || (role !== undefined && allowed.includes(role));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!roleOk) {
      if (isStaff(role) || isAdmin(role)) router.replace('/staf');
      else router.replace('/');
    }
  }, [user, role, roleOk, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal text-gold shadow-lg shadow-charcoal/20">
          <Hotel className="h-6 w-6" />
        </span>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold" />
        <p className="text-sm text-muted">Menyiapkan sesi Anda…</p>
        <p className="text-xs text-muted/70">{APP_NAME}</p>
      </div>
    );
  }

  if (!roleOk) return null;

  return <>{children}</>;
}

export default ProtectedRoute;
