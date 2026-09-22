import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, registrationId: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.accountType !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Only Competition Organizations can manage participants.' }, { status: 403 });
    }
    
    const resolvedParams = await params;
    const { id: eventId, registrationId } = resolvedParams;

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event || event.creatorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status, qualificationStatus, rejectionReason } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (qualificationStatus !== undefined) updateData.qualificationStatus = qualificationStatus;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

    const updated = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: updateData,
      include: { payment: true }
    });

    // When organizer accepts, also mark payment as SUCCESS
    if (status === 'APPROVED' && updated.payment && updated.payment.status !== 'SUCCESS') {
      await prisma.eventPayment.update({
        where: { id: updated.payment.id },
        data: { status: 'SUCCESS' }
      });
    }

    return NextResponse.json({ success: true, registration: updated });
  } catch (error: any) {
    console.error('Participant update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
