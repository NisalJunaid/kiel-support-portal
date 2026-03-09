import { Badge } from '@/Components/ui/badge';
import { getDomainBadgeVariant, getDomainLabel } from '@/lib/domain-references';

export function DomainStatusBadge({ domainReferences, referenceKey, value }) {
  return (
    <Badge variant={getDomainBadgeVariant(domainReferences, referenceKey, value)}>
      {getDomainLabel(domainReferences, referenceKey, value)}
    </Badge>
  );
}
