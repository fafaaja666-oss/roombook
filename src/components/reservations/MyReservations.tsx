'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarX2, LogIn, Search } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import { canCancel } from '@/lib/domain';
import { cancelReservation } from '@/lib/repository';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import ReservationCard from '@/components/reservations/ReservationCard';
import type { Reservation } from '@/types';

function normalize(value: string): string {
  return value.replace(/[^\d]/g, '').toLowerCase();
}

export default function MyReservations() {
  const { reservations, rooms, loading } = useData();
  const { user, isStaff: isStaffRole } = useAuth();
  const today = useToday();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<Reservation | null>(null);
  const [working, setWorking] = useState(false);

  const mine = useMemo(() => {
    if (!user) return [];
    if (isStaffRole) return reservations;
    return reservations.filter((reservation) => {
      const emailMatch =
        user.email && reservation.guestEmail?.toLowerCase() === user.email.toLowerCase();
      const phoneMatch =
        user.phone && normalize(reservation.guestPhone) === normalize(user.phone);
      return Boolean(emailMatch || phoneMatch);
    });
  }, [reservations, user, isStaffRole]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = term
      ? mine.filter(
          (r) =>
            r.code.toLowerCase().includes(term) ||
            r.guestName.toLowerCase().includes(term) ||
            r.roomNumber.toLowerCase().includes(term)
        )
      : mine;
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [mine, query]);

  const handleCancel = () => {
    if (!target) return;
    setWorking(true);
    const result = cancelReservation(target.id, user, 'Dibatalkan melalui halaman reservasi saya.');
    setWorking(false);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal membatalkan.', variant: 'error' });
      return;
    }
    toast({ title: `Reservasi ${target.code} dibatalkan`, variant: 'success' });
    setTarget(null);
  };

  if (!user) {
    return (
      <EmptyState
        icon={LogIn}
        title="Masuk untuk melihat reservasi"
        description="Silakan masuk dengan akun Anda untuk melihat daftar dan status reservasi."
        action={
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <LogIn className="h-4 w-4" /> Masuk
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder={isStaffRole ? 'Cari kode, nama, kamar…' : 'Cari kode atau kamar…'}
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari reservasi"
          />
        </div>
        <span className="text-sm text-muted">{filtered.length} reservasi</span>
        <Link
          href="/kamar"
          className="ml-auto inline-flex items-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream"
        >
          Pesan kamar baru
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Belum ada reservasi"
          description={
            query
              ? 'Tidak ada reservasi yang cocok dengan pencarian Anda.'
              : 'Reservasi yang Anda buat akan muncul di sini.'
          }
          action={
            <Link
              href="/kamar"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Jelajahi Kamar
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((reservation) => {
            const room = rooms.find((r) => r.id === reservation.roomId);
            const gate = canCancel(reservation, room, today);
            return (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                actions={
                  gate.ok ? (
                    <Button variant="secondary" size="sm" onClick={() => setTarget(reservation)}>
                      Batalkan
                    </Button>
                  ) : null
                }
                footer={
                  <span className="mr-auto text-xs text-muted">{gate.reason ?? ''}</span>
                }
              />
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Batalkan reservasi?"
        message={
          target
            ? `Reservasi ${target.code} untuk ${target.guestName} akan dibatalkan. Tindakan ini tidak dapat diurungkan.`
            : ''
        }
        confirmLabel="Ya, batalkan"
        loading={working}
        onConfirm={handleCancel}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
