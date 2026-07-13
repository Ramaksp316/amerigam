import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function updateProfile(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const portfolioUrl = formData.get('portfolioUrl') as string;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { name, bio, portfolioUrl },
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
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Edit Profile</h1>
      
      <div className="card">
        <form action={updateProfile}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Name</label>
            <input type="text" name="name" className="input-field" defaultValue={user.name || ''} placeholder="Your Name" required />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Bio</label>
            <textarea name="bio" className="input-field" defaultValue={user.bio || ''} placeholder="Write a short bio..." style={{ resize: 'vertical', minHeight: '80px' }}></textarea>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Portfolio URL</label>
            <input type="url" name="portfolioUrl" className="input-field" defaultValue={user.portfolioUrl || ''} placeholder="https://yourwebsite.com" />
          </div>

          <button type="submit" className="btn">Save Profile</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'red', marginBottom: '15px' }}>Danger Zone</h2>
        <form action={logout}>
          <button type="submit" className="btn btn-outline" style={{ color: 'red', borderColor: 'red' }}>Log Out</button>
        </form>
      </div>
    </div>
  );
}
