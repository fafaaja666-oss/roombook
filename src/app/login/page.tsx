'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Hotel, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isStaff } from '@/lib/domain';
import { DEMO_USERS, HOTEL_NAME } from '@/constants/data';
import { HERO_IMAGE } from '@/constants/room-images';
import { Input, Field } from '@/components/ui/Field';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const staffAccounts = DEMO_USERS.filter((user) => user.role !== 'guest');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = login(email, password);
    if (!result.success || !result.user) {
      setError(result.error ?? 'Gagal masuk.');
      setSubmitting(false);
      return;
    }
    router.replace(isStaff(result.user.role) ? '/staf' : '/reservasi-saya');
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-charcoal lg:block">
        <Image src={HERO_IMAGE} alt="" fill className="object-cover opacity-30" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-charcoal">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">RoomBook</span>
          </Link>
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight text-balance">
              Sistem manajemen hotel yang membuat setiap tamu merasa istimewa.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-300">
              Masuk untuk mengelola kamar, reservasi, dan operasional harian {HOTEL_NAME}.
            </p>
          </div>
          <p className="text-xs text-stone-400">Purwarupa demo — tidak menggunakan data nyata.</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-canvas px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal text-gold">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-ink">RoomBook</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">Masuk ke akun Anda</h2>
          <p className="mt-1.5 text-sm text-muted">
            Gunakan email dan kata sandi terdaftar untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Email" htmlFor="email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@roombook.test"
                  className="pl-10"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </Field>

            <Field label="Kata Sandi" htmlFor="password" required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </Field>

            {error && (
              <div className="animate-fade-in rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Masuk <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-dark">
              <ShieldCheck className="h-4 w-4" /> Akun demo staf
            </div>
            <div className="mt-3 space-y-2">
              {staffAccounts.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => fillDemo(user.email, user.password)}
                  className="flex w-full items-center justify-between rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-left transition-colors hover:border-gold/40 hover:bg-gold-soft/50"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {user.role === 'admin' ? 'Administrator' : 'Resepsionis'}
                    </span>
                    <span className="block text-xs text-muted">{user.email}</span>
                  </span>
                  <span className="text-xs text-gold-dark">Isi otomatis</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Kembali ke{' '}
            <Link href="/" className="font-medium text-primary transition-colors hover:text-gold-dark">
              halaman utama
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
