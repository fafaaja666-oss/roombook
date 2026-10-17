import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'gold' | 'info';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-stone-100 text-stone-600 border-stone-200',
  primary: 'bg-primary-soft text-primary border-line',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  gold: 'bg-gold-soft text-gold-dark border-gold/30',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
};

export default function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
