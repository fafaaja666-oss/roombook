import {
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  Ban,
  UserX,
  Sparkles,
  Wrench,
  BedDouble,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react';
import type {
  PaymentStatus,
  ReservationStatus,
  RoomHousekeepingStatus,
  RoomOperationalStatus,
} from '@/types';

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

const RESERVATION_META: Record<ReservationStatus, StatusMeta> = {
  pending: {
    label: 'Menunggu Konfirmasi',
    icon: Clock,
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Terkonfirmasi',
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  checked_in: {
    label: 'Check-in',
    icon: LogIn,
    pill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-600',
  },
  checked_out: {
    label: 'Check-out',
    icon: LogOut,
    pill: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-500',
  },
  cancelled: {
    label: 'Dibatalkan',
    icon: Ban,
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  no_show: {
    label: 'No-show',
    icon: UserX,
    pill: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-500',
  },
};

export function getStatusMeta(status: ReservationStatus | string): StatusMeta {
  return RESERVATION_META[status as ReservationStatus] ?? DEFAULT_META;
}

const PAYMENT_META: Record<PaymentStatus, StatusMeta> = {
  unpaid: {
    label: 'Belum Dibayar',
    icon: Clock,
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  partial: {
    label: 'DP Sebagian',
    icon: Clock,
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  paid: {
    label: 'Lunas',
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
};

export function getPaymentMeta(status: PaymentStatus | string): StatusMeta {
  return PAYMENT_META[status as PaymentStatus] ?? DEFAULT_META;
}

const ROOM_HK_META: Record<RoomHousekeepingStatus, StatusMeta> = {
  available: {
    label: 'Tersedia',
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  cleaning: {
    label: 'Perlu Dibersihkan',
    icon: Sparkles,
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  maintenance: {
    label: 'Pemeliharaan',
    icon: Wrench,
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export function getRoomHousekeepingMeta(status: RoomHousekeepingStatus | string): StatusMeta {
  return ROOM_HK_META[status as RoomHousekeepingStatus] ?? DEFAULT_META;
}

const ROOM_OP_META: Record<RoomOperationalStatus, StatusMeta> = {
  available: {
    label: 'Tersedia',
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  reserved: {
    label: 'Direservasi',
    icon: CalendarCheck,
    pill: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-600',
  },
  occupied: {
    label: 'Terisi',
    icon: BedDouble,
    pill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-600',
  },
  cleaning: {
    label: 'Dibersihkan',
    icon: Sparkles,
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  maintenance: {
    label: 'Pemeliharaan',
    icon: Wrench,
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export function getRoomOperationalMeta(status: RoomOperationalStatus | string): StatusMeta {
  return ROOM_OP_META[status as RoomOperationalStatus] ?? DEFAULT_META;
}

export const ROOM_OP_ORDER: RoomOperationalStatus[] = [
  'available',
  'reserved',
  'occupied',
  'cleaning',
  'maintenance',
];
