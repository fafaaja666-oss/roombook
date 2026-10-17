import Badge from '@/components/ui/Badge';
import { getRoomOperationalMeta } from '@/lib/status';
import type { RoomOperationalStatus } from '@/types';

export default function RoomStatusBadge({
  status,
  className,
}: {
  status: RoomOperationalStatus;
  className?: string;
}) {
  const meta = getRoomOperationalMeta(status);
  const Icon = meta.icon;
  return (
    <Badge tone="neutral" className={`${meta.pill} ${className ?? ''}`} icon={<Icon className="h-3.5 w-3.5" />}>
      {meta.label}
    </Badge>
  );
}
