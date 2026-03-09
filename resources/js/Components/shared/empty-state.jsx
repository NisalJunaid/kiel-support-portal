import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export function EmptyState({ title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  );
}
