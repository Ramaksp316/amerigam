import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SESSION_COOKIE = 'amg_dev_session';
const SESSION_VALUE = process.env.DEV_BOARD_SECRET || 'amg_dev_2026_s3cr3t_k3y';

export async function isDevAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_VALUE;
}

export function isDevAuthenticatedFromRequest(req: NextRequest): boolean {
  const session = req.cookies.get(SESSION_COOKIE);
  return session?.value === SESSION_VALUE;
}

export function verifyPin(inputPin: string): boolean {
  const correctPin = process.env.DEV_BOARD_PIN;
  if (!correctPin) return false;
  return inputPin === correctPin;
}

export { SESSION_COOKIE, SESSION_VALUE };
