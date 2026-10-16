'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import RoomDetail from '@/components/rooms/RoomDetail';

export default function RuanganDetailPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <RoomDetail />
      </AppLayout>
    </ProtectedRoute>
  );
}
