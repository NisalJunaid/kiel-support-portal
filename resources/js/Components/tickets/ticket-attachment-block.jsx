import { Badge } from '@/Components/ui/badge';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export function TicketAttachmentBlock({ attachments = [], compact = false }) {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id ?? `${attachment.name}-${attachment.created_at}`}
          className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm"
        >
          <div className="min-w-0 space-y-0.5">
            {attachment.download_url ? (
              <a href={attachment.download_url} className="block truncate font-medium underline underline-offset-2">
                {attachment.name}
              </a>
            ) : (
              <p className="truncate font-medium">{attachment.name}</p>
            )}
            {!compact && (
              <p className="text-xs text-muted-foreground">
                {attachment.mime_type || 'File'}
                {attachment.size_bytes ? ` · ${formatBytes(attachment.size_bytes)}` : ''}
              </p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0">{attachment.uploaded_by || 'System'}</Badge>
        </div>
      ))}
    </div>
  );
}
