import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProfileRedirectPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Redirect to the actual user portfolio page
  redirect(`/user/${userId}`);
}
