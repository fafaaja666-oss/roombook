'use client';

import { useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { formatDateTime, formatRelative } from '@/utils/helpers';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStatusMeta } from '@/lib/status';
import type { ActivityType } from '@/types';

const TYPE_LABELS: Record<ActivityType, string> = {
  reservation_created: 'Reservasi dibuat',
  reservation_updated: 'Reservasi diubah',
  reservation_confirmed: 'Reservasi dikonfirmasi',
  reservation_cancelled: 'Reservasi dibatalkan',
  check_in: 'Check-in',
  check_out: 'Check-out',
  room_status: 'Status kamar',
  payment: 'Pembayaran',
  guest: 'Data tamu',
};

const FILTERS: Array<{ key: 'all' | ActivityType; label: string }> = [
  { key: 'all', label: 'Semua' },
  { key: 'reservation_created', label: 'Reservasi' },
  { key: 'check_in', label: 'Check-in' },
  { key: 'check_out', label: 'Check-out' },
  { key: 'payment', label: 'Pembayaran' },
  { key: 'room_status', label: 'Kamar' },
];

export default function ActivityPage() {
  const { activity, loading } = useData();
  const [filter, setFilter] = useState<'all' | ActivityType>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return activity
      .filter((log) => (filter === 'all' ? true : log.type === filter))
      .filter((log) => !term || log.message.toLowerCase().includes(term) || log.actor.toLowerCase().includes(term));
  }, [activity, filter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari aktivitas atau pelaku…"
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari aktivitas"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === item.key
                ? 'border-charcoal bg-charcoal text-white'
                : 'border-line bg-surface text-muted hover:border-gold/40 hover:text-ink'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title="Belum ada aktivitas"
            description="Setiap tindakan staf dan sistem akan tercatat di sini."
            className="border-0"
          />
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((log) => {
              const meta = getStatusMeta(log.type);
              const Icon = meta.icon;
              return (
                <li key={log.id} className="flex items-start gap-4 px-5 py-4">
                  <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', meta.pill)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{log.message}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {TYPE_LABELS[log.type]} · {log.actor}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs font-medium text-muted">{formatRelative(log.at)}</p>
                    <p className="text-[11px] text-muted/70">{formatDateTime(log.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
