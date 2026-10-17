import Badge from '@/components/ui/Badge';
import { getPaymentMeta } from '@/lib/status';
import type { PaymentStatus } from '@/types';

export default function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = getPaymentMeta(status);
  const Icon = meta.icon;
  return (
    <Badge tone="neutral" className={meta.pill} icon={<Icon className="h-3.5 w-3.5" />}>
      {meta.label}
    </Badge>
  );
}
