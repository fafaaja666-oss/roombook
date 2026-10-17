'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { HOTEL_NAME } from '@/constants/data';
import { cn } from '@/lib/cn';
import { Hotel, Menu, X, LogOut, LayoutDashboard, UserRound } from 'lucide-react';

const LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Kamar & Suite', href: '/kamar' },
  { label: 'Reservasi Saya', href: '/reservasi-saya' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isStaff, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-charcoal/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-charcoal shadow-lg shadow-gold/20">
            <Hotel className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold tracking-tight">RoomBook</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-gold/70">
              {HOTEL_NAME}
            </span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-white/10 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isStaff ? (
                <Link
                  href="/staf"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-gold-dark hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" /> Panel Staf
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-stone-200">
                  <UserRound className="h-4 w-4 text-gold" /> {user.name}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:text-white"
              >
                Masuk
              </Link>
              <Link
                href="/kamar"
                className="rounded-lg bg-gold px-3.5 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-gold-dark hover:text-white"
              >
                Pesan Kamar
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-lg p-2 text-stone-200 transition-colors hover:bg-white/10 md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-slide-up border-t border-white/10 bg-charcoal px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === link.href ? 'bg-white/10 text-white' : 'text-stone-300 hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              {user ? (
                <>
                  {isStaff && (
                    <Link
                      href="/staf"
                      onClick={() => setOpen(false)}
                      className="rounded-lg bg-gold px-3.5 py-2.5 text-center text-sm font-medium text-charcoal"
                    >
                      Panel Staf
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-white/15 px-3.5 py-2.5 text-sm font-medium text-stone-200"
                  >
                    Keluar ({user.name})
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-white/15 px-3.5 py-2.5 text-center text-sm font-medium text-stone-200"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/kamar"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-gold px-3.5 py-2.5 text-center text-sm font-medium text-charcoal"
                  >
                    Pesan Kamar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
