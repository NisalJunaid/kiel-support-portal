import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export function EntitySummaryCard({ label, value, hint }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <CardTitle className="text-xl">{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>}
    </Card>
  );
}
