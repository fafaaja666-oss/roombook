'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Maximize,
  Layers,
  Check,
  CalendarCheck2,
  BedDouble,
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { getAvailableRooms, getRoomOperationalStatus } from '@/lib/domain';
import { formatCurrency } from '@/lib/repository';
import { getFacilityIcon } from '@/lib/facilities';
import { getRoomTypeImage, FALLBACK_ROOM_IMAGE } from '@/constants/room-images';
import { addDays, formatDate } from '@/utils/helpers';
import { Input, Field } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import RoomStatusBadge from '@/components/ui/RoomStatusBadge';

export default function RoomDetailView({ roomId }: { roomId: string }) {
  const { rooms, reservations, loading } = useData();
  const today = useToday();
  const router = useRouter();

  const room = rooms.find((r) => r.id === roomId);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [imgOverride, setImgOverride] = useState<{ roomId: string; src: string } | null>(null);

  const fallbackImage = room ? getRoomTypeImage(room.type) : null;
  const activeOverride = imgOverride?.roomId === roomId ? imgOverride.src : null;
  const imageSrc = activeOverride ?? (room?.image || fallbackImage) ?? null;


  const status = useMemo(
    () => (room ? getRoomOperationalStatus(room, reservations, today) : 'available'),
    [room, reservations, today]
  );

  const datesValid = Boolean(checkIn && checkOut && checkOut > checkIn);
  const available = useMemo(() => {
    if (!room || !datesValid) return true;
    return getAvailableRooms([room], reservations, checkIn, checkOut).length === 1;
  }, [room, reservations, checkIn, checkOut, datesValid]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-stone-200/70" />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-stone-200/70" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-stone-200/70" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-stone-200/70" />
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={BedDouble}
          title="Kamar tidak ditemukan"
          description="Kamar yang Anda cari mungkin sudah tidak tersedia atau tautannya salah."
          action={
            <Link
              href="/kamar"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke daftar kamar
            </Link>
          }
        />
      </div>
    );
  }

  const goToBooking = () => {
    const params = new URLSearchParams({ room: room.id });
    if (datesValid) {
      params.set('checkIn', checkIn);
      params.set('checkOut', checkOut);
    }
    router.push(`/pesan?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/kamar"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Semua kamar
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-cream">
            <Image
              src={imageSrc ?? FALLBACK_ROOM_IMAGE}
              alt={`Kamar ${room.number}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              onError={() => {
                if (fallbackImage && imageSrc !== fallbackImage)
                  setImgOverride({ roomId, src: fallbackImage });
              }}
            />
            <span className="absolute left-4 top-4 rounded-full bg-charcoal/85 px-3 py-1 text-xs font-medium text-gold backdrop-blur">
              {room.type}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-xl font-semibold text-ink">Fasilitas kamar</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {room.facilities.map((facility) => {
                const Icon = getFacilityIcon(facility);
                return (
                  <div
                    key={facility}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-soft text-gold-dark">
                      <Icon className="h-4 w-4" />
                    </span>
                    {facility}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Tentang kamar ini</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{room.description}</p>
            {room.notes && (
              <p className="mt-3 rounded-lg bg-warning-soft px-3.5 py-2.5 text-sm text-warning">
                Catatan: {room.notes}
              </p>
            )}
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Kamar No.</p>
                <h1 className="font-display text-3xl font-semibold text-ink">{room.number}</h1>
              </div>
              <RoomStatusBadge status={status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gold-dark" /> {room.capacity} tamu
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-gold-dark" /> Lantai {room.floor}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-gold-dark" /> {room.type}
              </span>
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <p className="font-display text-2xl font-semibold text-ink">
                {formatCurrency(room.pricePerNight)}
              </p>
              <p className="text-xs text-muted">per malam, belum termasuk pajak</p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <Field label="Check-in" htmlFor="d-checkIn">
                <Input
                  id="d-checkIn"
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCheckIn(value);
                    if (value && (!checkOut || checkOut <= value)) setCheckOut(addDays(value, 1));
                  }}
                />
              </Field>
              <Field label="Check-out" htmlFor="d-checkOut">
                <Input
                  id="d-checkOut"
                  type="date"
                  min={checkIn ? addDays(checkIn, 1) : today}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                />
              </Field>
            </div>

            {datesValid && (
              <div
                className={`mt-4 rounded-lg px-3.5 py-2.5 text-sm font-medium ${
                  available
                    ? 'bg-success-soft text-success'
                    : 'bg-danger-soft text-danger'
                }`}
              >
                {available ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Tersedia untuk {formatDate(checkIn)} →{' '}
                    {formatDate(checkOut)}
                  </span>
                ) : (
                  'Kamar sudah terisi pada rentang tanggal tersebut.'
                )}
              </div>
            )}

            <Button
              size="lg"
              variant="gold"
              className="mt-5 w-full"
              disabled={room.status === 'maintenance' || !room.active || (datesValid && !available)}
              onClick={goToBooking}
            >
              <CalendarCheck2 className="h-4 w-4" />
              {room.status === 'maintenance' ? 'Sedang Pemeliharaan' : 'Pesan Kamar Ini'}
            </Button>

            <p className="mt-3 text-center text-xs text-muted">
              Tidak ada pembayaran di muka pada demo ini.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
