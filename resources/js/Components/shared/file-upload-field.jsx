import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function FileUploadField({ id, label, helperText, error, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="file" multiple onChange={onChange} />
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
