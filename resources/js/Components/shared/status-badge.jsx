import { Badge } from '@/Components/ui/badge';

const map = {
  success: 'success',
  warning: 'warning',
  critical: 'destructive',
  destructive: 'destructive',
  info: 'info',
};

export function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() ?? 'info';
  return <Badge variant={map[normalized] ?? 'secondary'}>{status}</Badge>;
}
