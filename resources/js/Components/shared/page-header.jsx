import { Link } from '@inertiajs/react';

export function PageHeader({ title, description, breadcrumbs = [] }) {
  return (
    <div className="space-y-2">
      <nav className="text-xs text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.label}>
            {crumb.href ? <Link className="hover:text-foreground" href={crumb.href}>{crumb.label}</Link> : crumb.label}
            {index < breadcrumbs.length - 1 && ' / '}
          </span>
        ))}
      </nav>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
