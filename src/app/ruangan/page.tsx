'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import RoomList from '@/components/rooms/RoomList';

export default function RuanganPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<p className="text-sm text-muted">Memuat daftar ruangan...</p>}>
          <RoomList />
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}
