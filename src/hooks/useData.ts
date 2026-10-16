'use client';

import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import {
  storage,
  subscribeStorage,
  getStorageHydrated,
  getRoomsSnapshot,
  getReservationsSnapshot,
} from '@/lib/storage';
import type { Room, Reservation } from '@/types';

const EMPTY_ROOMS: Room[] = [];
const EMPTY_RESERVATIONS: Reservation[] = [];

const getServerHydrated = () => false;
const getServerRooms = () => EMPTY_ROOMS;
const getServerReservations = () => EMPTY_RESERVATIONS;

export function useData() {
  const hydrated = useSyncExternalStore(subscribeStorage, getStorageHydrated, getServerHydrated);
  const rooms = useSyncExternalStore(subscribeStorage, getRoomsSnapshot, getServerRooms);
  const reservations = useSyncExternalStore(
    subscribeStorage,
    getReservationsSnapshot,
    getServerReservations
  );

  useEffect(() => {
    storage.initializeData();
  }, []);

  return {
    rooms,
    reservations,
    loading: !hydrated,
    refreshData: () => storage.initializeData(),
    updateRooms: (newRooms: Room[]) => storage.setRooms(newRooms),
    updateReservations: (newReservations: Reservation[]) => storage.setReservations(newReservations),
  };
}
