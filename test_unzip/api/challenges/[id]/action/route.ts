import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { awardChallengeAP } from '../../../../../lib/ap-service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('userId')?.value;
    
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, proofText } = body;

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });

    const isChallenger = currentUserId === challenge.challengerId;
    const isChallenged = currentUserId === challenge.challengedId;

    if (action === 'ACCEPT' && isChallenged && challenge.status === 'PENDING') {
      await prisma.challenge.update({ where: { id }, data: { status: 'ACTIVE', acceptedAt: new Date() } });
      return NextResponse.json({ success: true });
    }

    if (action === 'DECLINE' && isChallenged && challenge.status === 'PENDING') {
      await prisma.challenge.update({ where: { id }, data: { status: 'DECLINED' } });
      return NextResponse.json({ success: true });
    }

    if (action === 'CANCEL' && isChallenger && challenge.status === 'PENDING') {
      await prisma.challenge.update({ where: { id }, data: { status: 'CANCELLED' } });
      return NextResponse.json({ success: true });
    }

    if (action === 'SUBMIT' && isChallenged && challenge.status === 'ACTIVE') {
      await prisma.challenge.update({ where: { id }, data: { status: 'SUBMITTED', proofText } });
      return NextResponse.json({ success: true });
    }

    if (action === 'REJECT' && isChallenger && challenge.status === 'SUBMITTED') {
      await prisma.challenge.update({ where: { id }, data: { status: 'ACTIVE' } });
      return NextResponse.json({ success: true });
    }

    if (action === 'APPROVE' && isChallenger && challenge.status === 'SUBMITTED') {
      // 1. Update status
      await prisma.challenge.update({ where: { id }, data: { status: 'COMPLETED' } });
      
      // 2. Award AP to the challenged user exactly once (duplicate protection handled in ap-service and db unique constraint)
      await awardChallengeAP(challenge.challengedId, challenge.id, challenge.title, challenge.difficulty);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action or state' }, { status: 400 });

  } catch (error: any) {
    console.error('Challenge action error:', error);
    if (error.code === 'P2002') { // Unique constraint failed (duplicate AP)
      return NextResponse.json({ success: true, message: 'Already awarded' });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
