// SPDX-License-Identifier: MIT

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, deleteAdminSession } from '@/lib/admin-session';
import { getDb } from '@/lib/db/pool';

const COOKIE_NAME = 'tg_admin';

export function isAdminConfigured(): boolean {
  return (process.env.ADMIN_KEY || '').length > 0;
}

export async function adminLogin(cookieValue: string): Promise<{ success: boolean; sessionId?: string }> {
  const adminKey = process.env.ADMIN_KEY || '';
  if (!adminKey) return { success: false };
  if (cookieValue !== adminKey) return { success: false };

  const session = createAdminSession(cookieValue);
  return { success: true, sessionId: session.id };
}

export async function adminLogout(sessionId?: string): Promise<NextResponse> {
  if (sessionId) {
    deleteAdminSession(sessionId);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export function extractSessionId(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

export function requireAdmin(request: NextRequest): { ok: boolean; sessionId?: string; response?: NextResponse } {
  const sessionId = extractSessionId(request);
  if (!sessionId) {
    return { ok: false, response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }

  const db = getDb();
  const row = db.prepare('SELECT id FROM admin_sessions WHERE id = ? AND expires_at > datetime("now")').get(sessionId) as { id: string } | undefined;
  if (!row) {
    return { ok: false, response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }

  return { ok: true, sessionId: row.id };
}
