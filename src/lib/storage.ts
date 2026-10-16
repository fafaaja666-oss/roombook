import { STORAGE_KEYS, DEMO_USERS, DEMO_ROOMS, createDemoReservations } from '@/constants/data';
import type { User, Room, Reservation } from '@/types';

type Listener = () => void;

const listeners = new Set<Listener>();
let revision = 0;
let hydrated = false;

const EMPTY_USERS: User[] = [];
const EMPTY_ROOMS: Room[] = [];
const EMPTY_RESERVATIONS: Reservation[] = [];

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
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      writeJSON(STORAGE_KEYS.RESERVATIONS, createDemoReservations());
      changed = true;
    }
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
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    emit();
  },
};

export function getRoomsSnapshot(): Room[] {
  return storage.getRooms();
}

export function getReservationsSnapshot(): Reservation[] {
  return storage.getReservations();
}

export function getCurrentUserSnapshot(): User | null {
  return storage.getCurrentUser();
}
