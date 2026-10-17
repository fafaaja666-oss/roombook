'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Building2 } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { getAvailableRooms } from '@/lib/domain';
import { ROOM_TYPES } from '@/constants/data';
import { addDays } from '@/utils/helpers';
import RoomCard from '@/components/rooms/RoomCard';
import { Input, Select, Field } from '@/components/ui/Field';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

type SortKey = 'price-asc' | 'price-desc' | 'capacity';

export default function KamarPage() {
  const { rooms, reservations, loading } = useData();
  const today = useToday();

  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState(1);
  const [sort, setSort] = useState<SortKey>('price-asc');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const usingDates = Boolean(checkIn && checkOut && checkOut > checkIn);

  const filtered = useMemo(() => {
    let list = rooms.filter((room) => room.active);

    if (usingDates) {
      list = getAvailableRooms(list, reservations, checkIn, checkOut);
    }

    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (room) =>
          room.number.toLowerCase().includes(term) ||
          room.type.toLowerCase().includes(term) ||
          room.description.toLowerCase().includes(term) ||
          room.facilities.some((f) => f.toLowerCase().includes(term))
      );
    }

    if (type !== 'all') list = list.filter((room) => room.type === type);
    if (minCapacity > 1) list = list.filter((room) => room.capacity >= minCapacity);

    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.pricePerNight - b.pricePerNight;
      if (sort === 'price-desc') return b.pricePerNight - a.pricePerNight;
      return b.capacity - a.capacity;
    });
  }, [rooms, reservations, query, type, minCapacity, sort, usingDates, checkIn, checkOut]);

  const clearDates = () => {
    setCheckIn('');
    setCheckOut('');
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
          Akomodasi
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-semibold text-ink">Kamar &amp; Suite</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Temukan kamar yang sesuai kebutuhan Anda. Tentukan tanggal menginap untuk melihat kamar
          yang benar-benar tersedia.
        </p>
      </header>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <SlidersHorizontal className="h-4 w-4 text-gold-dark" /> Saring pencarian
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Cari" htmlFor="q">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="q"
                placeholder="Nomor, tipe, fasilitas…"
                className="pl-10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </Field>

          <Field label="Tipe Kamar" htmlFor="type">
            <Select id="type" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="all">Semua tipe</option>
              {ROOM_TYPES.map((roomType) => (
                <option key={roomType} value={roomType}>
                  {roomType}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Min. Kapasitas" htmlFor="cap">
            <Select
              id="cap"
              value={minCapacity}
              onChange={(event) => setMinCapacity(Number(event.target.value))}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? 'Semua' : `${n}+ tamu`}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Urutkan" htmlFor="sort">
            <Select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              <option value="price-asc">Harga terendah</option>
              <option value="price-desc">Harga tertinggi</option>
              <option value="capacity">Kapasitas terbesar</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2 lg:max-w-2xl">
          <Field label="Check-in" htmlFor="checkIn" hint="Tanggal mulai menginap">
            <Input
              id="checkIn"
              type="date"
              min={today}
              value={checkIn}
              onChange={(event) => {
                const value = event.target.value;
                setCheckIn(value);
                if (value && (!checkOut || checkOut <= value)) {
                  setCheckOut(addDays(value, 1));
                }
              }}
            />
          </Field>
          <Field label="Check-out" htmlFor="checkOut" hint="Tanggal berangkat">
            <Input
              id="checkOut"
              type="date"
              min={checkIn ? addDays(checkIn, 1) : today}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
            />
          </Field>
        </div>

        {usingDates && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-gold-soft px-3.5 py-2 text-sm text-gold-dark">
            <span>
              Menampilkan {filtered.length} kamar tersedia untuk {checkIn} → {checkOut}
            </span>
            <button
              type="button"
              onClick={clearDates}
              className="font-medium underline-offset-2 hover:underline"
            >
              Hapus tanggal
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-surface p-5">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="mt-4 h-5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Tidak ada kamar yang cocok"
            description="Coba ubah tanggal, tipe kamar, atau kata kunci pencarian Anda."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
