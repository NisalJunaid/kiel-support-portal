import { EntityDrawer } from '@/Components/shared/entity-drawer';
import { Button } from '@/Components/ui/button';

export function EntityCreateDrawer({
  open,
  onOpenChange,
  title,
  description,
  onCancel,
  processing,
  children,
  className = 'z-[120] w-full border-l bg-card p-0 text-card-foreground sm:max-w-[72rem]',
}) {
  return (
    <EntityDrawer open={open} onOpenChange={onOpenChange} title={title} description={description} className={className}>
      <div className="space-y-4">
        {children}
        <div className="flex justify-end border-t pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={processing}>Cancel</Button>
        </div>
      </div>
    </EntityDrawer>
  );
}
