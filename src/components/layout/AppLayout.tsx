'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { getStatusMeta } from '@/lib/status';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  CalendarCheck2,
  FileText,
  LogOut,
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

const USER_NAV: NavGroup[] = [
  {
    label: 'Menu Utama',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Ruangan', href: '/ruangan', icon: Building2 },
      { label: 'Jadwal', href: '/jadwal', icon: Calendar },
      { label: 'Reservasi Saya', href: '/reservasi-saya', icon: FileText },
    ],
  },
];

const ADMIN_NAV: NavGroup[] = [
  {
    label: 'Ikhtisar',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'Manajemen',
    items: [
      { label: 'Kelola Ruangan', href: '/admin/ruangan', icon: Building2 },
      { label: 'Kelola Reservasi', href: '/admin/reservasi', icon: FileText },
      { label: 'Jadwal Ruangan', href: '/admin/jadwal', icon: Calendar },
    ],
  },
];

interface RouteMeta {
  matcher: string;
  title: string;
  description: string;
}

const ROUTE_META: RouteMeta[] = [
  { matcher: '/dashboard', title: 'Dashboard', description: 'Ringkasan aktivitas reservasi Anda' },
  { matcher: '/ruangan', title: 'Daftar Ruangan', description: 'Jelajahi ruangan dan ajukan reservasi' },
  { matcher: '/jadwal', title: 'Jadwal Ruangan', description: 'Pantau ketersediaan ruangan per jam' },
  { matcher: '/booking', title: 'Booking Ruangan', description: 'Ajukan reservasi ruangan baru' },
  { matcher: '/reservasi-saya', title: 'Reservasi Saya', description: 'Riwayat dan status pengajuan Anda' },
  { matcher: '/admin/ruangan', title: 'Kelola Ruangan', description: 'Tambah, ubah, dan atur status ruangan' },
  { matcher: '/admin/reservasi', title: 'Kelola Reservasi', description: 'Setujui atau tolak pengajuan reservasi' },
  { matcher: '/admin/jadwal', title: 'Jadwal Ruangan', description: 'Jadwal penggunaan seluruh ruangan' },
  { matcher: '/admin', title: 'Dashboard Administrator', description: 'Pusat kendali reservasi dan ruangan' },
];

function getActiveHref(pathname: string, hrefs: string[]): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b.length - a.length)[0];
}

function getRouteMeta(pathname: string): RouteMeta {
  if (/^\/ruangan\/[^/]+$/.test(pathname)) {
    return { matcher: pathname, title: 'Detail Ruangan', description: 'Informasi dan ketersediaan ruangan' };
  }
  const meta = ROUTE_META.filter(
    (item) => pathname === item.matcher || pathname.startsWith(item.matcher + '/')
  ).sort((a, b) => b.matcher.length - a.matcher.length)[0];
  return meta ?? { matcher: pathname, title: 'RoomBook', description: '' };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { reservations } = useData();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';
  const navGroups = isAdmin ? ADMIN_NAV : USER_NAV;
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
    if (isAdmin) {
      return reservations
        .filter((r) => r.status === 'Menunggu Persetujuan')
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          title: `Pengajuan: ${r.eventName}`,
          description: `${r.userName} • ${r.roomName}`,
          href: '/admin/reservasi',
          status: r.status,
        }));
    }
    return reservations
      .filter((r) => r.userId === user.id && r.status !== 'Menunggu Persetujuan')
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        title: r.eventName,
        description: `${r.roomName} • ${getStatusMeta(r.status).label}`,
        href: '/reservasi-saya',
        status: r.status,
      }));
  }, [reservations, user, isAdmin]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/ruangan?q=${encodeURIComponent(trimmed)}` : '/ruangan');
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-navy">
      <div className="flex h-16 items-center gap-3 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-400 text-white shadow-lg shadow-primary/30">
          <CalendarCheck2 className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-base font-semibold text-white">RoomBook</p>
          <p className="text-[11px] text-blue-200/60">Booking Ruangan</p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-blue-100/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-blue-200/50">
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
                        : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        active ? 'text-white' : 'text-blue-200/70 group-hover:text-white'
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-blue-200/60">
              {isAdmin ? 'Administrator' : 'Pengguna'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-blue-100/70 transition-colors hover:bg-white/10 hover:text-white"
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
            className="animate-fade-in absolute inset-0 bg-navy/60 backdrop-blur-sm"
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
              className="rounded-lg p-2 text-muted transition-colors hover:bg-slate-100 hover:text-ink lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-ink">{meta.title}</h1>
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
                placeholder="Cari ruangan..."
                className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                aria-label="Cari ruangan"
              />
            </form>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((open) => !open);
                  setProfileOpen(false);
                }}
                className="relative rounded-lg p-2 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
                aria-label="Notifikasi"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
                )}
              </button>
              {notifOpen && (
                <div className="animate-scale-in absolute right-0 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-navy/10">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <p className="text-sm font-semibold text-ink">Notifikasi</p>
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
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
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-muted">
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
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-slate-100"
                aria-label="Menu profil"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {initials}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
              </button>
              {profileOpen && (
                <div className="animate-scale-in absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-navy/10">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
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
