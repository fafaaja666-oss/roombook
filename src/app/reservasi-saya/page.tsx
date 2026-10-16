'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import MyReservations from '@/components/reservations/MyReservations';

export default function ReservasiSayaPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <MyReservations />
      </AppLayout>
    </ProtectedRoute>
  );
}
