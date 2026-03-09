import { Alert, AlertDescription } from '@/Components/ui/alert';

export function FlashMessages({ flash }) {
  if (!flash?.success && !flash?.error) return null;

  return (
    <div className="space-y-2">
      {flash.success && <Alert><AlertDescription>{flash.success}</AlertDescription></Alert>}
      {flash.error && <Alert variant="destructive"><AlertDescription>{flash.error}</AlertDescription></Alert>}
    </div>
  );
}
