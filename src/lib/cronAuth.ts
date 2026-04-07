// Shared cron auth helper — called at the top of every /api/cron/* route
// Accepts either:
//   1. Authorization: Bearer <CRON_SECRET>   (GitHub Actions)
//   2. x-vercel-cron header                  (Vercel Cron, auto-set by platform)

import { NextRequest, NextResponse } from 'next/server';

export function verifyCronAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  // Vercel platform header (trusted on Vercel infra)
  if (req.headers.get('x-vercel-cron') === '1') return null; // allowed

  // Bearer token (GitHub Actions / manual)
  const auth = req.headers.get('authorization') || '';
  if (secret && auth === `Bearer ${secret}`) return null; // allowed

  // In development, always allow
  if (process.env.NODE_ENV === 'development') return null;

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
