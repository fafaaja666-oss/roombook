'use client';

import { useSyncExternalStore } from 'react';
import { toDateOnly } from '@/lib/domain';

let cachedToday: string | null = null;

function subscribe() {
  return () => {};
}

function getSnapshot(): string {
  if (cachedToday === null) {
    cachedToday = toDateOnly(new Date());
  }
  return cachedToday;
}

function getServerSnapshot(): string {
  return '';
}

/** Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD. */
export function useToday(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
