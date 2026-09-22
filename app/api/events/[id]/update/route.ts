import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (event.creatorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      shortDescription,
      category,
      tags,
      coverImage,
      paymentQrCode,
      upiId,
      eventLevel,
      locationType,
      venue,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      entryFee,
      currency,
      participantLimit,
      minTeamSize,
      maxTeamSize,
      requireApproval,
      allowTeams,
      requireSubmissions,
      eligibility,
      rules,
      prizePool
    } = body;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: name || event.name,
        description: description || event.description,
        shortDescription: shortDescription !== undefined ? shortDescription : event.shortDescription,
        category: category || event.category,
        tags: tags !== undefined ? tags : event.tags,
        coverImage: coverImage !== undefined ? coverImage : event.coverImage,
        paymentQrCode: paymentQrCode !== undefined ? paymentQrCode : event.paymentQrCode,
        upiId: upiId !== undefined ? upiId : event.upiId,
        locationType: locationType || event.locationType,
        venue: venue !== undefined ? venue : event.venue,
        startDate: startDate ? new Date(startDate) : event.startDate,
        endDate: endDate ? new Date(endDate) : event.endDate,
        registrationStart: registrationStart ? new Date(registrationStart) : event.registrationStart,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : event.registrationEnd,
        entryFee: entryFee !== undefined ? parseFloat(entryFee) : event.entryFee,
        currency: currency || event.currency,
        participantLimit: participantLimit !== undefined ? (participantLimit ? parseInt(participantLimit) : null) : event.participantLimit,
        minTeamSize: minTeamSize !== undefined ? (minTeamSize ? parseInt(minTeamSize) : null) : event.minTeamSize,
        maxTeamSize: maxTeamSize !== undefined ? (maxTeamSize ? parseInt(maxTeamSize) : null) : event.maxTeamSize,
        requireApproval: requireApproval !== undefined ? requireApproval : event.requireApproval,
        allowTeams: allowTeams !== undefined ? allowTeams : event.allowTeams,
        requireSubmissions: requireSubmissions !== undefined ? requireSubmissions : event.requireSubmissions,
        eligibility: eligibility !== undefined ? eligibility : event.eligibility,
        rules: rules !== undefined ? rules : event.rules,
        prizePool: prizePool !== undefined ? prizePool : event.prizePool,
      }
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
