import { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Input } from '@/Components/ui/input';

export function TicketReplyComposer({
  endpoint,
  canAddPublicReply,
  canAddInternalNote = false,
  defaultType = 'public_reply',
  title = 'Reply',
  placeholder = 'Write your message…',
  submitLabel = 'Send message',
}) {
  const fileInputRef = useRef(null);
  const form = useForm({
    message_type: canAddInternalNote ? defaultType : 'public_reply',
    body: '',
    attachments: [],
  });

  if (!canAddPublicReply && !canAddInternalNote) {
    return null;
  }

  const attachmentErrors = Object.entries(form.errors)
    .filter(([key]) => key.startsWith('attachments'))
    .map(([, value]) => value);

  const removeFileAt = (index) => {
    const nextFiles = form.data.attachments.filter((_, fileIndex) => fileIndex !== index);
    form.setData('attachments', nextFiles);
    if (fileInputRef.current && nextFiles.length === 0) {
      fileInputRef.current.value = '';
    }
  };

  const submitReply = (e) => {
    e.preventDefault();
    form.post(endpoint, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        form.reset('body', 'attachments');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  return (
    <form onSubmit={submitReply} className="space-y-3 rounded-2xl border bg-card/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">{title}</p>
        {canAddInternalNote && (
          <Select value={form.data.message_type} onValueChange={(value) => form.setData('message_type', value)}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {canAddPublicReply && <SelectItem value="public_reply">Public reply</SelectItem>}
              {canAddInternalNote && <SelectItem value="internal_note">Internal note</SelectItem>}
            </SelectContent>
          </Select>
        )}
      </div>

      <Textarea
        value={form.data.body}
        onChange={(e) => form.setData('body', e.target.value)}
        placeholder={placeholder}
        rows={4}
      />
      {form.errors.body && <p className="text-xs text-destructive">{form.errors.body}</p>}

      <div className="space-y-2 rounded-md border border-dashed border-border bg-muted/30 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Attachments</p>
          <p className="text-xs text-muted-foreground">Allowed files follow ticket attachment rules.</p>
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => form.setData('attachments', Array.from(e.target.files || []))}
        />
        {!!form.data.attachments.length && (
          <ul className="space-y-1 text-xs">
            {form.data.attachments.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded border bg-background px-2 py-1">
                <span className="truncate">{file.name}</span>
                <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => removeFileAt(index)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        {attachmentErrors.map((error, index) => <p key={`attachment-error-${index}`} className="text-xs text-destructive">{error}</p>)}
      </div>

      <div className="flex justify-end">
        <Button size="sm" disabled={form.processing}>{submitLabel}</Button>
      </div>
    </form>
  );
}
