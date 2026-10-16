'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { formatDateShort } from '@/utils/helpers';
import RoomCard from '@/components/rooms/RoomCard';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import { getStatusMeta } from '@/lib/status';
import {
  Building2,
  CheckCircle2,
  Clock,
  CalendarDays,
  Plus,
  ArrowRight,
  Calendar,
  Bell,
  CalendarCheck2,
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const { rooms, reservations } = useData();
  const today = useToday();

  const userReservations = reservations.filter((r) => r.userId === user?.id);
  const pendingReservations = userReservations.filter((r) => r.status === 'Menunggu Persetujuan');
  const approvedReservations = userReservations.filter((r) => r.status === 'Disetujui');
  const todayReservations = approvedReservations
    .filter((r) => r.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const availableRooms = rooms.filter((r) => !r.isMaintenance);

  const recentReservations = [...userReservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const notifications = [...userReservations]
    .filter((r) => r.status !== 'Menunggu Persetujuan')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const recommendedRooms = [...availableRooms]
    .sort((a, b) => b.capacity - a.capacity)
    .slice(0, 3);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-navy p-6 sm:p-8">
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-24 right-32 h-60 w-60 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-blue-200">Selamat datang, {user?.name}</p>
                <h1 className="mt-2 text-balance text-2xl font-bold text-white sm:text-3xl">
                  Rencanakan kegiatan Anda di ruangan terbaik
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                  Cek ketersediaan, ajukan reservasi, dan pantau status persetujuan — semua dalam satu
                  tempat.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/booking"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                    Booking Ruangan
                  </Link>
                  <Link
                    href="/jadwal"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Calendar className="h-4 w-4" />
                    Lihat Jadwal
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur md:min-w-[220px]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                  <CalendarCheck2 className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-3xl font-bold text-white">{todayReservations.length}</p>
                  <p className="text-xs text-blue-100/80">Kegiatan disetujui hari ini</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Ruangan" value={rooms.length} icon={Building2} tone="navy" />
            <StatCard
              label="Ruangan Tersedia"
              value={availableRooms.length}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="Menunggu Persetujuan"
              value={pendingReservations.length}
              icon={Clock}
              tone="warning"
            />
            <StatCard
              label="Reservasi Disetujui"
              value={approvedReservations.length}
              icon={CheckCircle2}
              tone="primary"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Reservasi Terbaru"
                description="Lima pengajuan terakhir Anda"
                action={
                  <Link
                    href="/reservasi-saya"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
                  >
                    Lihat semua
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              {recentReservations.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted">Belum ada reservasi</p>
              ) : (
                <div className="divide-y divide-line">
                  {recentReservations.map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{r.eventName}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                          <span>{r.roomName}</span>
                          <span className="text-line">•</span>
                          <span>{formatDateShort(r.date)}</span>
                          <span className="text-line">•</span>
                          <span>
                            {r.startTime}–{r.endTime}
                          </span>
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Jadwal Hari Ini" icon={<CalendarDays className="h-4 w-4" />} />
                {todayReservations.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted">
                    Tidak ada kegiatan hari ini
                  </p>
                ) : (
                  <div className="space-y-1 p-3">
                    {todayReservations.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg p-2">
                        <span className="flex min-w-[64px] items-center justify-center rounded-lg bg-primary-soft px-2 py-1.5 text-xs font-semibold text-primary">
                          {r.startTime}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{r.eventName}</p>
                          <p className="truncate text-xs text-muted">{r.roomName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader title="Notifikasi Terbaru" icon={<Bell className="h-4 w-4" />} />
                {notifications.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted">Belum ada notifikasi</p>
                ) : (
                  <div className="divide-y divide-line">
                    {notifications.map((r) => {
                      const meta = getStatusMeta(r.status);
                      const Icon = meta.icon;
                      return (
                        <div key={r.id} className="flex items-start gap-3 px-5 py-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-muted">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{r.eventName}</p>
                            <p className="truncate text-xs text-muted">
                              {meta.label} • {formatDateShort(r.date)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">Ruangan Rekomendasi</h2>
                <p className="text-sm text-muted">Ruangan tersedia dengan kapasitas terbesar</p>
              </div>
              <Link
                href="/ruangan"
                className={buttonClasses({ variant: 'secondary', size: 'sm' })}
              >
                Lihat semua ruangan
              </Link>
            </div>
            {recommendedRooms.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
                Belum ada ruangan tersedia
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recommendedRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
