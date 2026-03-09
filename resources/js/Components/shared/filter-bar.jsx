import { Button } from '@/Components/ui/button';

export function FilterBar({ children, onSubmit, onReset, submitLabel = 'Apply filters' }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2 md:grid-cols-4">{children}</div>
      <div className="flex gap-2">
        <Button type="submit" variant="outline">{submitLabel}</Button>
        <Button type="button" variant="ghost" onClick={onReset}>Reset</Button>
      </div>
    </form>
  );
}
