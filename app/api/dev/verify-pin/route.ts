import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, SESSION_COOKIE, SESSION_VALUE } from '@/lib/dev-auth';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json({ success: false, error: 'PIN required' }, { status: 400 });
    }

    if (!verifyPin(pin)) {
      // Small delay to prevent brute force
      await new Promise(r => setTimeout(r, 1500));
      return NextResponse.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
