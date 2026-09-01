import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PaymentClient from './PaymentClient';

export default async function PaymentPage({ params }: { params: { registrationId: string } }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/login');

  const resolvedParams = await params;
  const registrationId = resolvedParams.registrationId;

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: {
      event: true,
      payment: true
    }
  });

  if (!registration || registration.userId !== userId) return notFound();

  // If payment doesn't exist or is already paid, handle it
  if (!registration.payment) {
    redirect(`/competitions/${registration.eventId}/manage`);
  }
  
  if (registration.payment.status === 'SUCCESS') {
    redirect(`/competitions/${registration.eventId}/manage`);
  }

  return (
    <PaymentClient registration={registration} payment={registration.payment} />
  );
}
