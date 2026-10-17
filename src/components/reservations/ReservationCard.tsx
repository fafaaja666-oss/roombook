import type { ReactNode } from 'react';
import { BedDouble, CalendarRange, Phone, Users, Hash } from 'lucide-react';
import { formatCurrency } from '@/lib/repository';
import { formatDate } from '@/utils/helpers';
import StatusBadge from '@/components/ui/StatusBadge';
import PaymentBadge from '@/components/ui/PaymentBadge';
import type { Reservation } from '@/types';

export default function ReservationCard({
  reservation,
  actions,
  footer,
}: {
  reservation: Reservation;
  actions?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm shadow-stone-300/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-mono font-medium text-gold-dark">{reservation.code}</span>
          </div>
          <h3 className="mt-1.5 font-display text-lg font-semibold text-ink">
            {reservation.guestName}
          </h3>
          {reservation.guestPhone && (
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted">
              <Phone className="h-3.5 w-3.5" /> {reservation.guestPhone}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={reservation.status} />
          <PaymentBadge status={reservation.paymentStatus} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-2">
          <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
          <div>
            <p className="text-xs text-muted">Kamar</p>
            <p className="text-sm font-medium text-ink">
              {reservation.roomType} · No. {reservation.roomNumber}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
          <div>
            <p className="text-xs text-muted">Menginap</p>
            <p className="text-sm font-medium text-ink">
              {formatDate(reservation.checkIn)} → {formatDate(reservation.checkOut)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
          <div>
            <p className="text-xs text-muted">Tamu</p>
            <p className="text-sm font-medium text-ink">
              {reservation.guests} orang · {reservation.nights} malam
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted">Total</p>
          <p className="text-sm font-semibold text-ink">{formatCurrency(reservation.totalAmount)}</p>
          {reservation.amountPaid > 0 && reservation.paymentStatus !== 'paid' && (
            <p className="text-xs text-muted">
              Dibayar {formatCurrency(reservation.amountPaid)}
            </p>
          )}
        </div>
      </div>

      {reservation.notes && (
        <p className="mt-3 rounded-lg bg-canvas px-3.5 py-2 text-xs text-muted">
          Catatan: {reservation.notes}
        </p>
      )}

      {(actions || footer) && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
          {footer}
          {actions}
        </div>
      )}
    </article>
  );
}
