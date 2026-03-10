import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { AnimatedAuthBackground } from '@/Components/auth/animated-auth-background';
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
      <div className="relative min-h-screen overflow-hidden bg-background">
        <AnimatedAuthBackground />
        <div className="relative z-10 grid min-h-screen items-center p-4 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 xl:px-16">
          <section className="hidden rounded-3xl border border-border/40 bg-card/40 p-10 backdrop-blur-sm lg:block">
            <div className="max-w-md space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">SaaS Support Workspace</p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">Resolve client issues faster with a focused operations portal.</h1>
              <p className="text-base text-muted-foreground">Prioritize incoming tickets, manage asset context, and keep teams aligned in one secure support environment.</p>
            </div>
          </section>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
            <Card className="border-border/60 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur-sm">
              <CardHeader className="space-y-4 pb-2">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${appName} logo`} className="h-14 w-auto max-w-[180px] object-contain" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">{appInitial}</div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{appName}</p>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                  </div>
                </div>
                <CardDescription>Sign in to continue to your support operations workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
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
                    <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="current-password" required className="h-11" />
                    {errors.password && <p className="text-sm font-medium text-destructive">{errors.password}</p>}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={data.remember}
                      onChange={(e) => setData('remember', e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    />
                    Keep me signed in on this device
                  </label>

                  <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={processing}>
                    {processing ? 'Signing in…' : 'Sign in'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
