// SPDX-License-Identifier: MIT

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, findAdminSession, deleteAdminSession } from '@/lib/admin-session';
import crypto from 'crypto';

function getAdminKey(): string {
  return process.env.ADMIN_KEY || '';
}

const COOKIE_NAME = 'tg_admin';
const COOKIE_MAX_AGE = 24 * 3600;

export function isAdminConfigured(): boolean {
  return getAdminKey().length > 0;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token + (process.env.ADMIN_SALT || 'tg-admin-salt')).digest('hex');
}

export async function adminLogin(cookieValue: string): Promise<{ success: boolean; sessionId?: string }> {
  const adminKey = getAdminKey();
  if (!adminKey) return { success: false };
  if (cookieValue !== adminKey) return { success: false };

  const tokenHash = hashToken(cookieValue);
  const session = createAdminSession(tokenHash);
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

export function verifyAdminRequest(request: NextRequest): boolean {
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookieValue) return false;

  const tokenHash = hashToken(cookieValue);
  const session = findAdminSession(tokenHash);
  return session !== null;
}

export function extractSessionIdFromRequest(request: NextRequest): string | null {
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookieValue) return null;

  const tokenHash = hashToken(cookieValue);
  const session = findAdminSession(tokenHash);
  return session?.id ?? null;
}
