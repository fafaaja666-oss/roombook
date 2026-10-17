'use client';

import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea, Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { getAvailableRooms } from '@/lib/domain';
import { createReservation, updateReservation, formatCurrency, type ReservationInput } from '@/lib/repository';
import { addDays } from '@/utils/helpers';
import type { Reservation } from '@/types';

function toForm(reservation: Reservation | null, today: string): ReservationInput {
  if (reservation) {
    return {
      guestName: reservation.guestName,
      guestPhone: reservation.guestPhone,
      guestEmail: reservation.guestEmail ?? '',
      guestIdNumber: '',
      roomId: reservation.roomId,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: reservation.guests,
      notes: reservation.notes ?? '',
    };
  }
  return {
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    guestIdNumber: '',
    roomId: '',
    checkIn: today,
    checkOut: addDays(today, 1),
    guests: 1,
    notes: '',
  };
}

export default function ReservationFormModal({
  reservation,
  onClose,
  onSaved,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { rooms, reservations } = useData();
  const { user } = useAuth();
  const today = useToday();
  const { toast } = useToast();

  const [form, setForm] = useState<ReservationInput>(() => toForm(reservation, today));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const availableRooms = useMemo(() => {
    if (!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) {
      return rooms.filter((room) => room.active);
    }
    return getAvailableRooms(rooms, reservations, form.checkIn, form.checkOut, reservation?.id);
  }, [rooms, reservations, form.checkIn, form.checkOut, reservation?.id]);

  const selectedRoom = rooms.find((room) => room.id === form.roomId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = reservation
      ? updateReservation(reservation.id, form, user)
      : createReservation(form, user, { status: 'confirmed' });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? 'Gagal menyimpan reservasi.');
      return;
    }
    toast({
      title: reservation ? 'Reservasi diperbarui' : 'Reservasi dibuat',
      description: result.value ? result.value.code : undefined,
      variant: 'success',
    });
    onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={reservation ? `Ubah Reservasi ${reservation.code}` : 'Reservasi Baru'}
      description={reservation ? 'Perbarui detail reservasi.' : 'Buat reservasi atas nama tamu.'}
      size="lg"
    >
      <form id="reservation-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Tamu" htmlFor="rm-name" required>
            <Input id="rm-name" value={form.guestName} onChange={(e) => update('guestName', e.target.value)} required />
          </Field>
          <Field label="Nomor Telepon" htmlFor="rm-phone" required>
            <Input id="rm-phone" value={form.guestPhone} onChange={(e) => update('guestPhone', e.target.value)} required />
          </Field>
          <Field label="Email" htmlFor="rm-email" hint="Opsional">
            <Input id="rm-email" type="email" value={form.guestEmail ?? ''} onChange={(e) => update('guestEmail', e.target.value)} />
          </Field>
          <Field label="No. Identitas" htmlFor="rm-id" hint="Opsional">
            <Input id="rm-id" value={form.guestIdNumber ?? ''} onChange={(e) => update('guestIdNumber', e.target.value)} />
          </Field>
          <Field label="Check-in" htmlFor="rm-checkin" required>
            <Input
              id="rm-checkin"
              type="date"
              value={form.checkIn}
              onChange={(e) => {
                const value = e.target.value;
                update('checkIn', value);
                if (value && form.checkOut <= value) update('checkOut', addDays(value, 1));
              }}
              required
            />
          </Field>
          <Field label="Check-out" htmlFor="rm-checkout" required>
            <Input
              id="rm-checkout"
              type="date"
              min={addDays(form.checkIn, 1)}
              value={form.checkOut}
              onChange={(e) => update('checkOut', e.target.value)}
              required
            />
          </Field>
          <Field label="Kamar" htmlFor="rm-room" required>
            <Select id="rm-room" value={form.roomId} onChange={(e) => update('roomId', e.target.value)} required>
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
          <Field label="Jumlah Tamu" htmlFor="rm-guests" required>
            <Select id="rm-guests" value={form.guests} onChange={(e) => update('guests', Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} orang
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {selectedRoom && form.guests > selectedRoom.capacity && (
          <p className="rounded-lg bg-warning-soft px-3.5 py-2.5 text-sm text-warning">
            Jumlah tamu melebihi kapasitas kamar ({selectedRoom.capacity} orang).
          </p>
        )}

        <Field label="Catatan" htmlFor="rm-notes" hint="Opsional">
          <Textarea id="rm-notes" rows={2} value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
        </Field>

        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </div>
        )}
      </form>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" form="reservation-form" loading={saving}>
          {reservation ? 'Simpan Perubahan' : 'Buat Reservasi'}
        </Button>
      </div>
    </Modal>
  );
}
