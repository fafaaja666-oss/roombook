'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import {
  ArrowRight,
  BedDouble,
  CalendarCheck2,
  ConciergeBell,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { countRoomStatuses } from '@/lib/domain';
import { HOTEL_AMENITIES } from '@/lib/facilities';
import { DEMO_USERS, HOTEL_NAME } from '@/constants/data';
import { HERO_IMAGE, ROOM_IMAGES } from '@/constants/room-images';
import RoomCard from '@/components/rooms/RoomCard';
import { Skeleton } from '@/components/ui/Skeleton';

const STEPS = [
  { icon: BedDouble, title: 'Pilih Kamar', text: 'Telusuri kamar & suite, bandingkan fasilitas dan harga terbaik.' },
  { icon: CalendarCheck2, title: 'Ajukan Reservasi', text: 'Tentukan tanggal menginap dan lengkapi data tamu dalam sekejap.' },
  { icon: KeyRound, title: 'Check-in', text: 'Resepsionis memproses kedatangan Anda dan menyerahkan kunci kamar.' },
];

export default function HomePage() {
  const { rooms, reservations, loading } = useData();
  const today = useToday();

  const stats = useMemo(
    () => countRoomStatuses(rooms, reservations, today),
    [rooms, reservations, today]
  );

  const featured = useMemo(
    () =>
      rooms
        .filter((room) => room.active)
        .sort((a, b) => a.pricePerNight - b.pricePerNight)
        .slice(0, 3),
    [rooms]
  );

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="absolute inset-0 opacity-20">
          <Image src={HERO_IMAGE} alt="" fill priority className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/95 to-charcoal/70" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold">
              <Sparkles className="h-3.5 w-3.5" /> {HOTEL_NAME}
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
              Kenyamanan menginap, <span className="text-gold">dikelola dengan rapi.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-300">
              RoomBook menyatukan reservasi kamar, check-in, dan check-out dalam satu sistem
              terpusat — memudahkan tamu memesan dan staf mengelola operasional hotel.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/kamar"
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-dark hover:text-white"
              >
                Jelajahi Kamar <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/reservasi-saya"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Cek Reservasi Saya
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-400">Total Kamar</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-gold">
                  {loading ? '—' : stats.total}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-400">Tersedia</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-gold">
                  {loading ? '—' : stats.available}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-400">Tipe Kamar</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-gold">
                  {loading ? '—' : new Set(rooms.map((r) => r.type)).size}
                </dd>
              </div>
            </dl>
          </div>

          <div className="hidden animate-scale-in lg:block">
            <div className="relative ml-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
              <Image
                src={ROOM_IMAGES.room_301}
                alt="Kamar hotel mewah"
                fill
                priority
                sizes="(max-width: 1024px) 0px, 500px"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-charcoal/85 px-3 py-2 text-sm backdrop-blur">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-medium">Hotel bintang lima</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft text-gold-dark">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-semibold text-line">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
              Pilihan terbaik
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Kamar unggulan
            </h2>
          </div>
          <Link
            href="/kamar"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-gold-dark"
          >
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-line bg-surface p-5">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="mt-4 h-5 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              ))
            : featured.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      </section>

      <section className="border-y border-line bg-cream/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
              Fasilitas hotel
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Segala yang Anda butuhkan selama menginap
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOTEL_AMENITIES.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div
                  key={amenity.name}
                  className="flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-charcoal text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-medium text-ink">{amenity.name}</h3>
                    <p className="mt-0.5 text-sm text-muted">{amenity.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-3xl border border-line bg-surface p-8 shadow-sm lg:grid-cols-2 lg:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold-dark">
              <ShieldCheck className="h-3.5 w-3.5" /> Akses Panel Staf
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
              Kelola operasional hotel
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Staf dan administrator dapat mengelola kamar, memproses check-in/check-out, serta
              memantau laporan lewat panel khusus. Gunakan salah satu akun demo berikut untuk
              mencoba.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              <ConciergeBell className="h-4 w-4" /> Masuk Panel Staf
            </Link>
          </div>

          <ul className="space-y-3">
            {DEMO_USERS.filter((user) => user.role !== 'guest').map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {user.role === 'admin' ? 'Administrator' : 'Resepsionis'}
                  </p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <code className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-gold-dark ring-1 ring-line">
                  {user.password}
                </code>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
