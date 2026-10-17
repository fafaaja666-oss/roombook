import { storage } from '@/lib/storage';
import {
  calculateNights,
  calculateTotal,
  canCancel,
  canCheckIn,
  canCheckOut,
  findConflictingReservations,
  isValidStayRange,
} from '@/lib/domain';
import type {
  ActivityLog,
  ActivityType,
  Guest,
  PaymentStatus,
  Reservation,
  ReservationStatus,
  Room,
  RoomHousekeepingStatus,
  RoomType,
  User,
} from '@/types';

export interface Result<T = void> {
  ok: boolean;
  error?: string;
  value?: T;
}

const RUPIAH = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return RUPIAH.format(value || 0);
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function generateReservationCode(existing: Reservation[]): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const serial = String(Math.floor(Math.random() * 9000) + 1000);
    const code = `RB-${date}-${serial}`;
    if (!existing.some((r) => r.code === code)) return code;
  }
  return `RB-${date}-${Date.now().toString().slice(-5)}`;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

function actorName(actor?: User | string | null): string {
  if (!actor) return 'Sistem';
  if (typeof actor === 'string') return actor;
  return actor.name;
}

function pushActivity(
  type: ActivityType,
  message: string,
  actor?: User | string | null
): void {
  const log: ActivityLog = {
    id: uid('act'),
    type,
    message,
    actor: actorName(actor),
    at: new Date().toISOString(),
  };
  storage.setActivity([log, ...storage.getActivity()].slice(0, 200));
}

/* ------------------------------------------------------------------ */
/* Tamu                                                               */
/* ------------------------------------------------------------------ */

export interface GuestInput {
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  notes?: string;
}

/**
 * Cari tamu berdasarkan nomor telepon / email agar tidak terjadi duplikasi.
 * Jika belum ada, buat data tamu baru.
 */
export function upsertGuest(input: GuestInput): Guest {
  const guests = storage.getGuests();
  const phone = normalizePhone(input.phone);
  const email = input.email?.trim().toLowerCase();
  const existing = guests.find(
    (g) =>
      (phone && normalizePhone(g.phone) === phone) ||
      (email && g.email?.toLowerCase() === email)
  );

  if (existing) {
    const updated: Guest = {
      ...existing,
      name: input.name.trim() || existing.name,
      phone: input.phone.trim() || existing.phone,
      email: input.email?.trim() || existing.email,
      idNumber: input.idNumber?.trim() || existing.idNumber,
      notes: input.notes?.trim() || existing.notes,
    };
    storage.setGuests(guests.map((g) => (g.id === existing.id ? updated : g)));
    return updated;
  }

  const guest: Guest = {
    id: uid('gst'),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    idNumber: input.idNumber?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  storage.setGuests([...guests, guest]);
  return guest;
}

export function updateGuest(id: string, input: Partial<GuestInput>, actor?: User): Result {
  const guests = storage.getGuests();
  const existing = guests.find((g) => g.id === id);
  if (!existing) return { ok: false, error: 'Tamu tidak ditemukan.' };
  const updated: Guest = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    phone: input.phone?.trim() ?? existing.phone,
    email: input.email?.trim() ?? existing.email,
    idNumber: input.idNumber?.trim() ?? existing.idNumber,
    notes: input.notes?.trim() ?? existing.notes,
  };
  storage.setGuests(guests.map((g) => (g.id === id ? updated : g)));
  pushActivity('guest', `Data tamu ${updated.name} diperbarui`, actor);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Reservasi                                                          */
/* ------------------------------------------------------------------ */

export interface ReservationInput {
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestIdNumber?: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
}

function validateReservation(
  input: ReservationInput,
  rooms: Room[],
  reservations: Reservation[],
  excludeId?: string
): Result<Room> {
  const room = rooms.find((r) => r.id === input.roomId);
  if (!room) return { ok: false, error: 'Kamar tidak ditemukan.' };
  if (!input.guestName.trim()) return { ok: false, error: 'Nama tamu wajib diisi.' };
  if (!input.guestPhone.trim()) return { ok: false, error: 'Nomor telepon tamu wajib diisi.' };
  if (!isValidStayRange(input.checkIn, input.checkOut)) {
    return { ok: false, error: 'Tanggal check-out harus setelah tanggal check-in.' };
  }
  if (!input.guests || input.guests <= 0) {
    return { ok: false, error: 'Jumlah tamu harus lebih dari 0.' };
  }
  if (input.guests > room.capacity) {
    return { ok: false, error: `Jumlah tamu melebihi kapasitas kamar (${room.capacity} orang).` };
  }
  if (!room.active) {
    return { ok: false, error: 'Kamar sedang tidak aktif dan tidak dapat dipesan.' };
  }
  if (room.status === 'maintenance') {
    return { ok: false, error: 'Kamar sedang dalam pemeliharaan dan tidak dapat dipesan.' };
  }
  const conflicts = findConflictingReservations(
    reservations,
    room.id,
    input.checkIn,
    input.checkOut,
    excludeId
  );
  if (conflicts.length > 0) {
    return {
      ok: false,
      error: `Kamar ${room.number} sudah terisi pada ${conflicts[0].checkIn} s/d ${conflicts[0].checkOut}.`,
    };
  }
  return { ok: true, value: room };
}

export function createReservation(
  input: ReservationInput,
  actor: User | null,
  options: { status?: ReservationStatus } = {}
): Result<Reservation> {
  const rooms = storage.getRooms();
  const reservations = storage.getReservations();
  const validation = validateReservation(input, rooms, reservations);
  if (!validation.ok || !validation.value) return { ok: false, error: validation.error };
  const room = validation.value;

  const nights = calculateNights(input.checkIn, input.checkOut);
  const total = calculateTotal(room.pricePerNight, nights);
  const guest = upsertGuest({
    name: input.guestName,
    phone: input.guestPhone,
    email: input.guestEmail,
    idNumber: input.guestIdNumber,
  });

  const now = new Date().toISOString();
  const status: ReservationStatus = options.status ?? 'confirmed';
  const reservation: Reservation = {
    id: uid('res'),
    code: generateReservationCode(reservations),
    guestId: guest.id,
    guestName: guest.name,
    guestPhone: guest.phone,
    guestEmail: guest.email,
    roomId: room.id,
    roomNumber: room.number,
    roomType: room.type,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights,
    guests: input.guests,
    pricePerNight: room.pricePerNight,
    totalAmount: total,
    status,
    paymentStatus: 'unpaid',
    amountPaid: 0,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  storage.setReservations([...reservations, reservation]);
  pushActivity(
    'reservation_created',
    `Reservasi ${reservation.code} dibuat untuk Kamar ${room.number} (${guest.name})`,
    actor
  );
  return { ok: true, value: reservation };
}

export function updateReservation(
  id: string,
  input: ReservationInput,
  actor: User | null
): Result<Reservation> {
  const rooms = storage.getRooms();
  const reservations = storage.getReservations();
  const existing = reservations.find((r) => r.id === id);
  if (!existing) return { ok: false, error: 'Reservasi tidak ditemukan.' };
  if (existing.status === 'checked_in' || existing.status === 'checked_out') {
    return { ok: false, error: 'Reservasi yang sudah check-in tidak dapat diubah.' };
  }

  const validation = validateReservation(input, rooms, reservations, id);
  if (!validation.ok || !validation.value) return { ok: false, error: validation.error };
  const room = validation.value;

  const nights = calculateNights(input.checkIn, input.checkOut);
  const total = calculateTotal(room.pricePerNight, nights);
  const guest = upsertGuest({
    name: input.guestName,
    phone: input.guestPhone,
    email: input.guestEmail,
    idNumber: input.guestIdNumber,
  });
  const amountPaid = Math.min(existing.amountPaid, total);
  const paymentStatus: PaymentStatus =
    amountPaid <= 0 ? 'unpaid' : amountPaid >= total ? 'paid' : 'partial';

  const updated: Reservation = {
    ...existing,
    guestId: guest.id,
    guestName: guest.name,
    guestPhone: guest.phone,
    guestEmail: guest.email,
    roomId: room.id,
    roomNumber: room.number,
    roomType: room.type,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights,
    guests: input.guests,
    pricePerNight: room.pricePerNight,
    totalAmount: total,
    amountPaid,
    paymentStatus,
    notes: input.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  storage.setReservations(reservations.map((r) => (r.id === id ? updated : r)));
  pushActivity(
    'reservation_updated',
    `Reservasi ${updated.code} diperbarui`,
    actor
  );
  return { ok: true, value: updated };
}

function patchReservation(id: string, patch: Partial<Reservation>): void {
  storage.setReservations(
    storage.getReservations().map((r) => (r.id === id ? { ...r, ...patch } : r))
  );
}

export function confirmReservation(id: string, actor?: User): Result {
  const reservation = storage.getReservations().find((r) => r.id === id);
  if (!reservation) return { ok: false, error: 'Reservasi tidak ditemukan.' };
  if (reservation.status !== 'pending') {
    return { ok: false, error: 'Hanya reservasi berstatus pending yang dapat dikonfirmasi.' };
  }
  const conflicts = findConflictingReservations(
    storage.getReservations(),
    reservation.roomId,
    reservation.checkIn,
    reservation.checkOut,
    id
  );
  if (conflicts.length > 0) {
    return { ok: false, error: 'Tidak dapat dikonfirmasi: kamar sudah terisi pada periode tersebut.' };
  }
  patchReservation(id, { status: 'confirmed', updatedAt: new Date().toISOString() });
  pushActivity('reservation_confirmed', `Reservasi ${reservation.code} dikonfirmasi`, actor);
  return { ok: true };
}

export function cancelReservation(
  id: string,
  actor: User | null,
  reason?: string
): Result {
  const reservations = storage.getReservations();
  const reservation = reservations.find((r) => r.id === id);
  if (!reservation) return { ok: false, error: 'Reservasi tidak ditemukan.' };
  const room = storage.getRooms().find((r) => r.id === reservation.roomId);
  const today = new Date().toISOString().slice(0, 10);
  const gate = canCancel(reservation, room, today);
  if (!gate.ok) return { ok: false, error: gate.reason };

  patchReservation(id, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  });
  pushActivity('reservation_cancelled', `Reservasi ${reservation.code} dibatalkan`, actor);
  return { ok: true };
}

export function checkInReservation(id: string, actor: User | null): Result<Reservation> {
  const reservations = storage.getReservations();
  const reservation = reservations.find((r) => r.id === id);
  if (!reservation) return { ok: false, error: 'Reservasi tidak ditemukan.' };
  const room = storage.getRooms().find((r) => r.id === reservation.roomId);
  if (!room) return { ok: false, error: 'Kamar tidak ditemukan.' };
  const today = new Date().toISOString().slice(0, 10);
  const gate = canCheckIn(reservation, room, reservations, today);
  if (!gate.ok) return { ok: false, error: gate.reason };

  const now = new Date().toISOString();
  patchReservation(id, {
    status: 'checked_in',
    checkedInAt: now,
    checkedInBy: actorName(actor),
    updatedAt: now,
  });
  pushActivity(
    'check_in',
    `Check-in ${reservation.guestName} — Kamar ${reservation.roomNumber} (${reservation.code})`,
    actor
  );
  return { ok: true, value: { ...reservation, status: 'checked_in', checkedInAt: now } };
}

export function checkOutReservation(id: string, actor: User | null): Result<Reservation> {
  const reservations = storage.getReservations();
  const reservation = reservations.find((r) => r.id === id);
  if (!reservation) return { ok: false, error: 'Reservasi tidak ditemukan.' };
  const gate = canCheckOut(reservation);
  if (!gate.ok) return { ok: false, error: gate.reason };

  const now = new Date().toISOString();
  patchReservation(id, {
    status: 'checked_out',
    checkedOutAt: now,
    checkedOutBy: actorName(actor),
    updatedAt: now,
  });
  // Kamar masuk proses housekeeping (cleaning) setelah check-out.
  setRoomStatus(reservation.roomId, 'cleaning', actor, { silent: true });
  pushActivity(
    'check_out',
    `Check-out ${reservation.guestName} — Kamar ${reservation.roomNumber} (${reservation.code})`,
    actor
  );
  return { ok: true, value: { ...reservation, status: 'checked_out', checkedOutAt: now } };
}

export function recordPayment(id: string, amount: number, actor?: User): Result {
  const reservation = storage.getReservations().find((r) => r.id === id);
  if (!reservation) return { ok: false, error: 'Reservasi tidak ditemukan.' };
  if (reservation.status === 'cancelled') {
    return { ok: false, error: 'Reservasi dibatalkan tidak dapat menerima pembayaran.' };
  }
  const nextPaid = Math.max(0, Math.min(reservation.totalAmount, (reservation.amountPaid || 0) + amount));
  const paymentStatus: PaymentStatus =
    nextPaid <= 0 ? 'unpaid' : nextPaid >= reservation.totalAmount ? 'paid' : 'partial';
  patchReservation(id, {
    amountPaid: nextPaid,
    paymentStatus,
    updatedAt: new Date().toISOString(),
  });
  pushActivity(
    'payment',
    `Pembayaran ${formatCurrency(amount)} untuk ${reservation.code}`,
    actor
  );
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Kamar                                                              */
/* ------------------------------------------------------------------ */

export interface RoomInput {
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  pricePerNight: number;
  facilities: string[];
  description: string;
  image: string;
  status: RoomHousekeepingStatus;
  notes?: string;
  active: boolean;
}

export function saveRoom(input: RoomInput, actor: User | null, id?: string): Result<Room> {
  const rooms = storage.getRooms();
  const number = input.number.trim();
  if (!number) return { ok: false, error: 'Nomor kamar wajib diisi.' };
  if (rooms.some((r) => r.number === number && r.id !== id)) {
    return { ok: false, error: `Nomor kamar ${number} sudah digunakan.` };
  }
  if (input.capacity <= 0) return { ok: false, error: 'Kapasitas harus lebih dari 0.' };
  if (input.pricePerNight <= 0) return { ok: false, error: 'Harga per malam harus lebih dari 0.' };

  if (id) {
    const existing = rooms.find((r) => r.id === id);
    if (!existing) return { ok: false, error: 'Kamar tidak ditemukan.' };
    const updated: Room = { ...existing, ...input, number };
    storage.setRooms(rooms.map((r) => (r.id === id ? updated : r)));
    pushActivity('room_status', `Kamar ${number} diperbarui`, actor);
    return { ok: true, value: updated };
  }

  const room: Room = {
    id: uid('room'),
    ...input,
    number,
    createdAt: new Date().toISOString(),
  };
  storage.setRooms([...rooms, room]);
  pushActivity('room_status', `Kamar ${number} ditambahkan`, actor);
  return { ok: true, value: room };
}

export function setRoomStatus(
  roomId: string,
  status: RoomHousekeepingStatus,
  actor: User | null,
  options: { silent?: boolean } = {}
): Result {
  const rooms = storage.getRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return { ok: false, error: 'Kamar tidak ditemukan.' };

  // Kamar yang sedang ditempati tidak boleh diubah status fisiknya.
  const occupied = storage
    .getReservations()
    .some((r) => r.roomId === roomId && r.status === 'checked_in');
  if (occupied && status !== room.status) {
    return { ok: false, error: 'Kamar sedang ditempati. Selesaikan check-out terlebih dahulu.' };
  }

  storage.setRooms(rooms.map((r) => (r.id === roomId ? { ...r, status } : r)));
  if (!options.silent) {
    const labels: Record<RoomHousekeepingStatus, string> = {
      available: 'tersedia',
      cleaning: 'perlu dibersihkan',
      maintenance: 'pemeliharaan',
    };
    pushActivity('room_status', `Kamar ${room.number} ditandai ${labels[status]}`, actor);
  }
  return { ok: true };
}

export function setRoomActive(roomId: string, active: boolean, actor: User | null): Result {
  const rooms = storage.getRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return { ok: false, error: 'Kamar tidak ditemukan.' };
  if (!active) {
    const activeReservations = storage.getReservations().some(
      (r) => r.roomId === roomId && ['pending', 'confirmed', 'checked_in'].includes(r.status)
    );
    if (activeReservations) {
      return {
        ok: false,
        error: 'Kamar memiliki reservasi aktif. Selesaikan atau batalkan terlebih dahulu.',
      };
    }
  }
  storage.setRooms(rooms.map((r) => (r.id === roomId ? { ...r, active } : r)));
  pushActivity('room_status', `Kamar ${room.number} ${active ? 'diaktifkan' : 'dinonaktifkan'}`, actor);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Pengguna / staf                                                    */
/* ------------------------------------------------------------------ */

export function saveUser(
  input: { name: string; email: string; password: string; role: User['role']; phone?: string; active: boolean },
  id?: string
): Result {
  const users = storage.getUsers();
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim()) return { ok: false, error: 'Nama wajib diisi.' };
  if (!email) return { ok: false, error: 'Email wajib diisi.' };
  if (!id && !input.password.trim()) return { ok: false, error: 'Kata sandi wajib diisi.' };
  if (users.some((u) => u.email.toLowerCase() === email && u.id !== id)) {
    return { ok: false, error: 'Email sudah digunakan.' };
  }
  if (id) {
    storage.setUsers(
      users.map((u) =>
        u.id === id
          ? {
              ...u,
              name: input.name.trim(),
              email,
              role: input.role,
              phone: input.phone?.trim(),
              active: input.active,
              password: input.password.trim() || u.password,
            }
          : u
      )
    );
  } else {
    storage.setUsers([
      ...users,
      {
        id: uid('usr'),
        name: input.name.trim(),
        email,
        password: input.password.trim(),
        role: input.role,
        phone: input.phone?.trim(),
        active: true,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  return { ok: true };
}
