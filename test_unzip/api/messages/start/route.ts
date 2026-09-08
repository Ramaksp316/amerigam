import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetId = searchParams.get('targetId');

  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  if (!targetId) {
    return NextResponse.redirect(new URL('/messages', baseUrl));
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  // Find existing conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: userId, user2Id: targetId },
        { user1Id: targetId, user2Id: userId }
      ]
    }
  });

  // Create if not exists
  if (!conversation) {
    const [user1Id, user2Id] = [userId, targetId].sort();
    conversation = await prisma.conversation.create({
      data: {
        user1Id,
        user2Id
      }
    });
  }

  return NextResponse.redirect(new URL(`/messages/${conversation.id}`, baseUrl));
}
