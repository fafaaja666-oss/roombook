import type { ReactNode } from 'react';
import type { Reservation } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import { Calendar, Clock, MapPin, Users, User, Info } from 'lucide-react';

export default function ReservationCard({
  reservation,
  actions,
  showUser = false,
}: {
  reservation: Reservation;
  actions?: ReactNode;
  showUser?: boolean;
}) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-md hover:shadow-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{reservation.eventName}</h3>
          <p className="mt-0.5 font-mono text-xs text-muted">{reservation.id}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="mt-4 grid gap-2.5 text-sm text-muted sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          {reservation.roomName}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          {formatDate(reservation.date)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
          {reservation.startTime} – {reservation.endTime}
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-slate-400" />
          {reservation.participants} peserta
        </p>
        {showUser && (
          <p className="flex items-center gap-2 sm:col-span-2">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            {reservation.userName} — {reservation.userEmail}
          </p>
        )}
      </div>

      {reservation.purpose && (
        <p className="mt-3 text-sm text-muted">
          <span className="font-medium text-ink">Keperluan:</span> {reservation.purpose}
        </p>
      )}

      {reservation.notes && (
        <p className="mt-1 text-sm text-muted">
          <span className="font-medium text-ink">Catatan:</span> {reservation.notes}
        </p>
      )}

      {reservation.status === 'Ditolak' && reservation.rejectionReason && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Alasan penolakan: {reservation.rejectionReason}</span>
        </div>
      )}

      {actions && (
        <div className="mt-auto flex flex-wrap gap-2 pt-4">{actions}</div>
      )}
    </Card>
  );
}
