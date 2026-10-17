'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Percent, BadgeDollarSign, TrendingUp, BedDouble, Wallet } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { countRoomStatuses, getOccupancyRate, sumRecordedRevenue } from '@/lib/domain';
import { formatCurrency } from '@/lib/repository';
import { addDays, formatDateShort } from '@/utils/helpers';
import { ROOM_TYPES } from '@/constants/data';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input, Field } from '@/components/ui/Field';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function ReportsPage() {
  const { rooms, reservations, loading } = useData();
  const today = useToday();
  const [fromDate, setFromDate] = useState(addDays(today, -29));
  const [toDate, setToDate] = useState(addDays(today, 1));

  const rangeValid = fromDate < toDate;

  const occupancy = useMemo(
    () => (rangeValid ? getOccupancyRate(rooms, reservations, fromDate, toDate) : 0),
    [rooms, reservations, fromDate, toDate, rangeValid]
  );

  const inRange = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.status !== 'cancelled' &&
          r.status !== 'no_show' &&
          r.checkIn < toDate &&
          fromDate < r.checkOut
      ),
    [reservations, fromDate, toDate]
  );

  const revenue = useMemo(() => sumRecordedRevenue(inRange), [inRange]);
  const outstanding = useMemo(
    () => inRange.reduce((sum, r) => sum + (r.totalAmount - r.amountPaid), 0),
    [inRange]
  );
  const stats = useMemo(() => countRoomStatuses(rooms, reservations, today), [rooms, reservations, today]);

  const byType = useMemo(
    () =>
      ROOM_TYPES.map((type) => {
        const list = inRange.filter((r) => r.roomType === type);
        const total = list.reduce((sum, r) => sum + r.totalAmount, 0);
        const paid = list.reduce((sum, r) => sum + r.amountPaid, 0);
        const nights = list.reduce((sum, r) => sum + r.nights, 0);
        return { type, count: list.length, total, paid, nights };
      }),
    [inRange]
  );

  const maxRevenue = Math.max(1, ...byType.map((item) => item.total));

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-ink">
            <BarChart3 className="h-5 w-5 text-gold-dark" />
            <span className="font-medium">Periode Laporan</span>
          </div>
          <div className="grid w-full gap-4 sm:flex sm:w-auto sm:items-end">
            <Field label="Dari" htmlFor="rep-from">
              <Input
                id="rep-from"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </Field>
            <Field label="Sampai" htmlFor="rep-to" error={!rangeValid ? 'Tanggal akhir harus setelah awal.' : undefined}>
              <Input
                id="rep-to"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </Field>
          </div>
          <p className="text-sm text-muted sm:ml-auto">
            {formatDateShort(fromDate)} — {formatDateShort(toDate)}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tingkat Okupansi" value={`${occupancy}%`} icon={Percent} tone="gold" hint="rata-rata periode" />
        <StatCard label="Reservasi Aktif" value={inRange.length} icon={BedDouble} tone="info" hint="dalam periode" />
        <StatCard label="Pendapatan Tercatat" value={formatCurrency(revenue)} icon={BadgeDollarSign} tone="success" hint="pembayaran diterima" />
        <StatCard label="Piutang" value={formatCurrency(outstanding)} icon={Wallet} tone="warning" hint="belum dibayar" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Pendapatan per Tipe Kamar"
            description="Perbandingan total nilai reservasi"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <div className="space-y-5 p-5">
            {byType.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{item.type}</span>
                  <span className="text-muted">
                    {item.count} reservasi · {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark"
                    style={{ width: `${Math.round((item.total / maxRevenue) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {item.nights} malam terjual · dibayar {formatCurrency(item.paid)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Status Kamar (Hari Ini)"
            description="Distribusi kondisi kamar saat ini"
            icon={<BedDouble className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-4 p-5">
            {[
              { label: 'Tersedia', value: stats.available, tone: 'text-success' },
              { label: 'Direservasi', value: stats.reserved, tone: 'text-sky-600' },
              { label: 'Terisi', value: stats.occupied, tone: 'text-indigo-600' },
              { label: 'Dibersihkan', value: stats.cleaning, tone: 'text-amber-600' },
              { label: 'Pemeliharaan', value: stats.maintenance, tone: 'text-danger' },
              { label: 'Nonaktif', value: stats.inactive, tone: 'text-stone-500' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-canvas p-4">
                <p className="text-xs text-muted">{item.label}</p>
                <p className={`mt-1 font-display text-2xl font-semibold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
