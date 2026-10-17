'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Hotel, MapPin, Phone, Mail } from 'lucide-react';
import { APP_NAME, HOTEL_NAME } from '@/constants/data';

const subscribe = () => () => {};
const getYear = (): number => new Date().getFullYear();
const getServerYear = (): number => 2026;

export default function Footer() {
  const year = useSyncExternalStore(subscribe, getYear, getServerYear);
  return (
    <footer className="mt-auto border-t border-white/10 bg-charcoal text-stone-300">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-charcoal">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-white">{APP_NAME}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
            Sistem manajemen hotel untuk reservasi kamar, check-in, dan check-out tamu dalam satu
            alur yang rapi dan terpusat di {HOTEL_NAME}.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Navigasi</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="transition-colors hover:text-gold">Beranda</Link></li>
            <li><Link href="/kamar" className="transition-colors hover:text-gold">Kamar &amp; Suite</Link></li>
            <li><Link href="/reservasi-saya" className="transition-colors hover:text-gold">Reservasi Saya</Link></li>
            <li><Link href="/login" className="transition-colors hover:text-gold">Masuk</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Kontak</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>Jl. Cendana Raya No. 88, Jakarta</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <span>+62 21 5555 8888</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span>stay@roombook.test</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-stone-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} {HOTEL_NAME}. Purwarupa demo — data tersimpan di perangkat Anda.</p>
          <p>Dibuat dengan Next.js</p>
        </div>
      </div>
    </footer>
  );
}
