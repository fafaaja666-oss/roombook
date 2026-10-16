'use client';

import type { Room, Reservation } from '@/types';
import { TIME_SLOTS } from '@/constants/data';
import { getSlotColor, isPastDate, hasTimeOverlap } from '@/utils/helpers';
import { Check, CheckCircle2, Clock, Wrench, Ban, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SlotState = 'available' | 'booked' | 'pending' | 'unavailable' | 'maintenance';

const STATE_STYLES: Record<SlotState, string> = {
  available:
    'border-green-200 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100',
  booked: 'border-blue-500 bg-blue-500 text-white',
  pending: 'border-orange-200 bg-orange-100 text-orange-700',
  unavailable: 'border-slate-200 bg-slate-100 text-slate-400',
  maintenance: 'border-red-200 bg-red-50 text-red-600',
};

function resolveState(
  date: string,
  today: string,
  room: Room,
  start: string,
  end: string,
  reservations: Reservation[]
): SlotState {
  if (room.isMaintenance) return 'maintenance';
  if (isPastDate(date, today)) return 'unavailable';
  const color = getSlotColor(date, room.id, start, end, reservations);
  if (color === 'blue') return 'booked';
  if (color === 'orange') return 'pending';
  if (color === 'red') return 'unavailable';
  return 'available';
}

export default function ScheduleTable({
  date,
  today,
  rooms,
  reservations,
  onSelectSlot,
  selected,
}: {
  date: string;
  today: string;
  rooms: Room[];
  reservations: Reservation[];
  onSelectSlot?: (room: Room, slot: { start: string; end: string }) => void;
  selected?: { roomId: string; start: string } | null;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-muted">
              <th className="sticky left-0 z-10 min-w-[170px] bg-surface px-4 py-3 text-left">
                Ruangan
              </th>
              {TIME_SLOTS.map((slot) => (
                <th key={slot.start} className="px-1 py-3 text-center font-medium">
                  {slot.start}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="sticky left-0 z-10 bg-surface px-4 py-3">
                  <p className="font-medium text-ink">{room.name}</p>
                  <p className="text-xs text-muted">{room.capacity} orang</p>
                </td>
                {TIME_SLOTS.map((slot) => {
                  const state = resolveState(date, today, room, slot.start, slot.end, reservations);
                  const booking = reservations.find(
                    (r) =>
                      r.roomId === room.id &&
                      r.date === date &&
                      r.status !== 'Dibatalkan' &&
                      hasTimeOverlap(slot.start, slot.end, r.startTime, r.endTime)
                  );
                  const clickable = state === 'available' && Boolean(onSelectSlot);
                  const isSelected = selected?.roomId === room.id && selected?.start === slot.start;
                  const label =
                    state === 'available'
                      ? 'Tersedia'
                      : state === 'booked'
                        ? 'Disetujui'
                        : state === 'pending'
                          ? 'Menunggu Persetujuan'
                          : state === 'maintenance'
                            ? 'Pemeliharaan'
                            : 'Tidak tersedia';
                  return (
                    <td key={slot.start} className="px-1 py-2 text-center">
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() => onSelectSlot?.(room, slot)}
                        title={
                          booking
                            ? `${booking.eventName} — ${label}`
                            : `${room.name} ${slot.label}: ${label}`
                        }
                        aria-label={`${room.name} ${slot.label} ${label}`}
                        className={cn(
                          'h-9 w-full min-w-[60px] rounded-lg border text-[11px] font-medium transition-colors',
                          STATE_STYLES[state],
                          clickable ? 'cursor-pointer' : 'cursor-default',
                          isSelected && 'ring-2 ring-primary ring-offset-1'
                        )}
                      >
                        {state === 'booked'
                          ? 'Disetujui'
                          : state === 'pending'
                            ? 'Menunggu'
                            : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <LegendItem icon={Check} className="text-green-700" label="Tersedia" />
        <LegendItem icon={CheckCircle2} className="text-blue-600" label="Disetujui" />
        <LegendItem icon={Clock} className="text-orange-600" label="Menunggu Persetujuan" />
        <LegendItem icon={Wrench} className="text-red-600" label="Pemeliharaan" />
        <LegendItem icon={Ban} className="text-slate-400" label="Tidak tersedia / Terlewat" />
      </div>
    </div>
  );
}

function LegendItem({
  icon: Icon,
  className,
  label,
}: {
  icon: LucideIcon;
  className?: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className={cn('h-4 w-4', className)} />
      {label}
    </span>
  );
}
