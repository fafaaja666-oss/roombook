'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Room } from '@/types';
import { useData } from '@/hooks/useData';
import { useToast } from '@/components/ui/Toast';
import RoomFormModal from '@/components/rooms/RoomFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Button, { buttonClasses } from '@/components/ui/Button';
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  CheckCircle2,
  Building2,
  AlertCircle,
  MapPin,
  Users,
} from 'lucide-react';

export default function RoomManager() {
  const { rooms, reservations, updateRooms } = useData();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [error, setError] = useState('');

  const activeCount = (roomId: string) =>
    reservations.filter(
      (r) =>
        r.roomId === roomId && (r.status === 'Disetujui' || r.status === 'Menunggu Persetujuan')
    ).length;

  const handleAdd = () => {
    setEditing(null);
    setError('');
    setFormOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditing(room);
    setError('');
    setFormOpen(true);
  };

  const handleSave = (data: Omit<Room, 'id'>, id?: string) => {
    if (id) {
      updateRooms(rooms.map((room) => (room.id === id ? { ...data, id } : room)));
      toast({ title: 'Ruangan diperbarui', description: data.name });
    } else {
      updateRooms([...rooms, { ...data, id: `room_${Date.now()}` }]);
      toast({ title: 'Ruangan ditambahkan', description: data.name });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const requestDelete = (room: Room) => {
    if (activeCount(room.id) > 0) {
      setError(
        `Tidak dapat menghapus "${room.name}" karena masih memiliki reservasi aktif. Batalkan atau selesaikan reservasi terlebih dahulu.`
      );
      return;
    }
    setError('');
    setDeleteTarget(room);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    updateRooms(rooms.filter((room) => room.id !== deleteTarget.id));
    toast({ title: 'Ruangan dihapus', description: deleteTarget.name, variant: 'info' });
    setDeleteTarget(null);
  };

  const handleToggleMaintenance = (room: Room) => {
    const next = !room.isMaintenance;
    updateRooms(
      rooms.map((r) =>
        r.id === room.id
          ? { ...r, isMaintenance: next, status: next ? 'Pemeliharaan' : 'Tersedia' }
          : r
      )
    );
    toast({
      title: next ? 'Ditandai pemeliharaan' : 'Kembali tersedia',
      description: room.name,
      variant: 'info',
    });
  };

  const maintenanceCount = rooms.filter((r) => r.isMaintenance).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Total <span className="font-semibold text-ink">{rooms.length}</span> ruangan •{' '}
          <span className="font-semibold text-ink">{maintenanceCount}</span> dalam pemeliharaan
        </p>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Tambah Ruangan
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {rooms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Belum ada ruangan"
          description="Tambahkan ruangan pertama untuk mulai menerima reservasi."
          action={
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4" /> Tambah Ruangan
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Ruangan</th>
                  <th className="px-5 py-3 text-left">Kapasitas</th>
                  <th className="px-5 py-3 text-left">Fasilitas</th>
                  <th className="px-5 py-3 text-left">Reservasi Aktif</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rooms.map((room) => {
                  const active = activeCount(room.id);
                  return (
                    <tr key={room.id} className="transition-colors hover:bg-canvas/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            <Image
                              src={room.image}
                              alt={room.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink">{room.name}</p>
                            <p className="flex items-center gap-1 text-xs text-muted">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{room.location}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-slate-400" />
                          {room.capacity}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted">{room.facilities.length} item</td>
                      <td className="px-5 py-3 text-muted">{active}</td>
                      <td className="px-5 py-3">
                        <Badge
                          tone={room.isMaintenance ? 'danger' : 'success'}
                          icon={
                            room.isMaintenance ? (
                              <Wrench className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )
                          }
                        >
                          {room.isMaintenance ? 'Pemeliharaan' : 'Tersedia'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(room)}
                            className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMaintenance(room)}
                            title={
                              room.isMaintenance ? 'Tandai tersedia' : 'Tandai sedang pemeliharaan'
                            }
                            className={buttonClasses({
                              variant: 'secondary',
                              size: 'sm',
                              className: room.isMaintenance ? 'text-green-700' : 'text-orange-700',
                            })}
                          >
                            {room.isMaintenance ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                              </>
                            ) : (
                              <>
                                <Wrench className="h-3.5 w-3.5" /> Servis
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(room)}
                            aria-label={`Hapus ${room.name}`}
                            className={buttonClasses({
                              variant: 'secondary',
                              size: 'icon',
                              className: 'h-9 w-9 text-danger hover:bg-red-50',
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <RoomFormModal
        open={formOpen}
        room={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Ruangan"
        message={`Yakin ingin menghapus "${deleteTarget?.name ?? ''}"? Data ruangan akan hilang permanen.`}
        confirmLabel="Ya, hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
