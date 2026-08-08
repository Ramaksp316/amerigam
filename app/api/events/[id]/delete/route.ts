import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
