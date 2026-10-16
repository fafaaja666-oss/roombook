'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/hooks/useData';
import RoomCard from '@/components/rooms/RoomCard';
import EmptyState from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Search, Building2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Filter = 'all' | 'available' | 'maintenance';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'available', label: 'Tersedia' },
  { value: 'maintenance', label: 'Pemeliharaan' },
];

export default function RoomList() {
  const { rooms } = useData();
  const searchParams = useSearchParams();
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const urlQuery = searchParams.get('q') ?? '';
  const query = typedQuery ?? urlQuery;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesQuery =
        !q ||
        room.name.toLowerCase().includes(q) ||
        room.location.toLowerCase().includes(q) ||
        room.facilities.some((facility) => facility.toLowerCase().includes(q));
      const matchesFilter =
        filter === 'all' ||
        (filter === 'available' && !room.isMaintenance) ||
        (filter === 'maintenance' && room.isMaintenance);
      return matchesQuery && matchesFilter;
    });
  }, [rooms, query, filter]);

  const countFor = (value: Filter) =>
    value === 'all'
      ? rooms.length
      : rooms.filter((room) =>
          value === 'available' ? !room.isMaintenance : room.isMaintenance
        ).length;

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setTypedQuery(e.target.value)}
            placeholder="Cari ruangan, lokasi, atau fasilitas..."
            className="h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-10 text-sm text-ink placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setTypedQuery('')}
              aria-label="Bersihkan pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1 rounded-xl bg-canvas p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                filter === option.value
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
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
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Tidak ada ruangan ditemukan"
          description="Coba ubah kata kunci pencarian atau filter yang dipilih."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
