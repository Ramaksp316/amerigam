import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('userId')?.value;
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      challengedId, 
      title, 
      objective, 
      category, 
      tags, 
      difficulty, 
      startDate, 
      endDate, 
      completionReq, 
      proofReq, 
      rules 
    } = body;

    if (!challengedId || !title || !objective || !difficulty || !proofReq) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auth verification
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    const targetUser = await prisma.user.findUnique({ where: { id: challengedId } });

    if (!currentUser || currentUser.accountType !== 'PERSONAL') {
      return NextResponse.json({ error: 'Only Personal accounts can send challenges' }, { status: 403 });
    }

    if (!targetUser || targetUser.accountType !== 'PERSONAL') {
      return NextResponse.json({ error: 'Challenges can only be sent to Personal accounts' }, { status: 403 });
    }
    
    if (currentUser.id === targetUser.id) {
      return NextResponse.json({ error: 'Cannot challenge yourself' }, { status: 400 });
    }

    // Duplicate pending check
    const existingPending = await prisma.challenge.findFirst({
      where: {
        challengerId: currentUser.id,
        challengedId: targetUser.id,
        title: title,
        status: 'PENDING'
      }
    });

    if (existingPending) {
      return NextResponse.json({ error: 'An identical pending challenge request already exists for this user.' }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        challengerId: currentUser.id,
        challengedId: targetUser.id,
        title,
        objective,
        category: category || null,
        tags: tags || [],
        difficulty,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        completionReq: completionReq || null,
        proofReq,
        rules: rules || null,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, challengeId: challenge.id });
  } catch (error) {
    console.error('Create challenge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
