'use client';

import { useMemo, useState } from 'react';
import { LogOut, Search, Wallet, BedDouble, CheckCircle2, Receipt } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import { checkOutReservation, recordPayment, formatCurrency } from '@/lib/repository';
import { formatDate, formatDateShort } from '@/utils/helpers';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Input, Field } from '@/components/ui/Field';
import PaymentBadge from '@/components/ui/PaymentBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Reservation } from '@/types';

export default function CheckOutPage() {
  const { reservations, loading } = useData();
  const { user } = useAuth();
  const today = useToday();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [payTarget, setPayTarget] = useState<Reservation | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [working, setWorking] = useState(false);

  const inHouse = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reservations
      .filter((r) => r.status === 'checked_in')
      .filter(
        (r) =>
          !term ||
          r.guestName.toLowerCase().includes(term) ||
          r.code.toLowerCase().includes(term) ||
          r.roomNumber.toLowerCase().includes(term)
      )
      .sort((a, b) => a.checkOut.localeCompare(b.checkOut));
  }, [reservations, query]);

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

  const handleCheckOut = (reservation: Reservation) => {
    const result = checkOutReservation(reservation.id, user);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal check-out', variant: 'error' });
      return;
    }
    toast({
      title: `${reservation.guestName} berhasil check-out`,
      description: `Kamar ${reservation.roomNumber} masuk proses housekeeping.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-charcoal p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-charcoal">
            <LogOut className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold">Check-out Tamu</h1>
            <p className="text-sm text-stone-300">
              {formatDate(today)} · {inHouse.length} tamu sedang menginap
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Cari nama, kode, kamar…"
          className="pl-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Cari tamu menginap"
        />
      </div>

      <Card>
        <CardHeader
          title="Tamu Sedang Menginap"
          description="Proses check-out dan pastikan tagihan dilunasi."
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : inHouse.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="Tidak ada tamu menginap"
            description="Saat ini tidak ada tamu yang sedang menginap."
            className="border-0"
          />
        ) : (
          <div className="divide-y divide-line">
            {inHouse.map((r) => {
              const remaining = r.totalAmount - r.amountPaid;
              const dueToday = r.checkOut <= today;
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-ink">{r.guestName}</p>
                      <PaymentBadge status={r.paymentStatus} />
                      {dueToday && (
                        <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                          Jatuh tempo
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.code} · {r.roomType} No. {r.roomNumber} · s/d{' '}
                      {formatDateShort(r.checkOut)}
                    </p>
                    {remaining > 0 && (
                      <p className="mt-1 text-xs font-medium text-danger">
                        Sisa tagihan {formatCurrency(remaining)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {remaining > 0 && (
                      <Button size="sm" variant="secondary" onClick={() => openPayment(r)}>
                        <Wallet className="h-3.5 w-3.5" /> Bayar
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleCheckOut(r)}>
                      <LogOut className="h-3.5 w-3.5" /> Check-out
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title="Catat Pelunasan"
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
            <Field label="Jumlah Pembayaran (Rp)" htmlFor="co-amount">
              <Input
                id="co-amount"
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
                <Receipt className="h-4 w-4" /> Catat
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
