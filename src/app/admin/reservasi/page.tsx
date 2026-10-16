'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import ReservationManager from '@/components/admin/ReservationManager';

export default function AdminReservasiPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AppLayout>
        <ReservationManager />
      </AppLayout>
    </ProtectedRoute>
  );
}
