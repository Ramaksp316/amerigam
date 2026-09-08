import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const staffId = cookieStore.get('userId')?.value;

    if (!staffId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Verify staffId belongs to a user with Organizer/Staff permissions
    // For now, any logged-in user can scan if they have the scanner app open, 
    // but in a production environment we'd check their role in the Event.

    const body = await req.json();
    const { qrToken, gateInfo } = body;

    if (!qrToken) {
      return NextResponse.json({ error: 'Missing QR Token' }, { status: 400 });
    }

    // Look up the registration by the secure opaque token
    const registration = await prisma.eventRegistration.findUnique({
      where: { qrToken },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true, amerigamId: true } },
        checkIns: true
      }
    });

    if (!registration) {
      return NextResponse.json({ error: 'Invalid QR Code. No registration found.' }, { status: 404 });
    }

    // Verify registration status
    if (registration.status !== 'APPROVED') {
      return NextResponse.json({ 
        error: `Registration is not approved (Current Status: ${registration.status})` 
      }, { status: 403 });
    }

    // Check if already checked in
    if (registration.checkIns && registration.checkIns.length > 0) {
      return NextResponse.json({ 
        alreadyCheckedIn: true, 
        message: 'Already Checked In',
        timestamp: registration.checkIns[0].timestamp,
        gate: registration.checkIns[0].gateInfo,
        participant: registration.user
      }, { status: 200 });
    }

    // Perform check-in securely using Prisma transaction if needed, 
    // but for simple check-ins, a create is fine.
    const checkIn = await prisma.eventCheckIn.create({
      data: {
        registrationId: registration.id,
        scannedById: staffId,
        gateInfo: gateInfo || 'Main Gate'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'CHECK-IN SUCCESSFUL',
      checkIn,
      participant: registration.user
    }, { status: 201 });

  } catch (error) {
    console.error('Error scanning QR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
