import { NextRequest, NextResponse } from 'next/server';
import { isDevAuthenticatedFromRequest } from '@/lib/dev-auth';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

webpush.setVapidDetails(
  'mailto:admin@amerigam.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Store subscriptions in memory (for now — can move to DB later)
const devSubscriptions: webpush.PushSubscription[] = [];

export async function POST(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sub = await req.json();
    // Add if not already stored
    const exists = devSubscriptions.some(s => s.endpoint === sub.endpoint);
    if (!exists) devSubscriptions.push(sub);

    return NextResponse.json({ success: true, count: devSubscriptions.length });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// Internal helper — used by activity/errors to send push
export async function sendDevPush(title: string, body: string, icon = '/amerigam-logo-transparent.png') {
  const payload = JSON.stringify({ title, body, icon });
  const results = await Promise.allSettled(
    devSubscriptions.map(sub => webpush.sendNotification(sub, payload))
  );
  // Remove invalid subscriptions
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      devSubscriptions.splice(i, 1);
    }
  });
}
