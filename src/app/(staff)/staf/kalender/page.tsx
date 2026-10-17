'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { isStayOverlap } from '@/lib/domain';
import { addDays, buildDateSequence, formatDateShort } from '@/utils/helpers';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStatusMeta } from '@/lib/status';
import type { Reservation } from '@/types';

const WINDOW = 14;

export default function CalendarPage() {
  const { rooms, reservations, loading } = useData();
  const today = useToday();
  const [start, setStart] = useState(today);

  const days = useMemo(() => buildDateSequence(start, WINDOW), [start]);

  const activeRooms = useMemo(
    () => rooms.filter((room) => room.active).sort((a, b) => a.number.localeCompare(b.number)),
    [rooms]
  );

  const reservationsByRoom = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    reservations
      .filter((r) => r.status !== 'cancelled' && r.status !== 'no_show')
      .forEach((r) => {
        const list = map.get(r.roomId) ?? [];
        list.push(r);
        map.set(r.roomId, list);
      });
    return map;
  }, [reservations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gold-dark" />
          <h1 className="font-display text-xl font-semibold text-ink">Kalender Ketersediaan</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setStart(addDays(start, -7))}>
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setStart(today)}>
            Hari ini
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setStart(addDays(start, 7))}>
            Berikutnya <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface shadow-sm">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div
                className="grid border-b border-line"
                style={{ gridTemplateColumns: `160px repeat(${WINDOW}, minmax(0, 1fr))` }}
              >
                <div className="sticky left-0 z-10 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Kamar
                </div>
                {days.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      'border-l border-line px-2 py-3 text-center text-xs',
                      day === today ? 'bg-gold-soft font-semibold text-gold-dark' : 'text-muted'
                    )}
                  >
                    <span className="block">{formatDateShort(day).slice(0, 6)}</span>
                    <span className="block text-[10px]">{day.slice(8)}</span>
                  </div>
                ))}
              </div>

              {activeRooms.map((room) => {
                const roomReservations = reservationsByRoom.get(room.id) ?? [];
                return (
                  <div
                    key={room.id}
                    className="grid border-b border-line last:border-0"
                    style={{ gridTemplateColumns: `160px repeat(${WINDOW}, minmax(0, 1fr))` }}
                  >
                    <div className="sticky left-0 z-10 flex items-center gap-2 border-r border-line bg-surface px-4 py-3">
                      <span className="font-display text-sm font-semibold text-ink">{room.number}</span>
                      <span className="text-xs text-muted">{room.type}</span>
                    </div>
                    {days.map((day) => {
                      const occupying = roomReservations.find((r) => isStayOverlap(day, addDays(day, 1), r.checkIn, r.checkOut));
                      const isStart = occupying?.checkIn === day;
                      const meta = occupying ? getStatusMeta(occupying.status) : null;
                      return (
                        <div key={`${room.id}-${day}`} className="relative h-12 border-l border-line">
                          {occupying && (
                            <div
                              title={`${occupying.guestName} · ${occupying.code}`}
                              className={cn(
                                'absolute inset-y-1 left-0 right-0 flex items-center px-2 text-[11px] font-medium',
                                meta?.pill ?? 'bg-canvas',
                                isStart ? 'rounded-l-md border-l-2' : 'border-l-0',
                                meta?.dot ? '' : ''
                              )}
                            >
                              {isStart && (
                                <span className="truncate">{occupying.guestName.split(' ')[0]}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        {(['confirmed', 'pending', 'checked_in', 'checked_out'] as const).map((status) => {
          const meta = getStatusMeta(status);
          return (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span className={cn('h-3 w-3 rounded-sm', meta.dot)} />
              <span className="text-muted">{meta.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
