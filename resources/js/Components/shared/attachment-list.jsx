import { Badge } from '@/Components/ui/badge';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function AttachmentList({ attachments = [], emptyText = 'No attachments yet.' }) {
  if (attachments.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
          <div>
            <a href={attachment.download_url} className="font-medium underline">{attachment.name}</a>
            <p className="text-xs text-muted-foreground">{attachment.mime_type} · {formatBytes(attachment.size_bytes)}</p>
          </div>
          <Badge variant="outline">{attachment.uploaded_by || 'System'}</Badge>
        </div>
      ))}
    </div>
  );
}
