import { Badge } from '@/Components/ui/badge';
import { getDomainBadgeVariant, getDomainLabel } from '@/lib/domain-references';

export function DomainPriorityBadge({ domainReferences, referenceKey = 'ticketPriority', value }) {
  return (
    <Badge variant={getDomainBadgeVariant(domainReferences, referenceKey, value)}>
      {getDomainLabel(domainReferences, referenceKey, value)}
    </Badge>
  );
}
