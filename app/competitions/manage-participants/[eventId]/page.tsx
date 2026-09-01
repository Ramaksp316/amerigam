import React from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ParticipantManagerClient from './ParticipantManagerClient';

export default async function ManageParticipantsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: true,
      registrations: {
        include: {
          user: true,
          payment: true
        },
        orderBy: {
          registrationId: 'desc'
        }
      }
    }
  });

  if (!event) {
    return (
      <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
        Competition not found.
      </div>
    );
  }

  if (event.creatorId !== userId) {
    return (
      <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
        <h2>Unauthorized</h2>
        <p style={{ color: '#94a3b8', marginTop: '8px' }}>You do not have permission to manage participants for this competition.</p>
      </div>
    );
  }

  // Passing data down as plain objects to client
  const plainEvent = JSON.parse(JSON.stringify(event));

  return <ParticipantManagerClient event={plainEvent} />;
}
