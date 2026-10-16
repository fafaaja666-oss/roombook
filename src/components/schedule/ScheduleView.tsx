'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import ScheduleTable from '@/components/schedule/ScheduleTable';
import EmptyState from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import Button, { buttonClasses } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import type { Room } from '@/types';
import { formatDate } from '@/utils/helpers';
import { CalendarOff, ChevronLeft, ChevronRight, Info, CalendarClock, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ScheduleView({ admin = false }: { admin?: boolean }) {
  const { rooms, reservations } = useData();
  const today = useToday();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState('');
  const [roomFilterOverride, setRoomFilterOverride] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    room: Room;
    slot: { start: string; end: string };
  } | null>(null);

  const urlRoom = searchParams.get('room') ?? '';
  const activeDate = date || today;
  const dateLabel = activeDate ? formatDate(activeDate) : '—';
  const roomFilter =
    roomFilterOverride ?? (urlRoom && rooms.some((r) => r.id === urlRoom) ? urlRoom : 'all');

  const visibleRooms = useMemo(
    () => (roomFilter === 'all' ? rooms : rooms.filter((r) => r.id === roomFilter)),
    [rooms, roomFilter]
  );

  const prevDisabled = !admin && activeDate <= today;

  const handleSelectSlot = (room: Room, slot: { start: string; end: string }) => {
    setSelected({ room, slot });
  };

  const goToBooking = () => {
    if (!selected) return;
    router.push(
      `/booking?room=${selected.room.id}&date=${activeDate}&start=${selected.slot.start}&end=${selected.slot.end}`
    );
  };

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-ink">Tanggal</label>
              <div className="mt-1 flex items-center gap-1">
                <button
                  type="button"
                  disabled={prevDisabled}
                  onClick={() => setDate(shiftDate(activeDate, -1))}
                  aria-label="Hari sebelumnya"
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:bg-slate-50 hover:text-ink',
                    prevDisabled && 'pointer-events-none opacity-40'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <input
                  type="date"
                  min={admin ? undefined : today}
                  value={activeDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setDate(shiftDate(activeDate, 1))}
                  aria-label="Hari berikutnya"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:bg-slate-50 hover:text-ink"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-ink">Ruangan</label>
              <div className="mt-1">
                <Select
                  value={roomFilter}
                  onChange={(e) => {
                    setRoomFilterOverride(e.target.value);
                    setSelected(null);
                  }}
                >
                  <option value="all">Semua Ruangan</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDate(today);
                setSelected(null);
              }}
              className={buttonClasses({ variant: 'secondary' })}
            >
              <Calendar className="h-4 w-4" /> Hari ini
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          Menampilkan jadwal untuk <span className="font-medium text-ink">{dateLabel}</span>
        </p>
        {!admin && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Info className="h-3.5 w-3.5" />
            Klik slot berwarna hijau untuk memilih waktu, lalu ajukan reservasi.
          </p>
        )}
      </Card>

      {selected && !admin && (
        <Card className="animate-scale-in flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">{selected.room.name}</p>
              <p className="text-sm text-muted">
                {dateLabel} • {selected.slot.start}–{selected.slot.end}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Batal
            </Button>
            <Button onClick={goToBooking}>Ajukan Reservasi</Button>
          </div>
        </Card>
      )}

      {visibleRooms.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="Tidak ada ruangan"
          description="Belum ada ruangan yang dapat ditampilkan untuk filter ini."
        />
      ) : (
        <ScheduleTable
          date={activeDate}
          today={today}
          rooms={visibleRooms}
          reservations={reservations}
          onSelectSlot={admin ? undefined : handleSelectSlot}
          selected={selected ? { roomId: selected.room.id, start: selected.slot.start } : null}
        />
      )}
    </div>
  );
}
