'use client';

import { useMemo, useState } from 'react';
import { LogIn, Search, BedDouble, CalendarClock, CheckCircle2 } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import { canCheckIn } from '@/lib/domain';
import { checkInReservation } from '@/lib/repository';
import { formatDate, formatDateShort } from '@/utils/helpers';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import RoomStatusBadge from '@/components/ui/RoomStatusBadge';
import { getRoomOperationalStatus } from '@/lib/domain';
import { Input } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckInPage() {
  const { reservations, rooms, loading } = useData();
  const { user } = useAuth();
  const today = useToday();
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  const arrivals = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reservations
      .filter((r) => r.status === 'confirmed' || r.status === 'pending')
      .filter((r) => r.checkIn <= today)
      .filter(
        (r) =>
          !term ||
          r.guestName.toLowerCase().includes(term) ||
          r.code.toLowerCase().includes(term) ||
          r.roomNumber.toLowerCase().includes(term)
      )
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }, [reservations, today, query]);

  const upcoming = useMemo(
    () =>
      reservations
        .filter((r) => r.status === 'confirmed' && r.checkIn > today)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
        .slice(0, 6),
    [reservations, today]
  );

  const inHouse = useMemo(
    () => reservations.filter((r) => r.status === 'checked_in'),
    [reservations]
  );

  const handleCheckIn = (id: string, guestName: string) => {
    const result = checkInReservation(id, user);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal check-in', variant: 'error' });
      return;
    }
    toast({ title: `${guestName} berhasil check-in`, variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-charcoal p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-charcoal">
            <LogIn className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold">Check-in Tamu</h1>
            <p className="text-sm text-stone-300">{formatDate(today)} · {inHouse.length} tamu menginap</p>
          </div>
        </div>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Cari nama, kode, kamar…"
          className="pl-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Cari kedatangan"
        />
      </div>

      <Card>
        <CardHeader
          title="Kedatangan Hari Ini atau Terlewat"
          description="Proses check-in untuk tamu yang sudah tiba."
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : arrivals.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Tidak ada tamu menunggu"
            description="Semua kedatangan untuk tanggal ini sudah diproses."
            className="border-0"
          />
        ) : (
          <div className="divide-y divide-line">
            {arrivals.map((r) => {
              const room = rooms.find((room) => room.id === r.roomId);
              const gate = room ? canCheckIn(r, room, reservations, today) : { ok: false, reason: 'Kamar tidak ditemukan.' };
              const roomStatus = room ? getRoomOperationalStatus(room, reservations, today) : null;
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-ink">{r.guestName}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.code} · {r.roomType} No. {r.roomNumber} · {r.nights} malam ·{' '}
                      {formatDateShort(r.checkIn)} → {formatDateShort(r.checkOut)}
                    </p>
                    {!gate.ok && <p className="mt-1 text-xs font-medium text-warning">{gate.reason}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {roomStatus && <RoomStatusBadge status={roomStatus} />}
                    <Button
                      size="sm"
                      disabled={!gate.ok}
                      onClick={() => handleCheckIn(r.id, r.guestName)}
                    >
                      <LogIn className="h-3.5 w-3.5" /> Check-in
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Kedatangan Mendatang"
          description="Reservasi terkonfirmasi dalam beberapa hari ke depan."
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <div className="divide-y divide-line">
          {upcoming.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Belum ada kedatangan mendatang.</p>
          ) : (
            upcoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{r.guestName}</p>
                  <p className="text-xs text-muted">
                    {r.roomType} No. {r.roomNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <BedDouble className="h-4 w-4 text-gold-dark" />
                  {formatDateShort(r.checkIn)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
