import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { ListPagination } from '@/Components/shared/list-pagination';

export default function ClientAssetsIndex({ assets }) {
  return (
    <ClientPortalLayout title="Assets" description="Assets scoped to your company.">
      <Card>
        <CardHeader><CardTitle>Company Assets</CardTitle></CardHeader>
        <CardContent>
          {assets.data.length === 0 ? <EmptyState title="No assets available" description="No assets have been linked to your company yet." /> : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {assets.data.map((asset) => <TableRow key={asset.id}><TableCell>{asset.name}</TableCell><TableCell>{asset.asset_code || '—'}</TableCell><TableCell>{asset.type || '—'}</TableCell><TableCell>{asset.status || '—'}</TableCell></TableRow>)}
                </TableBody>
              </Table>
              <ListPagination paginated={assets} className="mt-4" />
            </>
          )}
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}
