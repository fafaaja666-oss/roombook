'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Room } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

const IMAGE_OPTIONS = [
  '/images/room-1.svg',
  '/images/room-2.svg',
  '/images/room-3.svg',
  '/images/room-4.svg',
  '/images/room-5.svg',
];

function RoomForm({
  room,
  onSave,
  onCancel,
}: {
  room: Room | null;
  onSave: (data: Omit<Room, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(room?.name ?? '');
  const [location, setLocation] = useState(room?.location ?? '');
  const [capacity, setCapacity] = useState(room ? String(room.capacity) : '');
  const [facilities, setFacilities] = useState(room?.facilities.join(', ') ?? '');
  const [description, setDescription] = useState(room?.description ?? '');
  const [image, setImage] = useState(room?.image ?? IMAGE_OPTIONS[0]);
  const [isMaintenance, setIsMaintenance] = useState(room?.isMaintenance ?? false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError('Nama dan lokasi ruangan wajib diisi');
      return;
    }
    const capacityNumber = Number(capacity);
    if (!capacityNumber || capacityNumber <= 0) {
      setError('Kapasitas harus berupa angka lebih dari 0');
      return;
    }
    onSave({
      name: name.trim(),
      location: location.trim(),
      capacity: capacityNumber,
      facilities: facilities
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      description: description.trim(),
      image,
      isMaintenance,
      status: isMaintenance ? 'Pemeliharaan' : 'Tersedia',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Field label="Nama Ruangan" htmlFor="room-name" required>
        <Input
          id="room-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Ruang Rapat F"
        />
      </Field>

      <Field label="Lokasi" htmlFor="room-location" required>
        <Input
          id="room-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Contoh: Lantai 3, Gedung Utama"
        />
      </Field>

      <Field label="Kapasitas" htmlFor="room-capacity" required>
        <Input
          id="room-capacity"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="10"
        />
      </Field>

      <Field label="Fasilitas" htmlFor="room-facilities" hint="Pisahkan setiap fasilitas dengan koma">
        <Input
          id="room-facilities"
          value={facilities}
          onChange={(e) => setFacilities(e.target.value)}
          placeholder="Proyektor, AC, Whiteboard"
        />
      </Field>

      <Field label="Deskripsi" htmlFor="room-description">
        <Textarea
          id="room-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Deskripsi singkat ruangan"
        />
      </Field>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Gambar Ruangan</p>
        <div className="grid grid-cols-5 gap-2">
          {IMAGE_OPTIONS.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => setImage(option)}
              aria-label={`Pilih gambar ${index + 1}`}
              className={cn(
                'relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors',
                image === option ? 'border-primary' : 'border-transparent hover:border-line'
              )}
            >
              <Image src={option} alt="" fill sizes="80px" className="object-cover" />
              {image === option && (
                <span className="absolute inset-0 flex items-center justify-center bg-primary/30">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" />
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-3.5 py-3">
        <input
          type="checkbox"
          checked={isMaintenance}
          onChange={(e) => setIsMaintenance(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-sm text-ink">Tandai sedang dalam pemeliharaan</span>
      </label>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  );
}

export default function RoomFormModal({
  open,
  room,
  onClose,
  onSave,
}: {
  open: boolean;
  room: Room | null;
  onClose: () => void;
  onSave: (data: Omit<Room, 'id'>, id?: string) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={room ? 'Edit Ruangan' : 'Tambah Ruangan'}
      description={room ? 'Perbarui informasi ruangan.' : 'Lengkapi detail ruangan baru.'}
      size="lg"
    >
      <RoomForm room={room} onCancel={onClose} onSave={(data) => onSave(data, room?.id)} />
    </Modal>
  );
}
