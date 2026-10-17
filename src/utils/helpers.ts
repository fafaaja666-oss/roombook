import { calculateNights, getRoomOperationalStatus, toDateOnly } from '@/lib/domain';
import type { Reservation, Room, User } from '@/types';

export { toDateOnly };

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  return `${formatDateShort(checkIn)} → ${formatDateShort(checkOut)}`;
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelative(iso: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDateShort(iso.slice(0, 10));
}

export function formatNights(nights: number): string {
  return `${nights} malam`;
}

export function isPastDate(dateStr: string, today: string): boolean {
  return Boolean(dateStr) && dateStr < today;
}

export function todayISO(): string {
  return toDateOnly(new Date());
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

/** Ringkasan status kamar untuk sebuah tanggal, dipakai di beberapa halaman. */
export function roomStatusAt(room: Room, reservations: Reservation[], date: string) {
  return getRoomOperationalStatus(room, reservations, date);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return calculateNights(checkIn, checkOut);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function roleLabel(role: User['role']): string {
  const map: Record<User['role'], string> = {
    admin: 'Administrator',
    receptionist: 'Resepsionis',
    guest: 'Tamu',
  };
  return map[role];
}

export function buildDateSequence(fromDate: string, days: number): string[] {
  const result: string[] = [];
  const date = new Date(`${fromDate}T00:00:00`);
  for (let i = 0; i < days; i += 1) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    result.push(`${year}-${month}-${day}`);
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
