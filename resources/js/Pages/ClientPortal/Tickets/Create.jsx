import { Link, useForm, usePage } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import FileUploadField from '@/Components/shared/file-upload-field';
import { getDomainOptions } from '@/lib/domain-references';

export default function ClientTicketCreate({ assets, defaults, canSetPriority }) {
  const { props } = usePage();
  const priorityOptions = getDomainOptions(props.domainReferences, 'ticketPriority');
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    category: '',
    priority: defaults.priority || 'medium',
    asset_id: '',
    attachments: [],
  });

  const submit = (e) => {
    e.preventDefault();
    post('/portal/tickets');
  };

  return (
    <ClientPortalLayout title="Create ticket" description="Submit a support request for your company.">
      <form onSubmit={submit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ticket details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} />
              {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={6} value={data.description} onChange={(event) => setData('description', event.target.value)} />
              {errors.description ? <p className="text-xs text-destructive">{errors.description}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={data.category} onChange={(event) => setData('category', event.target.value)} placeholder="Incident, request, access..." />
              {errors.category ? <p className="text-xs text-destructive">{errors.category}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              {canSetPriority ? (
                <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value="Medium" disabled readOnly />
              )}
              {errors.priority ? <p className="text-xs text-destructive">{errors.priority}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Related asset</Label>
              <Select value={data.asset_id || 'none'} onValueChange={(value) => setData('asset_id', value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked asset</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={`${asset.id}`}>
                      {asset.name} ({asset.asset_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.asset_id ? <p className="text-xs text-destructive">{errors.asset_id}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadField
              id="portal-ticket-attachments"
              label="Attach files"
              helperText="Up to 5 files (PDF, images, Office docs, CSV/TXT), max 5MB each."
              error={errors.attachments || errors['attachments.0']}
              onChange={(event) => setData('attachments', Array.from(event.target.files || []))}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button disabled={processing}>Submit ticket</Button>
          <Button variant="outline" asChild>
            <Link href="/portal/tickets">Cancel</Link>
          </Button>
        </div>
      </form>
    </ClientPortalLayout>
  );
}
