'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CalendarCheck2, Receipt, ArrowRight } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import { calculateNights, calculateTotal, getAvailableRooms, isStaff } from '@/lib/domain';
import { createReservation, formatCurrency } from '@/lib/repository';
import { addDays, formatDate } from '@/utils/helpers';
import { Input, Select, Textarea, Field } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import type { Reservation } from '@/types';

export default function BookingForm({
  initialRoomId = '',
  initialCheckIn = '',
  initialCheckOut = '',
}: {
  initialRoomId?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
}) {
  const { rooms, reservations, loading } = useData();
  const { user, role } = useAuth();
  const today = useToday();
  const { toast } = useToast();

  const [roomId, setRoomId] = useState(initialRoomId);
  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || addDays(today, 1));
  const [guestName, setGuestName] = useState(user?.role === 'guest' ? user.name : '');
  const [guestPhone, setGuestPhone] = useState(user?.phone ?? '');
  const [guestEmail, setGuestEmail] = useState(user?.role === 'guest' ? user.email : '');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Reservation | null>(null);

  const datesValid = Boolean(checkIn && checkOut && checkOut > checkIn);

  const availableRooms = useMemo(() => {
    if (!datesValid) return rooms.filter((room) => room.active && room.status !== 'maintenance');
    return getAvailableRooms(rooms, reservations, checkIn, checkOut);
  }, [rooms, reservations, checkIn, checkOut, datesValid]);

  const selectedRoom = rooms.find((room) => room.id === roomId);

  const nights = datesValid ? calculateNights(checkIn, checkOut) : 0;
  const estimatedTotal = selectedRoom ? calculateTotal(selectedRoom.pricePerNight, nights) : 0;

  const staffBooking = isStaff(role);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedRoom) {
      setError('Silakan pilih kamar terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    const result = createReservation(
      {
        guestName,
        guestPhone,
        guestEmail: guestEmail || undefined,
        guestIdNumber: guestIdNumber || undefined,
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guests,
        notes: notes || undefined,
      },
      user,
      staffBooking ? { status: 'confirmed' } : { status: 'pending' }
    );
    setSubmitting(false);

    if (!result.ok || !result.value) {
      setError(result.error ?? 'Gagal membuat reservasi.');
      toast({ title: result.error ?? 'Gagal membuat reservasi.', variant: 'error' });
      return;
    }

    setCreated(result.value);
    toast({
      title: staffBooking ? 'Reservasi dibuat & dikonfirmasi' : 'Reservasi dikirim',
      description: staffBooking
        ? 'Reservasi tercatat dan siap untuk check-in sesuai jadwal.'
        : 'Menunggu konfirmasi dari resepsionis.',
      variant: 'success',
    });
  };

  if (created) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
          Reservasi {created.status === 'confirmed' ? 'Terkonfirmasi' : 'Diajukan'}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {created.status === 'confirmed'
            ? 'Reservasi tercatat dan siap untuk check-in sesuai jadwal.'
            : 'Reservasi Anda menunggu konfirmasi dari resepsionis.'}
        </p>

        <dl className="mt-6 space-y-3 rounded-xl border border-line bg-canvas p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Kode Reservasi</dt>
            <dd className="font-semibold text-gold-dark">{created.code}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Kamar</dt>
            <dd className="font-medium text-ink">
              {created.roomType} · No. {created.roomNumber}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Menginap</dt>
            <dd className="font-medium text-ink">
              {formatDate(created.checkIn)} → {formatDate(created.checkOut)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Total</dt>
            <dd className="font-semibold text-ink">{formatCurrency(created.totalAmount)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/reservasi-saya"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Lihat Reservasi Saya <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setNotes('');
              setGuestIdNumber('');
            }}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream"
          >
            Buat Reservasi Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <CalendarCheck2 className="h-5 w-5 text-gold-dark" /> Detail Menginap
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Check-in" htmlFor="b-checkIn" required>
              <Input
                id="b-checkIn"
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => {
                  const value = event.target.value;
                  setCheckIn(value);
                  if (value && (!checkOut || checkOut <= value)) setCheckOut(addDays(value, 1));
                }}
                required
              />
            </Field>
            <Field label="Check-out" htmlFor="b-checkOut" required>
              <Input
                id="b-checkOut"
                type="date"
                min={checkIn ? addDays(checkIn, 1) : today}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                required
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Kamar" htmlFor="b-room" required>
              <Select
                id="b-room"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih kamar…
                </option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.type} · No. {room.number} · {formatCurrency(room.pricePerNight)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Jumlah Tamu" htmlFor="b-guests" required>
              <Select
                id="b-guests"
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} orang
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {selectedRoom && guests > selectedRoom.capacity && (
            <p className="mt-3 rounded-lg bg-warning-soft px-3.5 py-2.5 text-sm text-warning">
              Kapasitas kamar ini maksimal {selectedRoom.capacity} orang.
            </p>
          )}

          {!loading && availableRooms.length === 0 && (
            <p className="mt-3 rounded-lg bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
              Tidak ada kamar tersedia untuk rentang tanggal tersebut. Coba ubah tanggal.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink">Data Tamu</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nama Lengkap" htmlFor="b-name" required>
              <Input
                id="b-name"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Sesuai identitas"
                required
              />
            </Field>
            <Field label="Nomor Telepon" htmlFor="b-phone" required>
              <Input
                id="b-phone"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
                placeholder="0812-xxxx-xxxx"
                required
              />
            </Field>
            <Field label="Email" htmlFor="b-email" hint="Opsional, untuk konfirmasi">
              <Input
                id="b-email"
                type="email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                placeholder="nama@email.com"
              />
            </Field>
            <Field label="No. Identitas (KTP/Paspor)" htmlFor="b-id" hint="Opsional">
              <Input
                id="b-id"
                value={guestIdNumber}
                onChange={(event) => setGuestIdNumber(event.target.value)}
                placeholder="3175-xxxx-xxxx"
              />
            </Field>
          </div>

          <Field label="Catatan Khusus" htmlFor="b-notes" className="mt-4">
            <Textarea
              id="b-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Permintaan khusus, mis. kamar lantai tinggi, late check-out…"
            />
          </Field>
        </section>
      </div>

      <aside className="lg:col-span-2">
        <div className="sticky top-24 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Receipt className="h-5 w-5 text-gold-dark" /> Ringkasan
          </h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Kamar</dt>
              <dd className="text-right font-medium text-ink">
                {selectedRoom ? `${selectedRoom.type} · No. ${selectedRoom.number}` : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Durasi</dt>
              <dd className="font-medium text-ink">{nights > 0 ? `${nights} malam` : '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tarif / malam</dt>
              <dd className="font-medium text-ink">
                {selectedRoom ? formatCurrency(selectedRoom.pricePerNight) : '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
            <span className="text-sm text-muted">Estimasi Total</span>
            <span className="font-display text-2xl font-semibold text-ink">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>

          {error && (
            <div className="animate-fade-in mt-5 rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            variant="gold"
            className="mt-5 w-full"
            loading={submitting}
            disabled={!selectedRoom || !datesValid}
          >
            {staffBooking ? 'Buat & Konfirmasi' : 'Ajukan Reservasi'}
          </Button>

          {!staffBooking && (
            <p className="mt-3 text-center text-xs text-muted">
              Reservasi akan dikonfirmasi oleh resepsionis.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
