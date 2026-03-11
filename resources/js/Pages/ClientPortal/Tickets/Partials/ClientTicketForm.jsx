import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import FileUploadField from '@/Components/shared/file-upload-field';
import { getDomainOptions } from '@/lib/domain-references';
import { TICKET_CATEGORY_OPTIONS, withCurrentOption } from '@/lib/form-options';

export default function ClientTicketForm({
  data,
  setData,
  errors,
  processing,
  onSubmit,
  onCancel,
  submitLabel = 'Submit ticket',
  formData,
  domainReferences,
  canSetPriority,
}) {
  const priorityOptions = getDomainOptions(domainReferences, 'ticketPriority');

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Ticket details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField id="title" label="Title" required error={errors.title} className="md:col-span-2">
            <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Brief summary of the issue" />
          </FormField>

          <FormField id="description" label="Description" required error={errors.description} className="md:col-span-2">
            <Textarea id="description" rows={6} value={data.description} onChange={(event) => setData('description', event.target.value)} placeholder="Describe the issue, what happened, and any steps already tried" />
          </FormField>

          <FormSelectField id="category" label="Category" required value={data.category} onChange={(value) => setData('category', value)} options={withCurrentOption(TICKET_CATEGORY_OPTIONS, data.category)} placeholder="Select category" error={errors.category} />

          {canSetPriority ? (
            <FormSelectField
              id="priority"
              label="Priority"
              required
              value={data.priority}
              onChange={(value) => setData('priority', value)}
              options={priorityOptions}
              placeholder="Select priority"
              error={errors.priority}
            />
          ) : (
            <FormField id="priority" label="Priority" hint="Priority is fixed by your client portal permissions.">
              <Input value={priorityOptions.find((option) => option.value === data.priority)?.label || 'Medium'} disabled readOnly />
            </FormField>
          )}

          <FormSelectField id="asset_id" label="Related asset" value={data.asset_id} onChange={(value) => setData('asset_id', value)} options={formData.assets.map((asset) => ({ value: asset.id, label: `${asset.name} (${asset.asset_code})` }))} allowEmpty emptyLabel="No linked asset" placeholder="Select asset" error={errors.asset_id} className="md:col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>
          <FileUploadField id="portal-ticket-attachments" label="Attach files" helperText="Attach screenshots, logs, or supporting files (up to 5 files, 5MB each)." error={errors.attachments || errors['attachments.0']} onChange={(event) => setData('attachments', Array.from(event.target.files || []))} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button disabled={processing}>{submitLabel}</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
              return;
            }

            router.get('/portal/tickets');
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
