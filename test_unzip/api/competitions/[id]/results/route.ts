import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.accountType !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Only Competition Organizations can manage results.' }, { status: 403 });
    }

    const { id } = await params;
    const { results, action } = await req.json(); // results: [{ rank, registrationId }], action: 'DRAFT' | 'PUBLISH'

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    if (event.creatorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate unique ranks and registrations
    const assignedRanks = new Set();
    const assignedRegs = new Set();

    for (const r of results) {
      if (assignedRanks.has(r.rank)) {
        return NextResponse.json({ error: 'Duplicate rank assigned' }, { status: 400 });
      }
      if (assignedRegs.has(r.registrationId)) {
        return NextResponse.json({ error: 'Duplicate participant assigned' }, { status: 400 });
      }
      assignedRanks.add(r.rank);
      assignedRegs.add(r.registrationId);

      // Verify participant belongs to this event
      const reg = event.registrations.find(reg => reg.id === r.registrationId);
      if (!reg) {
        return NextResponse.json({ error: `Participant ${r.registrationId} not found in this competition` }, { status: 400 });
      }
    }

    // Perform inside a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing results for this event to rebuild them
      await tx.eventResult.deleteMany({
        where: { eventId: id }
      });

      // 2. Create new results
      if (results.length > 0) {
        const createData = results.map((r: any) => {
          const reg = event.registrations.find(reg => reg.id === r.registrationId);
          let type = 'TOP_10';
          if (r.rank === 1) type = 'WINNER';
          else if (r.rank === 2) type = 'RUNNER_UP';
          else if (r.rank === 3) type = 'THIRD';

          return {
            eventId: id,
            registrationId: r.registrationId,
            userId: reg!.userId,
            rank: r.rank,
            type,
            status: action === 'PUBLISH' ? 'PUBLISHED' : 'DRAFT',
            publishedAt: action === 'PUBLISH' ? new Date() : null,
          };
        });

        await tx.eventResult.createMany({
          data: createData
        });
      }

      // 3. Update Event status
      await tx.event.update({
        where: { id },
        data: {
          resultStatus: action === 'PUBLISH' ? 'PUBLISHED' : 'DRAFT',
          status: action === 'PUBLISH' ? 'COMPLETED' : event.status
        }
      });
    });

    let apProcessingError = null;
    if (action === 'PUBLISH') {
      try {
        const { awardCompetitionAP } = await import('@/lib/ap-service');
        await awardCompetitionAP(id);
      } catch (apErr: any) {
        console.error('AP Processing failed:', apErr);
        apProcessingError = apErr.message || 'Failed to award AP';
      }
    }

    return NextResponse.json({ success: true, apProcessingError });
  } catch (error: any) {
    console.error('Error saving results:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
