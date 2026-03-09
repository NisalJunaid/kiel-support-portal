import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export function ListPagination({ paginated, className = '' }) {
  if (!paginated?.links || paginated.links.length <= 3) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`.trim()}>
      <p className="text-sm text-muted-foreground">
        Showing {paginated.from ?? 0} to {paginated.to ?? 0} of {paginated.total ?? 0}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {paginated.links.map((link, index) => (
          <Button key={`${link.label}-${index}`} asChild={!!link.url} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
            {link.url ? (
              <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: link.label }} />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
