'use client';

import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import {
  storage,
  subscribeStorage,
  getStorageHydrated,
  getRoomsSnapshot,
  getReservationsSnapshot,
  getGuestsSnapshot,
  getActivitySnapshot,
  getUsersSnapshot,
} from '@/lib/storage';
import type { ActivityLog, Guest, Reservation, Room, User } from '@/types';

const EMPTY_ROOMS: Room[] = [];
const EMPTY_RESERVATIONS: Reservation[] = [];
const EMPTY_GUESTS: Guest[] = [];
const EMPTY_ACTIVITY: ActivityLog[] = [];
const EMPTY_USERS: User[] = [];

const getServerHydrated = () => false;
const getServerRooms = () => EMPTY_ROOMS;
const getServerReservations = () => EMPTY_RESERVATIONS;
const getServerGuests = () => EMPTY_GUESTS;
const getServerActivity = () => EMPTY_ACTIVITY;
const getServerUsers = () => EMPTY_USERS;

export function useData() {
  const hydrated = useSyncExternalStore(subscribeStorage, getStorageHydrated, getServerHydrated);
  const rooms = useSyncExternalStore(subscribeStorage, getRoomsSnapshot, getServerRooms);
  const reservations = useSyncExternalStore(
    subscribeStorage,
    getReservationsSnapshot,
    getServerReservations
  );
  const guests = useSyncExternalStore(subscribeStorage, getGuestsSnapshot, getServerGuests);
  const activity = useSyncExternalStore(subscribeStorage, getActivitySnapshot, getServerActivity);
  const users = useSyncExternalStore(subscribeStorage, getUsersSnapshot, getServerUsers);

  useEffect(() => {
    storage.initializeData();
  }, []);

  return {
    rooms,
    reservations,
    guests,
    activity,
    users,
    loading: !hydrated,
  };
}
