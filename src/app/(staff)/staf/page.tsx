'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  BedDouble,
  CalendarClock,
  LogIn,
  LogOut,
  UsersRound,
  Percent,
  BadgeDollarSign,
  ArrowRight,
  CalendarCheck2,
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import {
  countRoomStatuses,
  getOccupancyRate,
  sumRecordedRevenue,
  isReservationActiveOn,
} from '@/lib/domain';
import { formatCurrency } from '@/lib/repository';
import { addDays, formatDateShort, formatRelative, greeting } from '@/utils/helpers';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getStatusMeta } from '@/lib/status';

export default function StaffDashboardPage() {
  const { rooms, reservations, activity, loading } = useData();
  const { user } = useAuth();
  const today = useToday();

  const stats = useMemo(() => countRoomStatuses(rooms, reservations, today), [rooms, reservations, today]);
  const occupancy = useMemo(
    () => getOccupancyRate(rooms, reservations, today, addDays(today, 1)),
    [rooms, reservations, today]
  );
  const revenue = useMemo(() => sumRecordedRevenue(reservations), [reservations]);

  const arrivals = useMemo(
    () => reservations.filter((r) => r.checkIn === today && (r.status === 'confirmed' || r.status === 'pending')),
    [reservations, today]
  );
  const departures = useMemo(
    () => reservations.filter((r) => r.checkOut === today && r.status === 'checked_in'),
    [reservations, today]
  );
  const inHouse = useMemo(
    () => reservations.filter((r) => r.status === 'checked_in' && isReservationActiveOn(r, today)),
    [reservations, today]
  );
  const pending = useMemo(
    () => reservations.filter((r) => r.status === 'pending'),
    [reservations]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-charcoal p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-stone-300">
              {greeting()}, <span className="font-medium text-gold">{user?.name}</span>
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              Ringkasan Operasional Hari Ini
            </h1>
            <p className="mt-1 text-sm text-stone-400">{formatDateShort(today)}</p>
          </div>
          <Link
            href="/staf/check-in"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-dark hover:text-white"
          >
            <LogIn className="h-4 w-4" /> Mulai Check-in
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Okupansi Hari Ini" value={`${occupancy}%`} icon={Percent} tone="gold" hint={`${stats.occupied} kamar terisi`} />
        <StatCard label="Kamar Tersedia" value={stats.available} icon={BedDouble} tone="success" hint={`dari ${stats.total} kamar`} />
        <StatCard label="Tamu Menginap" value={inHouse.length} icon={UsersRound} tone="info" hint="sedang berada di hotel" />
        <StatCard label="Pendapatan Tercatat" value={formatCurrency(revenue)} icon={BadgeDollarSign} tone="primary" hint="akumulasi pembayaran" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Kedatangan Hari Ini"
            description={`${arrivals.length} tamu dijadwalkan check-in`}
            icon={<CalendarCheck2 className="h-4 w-4" />}
            action={
              <Link href="/staf/check-in" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-gold-dark">
                Proses <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {arrivals.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">Tidak ada kedatangan hari ini.</p>
            ) : (
              arrivals.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.guestName}</p>
                    <p className="text-xs text-muted">
                      {r.roomType} · No. {r.roomNumber} · {r.nights} malam
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Keberangkatan Hari Ini"
            description={`${departures.length} tamu dijadwalkan check-out`}
            icon={<LogOut className="h-4 w-4" />}
            action={
              <Link href="/staf/check-out" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-gold-dark">
                Proses <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {departures.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">Tidak ada keberangkatan hari ini.</p>
            ) : (
              departures.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.guestName}</p>
                    <p className="text-xs text-muted">
                      {r.roomType} · No. {r.roomNumber}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{formatCurrency(r.totalAmount - r.amountPaid)} sisa</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Menunggu Konfirmasi"
            description={`${pending.length} reservasi perlu ditinjau`}
            icon={<CalendarClock className="h-4 w-4" />}
            action={
              <Link href="/staf/reservasi" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-gold-dark">
                Kelola <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {pending.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">Tidak ada reservasi tertunda.</p>
            ) : (
              pending.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.guestName}</p>
                    <p className="text-xs text-muted">
                      {r.code} · {formatDateShort(r.checkIn)} → {formatDateShort(r.checkOut)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Aktivitas Terbaru"
            description="Jejak tindakan staf dan sistem"
            icon={<CalendarClock className="h-4 w-4" />}
            action={
              <Link href="/staf/aktivitas" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-gold-dark">
                Semua <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {activity.length === 0 ? (
              <EmptyState title="Belum ada aktivitas" description="Aktivitas akan tercatat di sini." className="border-0" />
            ) : (
              activity.slice(0, 5).map((log) => {
                const Icon = getStatusMeta(log.type).icon;
                return (
                  <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-ink">{log.message}</p>
                      <p className="text-xs text-muted">
                        {log.actor} · {formatRelative(log.at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
