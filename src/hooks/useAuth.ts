'use client';

import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import {
  storage,
  subscribeStorage,
  getStorageHydrated,
  getCurrentUserSnapshot,
} from '@/lib/storage';

const getServerHydrated = () => false;
const getServerUser = () => null;

export function useAuth() {
  const hydrated = useSyncExternalStore(subscribeStorage, getStorageHydrated, getServerHydrated);
  const user = useSyncExternalStore(subscribeStorage, getCurrentUserSnapshot, getServerUser);

  useEffect(() => {
    storage.initializeData();
    storage.markHydrated();
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = storage.getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'Email atau password salah' };
    }
    storage.setCurrentUser(found);
    return { success: true };
  };

  const logout = () => {
    storage.setCurrentUser(null);
  };

  return { user, loading: !hydrated, login, logout };
}
