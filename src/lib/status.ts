import { Clock, CheckCircle2, XCircle, Ban, type LucideIcon } from 'lucide-react';
import type { ReservationStatus } from '@/types';

export interface StatusMeta {
  label: string;
  icon: LucideIcon;
  pill: string;
  dot: string;
}

const DEFAULT_META: StatusMeta = {
  label: 'Tidak diketahui',
  icon: Clock,
  pill: 'bg-slate-100 text-slate-600 border-slate-200',
  dot: 'bg-slate-400',
};

const STATUS_META: Record<ReservationStatus, StatusMeta> = {
  'Menunggu Persetujuan': {
    label: 'Menunggu Persetujuan',
    icon: Clock,
    pill: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  Disetujui: {
    label: 'Disetujui',
    icon: CheckCircle2,
    pill: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-600',
  },
  Ditolak: {
    label: 'Ditolak',
    icon: XCircle,
    pill: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  Dibatalkan: {
    label: 'Dibatalkan',
    icon: Ban,
    pill: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

export function getStatusMeta(status: ReservationStatus | string): StatusMeta {
  return STATUS_META[status as ReservationStatus] ?? DEFAULT_META;
}
