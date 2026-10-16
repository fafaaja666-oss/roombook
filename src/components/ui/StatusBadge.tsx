import Badge from '@/components/ui/Badge';
import { getStatusMeta } from '@/lib/status';
import type { ReservationStatus } from '@/types';

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;
  return (
    <Badge tone="neutral" className={meta.pill} icon={<Icon className="h-3.5 w-3.5" />}>
      {meta.label}
    </Badge>
  );
}
