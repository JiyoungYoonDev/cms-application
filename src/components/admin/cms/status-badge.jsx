import { Badge } from '@/components/ui/badge';

export function StatusBadge({ label, variant = 'secondary' }) {
  return (
    <Badge variant={variant} className='uppercase'>
      {label}
    </Badge>
  );
}
