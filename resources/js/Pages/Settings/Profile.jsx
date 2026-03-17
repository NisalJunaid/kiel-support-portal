import AppLayout from '@/Layouts/app-layout';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { useForm, usePage } from '@inertiajs/react';
import { FormField } from '@/Components/forms/form-field';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';

function ProfileContent({ profile }) {
  const profileForm = useForm({ name: profile.name || '', email: profile.email || '' });
  const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });
  const avatarForm = useForm({ avatar: null });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
          <CardDescription>Upload an avatar shown in your header dropdown and profile context.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
            <AvatarFallback>{profile.avatar_initials || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap items-center gap-3">
            <Input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => avatarForm.setData('avatar', e.target.files?.[0] || null)} className="max-w-sm" />
            <Button disabled={avatarForm.processing || !avatarForm.data.avatar} onClick={() => avatarForm.post('/settings/profile/avatar', { forceFormData: true, preserveScroll: true })}>Save avatar</Button>
            {profile.avatar_url ? <Button variant="outline" disabled={avatarForm.processing} onClick={() => avatarForm.delete('/settings/profile/avatar', { preserveScroll: true })}>Remove avatar</Button> : null}
          </div>
          {avatarForm.errors.avatar ? <p className="w-full text-sm text-destructive">{avatarForm.errors.avatar}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
          <CardDescription>Manage your name and sign-in email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); profileForm.patch('/settings/profile', { preserveScroll: true }); }}>
            <FormField id="name" label="Full name" error={profileForm.errors.name} required>
              <Input id="name" value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} placeholder="Your full name" />
            </FormField>
            <FormField id="email" label="Email" error={profileForm.errors.email} required>
              <Input id="email" type="email" value={profileForm.data.email} onChange={(e) => profileForm.setData('email', e.target.value)} placeholder="you@company.com" />
            </FormField>
            <Button type="submit" disabled={profileForm.processing}>Save profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use your current password to set a new secure password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); passwordForm.patch('/settings/profile/password', { preserveScroll: true, onSuccess: () => passwordForm.reset() }); }}>
            <FormField id="current_password" label="Current password" error={passwordForm.errors.current_password} required>
              <Input id="current_password" type="password" value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} placeholder="Enter current password" />
            </FormField>
            <FormField id="password" label="New password" error={passwordForm.errors.password} required>
              <Input id="password" type="password" value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} placeholder="At least 8 characters" />
            </FormField>
            <FormField id="password_confirmation" label="Confirm new password" error={passwordForm.errors.password_confirmation} required>
              <Input id="password_confirmation" type="password" value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} placeholder="Repeat new password" />
            </FormField>
            <Button type="submit" disabled={passwordForm.processing}>Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfileSettingsPage({ profile }) {
  const { props } = usePage();
  const isStaff = props.authorization?.isStaffWorkspace;
  const content = <ProfileContent profile={profile} />;

  if (isStaff) {
    return <AppLayout title="My Profile" description="Manage your account details and avatar.">{content}</AppLayout>;
  }

  return <ClientPortalLayout title="My Profile" description="Manage your account details and avatar.">{content}</ClientPortalLayout>;
}
