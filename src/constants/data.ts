import type { Reservation, Room, User } from '@/types';

export const STORAGE_KEYS = {
  USERS: 'roombook_users',
  ROOMS: 'roombook_rooms',
  RESERVATIONS: 'roombook_reservations',
  CURRENT_USER: 'roombook_current_user',
} as const;

export const APP_NAME = 'RoomBook';
export const APP_DESCRIPTION = 'Aplikasi Booking Ruangan';

export const OPERATING_START = '08:00';
export const OPERATING_END = '18:00';

export const TIME_SLOTS: { start: string; end: string; label: string }[] = [
  { start: '08:00', end: '09:00', label: '08:00 - 09:00' },
  { start: '09:00', end: '10:00', label: '09:00 - 10:00' },
  { start: '10:00', end: '11:00', label: '10:00 - 11:00' },
  { start: '11:00', end: '12:00', label: '11:00 - 12:00' },
  { start: '12:00', end: '13:00', label: '12:00 - 13:00' },
  { start: '13:00', end: '14:00', label: '13:00 - 14:00' },
  { start: '14:00', end: '15:00', label: '14:00 - 15:00' },
  { start: '15:00', end: '16:00', label: '15:00 - 16:00' },
  { start: '16:00', end: '17:00', label: '16:00 - 17:00' },
  { start: '17:00', end: '18:00', label: '17:00 - 18:00' },
];

export const TIME_OPTIONS: string[] = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

export const RESERVATION_STATUSES = [
  'Menunggu Persetujuan',
  'Disetujui',
  'Ditolak',
  'Dibatalkan',
] as const;

export const DEMO_USERS: User[] = [
  { id: 'user_1', name: 'Pengguna Demo', email: 'user@roombook.test', password: 'user123', role: 'user' },
  { id: 'admin_1', name: 'Administrator', email: 'admin@roombook.test', password: 'admin123', role: 'admin' },
];

export const DEMO_ROOMS: Room[] = [
  {
    id: 'room_1',
    name: 'Ruang Rapat A',
    location: 'Lantai 1, Gedung Utama',
    capacity: 10,
    facilities: ['Proyektor', 'AC', 'Whiteboard', 'Meja Rapat'],
    description: 'Ruang rapat untuk pertemuan kecil dengan fasilitas lengkap.',
    image: '/images/room-1.svg',
    isMaintenance: false,
    status: 'Tersedia',
  },
  {
    id: 'room_2',
    name: 'Ruang Diskusi B',
    location: 'Lantai 1, Gedung Utama',
    capacity: 6,
    facilities: ['AC', 'Whiteboard', 'Meja Bundar'],
    description: 'Ruang diskusi untuk kelompok kecil.',
    image: '/images/room-2.svg',
    isMaintenance: false,
    status: 'Tersedia',
  },
  {
    id: 'room_3',
    name: 'Ruang Seminar C',
    location: 'Lantai 2, Gedung Utama',
    capacity: 30,
    facilities: ['Proyektor', 'LCD', 'Sound System', 'AC', 'Podium'],
    description: 'Ruang seminar untuk acara dengan peserta banyak.',
    image: '/images/room-3.svg',
    isMaintenance: false,
    status: 'Tersedia',
  },
  {
    id: 'room_4',
    name: 'Laboratorium Komputer D',
    location: 'Lantai 2, Gedung IT',
    capacity: 25,
    facilities: ['Komputer', 'AC', 'Proyektor', 'Jaringan LAN'],
    description: 'Laboratorium komputer untuk pelatihan dan praktik.',
    image: '/images/room-4.svg',
    isMaintenance: false,
    status: 'Tersedia',
  },
  {
    id: 'room_5',
    name: 'Ruang Kelas E',
    location: 'Lantai 1, Gedung Akademik',
    capacity: 40,
    facilities: ['AC', 'Whiteboard', 'Proyektor', 'Meja-Kursi'],
    description: 'Ruang kelas untuk kegiatan belajar mengajar.',
    image: '/images/room-5.svg',
    isMaintenance: false,
    status: 'Tersedia',
  },
];

export function createDemoReservations(): Reservation[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'RES-20261014-001',
    userId: 'user_1',
    userName: 'Pengguna Demo',
    userEmail: 'user@roombook.test',
    eventName: 'Rapat Koordinasi',
    roomId: 'room_1',
    roomName: 'Ruang Rapat A',
    date: today,
    startTime: '09:00',
    endTime: '11:00',
    participants: 5,
    purpose: 'Koordinasi tim',
    notes: '',
    status: 'Menunggu Persetujuan',
    rejectionReason: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'RES-20261014-002',
    userId: 'user_1',
    userName: 'Pengguna Demo',
    userEmail: 'user@roombook.test',
    eventName: 'Seminar Mini',
    roomId: 'room_3',
    roomName: 'Ruang Seminar C',
    date: tomorrow,
    startTime: '13:00',
    endTime: '16:00',
    participants: 20,
    purpose: 'Seminar teknis',
    notes: '',
    status: 'Disetujui',
    rejectionReason: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'RES-20261014-003',
    userId: 'user_1',
    userName: 'Pengguna Demo',
    userEmail: 'user@roombook.test',
    eventName: 'Pelatihan',
    roomId: 'room_4',
    roomName: 'Laboratorium Komputer D',
    date: yesterday,
    startTime: '08:00',
    endTime: '12:00',
    participants: 15,
    purpose: 'Pelatihan aplikasi',
    notes: '',
    status: 'Ditolak',
    rejectionReason: 'Ruangan sudah terpakai untuk kegiatan lain.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ];
}
