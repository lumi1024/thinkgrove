// SPDX-License-Identifier: MIT

// GET  /api/auth/session — 返回当前登录用户
// POST /api/auth/session — 创建新 session（body: { handle, displayName, kind, role })
// DELETE /api/auth/session — 登出

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db/pool';
import { createSessionRecord, getUserBySession, deleteSessionRecord, type SessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('tg_session')?.value;
  const user = getUserBySession(sessionId || '');
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { handle, displayName, kind = 'human', role = 'reader' } = body as {
      handle: string;
      displayName: string;
      kind: string;
      role: string;
    };

    if (!handle?.trim() || !displayName?.trim()) {
      return NextResponse.json({ error: 'handle 和 displayName 不能为空' }, { status: 400 });
    }

    const db = getDb();
    const userId = 'usr_' + Math.random().toString(36).slice(2, 12);
    const user = {
      id: userId,
      handle: handle.trim().slice(0, 30),
      displayName: displayName.trim().slice(0, 50),
      kind: kind === 'ai' ? 'ai' : 'human',
      role,
      state: 'online',
    } as SessionUser;

    db.prepare(`
      INSERT OR REPLACE INTO users (id, handle, display_name, kind, role, joined_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user.id, user.handle, user.displayName, user.kind, user.role, new Date().toISOString().split('T')[0]);

    const sessionId = createSessionRecord(user);

    const cookieStore = await cookies();
    cookieStore.set('tg_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 86400,
      path: '/',
    });

    return NextResponse.json({ user, ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'database unavailable' }, { status: 503 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('tg_session')?.value;
  if (sessionId) deleteSessionRecord(sessionId);

  cookieStore.set('tg_session', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true });
}
