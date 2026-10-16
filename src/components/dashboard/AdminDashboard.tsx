'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/hooks/useData';
import { formatDateShort } from '@/utils/helpers';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { getStatusMeta } from '@/lib/status';
import type { ReservationStatus } from '@/types';
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const STATUS_ORDER: ReservationStatus[] = [
  'Menunggu Persetujuan',
  'Disetujui',
  'Ditolak',
  'Dibatalkan',
];

const BAR_COLORS: Record<ReservationStatus, string> = {
  'Menunggu Persetujuan': 'bg-orange-500',
  Disetujui: 'bg-green-600',
  Ditolak: 'bg-red-500',
  Dibatalkan: 'bg-slate-400',
};

export default function AdminDashboard() {
  const { rooms, reservations } = useData();

  const pendingReservations = reservations.filter((r) => r.status === 'Menunggu Persetujuan');
  const approvedReservations = reservations.filter((r) => r.status === 'Disetujui');

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: reservations.filter((r) => r.status === status).length,
  }));
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  return (
    <ProtectedRoute requireAdmin>
      <AppLayout>
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-navy p-6 sm:p-8">
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-24 right-32 h-60 w-60 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-blue-200">
                  <ShieldCheck className="h-4 w-4" />
                  Panel Administrator
                </p>
                <h1 className="mt-2 text-balance text-2xl font-bold text-white sm:text-3xl">
                  Pusat kendali reservasi & ruangan
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                  Tinjau pengajuan, kelola data ruangan, dan pantau seluruh jadwal penggunaan ruangan.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/admin/reservasi"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-blue-50"
                  >
                    Kelola Reservasi
                  </Link>
                  <Link
                    href="/admin/ruangan"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Kelola Ruangan
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur md:min-w-[220px]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Clock className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-3xl font-bold text-white">{pendingReservations.length}</p>
                  <p className="text-xs text-blue-100/80">Pengajuan menunggu tinjauan</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Ruangan" value={rooms.length} icon={Building2} tone="navy" />
            <StatCard
              label="Total Reservasi"
              value={reservations.length}
              icon={FileText}
              tone="primary"
            />
            <StatCard
              label="Menunggu Persetujuan"
              value={pendingReservations.length}
              icon={Clock}
              tone="warning"
            />
            <StatCard
              label="Disetujui"
              value={approvedReservations.length}
              icon={CheckCircle2}
              tone="success"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Pengajuan Menunggu"
                description="Reservasi yang perlu Anda tinjau"
                action={
                  <Link
                    href="/admin/reservasi"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
                  >
                    Tinjau
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              {pendingReservations.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted">
                  Tidak ada pengajuan menunggu
                </p>
              ) : (
                <div className="divide-y divide-line">
                  {pendingReservations.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{r.eventName}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                          <span>{r.roomName}</span>
                          <span className="text-line">•</span>
                          <span>{r.userName}</span>
                          <span className="text-line">•</span>
                          <span>{formatDateShort(r.date)}</span>
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
                <CardHeader title="Distribusi Status" icon={<Calendar className="h-4 w-4" />} />
                <div className="space-y-4 p-5">
                  {counts.map(({ status, count }) => {
                    const meta = getStatusMeta(status);
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-ink">{meta.label}</span>
                          <span className="text-muted">{count}</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={cn('h-full rounded-full', BAR_COLORS[status])}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <CardHeader title="Reservasi Terbaru" icon={<FileText className="h-4 w-4" />} />
                {recentReservations.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted">Belum ada reservasi</p>
                ) : (
                  <div className="divide-y divide-line">
                    {recentReservations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{r.eventName}</p>
                          <p className="truncate text-xs text-muted">
                            {r.roomName} • {formatDateShort(r.date)}
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/ruangan"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Kelola Ruangan</p>
                  <p className="text-sm text-muted">Tambah, ubah, dan atur status ruangan</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
            <Link
              href="/admin/jadwal"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Calendar className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Jadwal Ruangan</p>
                  <p className="text-sm text-muted">Pantau penggunaan seluruh ruangan</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
