'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import RoomManager from '@/components/admin/RoomManager';

export default function AdminRuanganPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AppLayout>
        <RoomManager />
      </AppLayout>
    </ProtectedRoute>
  );
}
