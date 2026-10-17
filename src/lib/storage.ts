import {
  STORAGE_KEYS,
  DEMO_USERS,
  DEMO_ROOMS,
  DEMO_GUESTS,
  createDemoReservations,
  createDemoActivity,
} from '@/constants/data';
import {
  ROOM_IMAGES,
  ROOM_TYPE_IMAGES,
  FALLBACK_ROOM_IMAGE,
} from '@/constants/room-images';
import type { ActivityLog, Guest, Reservation, Room, User } from '@/types';

type Listener = () => void;

const listeners = new Set<Listener>();
let revision = 0;
let hydrated = false;

const EMPTY_USERS: User[] = [];
const EMPTY_ROOMS: Room[] = [];
const EMPTY_RESERVATIONS: Reservation[] = [];
const EMPTY_GUESTS: Guest[] = [];
const EMPTY_ACTIVITY: ActivityLog[] = [];

const snapshotCache = new Map<string, { revision: number; value: unknown }>();

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeStorage(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStorageHydrated(): boolean {
  return hydrated;
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readSnapshot<T>(key: string, fallback: T): T {
  const cached = snapshotCache.get(key);
  if (cached && cached.revision === revision) {
    return cached.value as T;
  }
  const value = readJSON<T>(key, fallback);
  snapshotCache.set(key, { revision, value });
  return value;
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

/** Semua aset foto kamar yang sah berada di folder /images/rooms/. */
function isCurrentRoomAsset(path: unknown): path is string {
  return typeof path === 'string' && path.startsWith('/images/rooms/');
}

/**
 * Sinkronisasi foto kamar tersimpan (localStorage) dengan pemetaan terpusat
 * `ROOM_IMAGES`.
 *
 * - Kamar demo (id terdaftar di ROOM_IMAGES) selalu memakai foto pemetaan
 *   terpusat — hanya field `image` yang disentuh.
 * - Kamar lain (dibuat staf) hanya diperbaiki bila gambarnya merujuk aset lama
 *   yang sudah tidak ada (SVG/ilustrasi/URL eksternal); foto valid dari
 *   /images/rooms/ tetap dipertahankan.
 * - Reservasi, tamu, pengguna, dan aktivitas TIDAK disentuh.
 * Fungsi ini idempoten dan hanya menulis bila benar-benar ada perubahan.
 */
function syncRoomImages(): boolean {
  const rooms = readSnapshot<Room[]>(STORAGE_KEYS.ROOMS, EMPTY_ROOMS);
  if (rooms.length === 0) return false;

  let changed = false;
  const next = rooms.map((room) => {
    const mapped = ROOM_IMAGES[room.id];
    if (mapped && room.image !== mapped) {
      changed = true;
      return { ...room, image: mapped };
    }
    if (!mapped && !isCurrentRoomAsset(room.image)) {
      changed = true;
      return { ...room, image: ROOM_TYPE_IMAGES[room.type] ?? FALLBACK_ROOM_IMAGE };
    }
    return room;
  });

  if (changed) writeJSON(STORAGE_KEYS.ROOMS, next);
  return changed;
}

export const storage = {
  getUsers: (): User[] => readSnapshot<User[]>(STORAGE_KEYS.USERS, EMPTY_USERS),
  setUsers: (users: User[]) => {
    writeJSON(STORAGE_KEYS.USERS, users);
    emit();
  },

  getRooms: (): Room[] => readSnapshot<Room[]>(STORAGE_KEYS.ROOMS, EMPTY_ROOMS),
  setRooms: (rooms: Room[]) => {
    writeJSON(STORAGE_KEYS.ROOMS, rooms);
    emit();
  },

  getReservations: (): Reservation[] =>
    readSnapshot<Reservation[]>(STORAGE_KEYS.RESERVATIONS, EMPTY_RESERVATIONS),
  setReservations: (reservations: Reservation[]) => {
    writeJSON(STORAGE_KEYS.RESERVATIONS, reservations);
    emit();
  },

  getGuests: (): Guest[] => readSnapshot<Guest[]>(STORAGE_KEYS.GUESTS, EMPTY_GUESTS),
  setGuests: (guests: Guest[]) => {
    writeJSON(STORAGE_KEYS.GUESTS, guests);
    emit();
  },

  getActivity: (): ActivityLog[] =>
    readSnapshot<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, EMPTY_ACTIVITY),
  setActivity: (activity: ActivityLog[]) => {
    writeJSON(STORAGE_KEYS.ACTIVITY, activity);
    emit();
  },

  getCurrentUser: (): User | null => readSnapshot<User | null>(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      writeJSON(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    emit();
  },

  initializeData: () => {
    if (typeof window === 'undefined') return;
    let changed = false;
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      writeJSON(STORAGE_KEYS.USERS, DEMO_USERS);
      changed = true;
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      writeJSON(STORAGE_KEYS.ROOMS, DEMO_ROOMS);
      changed = true;
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUESTS)) {
      writeJSON(STORAGE_KEYS.GUESTS, DEMO_GUESTS);
      changed = true;
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      writeJSON(STORAGE_KEYS.RESERVATIONS, createDemoReservations());
      changed = true;
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY)) {
      writeJSON(STORAGE_KEYS.ACTIVITY, createDemoActivity());
      changed = true;
    }
    // Sinkronkan foto kamar agar gambar lama (SVG/ilustrasi/URL eksternal)
    // yang sempat tersimpan di localStorage tidak terus muncul.
    if (syncRoomImages()) changed = true;
    if (changed) emit();
  },

  markHydrated: () => {
    if (typeof window === 'undefined') return;
    if (!hydrated) {
      hydrated = true;
      emit();
    }
  },

  clearAll: () => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    emit();
  },
};

export function getRoomsSnapshot(): Room[] {
  return storage.getRooms();
}

export function getReservationsSnapshot(): Reservation[] {
  return storage.getReservations();
}

export function getGuestsSnapshot(): Guest[] {
  return storage.getGuests();
}

export function getActivitySnapshot(): ActivityLog[] {
  return storage.getActivity();
}

export function getUsersSnapshot(): User[] {
  return storage.getUsers();
}

export function getCurrentUserSnapshot(): User | null {
  return storage.getCurrentUser();
}
