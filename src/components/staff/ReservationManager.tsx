'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, CalendarRange, LogIn, LogOut, Check, X, Pencil, Wallet } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import { canCancel, canCheckIn, canCheckOut } from '@/lib/domain';
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  confirmReservation,
  recordPayment,
  formatCurrency,
} from '@/lib/repository';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import { Input as FieldInput, Field } from '@/components/ui/Field';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import ReservationCard from '@/components/reservations/ReservationCard';
import ReservationFormModal from '@/components/staff/ReservationFormModal';
import type { Reservation, ReservationStatus } from '@/types';

type FilterKey = 'all' | ReservationStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'confirmed', label: 'Terkonfirmasi' },
  { key: 'checked_in', label: 'Check-in' },
  { key: 'checked_out', label: 'Check-out' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

export default function ReservationManager({ initialQuery = '' }: { initialQuery?: string }) {
  const { reservations, rooms, loading } = useData();
  const { user } = useAuth();
  const today = useToday();
  const { toast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [payTarget, setPayTarget] = useState<Reservation | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [working, setWorking] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reservations
      .filter((r) => (filter === 'all' ? true : r.status === filter))
      .filter(
        (r) =>
          !term ||
          r.code.toLowerCase().includes(term) ||
          r.guestName.toLowerCase().includes(term) ||
          r.guestPhone.toLowerCase().includes(term) ||
          r.roomNumber.toLowerCase().includes(term)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reservations, filter, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: reservations.length };
    reservations.forEach((r) => {
      map[r.status] = (map[r.status] ?? 0) + 1;
    });
    return map;
  }, [reservations]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (reservation: Reservation) => {
    setEditing(reservation);
    setFormOpen(true);
  };

  const handleConfirm = (reservation: Reservation) => {
    const result = confirmReservation(reservation.id, user ?? undefined);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal konfirmasi', variant: 'error' });
      return;
    }
    toast({ title: `Reservasi ${reservation.code} dikonfirmasi`, variant: 'success' });
  };

  const handleCheckIn = (reservation: Reservation) => {
    const result = checkInReservation(reservation.id, user);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal check-in', variant: 'error' });
      return;
    }
    toast({ title: `${reservation.guestName} berhasil check-in`, variant: 'success' });
  };

  const handleCheckOut = (reservation: Reservation) => {
    const result = checkOutReservation(reservation.id, user);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal check-out', variant: 'error' });
      return;
    }
    toast({ title: `${reservation.guestName} berhasil check-out`, variant: 'success' });
  };

  const handleCancel = () => {
    if (!cancelTarget) return;
    setWorking(true);
    const result = cancelReservation(cancelTarget.id, user, 'Dibatalkan oleh staf.');
    setWorking(false);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal membatalkan', variant: 'error' });
      return;
    }
    toast({ title: `Reservasi ${cancelTarget.code} dibatalkan`, variant: 'success' });
    setCancelTarget(null);
  };

  const openPayment = (reservation: Reservation) => {
    setPayTarget(reservation);
    setPayAmount(Math.max(0, reservation.totalAmount - reservation.amountPaid));
  };

  const handlePayment = () => {
    if (!payTarget) return;
    setWorking(true);
    const result = recordPayment(payTarget.id, payAmount, user ?? undefined);
    setWorking(false);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal mencatat pembayaran', variant: 'error' });
      return;
    }
    toast({ title: `Pembayaran ${formatCurrency(payAmount)} dicatat`, variant: 'success' });
    setPayTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <FieldInput
            placeholder="Cari kode, nama, telepon, kamar…"
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari reservasi"
          />
        </div>
        <Button className="sm:ml-auto" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Reservasi Baru
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === item.key
                ? 'border-charcoal bg-charcoal text-white'
                : 'border-line bg-surface text-muted hover:border-gold/40 hover:text-ink'
            )}
          >
            {item.label}
            <span
              className={cn(
                'rounded-full px-1.5 text-xs',
                filter === item.key ? 'bg-white/15' : 'bg-canvas'
              )}
            >
              {counts[item.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="Tidak ada reservasi"
          description="Tidak ada reservasi yang cocok dengan filter atau pencarian Anda."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Reservasi Baru
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((reservation) => {
            const room = rooms.find((r) => r.id === reservation.roomId);
            const checkInGate = room ? canCheckIn(reservation, room, reservations, today) : { ok: false };
            const checkOutGate = canCheckOut(reservation);
            const cancelGate = canCancel(reservation, room, today);
            return (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                footer={
                  <div className="mr-auto flex flex-wrap gap-2">
                    {reservation.status === 'pending' && (
                      <Button size="sm" variant="subtle" onClick={() => handleConfirm(reservation)}>
                        <Check className="h-3.5 w-3.5" /> Konfirmasi
                      </Button>
                    )}
                    {checkInGate.ok && (
                      <Button size="sm" variant="primary" onClick={() => handleCheckIn(reservation)}>
                        <LogIn className="h-3.5 w-3.5" /> Check-in
                      </Button>
                    )}
                    {checkOutGate.ok && (
                      <Button size="sm" variant="primary" onClick={() => handleCheckOut(reservation)}>
                        <LogOut className="h-3.5 w-3.5" /> Check-out
                      </Button>
                    )}
                  </div>
                }
                actions={
                  <>
                    {reservation.paymentStatus !== 'paid' && reservation.status !== 'cancelled' && (
                      <Button size="sm" variant="secondary" onClick={() => openPayment(reservation)}>
                        <Wallet className="h-3.5 w-3.5" /> Bayar
                      </Button>
                    )}
                    {reservation.status !== 'checked_in' && reservation.status !== 'checked_out' && (
                      <Button size="sm" variant="ghost" onClick={() => openEdit(reservation)}>
                        <Pencil className="h-3.5 w-3.5" /> Ubah
                      </Button>
                    )}
                    {cancelGate.ok && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:bg-red-50"
                        onClick={() => setCancelTarget(reservation)}
                      >
                        <X className="h-3.5 w-3.5" /> Batal
                      </Button>
                    )}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      {formOpen && (
        <ReservationFormModal
          key={editing?.id ?? 'new'}
          reservation={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Batalkan reservasi?"
        message={
          cancelTarget
            ? `Reservasi ${cancelTarget.code} untuk ${cancelTarget.guestName} akan dibatalkan.`
            : ''
        }
        confirmLabel="Ya, batalkan"
        loading={working}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <Modal
        open={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title="Catat Pembayaran"
        description={payTarget ? `Reservasi ${payTarget.code}` : ''}
        size="sm"
      >
        {payTarget && (
          <div className="space-y-4">
            <dl className="space-y-2 rounded-xl border border-line bg-canvas p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Total tagihan</dt>
                <dd className="font-medium text-ink">{formatCurrency(payTarget.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Sudah dibayar</dt>
                <dd className="font-medium text-ink">{formatCurrency(payTarget.amountPaid)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="text-muted">Sisa</dt>
                <dd className="font-semibold text-ink">
                  {formatCurrency(payTarget.totalAmount - payTarget.amountPaid)}
                </dd>
              </div>
            </dl>

            <Field label="Jumlah Pembayaran (Rp)" htmlFor="pay-amount">
              <FieldInput
                id="pay-amount"
                type="number"
                min={0}
                max={payTarget.totalAmount - payTarget.amountPaid}
                value={payAmount}
                onChange={(event) => setPayAmount(Number(event.target.value))}
              />
            </Field>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPayTarget(null)}>
                Batal
              </Button>
              <Button loading={working} onClick={handlePayment}>
                Catat Pembayaran
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
