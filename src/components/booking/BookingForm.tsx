'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { TIME_OPTIONS } from '@/constants/data';
import type { Reservation } from '@/types';
import {
  generateReservationId,
  isPastDate,
  isTimeRangeValid,
  findConflictingReservations,
  formatDate,
} from '@/utils/helpers';
import { getFacilityIcon } from '@/lib/facilities';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import Button, { buttonClasses } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  CheckCircle2,
  CalendarClock,
  Clock,
  Users,
  Info,
  MapPin,
  AlertCircle,
  CalendarOff,
} from 'lucide-react';
import Image from 'next/image';

export default function BookingForm() {
  const { user } = useAuth();
  const { rooms, reservations, updateReservations } = useData();
  const today = useToday();
  const router = useRouter();
  const searchParams = useSearchParams();

  const availableRooms = useMemo(() => rooms.filter((r) => !r.isMaintenance), [rooms]);
  const preselected = searchParams.get('room') ?? '';
  const defaultRoomId =
    availableRooms.find((r) => r.id === preselected)?.id ?? availableRooms[0]?.id ?? '';
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(searchParams.get('date') ?? '');
  const [startTime, setStartTime] = useState(searchParams.get('start') ?? '08:00');
  const [endTime, setEndTime] = useState(searchParams.get('end') ?? '09:00');
  const [participants, setParticipants] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const activeDate = date || today;
  const selectedRoom = rooms.find((r) => r.id === roomId) ?? null;
  const conflicts = useMemo(() => {
    if (!roomId || !activeDate || !startTime || !endTime || startTime >= endTime) return [];
    return findConflictingReservations(reservations, roomId, activeDate, startTime, endTime);
  }, [reservations, roomId, activeDate, startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;
    if (!roomId) {
      setError('Pilih ruangan terlebih dahulu');
      return;
    }
    if (!eventName.trim()) {
      setError('Nama kegiatan wajib diisi');
      return;
    }
    if (!activeDate) {
      setError('Tanggal wajib diisi');
      return;
    }
    if (isPastDate(activeDate, today)) {
      setError('Tidak dapat memesan tanggal yang sudah lewat');
      return;
    }
    if (!isTimeRangeValid(startTime, endTime)) {
      setError('Jam selesai harus setelah jam mulai');
      return;
    }

    const room = rooms.find((r) => r.id === roomId);
    if (!room) {
      setError('Ruangan tidak ditemukan');
      return;
    }

    const participantCount = Number(participants);
    if (!participantCount || participantCount <= 0) {
      setError('Jumlah peserta harus lebih dari 0');
      return;
    }
    if (participantCount > room.capacity) {
      setError(`Jumlah peserta melebihi kapasitas ruangan (${room.capacity} orang)`);
      return;
    }

    const conflicting = findConflictingReservations(
      reservations,
      roomId,
      activeDate,
      startTime,
      endTime
    );
    if (conflicting.length > 0) {
      setError('Jadwal bertabrakan dengan reservasi lain. Silakan pilih waktu atau ruangan lain.');
      return;
    }

    const now = new Date().toISOString();
    const reservation: Reservation = {
      id: generateReservationId(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      eventName: eventName.trim(),
      roomId,
      roomName: room.name,
      date: activeDate,
      startTime,
      endTime,
      participants: participantCount,
      purpose: purpose.trim(),
      notes: notes.trim(),
      status: 'Menunggu Persetujuan',
      rejectionReason: undefined,
      createdAt: now,
      updatedAt: now,
    };

    updateReservations([...reservations, reservation]);
    setSuccess(true);
    setTimeout(() => router.push('/reservasi-saya'), 1400);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink">Reservasi Berhasil Diajukan</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Pengajuan Anda sedang menunggu persetujuan administrator. Anda akan diarahkan ke halaman
            reservasi.
          </p>
          <Link href="/reservasi-saya" className={buttonClasses({ className: 'mt-6' })}>
            Lihat Reservasi Saya
          </Link>
        </Card>
      </div>
    );
  }

  if (availableRooms.length === 0 && !selectedRoom) {
    return (
      <EmptyState
        icon={CalendarOff}
        title="Tidak ada ruangan tersedia"
        description="Semua ruangan sedang dalam pemeliharaan. Silakan coba lagi nanti."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Card>
          <CardHeader
            title="Detail Kegiatan"
            description="Informasi dasar kegiatan yang akan dipesan"
            icon={<CalendarClock className="h-4 w-4" />}
          />
          <div className="space-y-4 p-5">
            <Field label="Ruangan" htmlFor="room" required>
              <Select id="room" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} — {room.location} (kapasitas {room.capacity})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Nama Kegiatan" htmlFor="event" required>
              <Input
                id="event"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Contoh: Rapat Koordinasi Tim"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Keperluan" htmlFor="purpose">
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Contoh: Koordinasi proyek"
                />
              </Field>
              <Field
                label="Jumlah Peserta"
                htmlFor="participants"
                required
                hint={selectedRoom ? `Maksimal ${selectedRoom.capacity} orang` : undefined}
              >
                <Input
                  id="participants"
                  type="number"
                  min={1}
                  max={selectedRoom?.capacity}
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="0"
                />
              </Field>
            </div>

            <Field label="Catatan" htmlFor="notes" hint="Opsional">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Kebutuhan tambahan, dll."
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Waktu"
            description="Tanggal dan rentang jam penggunaan ruangan"
            icon={<Clock className="h-4 w-4" />}
          />
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <Field label="Tanggal" htmlFor="date" required>
              <Input
                id="date"
                type="date"
                min={today}
                value={activeDate}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Jam Mulai" htmlFor="start" required>
              <Select id="start" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {TIME_OPTIONS.slice(0, -1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Jam Selesai" htmlFor="end" required>
              <Select id="end" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                {TIME_OPTIONS.slice(1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/ruangan" className={buttonClasses({ variant: 'secondary' })}>
            Batal
          </Link>
          <Button type="submit">Ajukan Reservasi</Button>
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        {selectedRoom && (
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[16/9] w-full bg-slate-100">
              <Image
                src={selectedRoom.image}
                alt={selectedRoom.name}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-ink">{selectedRoom.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="h-4 w-4 shrink-0" />
                {selectedRoom.location}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
                <Users className="h-4 w-4 shrink-0" />
                Kapasitas {selectedRoom.capacity} orang
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedRoom.facilities.map((facility) => {
                  const Icon = getFacilityIcon(facility);
                  return (
                    <span
                      key={facility}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 text-xs font-medium text-muted"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {facility}
                    </span>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Ketersediaan" icon={<Clock className="h-4 w-4" />} />
          <div className="p-5">
            {activeDate && !isPastDate(activeDate, today) ? (
              <div className="space-y-3">
                <p className="text-sm text-muted">{formatDate(activeDate)}</p>
                {conflicts.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                    <Info className="h-4 w-4" /> Waktu ini masih tersedia
                  </p>
                ) : (
                  <div className="space-y-2">
                    {conflicts.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-orange-200 bg-orange-50 p-2.5 text-xs text-orange-800"
                      >
                        <span className="font-semibold">
                          {r.startTime}–{r.endTime}
                        </span>{' '}
                        • {r.eventName}
                        <span className="ml-1 text-orange-600">({r.status})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">Pilih tanggal yang akan datang.</p>
            )}
          </div>
        </Card>
      </aside>
    </form>
  );
}
