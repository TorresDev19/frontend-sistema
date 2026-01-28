import { Badge } from '@/components/ui/badge';
import { StockStatus } from '@/types';

interface StatusBadgeProps {
  status: StockStatus;
}

const statusConfig = {
  normal: { label: 'Normal', variant: 'success' as const },
  low: { label: 'Baixo', variant: 'warning' as const },
  critical: { label: 'Crítico', variant: 'critical' as const },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="font-medium">
      {config.label}
    </Badge>
  );
}
