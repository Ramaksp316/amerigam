import { NextRequest, NextResponse } from 'next/server';
import { isDevAuthenticatedFromRequest } from '@/lib/dev-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;
    const resolved = req.nextUrl.searchParams.get('resolved') === 'true';

    const [errors, total] = await Promise.all([
      prisma.devErrorLog.findMany({
        where: { resolved },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }).catch(() => []),
      prisma.devErrorLog.count({ where: { resolved } }).catch(() => 0),
    ]);

    return NextResponse.json({ errors, total });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // This endpoint logs errors — called from error.tsx boundary
  try {
    const body = await req.json();
    const { digest, message, stack, url, userId, userEmail, userAgent } = body;

    await prisma.devErrorLog.create({
      data: { digest, message, stack, url, userId, userEmail, userAgent },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    await prisma.devErrorLog.update({ where: { id }, data: { resolved: true } }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to resolve error' }, { status: 500 });
  }
}
