'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea, Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { saveRoom, type RoomInput } from '@/lib/repository';
import { ROOM_TYPES } from '@/constants/data';
import { ROOM_IMAGE_OPTIONS, ROOM_TYPE_IMAGES } from '@/constants/room-images';
import type { Room, RoomHousekeepingStatus, RoomType } from '@/types';

const EMPTY: RoomInput = {
  number: '',
  type: 'Standard',
  floor: 1,
  capacity: 2,
  pricePerNight: 650000,
  facilities: ['Wi-Fi', 'AC', 'TV', 'Air Panas'],
  description: '',
  image: ROOM_TYPE_IMAGES.Standard,
  status: 'available',
  notes: '',
  active: true,
};

function toForm(room: Room | null): RoomInput {
  if (!room) return EMPTY;
  return {
    number: room.number,
    type: room.type,
    floor: room.floor,
    capacity: room.capacity,
    pricePerNight: room.pricePerNight,
    facilities: room.facilities,
    description: room.description,
    image: room.image,
    status: room.status,
    notes: room.notes,
    active: room.active,
  };
}

export default function RoomFormModal({
  room,
  onClose,
  onSaved,
}: {
  room: Room | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<RoomInput>(() => toForm(room));
  const [facilitiesText, setFacilitiesText] = useState(() =>
    (room?.facilities ?? EMPTY.facilities).join(', ')
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof RoomInput>(key: K, value: RoomInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const facilities = facilitiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const result = saveRoom({ ...form, facilities }, null, room?.id ?? undefined);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? 'Gagal menyimpan kamar.');
      return;
    }
    toast({
      title: room ? `Kamar ${form.number} diperbarui` : `Kamar ${form.number} ditambahkan`,
      variant: 'success',
    });
    onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={room ? `Ubah Kamar ${room.number}` : 'Tambah Kamar Baru'}
      description={room ? 'Perbarui informasi kamar.' : 'Lengkapi detail kamar baru.'}
      size="lg"
    >
      <form id="room-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor Kamar" htmlFor="rf-number" required>
            <Input
              id="rf-number"
              value={form.number}
              onChange={(event) => update('number', event.target.value)}
              placeholder="mis. 205"
              required
            />
          </Field>
          <Field label="Tipe" htmlFor="rf-type" required>
            <Select
              id="rf-type"
              value={form.type}
              onChange={(event) => update('type', event.target.value as RoomType)}
            >
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Lantai" htmlFor="rf-floor" required>
            <Input
              id="rf-floor"
              type="number"
              min={1}
              value={form.floor}
              onChange={(event) => update('floor', Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Kapasitas (orang)" htmlFor="rf-capacity" required>
            <Input
              id="rf-capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(event) => update('capacity', Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Harga / malam (Rp)" htmlFor="rf-price" required>
            <Input
              id="rf-price"
              type="number"
              min={0}
              step={50000}
              value={form.pricePerNight}
              onChange={(event) => update('pricePerNight', Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Status Housekeeping" htmlFor="rf-status">
            <Select
              id="rf-status"
              value={form.status}
              onChange={(event) => update('status', event.target.value as RoomHousekeepingStatus)}
            >
              <option value="available">Tersedia</option>
              <option value="cleaning">Perlu Dibersihkan</option>
              <option value="maintenance">Pemeliharaan</option>
            </Select>
          </Field>
        </div>

        <Field label="Fasilitas" htmlFor="rf-facilities" hint="Pisahkan dengan koma">
          <Input
            id="rf-facilities"
            value={facilitiesText}
            onChange={(event) => setFacilitiesText(event.target.value)}
            placeholder="Wi-Fi, AC, Smart TV, Mini Bar"
          />
        </Field>

        <Field label="Gambar Kamar" htmlFor="rf-image">
          <Select id="rf-image" value={form.image} onChange={(event) => update('image', event.target.value)}>
            {ROOM_IMAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Deskripsi" htmlFor="rf-desc" required>
          <Textarea
            id="rf-desc"
            rows={3}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Deskripsi singkat kamar…"
            required
          />
        </Field>

        <Field label="Catatan Internal" htmlFor="rf-notes" hint="Opsional, tidak tampil ke tamu">
          <Input
            id="rf-notes"
            value={form.notes ?? ''}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="mis. renovasi, kerusakan…"
          />
        </Field>

        <label className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-4 py-3">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => update('active', event.target.checked)}
            className="h-4 w-4 rounded border-line text-gold focus:ring-gold"
          />
          <span className="text-sm text-ink">
            Kamar aktif (dapat dipesan oleh tamu)
          </span>
        </label>

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
        <Button type="submit" form="room-form" loading={saving}>
          {room ? 'Simpan Perubahan' : 'Tambah Kamar'}
        </Button>
      </div>
    </Modal>
  );
}
