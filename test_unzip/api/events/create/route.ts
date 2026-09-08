import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.accountType !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Only Competition Organizations can create events.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      shortDescription,
      category,
      tags,
      eventLevel = 'Local',
      locationType,
      venue,
      country,
      state,
      city,
      district,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      entryFee,
      currency,
      allowTeams,
      minTeamSize,
      maxTeamSize,
      onlineLink,
      rules,
      eligibility,
      qualificationEnabled,
      qualificationInfo,
      prizePool,
      coverImage,
      participantLimit,
      status = 'PUBLISHED'
    } = body;

    // Validate required fields
    if (!name || !description || !category || !locationType || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate Registration Dates
    if (registrationStart && registrationEnd) {
      if (new Date(registrationStart) >= new Date(registrationEnd)) {
        return NextResponse.json({ error: 'Registration end date must be after start date.' }, { status: 400 });
      }
      if (new Date(registrationEnd) > new Date(startDate)) {
        return NextResponse.json({ error: 'Registration end date cannot be after competition start date.' }, { status: 400 });
      }
    }

    // Validate Competition Dates
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json({ error: 'Competition end date must be after start date.' }, { status: 400 });
    }

    // Validate Free/Paid
    const isPaid = entryFee > 0;
    if (isPaid && (!currency || currency.trim() === '')) {
      return NextResponse.json({ error: 'Currency is required for paid competitions.' }, { status: 400 });
    }

    // Validate Team Limits
    if (allowTeams && minTeamSize && maxTeamSize && minTeamSize > maxTeamSize) {
      return NextResponse.json({ error: 'Maximum team size must be greater than or equal to minimum team size.' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        shortDescription,
        category,
        tags,
        eventLevel,
        locationType,
        venue,
        country,
        state,
        city,
        district,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationStart: registrationStart ? new Date(registrationStart) : null,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        entryFee: entryFee ? parseFloat(entryFee) : 0,
        currency: currency || 'INR',
        allowTeams: allowTeams || false,
        minTeamSize: minTeamSize ? parseInt(minTeamSize) : null,
        maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
        onlineLink,
        rules,
        eligibility,
        qualificationEnabled: qualificationEnabled || false,
        qualificationInfo,
        prizePool,
        coverImage,
        participantLimit: participantLimit ? parseInt(participantLimit) : null,
        status,
        creatorId: userId,
        requireApproval: false,
        evaluationMethod: 'NONE',
      }
    });

    // Notify followers
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true }
    });

    if (followers.length > 0) {
      const notificationData = followers.map(f => ({
        userId: f.followerId,
        actorId: userId,
        type: 'event',
        content: `created a new competition: ${name}`,
        link: `/competitions/${event.id}`
      }));
      await prisma.notification.createMany({ data: notificationData });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
