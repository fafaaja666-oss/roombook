import type { Reservation } from '@/types';

export function generateReservationId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RES-${date}-${random}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function isPastDate(dateStr: string, today: string): boolean {
  return dateStr < today;
}

export function hasTimeOverlap(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string
): boolean {
  return newStart < existingEnd && existingStart < newEnd;
}

export function isTimeRangeValid(start: string, end: string): boolean {
  return start < end;
}

export function findConflictingReservations(
  reservations: Reservation[],
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): Reservation[] {
  return reservations.filter(
    (r) =>
      r.id !== excludeId &&
      r.roomId === roomId &&
      r.date === date &&
      (r.status === 'Disetujui' || r.status === 'Menunggu Persetujuan') &&
      hasTimeOverlap(startTime, endTime, r.startTime, r.endTime)
  );
}

export function getSlotColor(
  date: string,
  roomId: string,
  startTime: string,
  endTime: string,
  reservations: Reservation[]
): 'green' | 'blue' | 'orange' | 'red' {
  const approved = reservations.filter(
    (r) => r.roomId === roomId && r.date === date && r.status === 'Disetujui'
  );
  const pending = reservations.filter(
    (r) => r.roomId === roomId && r.date === date && r.status === 'Menunggu Persetujuan'
  );

  for (const r of approved) {
    if (hasTimeOverlap(startTime, endTime, r.startTime, r.endTime)) {
      return 'blue';
    }
  }
  for (const r of pending) {
    if (hasTimeOverlap(startTime, endTime, r.startTime, r.endTime)) {
      return 'orange';
    }
  }
  return 'green';
}