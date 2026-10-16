'use client';

import { useMemo, useState } from 'react';
import type { Reservation, ReservationStatus } from '@/types';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import ReservationCard from '@/components/reservations/ReservationCard';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/Field';
import { hasTimeOverlap, isPastDate } from '@/utils/helpers';
import { FileText, Search, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type Filter = 'all' | ReservationStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'Menunggu Persetujuan', label: 'Menunggu' },
  { value: 'Disetujui', label: 'Disetujui' },
  { value: 'Ditolak', label: 'Ditolak' },
  { value: 'Dibatalkan', label: 'Dibatalkan' },
];

export default function ReservationManager() {
  const { reservations, updateReservations } = useData();
  const today = useToday();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>('Menunggu Persetujuan');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Reservation | null>(null);
  const [reason, setReason] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

  const countFor = (value: Filter) =>
    value === 'all'
      ? reservations.length
      : reservations.filter((r) => r.status === value).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations
      .filter((r) => filter === 'all' || r.status === filter)
      .filter(
        (r) =>
          !q ||
          r.eventName.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.roomName.toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [reservations, filter, query]);

  const setStatus = (
    reservation: Reservation,
    status: ReservationStatus,
    rejectionReason?: string
  ) => {
    const now = new Date().toISOString();
    updateReservations(
      reservations.map((r) =>
        r.id === reservation.id ? { ...r, status, rejectionReason, updatedAt: now } : r
      )
    );
  };

  const handleApprove = (reservation: Reservation) => {
    const approvedConflicts = reservations.filter(
      (r) =>
        r.id !== reservation.id &&
        r.roomId === reservation.roomId &&
        r.date === reservation.date &&
        r.status === 'Disetujui' &&
        hasTimeOverlap(reservation.startTime, reservation.endTime, r.startTime, r.endTime)
    );
    if (approvedConflicts.length > 0) {
      setError(
        `Tidak dapat menyetujui "${reservation.eventName}" karena bertabrakan dengan reservasi yang sudah disetujui pada ruangan dan waktu yang sama.`
      );
      return;
    }
    setError('');
    setStatus(reservation, 'Disetujui');
    toast({ title: 'Reservasi disetujui', description: reservation.eventName });
  };

  const submitReject = () => {
    if (!rejectTarget) return;
    if (!reason.trim()) {
      setError('Alasan penolakan wajib diisi');
      return;
    }
    setStatus(rejectTarget, 'Ditolak', reason.trim());
    toast({ title: 'Reservasi ditolak', description: rejectTarget.eventName, variant: 'info' });
    setRejectTarget(null);
    setReason('');
    setError('');
  };

  const handleCancelReservation = () => {
    if (!cancelTarget) return;
    setStatus(cancelTarget, 'Dibatalkan');
    toast({ title: 'Reservasi dibatalkan', description: cancelTarget.eventName, variant: 'info' });
    setCancelTarget(null);
  };

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-canvas p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                filter === option.value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              )}
            >
              {option.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs',
                  filter === option.value
                    ? 'bg-primary-soft text-primary'
                    : 'bg-slate-200/70 text-muted'
                )}
              >
                {countFor(option.value)}
              </span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kegiatan, pemohon, ruangan..."
            className="h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </Card>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Tidak ada reservasi"
          description="Belum ada reservasi yang cocok dengan filter ini."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((reservation) => {
            const pending = reservation.status === 'Menunggu Persetujuan';
            const approved = reservation.status === 'Disetujui';
            const cancellable = (pending || approved) && !isPastDate(reservation.date, today);
            return (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                showUser
                actions={
                  <>
                    {pending && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(reservation)}>
                          <Check className="h-4 w-4" /> Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-danger hover:bg-red-50"
                          onClick={() => {
                            setError('');
                            setReason('');
                            setRejectTarget(reservation);
                          }}
                        >
                          <X className="h-4 w-4" /> Tolak
                        </Button>
                      </>
                    )}
                    {cancellable && !pending && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCancelTarget(reservation)}
                      >
                        Batalkan
                      </Button>
                    )}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Tolak Reservasi"
        description={rejectTarget?.eventName}
        size="sm"
      >
        <Field label="Alasan Penolakan" htmlFor="reject-reason" required>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Contoh: Ruangan sudah terpakai untuk kegiatan lain."
          />
        </Field>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRejectTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={submitReject}>
            Tolak Reservasi
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Batalkan Reservasi"
        message={`Yakin ingin membatalkan reservasi "${cancelTarget?.eventName ?? ''}"?`}
        confirmLabel="Ya, batalkan"
        onConfirm={handleCancelReservation}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
