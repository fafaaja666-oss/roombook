'use client';

import { useState } from 'react';
import { ShieldCheck, Plus, Pencil, UserRound } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { saveUser } from '@/lib/repository';
import { formatDateShort, initialsOf } from '@/utils/helpers';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Input, Select, Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import type { User, UserRole } from '@/types';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrator',
  receptionist: 'Resepsionis',
  guest: 'Tamu',
};

const EMPTY = { name: '', email: '', password: '', role: 'receptionist' as UserRole, phone: '', active: true };

export default function UsersPage() {
  const { users, loading } = useData();
  const { user: currentUser, isAdmin: admin } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!admin) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Akses ditolak"
        description="Hanya administrator yang dapat mengelola pengguna."
      />
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setOpen(true);
  };

  const openEdit = (target: User) => {
    setEditing(target);
    setForm({
      name: target.name,
      email: target.email,
      password: '',
      role: target.role,
      phone: target.phone ?? '',
      active: target.active,
    });
    setError(null);
    setOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = saveUser(form, editing?.id);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? 'Gagal menyimpan pengguna.');
      return;
    }
    toast({ title: editing ? 'Pengguna diperbarui' : 'Pengguna ditambahkan', variant: 'success' });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{(users ?? []).length} akun terdaftar</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Pengguna
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((item) => (
            <Card key={item.id} className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-gold">
                  {initialsOf(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium text-ink">{item.name}</h3>
                    {item.id === currentUser?.id && (
                      <Badge tone="gold">Anda</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted">{item.email}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone={item.role === 'admin' ? 'primary' : item.role === 'receptionist' ? 'info' : 'neutral'}>
                  <UserRound className="h-3.5 w-3.5" /> {ROLE_LABEL[item.role]}
                </Badge>
                <Badge tone={item.active ? 'success' : 'danger'}>
                  {item.active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              <p className="mt-3 text-xs text-muted">
                {item.phone ? `${item.phone} · ` : ''}Dibuat {formatDateShort(item.createdAt.slice(0, 10))}
              </p>

              <div className="mt-4 border-t border-line pt-4">
                <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" /> Ubah
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Ubah ${editing.name}` : 'Tambah Pengguna'}
        description={editing ? 'Perbarui data akun.' : 'Buat akun staf baru.'}
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama" htmlFor="u-name" required>
            <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Email" htmlFor="u-email" required>
            <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Peran" htmlFor="u-role" required>
              <Select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                <option value="receptionist">Resepsionis</option>
                <option value="admin">Administrator</option>
                <option value="guest">Tamu</option>
              </Select>
            </Field>
            <Field label="Telepon" htmlFor="u-phone">
              <Input id="u-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <Field
            label="Kata Sandi"
            htmlFor="u-password"
            hint={editing ? 'Biarkan kosong untuk tidak mengubah' : 'Wajib diisi untuk akun baru'}
            required={!editing}
          >
            <Input
              id="u-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editing}
            />
          </Field>
          <label className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-4 py-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-line text-gold focus:ring-gold"
            />
            <span className="text-sm text-ink">Akun aktif</span>
          </label>
          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
              {error}
            </div>
          )}
        </form>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="submit" form="user-form" loading={saving}>
            Simpan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
