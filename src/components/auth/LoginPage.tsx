'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { Field, Input } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import {
  Eye,
  EyeOff,
  CalendarCheck2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Mail,
  Lock,
  AlertCircle,
} from 'lucide-react';

const FEATURES = [
  { icon: Zap, text: 'Lihat ketersediaan ruangan secara langsung' },
  { icon: CalendarCheck2, text: 'Ajukan reservasi hanya dalam hitungan detik' },
  { icon: ShieldCheck, text: 'Pantau status persetujuan secara transparan' },
];

const DEMO_ACCOUNTS = [
  { label: 'Pengguna', email: 'user@roombook.test', password: 'user123' },
  { label: 'Administrator', email: 'admin@roombook.test', password: 'admin123' },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    storage.initializeData();
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email dan password harus diisi');
      setLoading(false);
      return;
    }

    const result = login(email, password);
    if (!result.success) {
      setError(result.error || 'Login gagal');
      setLoading(false);
      return;
    }

    setLoading(false);
    const current = storage.getCurrentUser();
    router.push(current?.role === 'admin' ? '/admin' : '/dashboard');
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="relative hidden w-1/2 overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image
          src="/images/login-hero.svg"
          alt="Ruang rapat modern"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/60 to-navy/95" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-400 text-white shadow-lg shadow-primary/40">
            <CalendarCheck2 className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-white">RoomBook</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-balance text-4xl font-bold leading-tight text-white">
            Booking Ruangan Jadi Lebih Mudah
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80">
            Satu tempat untuk menemukan ruangan, mengajukan reservasi, dan memantau persetujuan
            kegiatan Anda.
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.text} className="flex items-center gap-3 text-sm text-blue-50/90">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4 text-blue-200" />
                  </span>
                  {feature.text}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-blue-200/60">
          © 2026 RoomBook — Aplikasi Booking Ruangan
        </p>
      </div>

      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-10 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-ink">RoomBook</span>
          </div>

          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Selamat Datang Kembali</h1>
          <p className="mt-2 text-sm text-muted">
            Masuk untuk melanjutkan mengelola reservasi ruangan Anda.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Field label="Email" htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@roombook.test"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted transition-colors hover:text-ink"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-line bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Akun Demo</p>
            <div className="mt-3 space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{account.label}</span>
                    <span className="block text-xs text-muted">
                      {account.email} / {account.password}
                    </span>
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-muted transition-colors group-hover:text-primary" />
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Klik salah satu akun untuk mengisi form secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
