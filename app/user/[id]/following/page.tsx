import { redirect } from 'next/navigation';

export default async function FollowingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/user/${id}?tab=following`);
}
