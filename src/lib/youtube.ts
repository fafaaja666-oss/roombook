/**
 * Pemuatan tunggal (singleton) YouTube IFrame Player API.
 *
 * Skrip hanya dimuat sekali per halaman dan promise-nya di-cache, sehingga
 * tidak ada beberapa instance pemutar dibuat berulang saat komponen render
 * ulang. Tipe di bawah sengaja minimal (hanya yang dipakai) agar tidak
 * bergantung pada definisi tipe eksternal.
 */
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

export interface YTPlayerOptions {
  width?: string | number;
  height?: string | number;
  videoId: string;
  host?: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerEvent) => void;
  };
}

export interface YTNamespace {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

/** Nilai state pemutar YouTube yang relevan. */
export const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SCRIPT_ID = 'youtube-iframe-api';
const LOAD_TIMEOUT_MS = 10000;

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube IFrame API hanya tersedia di browser.'));
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    let settled = false;

    const finish = (result: { ok: true; value: YTNamespace } | { ok: false; error: Error }) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (result.ok) resolve(result.value);
      else reject(result.error);
    };

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT && window.YT.Player) {
        finish({ ok: true, value: window.YT });
      } else {
        finish({ ok: false, error: new Error('YouTube IFrame API gagal diinisialisasi.') });
      }
    };

    const timer = window.setTimeout(
      () => finish({ ok: false, error: new Error('Waktu memuat YouTube IFrame API habis.') }),
      LOAD_TIMEOUT_MS
    );

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () =>
        finish({ ok: false, error: new Error('Gagal memuat YouTube IFrame API.') });
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}
