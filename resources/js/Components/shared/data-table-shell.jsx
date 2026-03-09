import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export function DataTableShell({ title, columns, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {columns.map((column) => (
                  <th key={column} className="px-2 py-3 font-medium">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
