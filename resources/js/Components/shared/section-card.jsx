import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

export function SectionCard({ title, description, action, children, contentClassName = 'space-y-4' }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
