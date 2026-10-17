import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Maximize, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/repository';
import { getFacilityIcon } from '@/lib/facilities';
import { getRoomTypeImage } from '@/constants/room-images';
import type { Room } from '@/types';

export default function RoomCard({ room }: { room: Room }) {
  const fallback = getRoomTypeImage(room.type);
  const [imgSrc, setImgSrc] = useState(room.image || fallback);
  const facilities = room.facilities.slice(0, 3);

  const handleImageError = () => {
    if (imgSrc !== fallback) setImgSrc(fallback);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm shadow-stone-300/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-300/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <Image
          src={imgSrc}
          alt={`Kamar ${room.number} — ${room.type}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={handleImageError}
        />
        <span className="absolute left-3 top-3 rounded-full bg-charcoal/85 px-2.5 py-1 text-xs font-medium text-gold backdrop-blur">
          {room.type}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur">
          No. {room.number}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {room.capacity} tamu
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> Lantai {room.floor}
          </span>
        </div>

        <h3 className="mt-2 font-display text-lg font-semibold text-ink">
          {room.type} Room {room.number}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{room.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {facilities.map((facility) => {
            const Icon = getFacilityIcon(facility);
            return (
              <span
                key={facility}
                className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[11px] text-muted"
              >
                <Icon className="h-3 w-3 text-gold-dark" /> {facility}
              </span>
            );
          })}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="font-display text-xl font-semibold text-ink">
              {formatCurrency(room.pricePerNight)}
            </p>
            <p className="text-xs text-muted">per malam</p>
          </div>
          <Link
            href={`/kamar/${room.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Lihat <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
