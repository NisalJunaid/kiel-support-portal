import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function Login() {
  const { flash, errors } = usePage().props;
  const { data, setData, post, processing } = useForm({ email: '', password: '', remember: false });

  const submit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <>
      <Head title="Login" />
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Kiel</p>
            <CardTitle>Support Portal Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {flash?.error && (
              <Alert className="border-destructive/40">
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>{flash.error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                Remember me
              </label>
              <Button type="submit" className="w-full" disabled={processing}>Sign in</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
