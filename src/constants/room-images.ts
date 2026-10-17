import type { RoomType } from '@/types';

/**
 * ==== PEMETAAN GAMBAR KAMAR TERPUSAT ====
 *
 * Satu tema visual: "Modern Luxury Hotel" — interior premium modern dengan
 * dominasi beige, krem, putih hangat, cokelat kayu, dan aksen charcoal.
 *
 * Sumber foto: Pexels (https://www.pexels.com/license/) — gratis untuk
 * penggunaan komersial, tanpa atribusi. Semua berkas telah diproses seragam:
 * rasio 4:3 (1600x1200), tone warna & temperatur pencahayaan diselaraskan.
 *
 * Jangan menempelkan path gambar langsung di komponen. Gunakan konstanta /
 * fungsi di modul ini agar satu foto tidak muncul pada tipe kamar berbeda.
 */

/** Gambar utama per kamar (id kamar -> path). */
export const ROOM_IMAGES: Record<string, string> = {
  room_101: '/images/rooms/standard-101.jpg',
  room_102: '/images/rooms/standard-102.jpg',
  room_103: '/images/rooms/standard-103.jpg',
  room_201: '/images/rooms/deluxe-201.jpg',
  room_202: '/images/rooms/deluxe-202.jpg',
  room_203: '/images/rooms/deluxe-203.jpg',
  room_301: '/images/rooms/suite-301.jpg',
  room_302: '/images/rooms/suite-302.jpg',
  room_401: '/images/rooms/executive-401.jpg',
  room_402: '/images/rooms/executive-402.jpg',
};

/** Gambar khas per tipe kamar (dipakai sebagai fallback / opsi formulir). */
export const ROOM_TYPE_IMAGES: Record<RoomType, string> = {
  Standard: '/images/rooms/standard-101.jpg',
  Deluxe: '/images/rooms/deluxe-201.jpg',
  Suite: '/images/rooms/suite-301.jpg',
  Executive: '/images/rooms/executive-401.jpg',
};

/** Gambar lanskap untuk hero halaman utama & panel login. */
export const HERO_IMAGE = '/images/rooms/lobby-hero.jpg';

/** Fallback bila id kamar tidak dikenal. */
export const FALLBACK_ROOM_IMAGE = '/images/rooms/deluxe-202.jpg';

/** Daftar pilihan gambar untuk formulir staf (berlabel, bebas duplikat). */
export const ROOM_IMAGE_OPTIONS: { value: string; label: string }[] = [
  { value: '/images/rooms/standard-101.jpg', label: 'Standard — Kamar Utama' },
  { value: '/images/rooms/standard-102.jpg', label: 'Standard — Rapi & Terang' },
  { value: '/images/rooms/standard-103.jpg', label: 'Standard — Nuansa Hangat' },
  { value: '/images/rooms/deluxe-201.jpg', label: 'Deluxe — Nuansa Beige' },
  { value: '/images/rooms/deluxe-202.jpg', label: 'Deluxe — Headboard Kayu' },
  { value: '/images/rooms/deluxe-203.jpg', label: 'Deluxe — Nyaman & Elegan' },
  { value: '/images/rooms/suite-301.jpg', label: 'Suite — Kamar Utama' },
  { value: '/images/rooms/suite-302.jpg', label: 'Suite — Interior Modern' },
  { value: '/images/rooms/executive-401.jpg', label: 'Executive — Kamar Luas' },
  { value: '/images/rooms/executive-402.jpg', label: 'Executive — Desain Minimalis' },
];

/** Ambil gambar terkait sebuah kamar berdasarkan id-nya. */
export function getRoomImage(roomId: string): string {
  return ROOM_IMAGES[roomId] ?? FALLBACK_ROOM_IMAGE;
}

/** Ambil gambar khas untuk sebuah tipe kamar. */
export function getRoomTypeImage(roomType: RoomType): string {
  return ROOM_TYPE_IMAGES[roomType] ?? FALLBACK_ROOM_IMAGE;
}
