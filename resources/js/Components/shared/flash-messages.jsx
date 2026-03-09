import { usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

export function FlashMessages() {
  const { flash } = usePage().props;

  if (!flash?.success && !flash?.error) return null;

  return (
    <div className="space-y-2">
      {flash.success && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{flash.success}</AlertDescription>
        </Alert>
      )}
      {flash.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{flash.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
