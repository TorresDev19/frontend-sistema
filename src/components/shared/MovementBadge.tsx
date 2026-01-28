import { Badge } from '@/components/ui/badge';
import { MovementType } from '@/types';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface MovementBadgeProps {
  type: MovementType;
}

export function MovementBadge({ type }: MovementBadgeProps) {
  if (type === 'entry') {
    return (
      <Badge variant="success" className="gap-1 font-medium">
        <ArrowDownLeft className="h-3 w-3" />
        Entrada
      </Badge>
    );
  }

  return (
    <Badge variant="critical" className="gap-1 font-medium">
      <ArrowUpRight className="h-3 w-3" />
      Saída
    </Badge>
  );
}
