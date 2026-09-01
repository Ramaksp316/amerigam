import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ApplyClient from './ApplyClient';

export default async function CompetitionApplyPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/login');

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: {
        select: { id: true, name: true, avatarData: true }
      },
      _count: {
        select: { registrations: true }
      }
    }
  });

  if (!event) return notFound();

  // Eligibility Check
  const now = new Date();
  const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
  const regEnd = event.registrationEnd ? new Date(event.registrationEnd) : null;
  const isRegistrationOpen = regStart && regEnd && now >= regStart && now <= regEnd;

  let eligibilityError = null;
  if (!isRegistrationOpen) {
    eligibilityError = 'Registration is currently closed.';
  }
  if (event.participantLimit && event._count.registrations >= event.participantLimit) {
    eligibilityError = 'Registration is full. Maximum participants reached.';
  }

  // Check if already registered
  const existingReg = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } }
  });
  
  if (existingReg) {
    if (existingReg.status === 'PENDING' && event.entryFee && event.entryFee > 0) {
      redirect(`/competitions/payment/${existingReg.id}`);
    }
    redirect(`/competitions/${eventId}/manage`);
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { personalProfile: true }
  });

  return (
    <ApplyClient event={event} currentUser={currentUser} eligibilityError={eligibilityError} />
  );
}
