'use client';

import { useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import {
  storage,
  subscribeStorage,
  getStorageHydrated,
  getCurrentUserSnapshot,
} from '@/lib/storage';
import { isAdmin, isStaff } from '@/lib/domain';
import type { User } from '@/types';

const getServerHydrated = () => false;
const getServerUser = () => null;

export function useAuth() {
  const hydrated = useSyncExternalStore(subscribeStorage, getStorageHydrated, getServerHydrated);
  const user = useSyncExternalStore(subscribeStorage, getCurrentUserSnapshot, getServerUser);

  useEffect(() => {
    storage.initializeData();
    storage.markHydrated();
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string; user?: User } => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      return { success: false, error: 'Email dan kata sandi wajib diisi.' };
    }
    const found = storage
      .getUsers()
      .find((u) => u.email.toLowerCase() === trimmedEmail && u.password === password);
    if (!found) {
      return { success: false, error: 'Email atau kata sandi salah.' };
    }
    if (!found.active) {
      return { success: false, error: 'Akun ini sedang dinonaktifkan. Hubungi administrator.' };
    }
    storage.setCurrentUser(found);
    storage.markHydrated();
    return { success: true, user: found };
  };

  const logout = () => {
    storage.setCurrentUser(null);
  };

  const role = user?.role;
  const flags = useMemo(
    () => ({
      isAdmin: isAdmin(role),
      isStaff: isStaff(role),
      isGuest: role === 'guest',
    }),
    [role]
  );

  return { user, role, loading: !hydrated, login, logout, ...flags };
}
