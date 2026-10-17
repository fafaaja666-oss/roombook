import type {
  Reservation,
  ReservationStatus,
  Room,
  RoomOperationalStatus,
  UserRole,
} from '@/types';

/** Status reservasi yang masih "menahan" kamar (menghalangi ketersediaan). */
export const BLOCKING_STATUSES: ReservationStatus[] = ['pending', 'confirmed', 'checked_in'];

/** Status reservasi yang dianggap selesai / tidak menahan kamar. */
export const CLOSED_STATUSES: ReservationStatus[] = ['checked_out', 'cancelled', 'no_show'];

export const ROOM_TYPE_ORDER = ['Standard', 'Deluxe', 'Suite', 'Executive'] as const;

/* ------------------------------------------------------------------ */
/* Tanggal                                                             */
/* ------------------------------------------------------------------ */

export function toDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
}

/** Jumlah malam = selisih hari check-out dikurangi check-in. */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = parseDate(checkIn).getTime();
  const end = parseDate(checkOut).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function isValidStayRange(checkIn: string, checkOut: string): boolean {
  return Boolean(checkIn) && Boolean(checkOut) && checkOut > checkIn;
}

/**
 * Rentang menginap: check-in termasuk, check-out tidak termasuk.
 * Dua rentang bertabrakan bila keduanya beririsan.
 */
export function isStayOverlap(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string
): boolean {
  return aIn < bOut && bIn < aOut;
}

export function isReservationActiveOn(reservation: Reservation, date: string): boolean {
  return reservation.checkIn <= date && date < reservation.checkOut;
}

/* ------------------------------------------------------------------ */
/* Harga                                                              */
/* ------------------------------------------------------------------ */

export function calculateTotal(pricePerNight: number, nights: number): number {
  return Math.max(0, Math.round(pricePerNight * nights));
}

/* ------------------------------------------------------------------ */
/* Ketersediaan                                                       */
/* ------------------------------------------------------------------ */

export interface AvailabilityInput {
  rooms: Room[];
  reservations: Reservation[];
}

/** Reservasi yang menahan kamar pada rentang tertentu. */
export function getBlockingReservations(
  reservations: Reservation[],
  options: { roomId?: string; excludeId?: string } = {}
): Reservation[] {
  return reservations.filter(
    (r) =>
      BLOCKING_STATUSES.includes(r.status) &&
      (!options.roomId || r.roomId === options.roomId) &&
      (!options.excludeId || r.id !== options.excludeId)
  );
}

export function findConflictingReservations(
  reservations: Reservation[],
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string
): Reservation[] {
  if (!isValidStayRange(checkIn, checkOut)) return [];
  return getBlockingReservations(reservations, { roomId, excludeId }).filter((r) =>
    isStayOverlap(checkIn, checkOut, r.checkIn, r.checkOut)
  );
}

/**
 * Kamar dapat dialokasikan bila aktif, tidak maintenance, dan tidak ada
 * reservasi aktif yang bertabrakan pada rentang yang diminta.
 */
export function isRoomAvailable(
  room: Room,
  reservations: Reservation[],
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string
): boolean {
  if (!room.active) return false;
  if (room.status === 'maintenance') return false;
  if (!isValidStayRange(checkIn, checkOut)) return false;
  return (
    findConflictingReservations(reservations, room.id, checkIn, checkOut, excludeReservationId)
      .length === 0
  );
}

export function getAvailableRooms(
  rooms: Room[],
  reservations: Reservation[],
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string
): Room[] {
  return rooms.filter((room) => isRoomAvailable(room, reservations, checkIn, checkOut, excludeReservationId));
}

/* ------------------------------------------------------------------ */
/* Status operasional kamar (turunan)                                 */
/* ------------------------------------------------------------------ */

/**
 * Menurunkan status operasional kamar untuk tanggal tertentu.
 * - maintenance / cleaning berasal dari data kamar (housekeeping)
 * - occupied berasal dari reservasi yang sedang checked-in
 * - reserved berasal dari reservasi confirmed/pending yang mencakup tanggal
 */
export function getRoomOperationalStatus(
  room: Room,
  reservations: Reservation[],
  date: string
): RoomOperationalStatus {
  const active = getBlockingReservations(reservations, { roomId: room.id });
  const checkedIn = active.find((r) => r.status === 'checked_in' && isReservationActiveOn(r, date));

  // Okupansi menang atas status housekeeping (tamu sedang di dalam kamar).
  if (checkedIn) return 'occupied';
  if (room.status === 'maintenance') return 'maintenance';
  if (room.status === 'cleaning') return 'cleaning';

  const upcoming = active.find(
    (r) => r.status !== 'checked_in' && isReservationActiveOn(r, date)
  );
  if (upcoming) return 'reserved';

  return 'available';
}

export function getNextArrival(room: Room, reservations: Reservation[], fromDate: string): Reservation | undefined {
  return getBlockingReservations(reservations, { roomId: room.id })
    .filter((r) => r.status !== 'checked_in' && r.checkIn >= fromDate)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
}

/* ------------------------------------------------------------------ */
/* Aturan transisi status                                             */
/* ------------------------------------------------------------------ */

export interface GateResult {
  ok: boolean;
  reason?: string;
}

export function canCheckIn(
  reservation: Reservation,
  room: Room,
  reservations: Reservation[],
  today: string
): GateResult {
  if (reservation.status === 'checked_in') {
    return { ok: false, reason: 'Reservasi ini sudah pernah check-in.' };
  }
  if (reservation.status === 'checked_out') {
    return { ok: false, reason: 'Reservasi ini sudah selesai (check-out).' };
  }
  if (reservation.status === 'cancelled') {
    return { ok: false, reason: 'Reservasi yang dibatalkan tidak dapat check-in.' };
  }
  if (reservation.status === 'no_show') {
    return { ok: false, reason: 'Reservasi berstatus no-show tidak dapat check-in.' };
  }
  if (reservation.status === 'pending') {
    return { ok: false, reason: 'Reservasi belum dikonfirmasi. Konfirmasi terlebih dahulu.' };
  }
  if (today < reservation.checkIn) {
    return { ok: false, reason: 'Belum memasuki tanggal check-in reservasi ini.' };
  }
  if (today >= reservation.checkOut) {
    return { ok: false, reason: 'Tanggal check-out sudah terlewat.' };
  }
  if (!room.active || room.status === 'maintenance') {
    return { ok: false, reason: 'Kamar sedang dalam pemeliharaan atau tidak aktif.' };
  }
  if (room.status === 'cleaning') {
    return { ok: false, reason: 'Kamar belum siap (masih proses housekeeping).' };
  }

  const conflict = reservations.find(
    (r) =>
      r.id !== reservation.id &&
      r.roomId === reservation.roomId &&
      r.status === 'checked_in' &&
      isReservationActiveOn(r, today)
  );
  if (conflict) {
    return { ok: false, reason: 'Kamar sedang ditempati tamu lain.' };
  }
  return { ok: true };
}

export function canCheckOut(reservation: Reservation): GateResult {
  if (reservation.status !== 'checked_in') {
    return { ok: false, reason: 'Hanya tamu yang sedang menginap yang dapat check-out.' };
  }
  return { ok: true };
}

export function canCancel(
  reservation: Reservation,
  room: Room | undefined,
  today: string
): GateResult {
  if (reservation.status === 'checked_in') {
    return { ok: false, reason: 'Tamu sedang menginap. Proses check-out terlebih dahulu.' };
  }
  if (reservation.status === 'checked_out' || reservation.status === 'cancelled') {
    return { ok: false, reason: 'Reservasi ini sudah tidak aktif.' };
  }
  if (reservation.checkOut <= today) {
    return { ok: false, reason: 'Reservasi sudah terlewat dan tidak dapat dibatalkan.' };
  }
  if (room && room.status === 'maintenance') {
    // masih boleh dibatalkan
    return { ok: true };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Otorisasi                                                          */
/* ------------------------------------------------------------------ */

export const STAFF_ROLES: UserRole[] = ['admin', 'receptionist'];

export function isStaff(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'receptionist';
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'admin';
}

/* ------------------------------------------------------------------ */
/* Statistik / laporan                                                */
/* ------------------------------------------------------------------ */

export interface RoomStatusCounts {
  total: number;
  available: number;
  reserved: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  inactive: number;
}

export function countRoomStatuses(
  rooms: Room[],
  reservations: Reservation[],
  date: string
): RoomStatusCounts {
  const counts: RoomStatusCounts = {
    total: rooms.length,
    available: 0,
    reserved: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
    inactive: 0,
  };
  rooms.forEach((room) => {
    if (!room.active) {
      counts.inactive += 1;
      return;
    }
    counts[getRoomOperationalStatus(room, reservations, date)] += 1;
  });
  return counts;
}

export function getOccupancyRate(
  rooms: Room[],
  reservations: Reservation[],
  fromDate: string,
  toDate: string
): number {
  const nights = calculateNights(fromDate, toDate);
  const activeRooms = rooms.filter((r) => r.active && r.status !== 'maintenance').length;
  if (nights <= 0 || activeRooms === 0) return 0;
  const roomNights = reservations
    .filter((r) => r.status !== 'cancelled' && r.status !== 'no_show')
    .reduce((sum, r) => {
      const overlapStart = r.checkIn > fromDate ? r.checkIn : fromDate;
      const overlapEnd = r.checkOut < toDate ? r.checkOut : toDate;
      return sum + Math.max(0, calculateNights(overlapStart, overlapEnd));
    }, 0);
  const availableRoomNights = activeRooms * nights;
  return availableRoomsSafe(roomNights, availableRoomNights);
}

function availableRoomsSafe(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export function sumRecordedRevenue(reservations: Reservation[]): number {
  return reservations
    .filter((r) => r.status !== 'cancelled' && r.status !== 'no_show')
    .reduce((sum, r) => sum + (r.amountPaid || 0), 0);
}

export function isClosedStatus(status: ReservationStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}
