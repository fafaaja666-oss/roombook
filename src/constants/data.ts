import type { ActivityLog, Guest, Reservation, Room, User } from '@/types';
import { addDays, calculateNights, calculateTotal, toDateOnly } from '@/lib/domain';
import { ROOM_IMAGES } from '@/constants/room-images';

export const APP_NAME = 'RoomBook';
export const APP_TAGLINE = 'Hotel Management & Reservation';
export const HOTEL_NAME = 'RoomBook Grand Hotel';

export const STORAGE_KEYS = {
  USERS: 'roombook_users_v2',
  ROOMS: 'roombook_rooms_v2',
  RESERVATIONS: 'roombook_reservations_v2',
  GUESTS: 'roombook_guests_v2',
  ACTIVITY: 'roombook_activity_v2',
  CURRENT_USER: 'roombook_current_user_v2',
} as const;

export const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive'] as const;

/**
 * Musik latar global berbasis video YouTube (satu-satunya sumber audio).
 * Ganti ID di bawah untuk memakai video lain. Pemutar dimuat lewat YouTube
 * IFrame Player API dan menyesuaikan kebijakan autoplay peramban.
 *
 * Video aktif: https://youtu.be/nB2nXKENAco
 */
export const MUSIC_YOUTUBE_ID = 'nB2nXKENAco';
export const MUSIC_TRACK_TITLE = 'Musik Lobby RoomBook';

/** Akun demo. Kata sandi hanya untuk keperluan prototipe. */
export const DEMO_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Andi Pratama',
    email: 'admin@roombook.test',
    password: 'admin123',
    role: 'admin',
    phone: '0811-2000-100',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'usr_reception',
    name: 'Rini Saputra',
    email: 'resepsionis@roombook.test',
    password: 'resepsionis123',
    role: 'receptionist',
    phone: '0811-2000-200',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'usr_guest',
    name: 'Budi Santoso',
    email: 'tamu@roombook.test',
    password: 'tamu123',
    role: 'guest',
    phone: '0812-3456-7890',
    active: true,
    createdAt: '2026-01-02T08:00:00.000Z',
  },
];

export const DEMO_ROOMS: Room[] = [
  {
    id: 'room_101',
    number: '101',
    type: 'Standard',
    floor: 1,
    capacity: 2,
    pricePerNight: 650000,
    facilities: ['Wi-Fi', 'AC', 'TV', 'Air Panas', 'Sarapan'],
    description:
      'Kamar Standard yang nyaman dengan tempat tidur queen, cocok untuk perjalanan bisnis singkat maupun liburan singkat.',
    image: ROOM_IMAGES.room_101,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_102',
    number: '102',
    type: 'Standard',
    floor: 1,
    capacity: 2,
    pricePerNight: 650000,
    facilities: ['Wi-Fi', 'AC', 'TV', 'Air Panas'],
    description: 'Kamar Standard dengan pemandangan taman internal yang tenang.',
    image: ROOM_IMAGES.room_102,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_103',
    number: '103',
    type: 'Standard',
    floor: 1,
    capacity: 3,
    pricePerNight: 700000,
    facilities: ['Wi-Fi', 'AC', 'TV', 'Air Panas', 'Sarapan'],
    description: 'Kamar Standard keluarga dengan satu tempat tidur queen dan satu single.',
    image: ROOM_IMAGES.room_103,
    status: 'cleaning',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_201',
    number: '201',
    type: 'Deluxe',
    floor: 2,
    capacity: 2,
    pricePerNight: 950000,
    facilities: ['Wi-Fi', 'AC', 'Smart TV', 'Air Panas', 'Mini Bar', 'Sarapan', 'Balkon'],
    description:
      'Kamar Deluxe yang luas dengan area duduk, balkon pribadi, dan akses Kolam Renang.',
    image: ROOM_IMAGES.room_201,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_202',
    number: '202',
    type: 'Deluxe',
    floor: 2,
    capacity: 3,
    pricePerNight: 1000000,
    facilities: ['Wi-Fi', 'AC', 'Smart TV', 'Air Panas', 'Mini Bar', 'Sarapan', 'Balkon'],
    description: 'Kamar Deluxe dengan tempat tidur king dan sofa bed untuk keluarga kecil.',
    image: ROOM_IMAGES.room_202,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_203',
    number: '203',
    type: 'Deluxe',
    floor: 2,
    capacity: 2,
    pricePerNight: 950000,
    facilities: ['Wi-Fi', 'AC', 'Smart TV', 'Air Panas', 'Mini Bar', 'Sarapan'],
    description: 'Kamar Deluxe menghadap kota dengan jendela panorama lantai ke langit-langit.',
    image: ROOM_IMAGES.room_203,
    status: 'maintenance',
    active: true,
    notes: 'Renovasi kamar mandi, estimasi selesai akhir pekan.',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_301',
    number: '301',
    type: 'Suite',
    floor: 3,
    capacity: 4,
    pricePerNight: 1750000,
    facilities: ['Wi-Fi', 'AC', 'Smart TV', 'Air Panas', 'Mini Bar', 'Sarapan', 'Ruang Tamu', 'Bathtub'],
    description:
      'Suite elegan dengan ruang tamu terpisah, bathtub, dan layanan kamar prioritas.',
    image: ROOM_IMAGES.room_301,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_302',
    number: '302',
    type: 'Suite',
    floor: 3,
    capacity: 4,
    pricePerNight: 1750000,
    facilities: ['Wi-Fi', 'AC', 'Smart TV', 'Air Panas', 'Mini Bar', 'Sarapan', 'Ruang Tamu', 'Bathtub'],
    description: 'Suite keluarga dengan dua kamar tidur dan pemandangan laut.',
    image: ROOM_IMAGES.room_302,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_401',
    number: '401',
    type: 'Executive',
    floor: 4,
    capacity: 2,
    pricePerNight: 2500000,
    facilities: [
      'Wi-Fi',
      'AC',
      'Smart TV',
      'Air Panas',
      'Mini Bar',
      'Sarapan',
      'Lounge Access',
      'Butler',
    ],
    description:
      'Kamar Executive di lantai tertinggi dengan akses Executive Lounge dan pemandangan panorama.',
    image: ROOM_IMAGES.room_401,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'room_402',
    number: '402',
    type: 'Executive',
    floor: 4,
    capacity: 3,
    pricePerNight: 2700000,
    facilities: [
      'Wi-Fi',
      'AC',
      'Smart TV',
      'Air Panas',
      'Mini Bar',
      'Sarapan',
      'Lounge Access',
      'Butler',
    ],
    description: 'Executive Corner dengan ruang kerja dan pemandangan kota 270 derajat.',
    image: ROOM_IMAGES.room_402,
    status: 'available',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

export const DEMO_GUESTS: Guest[] = [
  {
    id: 'gst_001',
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    email: 'tamu@roombook.test',
    idNumber: '3175-0912-3456',
    notes: 'Tamu reguler, preferensi kamar lantai tinggi.',
    createdAt: '2026-01-02T08:00:00.000Z',
  },
  {
    id: 'gst_002',
    name: 'Siti Nurhaliza',
    phone: '0813-2222-1111',
    email: 'siti.n@example.com',
    idNumber: '3273-1122-9087',
    createdAt: '2026-01-05T09:30:00.000Z',
  },
  {
    id: 'gst_003',
    name: 'James Wijaya',
    phone: '0811-9876-5432',
    email: 'james.w@example.com',
    idNumber: '3174-5566-1122',
    notes: 'Perjalanan bisnis, minta early check-in bila tersedia.',
    createdAt: '2026-01-07T14:10:00.000Z',
  },
];

interface DemoReservationSeed {
  id: string;
  code: string;
  guestIndex: number;
  roomId: string;
  checkInOffset: number;
  nights: number;
  guests: number;
  status: Reservation['status'];
  payment: Reservation['paymentStatus'];
  paidRatio: number;
  notes?: string;
}

const RESERVATION_SEEDS: DemoReservationSeed[] = [
  {
    id: 'res_001',
    code: 'RB-0001',
    guestIndex: 0,
    roomId: 'room_101',
    checkInOffset: -1,
    nights: 3,
    guests: 2,
    status: 'checked_in',
    payment: 'paid',
    paidRatio: 1,
    notes: 'Tamu minta late check-out.',
  },
  {
    id: 'res_002',
    code: 'RB-0002',
    guestIndex: 1,
    roomId: 'room_201',
    checkInOffset: 0,
    nights: 2,
    guests: 2,
    status: 'confirmed',
    payment: 'partial',
    paidRatio: 0.5,
  },
  {
    id: 'res_003',
    code: 'RB-0003',
    guestIndex: 2,
    roomId: 'room_401',
    checkInOffset: 0,
    nights: 1,
    guests: 1,
    status: 'confirmed',
    payment: 'unpaid',
    paidRatio: 0,
    notes: 'Perlu airport transfer.',
  },
  {
    id: 'res_004',
    code: 'RB-0004',
    guestIndex: 0,
    roomId: 'room_301',
    checkInOffset: 5,
    nights: 3,
    guests: 3,
    status: 'confirmed',
    payment: 'partial',
    paidRatio: 0.3,
  },
  {
    id: 'res_005',
    code: 'RB-0005',
    guestIndex: 1,
    roomId: 'room_102',
    checkInOffset: 2,
    nights: 2,
    guests: 2,
    status: 'pending',
    payment: 'unpaid',
    paidRatio: 0,
  },
  {
    id: 'res_006',
    code: 'RB-0006',
    guestIndex: 2,
    roomId: 'room_203',
    checkInOffset: -6,
    nights: 2,
    guests: 2,
    status: 'checked_out',
    payment: 'paid',
    paidRatio: 1,
  },
  {
    id: 'res_007',
    code: 'RB-0007',
    guestIndex: 0,
    roomId: 'room_302',
    checkInOffset: -10,
    nights: 1,
    guests: 2,
    status: 'cancelled',
    payment: 'unpaid',
    paidRatio: 0,
    notes: 'Dibatalkan tamu karena perubahan rencana.',
  },
];

export function createDemoReservations(): Reservation[] {
  const today = toDateOnly(new Date());
  return RESERVATION_SEEDS.map((seed) => {
    const room = DEMO_ROOMS.find((r) => r.id === seed.roomId);
    const guest = DEMO_GUESTS[seed.guestIndex];
    const pricePerNight = room?.pricePerNight ?? 0;
    const nights = seed.nights;
    const total = calculateTotal(pricePerNight, nights);
    const checkIn = addDays(today, seed.checkInOffset);
    const checkOut = addDays(checkIn, nights);
    const isDone = seed.status === 'checked_out' || seed.status === 'cancelled';
    return {
      id: seed.id,
      code: seed.code,
      guestId: guest.id,
      guestName: guest.name,
      guestPhone: guest.phone,
      guestEmail: guest.email,
      roomId: seed.roomId,
      roomNumber: room?.number ?? '',
      roomType: room?.type ?? 'Standard',
      checkIn,
      checkOut,
      nights: calculateNights(checkIn, checkOut) || nights,
      guests: seed.guests,
      pricePerNight,
      totalAmount: total,
      status: seed.status,
      paymentStatus: seed.payment,
      amountPaid: Math.round(total * seed.paidRatio),
      notes: seed.notes,
      createdAt: addDays(today, seed.checkInOffset - 12) + 'T10:00:00.000Z',
      updatedAt: addDays(today, seed.checkInOffset - 12) + 'T10:00:00.000Z',
      checkedInAt: seed.status === 'checked_in' ? addDays(checkIn, 0) + 'T14:05:00.000Z' : undefined,
      checkedInBy: seed.status === 'checked_in' ? 'Rini Saputra' : undefined,
      checkedOutAt: isDone && seed.status === 'checked_out' ? checkOut + 'T11:20:00.000Z' : undefined,
      checkedOutBy: isDone && seed.status === 'checked_out' ? 'Rini Saputra' : undefined,
      cancelledAt: seed.status === 'cancelled' ? addDays(today, -9) + 'T09:00:00.000Z' : undefined,
      cancellationReason:
        seed.status === 'cancelled' ? 'Dibatalkan tamu karena perubahan rencana.' : undefined,
    } satisfies Reservation;
  });
}

export function createDemoActivity(): ActivityLog[] {
  const today = toDateOnly(new Date());
  return [
    {
      id: 'act_001',
      type: 'check_in',
      message: 'Check-in tamu Budi Santoso — Kamar 101 (RB-0001)',
      actor: 'Rini Saputra',
      at: addDays(today, -1) + 'T14:05:00.000Z',
    },
    {
      id: 'act_002',
      type: 'reservation_confirmed',
      message: 'Reservasi RB-0002 dikonfirmasi untuk Kamar 201',
      actor: 'Rini Saputra',
      at: addDays(today, -2) + 'T09:40:00.000Z',
    },
    {
      id: 'act_003',
      type: 'room_status',
      message: 'Kamar 203 ditandai dalam pemeliharaan',
      actor: 'Andi Pratama',
      at: addDays(today, -3) + 'T16:20:00.000Z',
    },
    {
      id: 'act_004',
      type: 'reservation_created',
      message: 'Reservasi RB-0004 dibuat untuk Kamar 301',
      actor: 'Budi Santoso',
      at: addDays(today, -4) + 'T11:15:00.000Z',
    },
    {
      id: 'act_005',
      type: 'check_out',
      message: 'Check-out tamu James Wijaya — Kamar 203 (RB-0006)',
      actor: 'Rini Saputra',
      at: addDays(today, -5) + 'T11:20:00.000Z',
    },
  ];
}
