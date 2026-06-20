// SPDX-License-Identifier: MIT

// POST /api/admin/login
// Body: { adminKey }
// Returns: { ok: true } + sets httpOnly cookie

import { NextResponse } from 'next/server';
import { adminLogin, isAdminConfigured } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { adminKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const adminKey = body.adminKey?.trim();
  if (!adminKey) {
    return NextResponse.json({ error: 'adminKey required' }, { status: 400 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'admin auth not configured' }, { status: 503 });
  }

  const result = await adminLogin(adminKey);
  if (!result.success) {
    return NextResponse.json({ error: 'invalid admin key' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('tg_admin', result.sessionId!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 3600,
    path: '/',
  });
  return response;
}
