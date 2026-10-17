'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { MUSIC_YOUTUBE_ID } from '@/constants/data';
import { getServerSnapshot, getSnapshot, setMuted, subscribe } from '@/lib/music-store';
import { PLAYER_STATE, loadYouTubeApi, type YTPlayer } from '@/lib/youtube';
import { cn } from '@/lib/cn';

const WATCHDOG_MS = 1800;

/** Volume latar yang lembut & tetap (tidak ada kontrol volume di UI). */
const FIXED_VOLUME = 35;

/**
 * Musik latar global berbasis YouTube IFrame Player API.
 *
 * - Memuat API sekali dan membuat satu pemutar saja (tidak pernah ganda).
 * - Pemutar resmi tetap terpasang penuh agar pemutaran sah, tetapi tampilannya
 *   disembunyikan; antarmuka yang terlihat hanya satu tombol bisu/tidak bisu.
 * - Mencoba memutar otomatis dengan suara aktif. Bila peramban memblokir
 *   autoplay, status ditandai "ketuk untuk mengaktifkan" dan tombol yang sama
 *   menjadi pemicu (gestur pengguna) untuk memulai pemutaran.
 * - Tidak pernah mengklaim sedang diputar sebelum pemutar benar-benar jalan.
 * - Preferensi bisu disimpan di localStorage; pengguna yang memilih bisu tidak
 *   dipaksa mendengarkan.
 *
 * Komponen dipasang di root layout sehingga pemutar tidak di-restart saat
 * berpindah halaman.
 */
export default function BackgroundMusic() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const watchdogRef = useRef<number | null>(null);

  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ready, setReady] = useState(false);
  const [playerState, setPlayerState] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let child: HTMLDivElement | null = null;

    loadYouTubeApi()
      .then((YT) => {
        const host = hostRef.current;
        if (cancelled || !host) return;

        child = document.createElement('div');
        host.appendChild(child);

        playerRef.current = new YT.Player(child, {
          width: '100%',
          height: '100%',
          videoId: MUSIC_YOUTUBE_ID,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              const current = getSnapshot();
              event.target.setVolume(FIXED_VOLUME);
              if (current.muted) event.target.mute();
              else event.target.unMute();
              setReady(true);
            },
            onStateChange: (event) => {
              if (cancelled) return;
              setPlayerState(event.data);
              if (event.data === PLAYER_STATE.PLAYING) setBlocked(false);
              if (event.data === PLAYER_STATE.ENDED) {
                try {
                  event.target.playVideo();
                } catch {
                  /* abaikan */
                }
              }
            },
            onError: () => {
              if (cancelled) return;
              setFailed(true);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
      const player = playerRef.current;
      playerRef.current = null;
      if (player) {
        try {
          player.destroy();
        } catch {
          /* abaikan */
        }
      }
      if (child?.parentNode) child.parentNode.removeChild(child);
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !ready) return;

    const current = getSnapshot();
    player.setVolume(FIXED_VOLUME);
    if (current.muted) player.mute();
    else player.unMute();

    try {
      player.playVideo();
    } catch {
      /* kegagalan pemutaran ditangani oleh watchdog di bawah */
    }

    if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    watchdogRef.current = window.setTimeout(() => {
      const state = player.getPlayerState();
      if (state !== PLAYER_STATE.PLAYING && state !== PLAYER_STATE.BUFFERING) {
        setBlocked(true);
      }
    }, WATCHDOG_MS);

    return () => {
      if (watchdogRef.current) {
        window.clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
    };
  }, [ready]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !ready) return;
    if (prefs.muted) player.mute();
    else player.unMute();
  }, [prefs.muted, ready]);

  const playing = playerState === PLAYER_STATE.PLAYING;
  const buffering = playerState === PLAYER_STATE.BUFFERING;

  let statusLabel: string;
  let statusDot: string;
  if (failed) {
    statusLabel = 'Musik latar tidak tersedia';
    statusDot = 'bg-danger';
  } else if (!ready) {
    statusLabel = 'Menyiapkan musik…';
    statusDot = 'bg-line animate-pulse';
  } else if (playing && !prefs.muted) {
    statusLabel = 'Musik aktif — ketuk untuk membisukan';
    statusDot = 'bg-gold animate-pulse';
  } else if (buffering && !prefs.muted) {
    statusLabel = 'Memuat musik…';
    statusDot = 'bg-warning animate-pulse';
  } else if (prefs.muted) {
    // Preferensi bisu selalu tercermin, apa pun state pemutaran.
    statusLabel = 'Musik dibisukan — ketuk untuk menyalakan suara';
    statusDot = 'bg-line';
  } else if (blocked) {
    statusLabel = 'Ketuk untuk mengaktifkan musik';
    statusDot = 'bg-warning';
  } else {
    statusLabel = 'Musik dijeda — ketuk untuk memutar';
    statusDot = 'bg-line';
  }

  function handleToggle() {
    const player = playerRef.current;
    if (!player || !ready || failed) return;

    if (!playing) {
      setBlocked(false);
      if (prefs.muted) setMuted(false);
      try {
        player.unMute();
        player.playVideo();
      } catch {
        setBlocked(true);
      }
      return;
    }

    setMuted(!prefs.muted);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {/* Pemutar resmi YouTube tetap terpasang (ukuran nyata) namun tak
          terlihat: tidak ada thumbnail, judul, tombol putar, atau panel. */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[180px] w-[320px] overflow-hidden opacity-0"
      >
        <div ref={hostRef} className="h-full w-full" />
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={!ready || failed}
        aria-label={statusLabel}
        title={statusLabel}
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border shadow-lg shadow-charcoal/10 backdrop-blur transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          prefs.muted
            ? 'border-line bg-surface/95 text-muted hover:bg-cream hover:text-ink'
            : 'border-gold/40 bg-charcoal text-gold hover:bg-charcoal-soft'
        )}
      >
        {prefs.muted || failed ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface',
            statusDot
          )}
        />
      </button>
    </div>
  );
}
