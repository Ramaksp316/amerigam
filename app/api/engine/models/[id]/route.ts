import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const model = await prisma.competitionModel.findUnique({
      where: { id },
      include: {
        nodes: true,
        connections: true
      }
    });

    if (!model) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (model.creatorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, nodes, connections, isPublished } = body;

    const existingModel = await prisma.competitionModel.findUnique({ where: { id } });
    
    if (!existingModel) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existingModel.creatorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existingModel.isPublished && isPublished === undefined) {
      // Prevent structural changes if published
      return NextResponse.json({ error: 'Cannot modify a published model. Clone it instead.' }, { status: 400 });
    }

    // Transaction to update model, nodes, and connections
    await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.competitionModel.update({
        where: { id },
        data: {
          name: name !== undefined ? name : existingModel.name,
          description: description !== undefined ? description : existingModel.description,
          isPublished: isPublished !== undefined ? isPublished : existingModel.isPublished,
          version: existingModel.version + 1
        }
      });

      // 2. If nodes/connections are provided, sync them
      if (nodes && Array.isArray(nodes)) {
        // Delete existing nodes and connections
        await tx.modelConnection.deleteMany({ where: { modelId: id } });
        await tx.modelNode.deleteMany({ where: { modelId: id } });

        // Create new nodes
        for (const node of nodes) {
          await tx.modelNode.create({
            data: {
              id: node.id,
              modelId: id,
              type: node.type,
              name: node.name,
              config: typeof node.config === 'string' ? node.config : JSON.stringify(node.config || {}),
              positionX: node.positionX || 0,
              positionY: node.positionY || 0,
            }
          });
        }

        // Create new connections
        if (connections && Array.isArray(connections)) {
          for (const conn of connections) {
            await tx.modelConnection.create({
              data: {
                id: conn.id,
                modelId: id,
                sourceId: conn.sourceId,
                targetId: conn.targetId,
                condition: conn.condition || null
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
  }
}
