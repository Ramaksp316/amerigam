import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const models = await prisma.competitionModel.findMany({
      where: { creatorId: userId },
      include: {
        _count: {
          select: { nodes: true, competitions: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching competition models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const model = await prisma.competitionModel.create({
      data: {
        name,
        description,
        creatorId: userId,
        nodes: {
          create: [
            {
              type: 'START',
              name: 'Start',
              config: JSON.stringify({}),
              positionX: 250,
              positionY: 50
            }
          ]
        }
      }
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    console.error('Error creating competition model:', error);
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
  }
}
