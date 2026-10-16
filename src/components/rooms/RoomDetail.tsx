'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useToday';
import { formatDate, formatDateShort } from '@/utils/helpers';
import { getFacilityIcon } from '@/lib/facilities';
import { Card, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';
import {
  ArrowLeft,
  MapPin,
  Users,
  CheckCircle2,
  Wrench,
  CalendarDays,
  Clock,
  Calendar,
} from 'lucide-react';

export default function RoomDetail() {
  const params = useParams<{ id: string }>();
  const { rooms, reservations } = useData();
  const today = useToday();

  const room = rooms.find((r) => r.id === params.id);

  if (!room) {
    return (
      <EmptyState
        icon={MapPin}
        title="Ruangan tidak ditemukan"
        description="Ruangan yang Anda cari mungkin telah dihapus atau tidak tersedia."
        action={
          <Link href="/ruangan" className={buttonClasses({})}>
            <ArrowLeft className="h-4 w-4" /> Kembali ke daftar ruangan
          </Link>
        }
      />
    );
  }

  const todayReservations = reservations
    .filter((r) => r.roomId === room.id && r.date === today && r.status === 'Disetujui')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <Link
        href="/ruangan"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar ruangan
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[16/9] w-full bg-slate-100">
              <Image
                src={room.image}
                alt={room.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute left-4 top-4">
                <Badge
                  tone={room.isMaintenance ? 'danger' : 'success'}
                  className="bg-white/95 backdrop-blur"
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
              </div>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-ink">{room.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-1.5 text-sm font-medium text-ink">
                  <MapPin className="h-4 w-4 text-muted" />
                  {room.location}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-1.5 text-sm font-medium text-ink">
                  <Users className="h-4 w-4 text-muted" />
                  Kapasitas {room.capacity} orang
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{room.description}</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Fasilitas" description="Fasilitas yang tersedia di ruangan ini" />
            <div className="grid grid-cols-2 gap-2.5 p-5 sm:grid-cols-3">
              {room.facilities.map((facility) => {
                const Icon = getFacilityIcon(facility);
                return (
                  <div
                    key={facility}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{facility}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted">Status ruangan</p>
            <div className="mt-2">
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
            </div>
            <div className="mt-5 space-y-2.5 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted" /> {today ? formatDate(today) : '—'}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted" /> Jam operasional 08:00 – 18:00
              </p>
            </div>
            <div className="mt-6 space-y-2">
              {room.isMaintenance ? (
                <span
                  className={buttonClasses({
                    className: 'w-full pointer-events-none opacity-60',
                    size: 'lg',
                  })}
                >
                  Sedang dalam pemeliharaan
                </span>
              ) : (
                <Link
                  href={`/booking?room=${room.id}`}
                  className={buttonClasses({ className: 'w-full', size: 'lg' })}
                >
                  Booking Ruangan
                </Link>
              )}
              <Link
                href={`/jadwal?room=${room.id}`}
                className={buttonClasses({ variant: 'secondary', className: 'w-full' })}
              >
                Lihat Jadwal
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Jadwal Hari Ini" icon={<CalendarDays className="h-4 w-4" />} />
            {todayReservations.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Belum ada jadwal terpakai hari ini
              </p>
            ) : (
              <div className="space-y-1 p-3">
                {todayReservations.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg p-2">
                    <span className="flex min-w-[64px] items-center justify-center rounded-lg bg-primary-soft px-2 py-1.5 text-xs font-semibold text-primary">
                      {r.startTime}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{r.eventName}</p>
                      <p className="truncate text-xs text-muted">
                        {r.startTime}–{r.endTime} • {formatDateShort(r.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
