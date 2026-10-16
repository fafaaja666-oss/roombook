import Image from 'next/image';
import Link from 'next/link';
import type { Room } from '@/types';
import { MapPin, Users, ArrowUpRight, Wrench, CheckCircle2 } from 'lucide-react';
import { getFacilityIcon } from '@/lib/facilities';
import { buttonClasses } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function RoomCard({
  room,
  variant = 'default',
}: {
  room: Room;
  variant?: 'default' | 'compact';
}) {
  const unavailable = room.isMaintenance;
  const facilities = room.facilities;
  const visibleFacilities = variant === 'compact' ? facilities.slice(0, 2) : facilities.slice(0, 3);

  return (
    <Card className="group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md hover:shadow-slate-200">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={room.image}
          alt={room.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge
            tone={unavailable ? 'danger' : 'success'}
            className="bg-white/95 backdrop-blur"
            icon={
              unavailable ? (
                <Wrench className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )
            }
          >
            {unavailable ? 'Pemeliharaan' : 'Tersedia'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-ink">{room.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{room.location}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1 text-xs font-medium text-ink">
            <Users className="h-3.5 w-3.5 text-muted" />
            {room.capacity} orang
          </span>
          {visibleFacilities.map((facility) => {
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
          {facilities.length > visibleFacilities.length && (
            <span className="inline-flex items-center rounded-lg bg-canvas px-2.5 py-1 text-xs font-medium text-muted">
              +{facilities.length - visibleFacilities.length}
            </span>
          )}
        </div>

        {variant === 'default' && (
          <p className="mt-3 line-clamp-2 text-sm text-muted">{room.description}</p>
        )}

        <div className="mt-auto flex gap-2 pt-5">
          <Link
            href={`/ruangan/${room.id}`}
            className={buttonClasses({ variant: 'secondary', className: 'flex-1' })}
          >
            Lihat Detail
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          {unavailable ? (
            <span
              className={buttonClasses({
                variant: 'secondary',
                className: 'flex-1 pointer-events-none opacity-60',
              })}
            >
              Tidak tersedia
            </span>
          ) : (
            <Link
              href={`/booking?room=${room.id}`}
              className={buttonClasses({ className: 'flex-1' })}
            >
              Booking
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
