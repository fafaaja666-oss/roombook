'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { getStatusMeta } from '@/lib/status';
import { isAdmin } from '@/lib/domain';
import { cn } from '@/lib/cn';
import {
  Hotel,
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarRange,
  LogIn,
  LogOut,
  CalendarDays,
  BarChart3,
  History,
  ShieldCheck,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const BASE_STAFF_NAV: NavGroup[] = [
  {
    label: 'Ikhtisar',
    items: [
      { label: 'Dashboard', href: '/staf', icon: LayoutDashboard },
      { label: 'Kalender Kamar', href: '/staf/kalender', icon: CalendarDays },
      { label: 'Laporan', href: '/staf/laporan', icon: BarChart3 },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { label: 'Kamar', href: '/staf/kamar', icon: BedDouble },
      { label: 'Tamu', href: '/staf/tamu', icon: Users },
      { label: 'Reservasi', href: '/staf/reservasi', icon: CalendarRange },
      { label: 'Check-in', href: '/staf/check-in', icon: LogIn },
      { label: 'Check-out', href: '/staf/check-out', icon: LogOut },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Log Aktivitas', href: '/staf/aktivitas', icon: History },
      { label: 'Pengguna', href: '/staf/pengguna', icon: ShieldCheck },
    ],
  },
];

const GUEST_HOME = '/';

interface RouteMeta {
  matcher: string;
  title: string;
  description: string;
}

const ROUTE_META: RouteMeta[] = [
  { matcher: '/staf/kamar', title: 'Manajemen Kamar', description: 'Status housekeeping dan ketersediaan kamar' },
  { matcher: '/staf/tamu', title: 'Data Tamu', description: 'Profil dan riwayat menginap tamu' },
  { matcher: '/staf/reservasi', title: 'Reservasi', description: 'Kelola reservasi, pembatalan, dan pembayaran' },
  { matcher: '/staf/check-in', title: 'Check-in', description: 'Proses kedatangan tamu hari ini' },
  { matcher: '/staf/check-out', title: 'Check-out', description: 'Proses keberangkatan dan pelunasan' },
  { matcher: '/staf/kalender', title: 'Kalender Kamar', description: 'Grafik okupansi dan jadwal menginap' },
  { matcher: '/staf/laporan', title: 'Laporan', description: 'Pendapatan, okupansi, dan tren hunian' },
  { matcher: '/staf/aktivitas', title: 'Log Aktivitas', description: 'Riwayat tindakan staf dan sistem' },
  { matcher: '/staf/pengguna', title: 'Pengguna', description: 'Akun staf, role, dan status aktif' },
  { matcher: '/staf', title: 'Dashboard Staf', description: 'Ringkasan operasional hotel hari ini' },
];

function getActiveHref(pathname: string, hrefs: string[]): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b.length - a.length)[0];
}

function getRouteMeta(pathname: string): RouteMeta {
  const meta = ROUTE_META.filter(
    (item) => pathname === item.matcher || pathname.startsWith(item.matcher + '/')
  ).sort((a, b) => b.matcher.length - a.matcher.length)[0];
  return meta ?? { matcher: pathname, title: 'Panel Staf', description: '' };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const { reservations, rooms } = useData();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const admin = isAdmin(role);
  const navGroups = useMemo(
    () =>
      BASE_STAFF_NAV.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => admin || (item.href !== '/staf/pengguna' && item.href !== '/staf/aktivitas')
        ),
      })).filter((group) => group.items.length > 0),
    [admin]
  );
  const hrefs = navGroups.flatMap((group) => group.items.map((item) => item.href));
  const activeHref = getActiveHref(pathname, hrefs);
  const meta = getRouteMeta(pathname);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const notifications = useMemo(() => {
    if (!user) return [];
    return reservations
      .filter((r) => r.status === 'pending' || r.status === 'confirmed')
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        title: `${r.code} · ${r.guestName}`,
        description: `${rooms.find((room) => room.id === r.roomId)?.number ?? r.roomNumber} • ${getStatusMeta(r.status).label}`,
        href: r.status === 'pending' ? '/staf/reservasi' : '/staf/check-in',
        status: r.status,
      }));
  }, [reservations, rooms, user]);

  const handleLogout = () => {
    logout();
    router.push(GUEST_HOME);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/staf/reservasi?q=${encodeURIComponent(trimmed)}` : '/staf/reservasi');
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-charcoal">
      <div className="flex h-16 items-center gap-3 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-charcoal shadow-lg shadow-gold/30">
          <Hotel className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold text-white">RoomBook</p>
          <p className="text-[11px] text-gold/70">Panel Staf Hotel</p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-stone-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold" />
                    )}
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        active ? 'text-gold' : 'text-stone-400 group-hover:text-white'
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-charcoal">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-stone-400">
              {admin ? 'Administrator' : 'Resepsionis'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebarContent}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="animate-slide-in-left absolute inset-y-0 left-0 w-64">{sidebarContent}</div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-ink lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-base font-semibold text-ink">{meta.title}</h1>
              {meta.description && (
                <p className="hidden truncate text-xs text-muted sm:block">{meta.description}</p>
              )}
            </div>

            <form
              onSubmit={handleSearch}
              className="relative hidden w-64 items-center md:flex lg:w-72"
              role="search"
            >
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari kode/tamu…"
                className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-stone-400 focus:border-gold focus:bg-white focus:outline-none focus:ring-4 focus:ring-gold/15"
                aria-label="Cari reservasi"
              />
            </form>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((open) => !open);
                  setProfileOpen(false);
                }}
                className="relative rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-ink"
                aria-label="Notifikasi"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-surface" />
                )}
              </button>
              {notifOpen && (
                <div className="animate-scale-in absolute right-0 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-charcoal/10">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <p className="text-sm font-semibold text-ink">Notifikasi</p>
                    <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-gold-dark">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-muted">
                        Tidak ada notifikasi baru
                      </p>
                    ) : (
                      notifications.map((item) => {
                        const statusStyle = getStatusMeta(item.status);
                        const StatusIcon = statusStyle.icon;
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setNotifOpen(false)}
                            className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0 transition-colors hover:bg-canvas"
                          >
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                              <StatusIcon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                              <p className="truncate text-xs text-muted">{item.description}</p>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-cream"
                aria-label="Menu profil"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-gold">
                  {initials}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
              </button>
              {profileOpen && (
                <div className="animate-scale-in absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-charcoal/10">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                  <Link
                    href={GUEST_HOME}
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 border-b border-line px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-canvas"
                  >
                    <Hotel className="h-4 w-4" /> Lihat Situs Tamu
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-danger transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
