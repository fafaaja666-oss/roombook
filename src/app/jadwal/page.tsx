'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import ScheduleView from '@/components/schedule/ScheduleView';

export default function JadwalPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<p className="text-sm text-muted">Memuat jadwal...</p>}>
          <ScheduleView />
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}
