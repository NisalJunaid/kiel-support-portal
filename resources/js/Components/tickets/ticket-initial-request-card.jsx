import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export function TicketInitialRequestCard({
  title = 'Initial request',
  description,
  requesterName,
  createdAt,
  className = '',
}) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2 pb-3">
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {requesterName ? <span>From: {requesterName}</span> : null}
          {createdAt ? <span>Submitted: {createdAt}</span> : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/95">
          {description || 'No initial description was provided.'}
        </p>
      </CardContent>
    </Card>
  );
}
