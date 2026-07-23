import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Settings, LogOut, UserCircle } from 'lucide-react';
import ProfileFormClient from './ProfileFormClient';

async function updateProfile(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const portfolioUrl = formData.get('portfolioUrl') as string;
  const avatarData = formData.get('avatarData') as string;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { name, bio, portfolioUrl, avatarData },
    });
    revalidatePath('/profile');
    revalidatePath(`/user/${userId}`);
    redirect(`/user/${userId}`);
  }
}

async function logout() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  redirect('/login');
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ 
    where: { id: userId }
  });

  if (!user) redirect('/login');
  if (!user.onboarded) redirect('/onboarding');

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
        <Settings size={32} color="var(--accent-purple)" />
        <h1 className="heading-jakaas" style={{ fontSize: '2rem', margin: 0 }}>Settings</h1>
      </div>
      
      <div className="glass-card" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <UserCircle size={20} color="var(--text-secondary)" /> Edit Profile
        </h2>
        
        <ProfileFormClient user={user} updateAction={updateProfile} />
      </div>

      <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--danger)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <LogOut size={20} /> Danger Zone
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          Logging out will end your current session. You will need to sign in again to access your account.
        </p>
        <form action={logout}>
          <button type="submit" className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', width: 'auto', padding: 'var(--space-2) var(--space-6)' }}>Log Out</button>
        </form>
      </div>
    </div>
  );
}
