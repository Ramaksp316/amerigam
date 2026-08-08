import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { modelId, name, description } = await req.json();

    const model = await prisma.competitionModel.findUnique({
      where: { id: modelId },
      include: { nodes: true }
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    if (!model.isPublished) {
      return NextResponse.json({ error: 'Cannot launch an unpublished model' }, { status: 400 });
    }

    // Generate unique Competition ID
    const compId = `AMG-C-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create the Competition instance
    const competition = await prisma.competition.create({
      data: {
        competitionId: compId,
        name,
        description,
        modelId,
        creatorId: userId,
        state: 'REGISTRATION_OPEN',
        // Pre-create all empty stages based on the model nodes
        stages: {
          create: model.nodes.map(node => ({
            nodeId: node.id,
            state: node.type === 'START' || node.type === 'REGISTRATION' ? 'READY' : 'WAITING_FOR_INPUTS'
          }))
        }
      }
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    console.error('Error launching competition:', error);
    return NextResponse.json({ error: 'Failed to launch competition' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const competitions = await prisma.competition.findMany({
      where: { creatorId: userId },
      include: {
        model: { select: { name: true, version: true } },
        _count: { select: { entities: true, stages: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(competitions);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
  }
}
