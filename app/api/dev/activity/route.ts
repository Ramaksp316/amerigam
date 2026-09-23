import { NextRequest, NextResponse } from 'next/server';
import { isDevAuthenticatedFromRequest } from '@/lib/dev-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// SSE Live Activity Stream — browser stays connected, server pushes events
export async function GET(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      // Send initial snapshot of truly online users (active within last 3 minutes)
      const activeThreshold = new Date(Date.now() - 3 * 60 * 1000);
      const onlineUsers = await prisma.user.findMany({
        where: { lastSeen: { gte: activeThreshold } },
        orderBy: { lastSeen: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          status: true,
          lastSeen: true,
          city: true,
          country: true,
          createdAt: true,
          onboarded: true,
        },
      });

      // Recently seen users in last 24 hours (not currently online)
      const recentUsers = await prisma.user.findMany({
        where: {
          lastSeen: {
            lt: activeThreshold,
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { lastSeen: 'desc' },
        take: 10,
        select: {
          id: true,
          username: true,
          name: true,
          status: true,
          lastSeen: true,
          city: true,
          country: true,
        },
      });

      send({
        type: 'snapshot',
        onlineUsers,
        recentUsers,
        users: onlineUsers,
        timestamp: new Date().toISOString(),
      });

      // Poll for changes every 5 seconds
      let lastCheck = new Date();
      const interval = setInterval(async () => {
        try {
          // New signups since last check
          const newUsers = await prisma.user.findMany({
            where: { createdAt: { gt: lastCheck } },
            select: {
              id: true, username: true, name: true, email: true,
              createdAt: true, city: true, country: true, onboarded: true,
            },
          });

          if (newUsers.length > 0) {
            newUsers.forEach(u => {
              send({
                type: 'new_signup',
                user: u,
                timestamp: new Date().toISOString(),
                message: `✨ New signup: @${u.username || u.name} (${u.city || u.country || 'Unknown'})`,
              });
            });
          }

          // Real-time active users (active within last 3 minutes)
          const currentActive = new Date(Date.now() - 3 * 60 * 1000);
          const activeUsers = await prisma.user.findMany({
            where: { lastSeen: { gte: currentActive } },
            orderBy: { lastSeen: 'desc' },
            select: {
              id: true, username: true, name: true, status: true,
              lastSeen: true, city: true, country: true,
            },
          });

          send({
            type: 'active_pulse',
            users: activeUsers,
            count: activeUsers.length,
            timestamp: new Date().toISOString(),
          });

          // New errors
          const newErrors = await prisma.devErrorLog.findMany({
            where: { createdAt: { gt: lastCheck }, resolved: false },
          }).catch(() => []);

          if (newErrors.length > 0) {
            newErrors.forEach(err => {
              send({
                type: 'new_error',
                error: err,
                timestamp: new Date().toISOString(),
                message: `⚠️ Error on ${err.url || 'unknown page'}: ${err.message?.slice(0, 80)}`,
              });
            });
          }

          lastCheck = new Date();
        } catch {}
      }, 5000);

      // Heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          clearInterval(interval);
        }
      }, 15000);

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
