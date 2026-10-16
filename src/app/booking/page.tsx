'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import BookingForm from '@/components/booking/BookingForm';

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<p className="text-sm text-muted">Memuat formulir...</p>}>
          <BookingForm />
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}
