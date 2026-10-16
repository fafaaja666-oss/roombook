'use client';

import { useSyncExternalStore } from 'react';

let cachedToday: string | null = null;

function subscribe() {
  return () => {};
}

function getSnapshot(): string {
  if (cachedToday === null) {
    cachedToday = new Date().toISOString().slice(0, 10);
  }
  return cachedToday;
}

function getServerSnapshot(): string {
  return '';
}

export function useToday(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
