'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  BedDouble,
  Pencil,
  Power,
  Sparkles,
  Wrench,
  CheckCircle2,
  Users,
  Layers,
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import { useToast } from '@/components/ui/Toast';
import { countRoomStatuses, getRoomOperationalStatus } from '@/lib/domain';
import { setRoomActive, setRoomStatus, formatCurrency } from '@/lib/repository';
import { ROOM_TYPES } from '@/constants/data';
import { cn } from '@/lib/cn';
import StatCard from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import RoomStatusBadge from '@/components/ui/RoomStatusBadge';
import { Input, Select } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import RoomFormModal from '@/components/staff/RoomFormModal';
import RoomThumb from '@/components/rooms/RoomThumb';
import type { Room, RoomHousekeepingStatus } from '@/types';

export default function RoomManagerPage() {
  const { rooms, reservations, loading } = useData();
  const { user } = useAuth();
  const today = useToday();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);

  const stats = useMemo(() => countRoomStatuses(rooms, reservations, today), [rooms, reservations, today]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rooms
      .filter((room) => (typeFilter === 'all' ? true : room.type === typeFilter))
      .filter(
        (room) =>
          !term ||
          room.number.toLowerCase().includes(term) ||
          room.type.toLowerCase().includes(term)
      )
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [rooms, query, typeFilter]);

  const changeStatus = (room: Room, status: RoomHousekeepingStatus, label: string) => {
    const result = setRoomStatus(room.id, status, user);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal mengubah status', variant: 'error' });
      return;
    }
    toast({ title: `Kamar ${room.number} ditandai ${label}`, variant: 'success' });
  };

  const toggleActive = (room: Room) => {
    const result = setRoomActive(room.id, !room.active, user);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal mengubah status aktif', variant: 'error' });
      return;
    }
    toast({ title: `Kamar ${room.number} ${room.active ? 'dinonaktifkan' : 'diaktifkan'}`, variant: 'success' });
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Kamar" value={stats.total} icon={BedDouble} tone="primary" />
        <StatCard label="Tersedia" value={stats.available} icon={CheckCircle2} tone="success" />
        <StatCard label="Terisi / Direservasi" value={stats.occupied + stats.reserved} icon={Layers} tone="info" />
        <StatCard label="Kebersihan / Perbaikan" value={stats.cleaning + stats.maintenance} icon={Wrench} tone="warning" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari no. atau tipe kamar…"
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari kamar"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter tipe">
            <option value="all">Semua tipe</option>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <Button className="sm:ml-auto" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Kamar
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-5">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="Tidak ada kamar"
          description="Tambahkan kamar baru atau ubah filter pencarian."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Tambah Kamar
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room) => {
            const status = getRoomOperationalStatus(room, reservations, today);
            return (
              <Card key={room.id} className={cn('p-5', !room.active && 'opacity-70')}>
                <div className="flex items-start gap-3">
                  <RoomThumb room={room} className="h-16 w-24 sm:h-[72px] sm:w-32" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-2xl font-semibold text-ink">{room.number}</h3>
                      <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-gold-dark">
                        {room.type}
                      </span>
                      {!room.active && (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {room.capacity}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> Lt. {room.floor}
                      </span>
                      <span>{formatCurrency(room.pricePerNight)}</span>
                    </div>
                  </div>
                  <RoomStatusBadge status={status} />
                </div>

                {room.notes && (
                  <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">{room.notes}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {room.status !== 'available' && (
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => changeStatus(room, 'available', 'tersedia')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Siap
                    </Button>
                  )}
                  {room.status !== 'cleaning' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => changeStatus(room, 'cleaning', 'perlu dibersihkan')}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Bersihkan
                    </Button>
                  )}
                  {room.status !== 'maintenance' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => changeStatus(room, 'maintenance', 'pemeliharaan')}
                    >
                      <Wrench className="h-3.5 w-3.5" /> Perbaikan
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(room)}>
                    <Pencil className="h-3.5 w-3.5" /> Ubah
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={room.active ? 'text-danger hover:bg-red-50' : 'text-success hover:bg-success-soft'}
                    onClick={() => toggleActive(room)}
                  >
                    <Power className="h-3.5 w-3.5" /> {room.active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <RoomFormModal
          key={editing?.id ?? 'new'}
          room={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
