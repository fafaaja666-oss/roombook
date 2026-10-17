export type UserRole = 'admin' | 'receptionist' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  createdAt: string;
}

/**
 * Status fisik / housekeeping kamar yang disimpan pada data kamar.
 * Status "occupied" dan "reserved" TIDAK disimpan di sini karena diturunkan
 * secara langsung dari data reservasi (satu sumber kebenaran).
 */
export type RoomHousekeepingStatus = 'available' | 'cleaning' | 'maintenance';

/**
 * Status operasional kamar yang ditampilkan ke pengguna.
 * Gabungan status housekeeping (data kamar) + okupansi (data reservasi).
 */
export type RoomOperationalStatus =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'cleaning'
  | 'maintenance';

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Executive';

export interface Room {
  id: string;
  /** Nomor kamar, unik. Contoh: 101, 204, 512 */
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  /** Harga dasar per malam dalam Rupiah */
  pricePerNight: number;
  facilities: string[];
  description: string;
  image: string;
  status: RoomHousekeepingStatus;
  notes?: string;
  /** Kamar nonaktif tidak dapat dipesan tetapi riwayatnya tetap tersimpan */
  active: boolean;
  createdAt: string;
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Reservation {
  id: string;
  /** Kode reservasi unik untuk tamu, contoh: RB-20260116-0007 */
  code: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;

  roomId: string;
  roomNumber: string;
  roomType: RoomType;

  /** Tanggal check-in (termasuk) format YYYY-MM-DD */
  checkIn: string;
  /** Tanggal check-out (tidak termasuk) format YYYY-MM-DD */
  checkOut: string;
  nights: number;
  guests: number;

  /** Harga saat reservasi dibuat (snapshot, tidak berubah walau harga kamar berubah) */
  pricePerNight: number;
  totalAmount: number;

  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;

  notes?: string;
  createdAt: string;
  updatedAt: string;

  checkedInAt?: string;
  checkedInBy?: string;
  checkedOutAt?: string;
  checkedOutBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  notes?: string;
  createdAt: string;
}

export type ActivityType =
  | 'reservation_created'
  | 'reservation_updated'
  | 'reservation_confirmed'
  | 'reservation_cancelled'
  | 'check_in'
  | 'check_out'
  | 'room_status'
  | 'payment'
  | 'guest';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  message: string;
  actor: string;
  at: string;
}
