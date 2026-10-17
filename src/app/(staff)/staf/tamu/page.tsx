'use client';

import { useMemo, useState } from 'react';
import { Search, Users, Phone, Mail, CreditCard, Pencil, BedDouble } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/components/ui/Toast';
import { updateGuest } from '@/lib/repository';
import { formatCurrency } from '@/lib/repository';
import { formatDateShort, initialsOf } from '@/utils/helpers';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Input, Field, Textarea } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Guest } from '@/types';

export default function GuestManagerPage() {
  const { guests, reservations, loading } = useData();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', idNumber: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Guest | null>(null);

  const enriched = useMemo(() => {
    const term = query.trim().toLowerCase();
    return guests
      .map((guest) => {
        const guestReservations = reservations.filter(
          (r) => r.guestId === guest.id || (guest.email && r.guestEmail === guest.email)
        );
        const totalSpend = guestReservations.reduce((sum, r) => sum + r.amountPaid, 0);
        return { guest, guestReservations, totalSpend };
      })
      .filter(
        ({ guest }) =>
          !term ||
          guest.name.toLowerCase().includes(term) ||
          guest.phone.toLowerCase().includes(term) ||
          guest.email?.toLowerCase().includes(term)
      )
      .sort((a, b) => b.guestReservations.length - a.guestReservations.length);
  }, [guests, reservations, query]);

  const openEdit = (guest: Guest) => {
    setEditing(guest);
    setForm({
      name: guest.name,
      phone: guest.phone,
      email: guest.email ?? '',
      idNumber: guest.idNumber ?? '',
      notes: guest.notes ?? '',
    });
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    const result = updateGuest(editing.id, form);
    setSaving(false);
    if (!result.ok) {
      toast({ title: result.error ?? 'Gagal menyimpan', variant: 'error' });
      return;
    }
    toast({ title: `Data ${form.name} diperbarui`, variant: 'success' });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Cari nama, telepon, email…"
          className="pl-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Cari tamu"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{enriched.length} tamu terdaftar</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : enriched.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tidak ada tamu"
          description="Data tamu akan muncul setelah adanya reservasi."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {enriched.map(({ guest, guestReservations, totalSpend }) => (
            <Card key={guest.id} className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-gold">
                  {initialsOf(guest.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-ink">{guest.name}</h3>
                  <p className="text-xs text-muted">
                    Sejak {formatDateShort(guest.createdAt.slice(0, 10))}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-muted">
                  <Phone className="h-3.5 w-3.5 text-gold-dark" /> {guest.phone}
                </p>
                {guest.email && (
                  <p className="flex items-center gap-2 text-muted">
                    <Mail className="h-3.5 w-3.5 text-gold-dark" /> {guest.email}
                  </p>
                )}
                {guest.idNumber && (
                  <p className="flex items-center gap-2 text-muted">
                    <CreditCard className="h-3.5 w-3.5 text-gold-dark" /> {guest.idNumber}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <BedDouble className="h-3.5 w-3.5" /> {guestReservations.length} reservasi
                </span>
                <span className="ml-auto font-medium text-ink">{formatCurrency(totalSpend)}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setDetail(guest)}>
                  Riwayat
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(guest)}>
                  <Pencil className="h-3.5 w-3.5" /> Ubah
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Ubah Data Tamu"
        description={editing?.name}
      >
        <form id="guest-form" onSubmit={handleSave} className="space-y-4">
          <Field label="Nama" htmlFor="g-name" required>
            <Input id="g-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telepon" htmlFor="g-phone" required>
              <Input id="g-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </Field>
            <Field label="Email" htmlFor="g-email">
              <Input id="g-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </div>
          <Field label="No. Identitas" htmlFor="g-id">
            <Input id="g-id" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
          </Field>
          <Field label="Catatan" htmlFor="g-notes">
            <Textarea id="g-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </form>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setEditing(null)}>
            Batal
          </Button>
          <Button type="submit" form="guest-form" loading={saving}>
            Simpan
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Riwayat Reservasi"
        description={detail?.name}
        size="lg"
      >
        {detail && (
          <div className="space-y-3">
            {reservations
              .filter((r) => r.guestId === detail.id || (detail.email && r.guestEmail === detail.email))
              .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {r.roomType} No. {r.roomNumber}
                    </p>
                    <p className="text-xs text-muted">
                      {r.code} · {formatDateShort(r.checkIn)} → {formatDateShort(r.checkOut)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            {reservations.filter((r) => r.guestId === detail.id || (detail.email && r.guestEmail === detail.email)).length === 0 && (
              <p className="py-6 text-center text-sm text-muted">Belum ada reservasi.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
