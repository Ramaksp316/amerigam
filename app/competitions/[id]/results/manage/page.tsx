import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ResultManagerClient from './ResultManagerClient';

export default async function ManageResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      creator: true,
      registrations: {
        include: {
          user: true
        }
      },
      results: true,
    }
  });

  if (!event) {
    redirect('/competitions');
  }

  // Authorization: Only organization that owns the competition
  if (event.creatorId !== userId) {
    redirect(`/competitions/${event.id}`);
  }

  // Count total participants
  const totalParticipants = event.registrations.length;

  // Filter eligible: Qualified (if applicable) or Accepted, ignoring Rejected, Cancelled, Pending
  const eligibleRegistrations = event.registrations.filter(r => {
    if (r.status === 'REJECTED' || r.status === 'CANCELLED' || r.status === 'PENDING') return false;
    if (r.qualificationStatus === 'NON_QUALIFIED') return false;
    return true;
  });

  const eligibleCount = eligibleRegistrations.length;

  // Pass necessary data to Client Component
  const eventData = {
    id: event.id,
    name: event.name,
    resultStatus: event.resultStatus,
    creatorName: event.creator.name,
    totalParticipants,
    eligibleCount,
  };

  // Map registrations to a simpler format for dropdowns
  const participants = eligibleRegistrations.map(r => ({
    id: r.id, // registrationId
    userId: r.user.id,
    name: r.user.name || '',
    username: r.user.username || '',
    avatarData: r.user.avatarData || '',
    status: r.status,
    qualificationStatus: r.qualificationStatus,
  }));

  // Existing results
  const existingResults = event.results.map(r => ({
    rank: r.rank,
    registrationId: r.registrationId,
  }));

  return (
    <ResultManagerClient
      event={eventData}
      participants={participants}
      existingResults={existingResults}
    />
  );
}
