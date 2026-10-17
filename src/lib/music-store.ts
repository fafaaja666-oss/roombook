/**
 * Store preferensi musik latar berbasis localStorage.
 *
 * Dibuat sebagai external store agar bisa dibaca lewat `useSyncExternalStore`
 * (menghindari setState di dalam effect) dan tetap konsisten antara render
 * server dan klien.
 *
 * Sesuai kebutuhan UI, satu-satunya preferensi yang disimpan adalah status
 * bisu (mute). Pemutaran berjalan otomatis; tingkat volume ditetapkan tetap.
 */
export interface MusicPrefs {
  /** Suara dimatikan sementara (tanpa menghentikan lagu). */
  muted: boolean;
}

const STORAGE_KEY = 'roombook_music_muted_v1';

export const DEFAULT_MUSIC_PREFS: MusicPrefs = Object.freeze({
  muted: false,
});

let state: MusicPrefs = DEFAULT_MUSIC_PREFS;
let hydrated = false;
const listeners = new Set<() => void>();

function load(): MusicPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MUSIC_PREFS;
    const parsed = JSON.parse(raw) as Partial<MusicPrefs>;
    return { muted: parsed.muted === true };
  } catch {
    return DEFAULT_MUSIC_PREFS;
  }
}

function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  state = load();
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage tidak tersedia */
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function commit(next: MusicPrefs): void {
  state = next;
  persist();
  emit();
}

export function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): MusicPrefs {
  ensureHydrated();
  return state;
}

export function getServerSnapshot(): MusicPrefs {
  return DEFAULT_MUSIC_PREFS;
}

export function setMuted(muted: boolean): void {
  ensureHydrated();
  if (state.muted === muted) return;
  commit({ ...state, muted });
}
