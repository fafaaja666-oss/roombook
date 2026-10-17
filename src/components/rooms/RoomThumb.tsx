'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getRoomTypeImage } from '@/constants/room-images';
import { cn } from '@/lib/cn';
import type { Room } from '@/types';

/**
 * Thumbnail foto kamar untuk panel staf.
 * Foto gagal dimuat -> otomatis jatuh ke foto khas tipe kamar (bukan ilustrasi).
 */
export default function RoomThumb({ room, className }: { room: Room; className?: string }) {
  const fallback = getRoomTypeImage(room.type);
  const [src, setSrc] = useState(room.image || fallback);

  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-lg border border-line bg-cream', className)}>
      <Image
        src={src}
        alt={`Foto kamar ${room.number}`}
        fill
        sizes="96px"
        className="object-cover"
        onError={() => {
          if (src !== fallback) setSrc(fallback);
        }}
      />
    </div>
  );
}
