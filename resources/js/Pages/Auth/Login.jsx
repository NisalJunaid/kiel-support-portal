import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { resolveBrandLogoUrl } from '@/lib/branding';
import { useTheme } from '@/lib/theme-context';

export default function Login() {
  const { flash, errors, branding } = usePage().props;
  const { darkModeEnabled } = useTheme();
  const logoUrl = resolveBrandLogoUrl(branding, darkModeEnabled);
  const appName = branding?.app_name || 'Kiel Support Portal';
  const appInitial = appName.charAt(0).toUpperCase();

  const { data, setData, post, processing } = useForm({ email: '', password: '', remember: false });

  const submit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <>
      <Head title="Login" />
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
          <Card className="w-full border-border/60 bg-card shadow-xl sm:shadow-2xl">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex justify-center pt-1">
                {logoUrl ? (
                  <img src={logoUrl} alt={`${appName} logo`} className="h-12 w-auto max-w-[220px] object-contain sm:h-14" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">{appInitial}</div>
                )}
              </div>

              {flash?.error && (
                <Alert className="border-destructive/40 bg-destructive/5">
                  <AlertTitle>Sign in failed</AlertTitle>
                  <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} autoComplete="email" required className="h-11" />
                  {errors.email && <p className="text-sm font-medium text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="current-password"
                    required
                    className="h-11"
                  />
                  {errors.password && <p className="text-sm font-medium text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={processing}>
                  {processing ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
