import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';

export type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'navy' | 'gold' | 'info';

const TONES: Record<StatTone, string> = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  navy: 'bg-navy/5 text-navy',
  gold: 'bg-gold-soft text-gold-dark',
  info: 'bg-sky-50 text-sky-700',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: StatTone;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-muted">{hint}</p>}
        </div>
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', TONES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
