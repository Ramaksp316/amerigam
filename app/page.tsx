import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (userId) {
    redirect('/feed');
  } else {
    redirect('/login');
  }
}
