'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import ReservationCard from '@/components/reservations/ReservationCard';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatCard from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import type { Reservation, ReservationStatus } from '@/types';
import { isPastDate } from '@/utils/helpers';
import { FileText, Plus, Search, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type Filter = 'all' | ReservationStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'Menunggu Persetujuan', label: 'Menunggu' },
  { value: 'Disetujui', label: 'Disetujui' },
  { value: 'Ditolak', label: 'Ditolak' },
  { value: 'Dibatalkan', label: 'Dibatalkan' },
];

export default function MyReservations() {
  const { user } = useAuth();
  const { reservations, updateReservations } = useData();
  const today = useToday();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

  const mine = useMemo(
    () => reservations.filter((r) => r.userId === user?.id),
    [reservations, user]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = filter === 'all' ? mine : mine.filter((r) => r.status === filter);
    return list
      .filter(
        (r) =>
          !q ||
          r.eventName.toLowerCase().includes(q) ||
          r.roomName.toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [mine, filter, query]);

  const countFor = (value: Filter) =>
    value === 'all' ? mine.length : mine.filter((r) => r.status === value).length;

  const canCancel = (r: Reservation) =>
    (r.status === 'Menunggu Persetujuan' || r.status === 'Disetujui') &&
    !isPastDate(r.date, today);

  const handleCancel = () => {
    if (!cancelTarget) return;
    const now = new Date().toISOString();
    updateReservations(
      reservations.map((r) =>
        r.id === cancelTarget.id ? { ...r, status: 'Dibatalkan', updatedAt: now } : r
      )
    );
    toast({ title: 'Reservasi dibatalkan', description: cancelTarget.eventName, variant: 'info' });
    setCancelTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pengajuan" value={countFor('all')} icon={FileText} tone="navy" />
        <StatCard
          label="Menunggu"
          value={countFor('Menunggu Persetujuan')}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Disetujui"
          value={countFor('Disetujui')}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard label="Ditolak" value={countFor('Ditolak')} icon={XCircle} tone="danger" />
      </div>

      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-canvas p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                filter === option.value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              )}
            >
              {option.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs',
                  filter === option.value
                    ? 'bg-primary-soft text-primary'
                    : 'bg-slate-200/70 text-muted'
                )}
              >
                {countFor(option.value)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:w-60">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kegiatan atau ruangan..."
              className="h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <Link href="/booking" className={buttonClasses({ className: 'h-11' })}>
            <Plus className="h-4 w-4" /> Booking Ruangan
          </Link>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada reservasi"
          description="Anda belum memiliki reservasi pada kategori ini."
          action={
            <Link href="/booking" className={buttonClasses({})}>
              <Plus className="h-4 w-4" /> Buat Reservasi
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              actions={
                canCancel(reservation) ? (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(reservation)}
                    className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                  >
                    Batalkan
                  </button>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Batalkan Reservasi"
        message={`Yakin ingin membatalkan reservasi "${cancelTarget?.eventName ?? ''}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, batalkan"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
