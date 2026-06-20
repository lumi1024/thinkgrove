// SPDX-License-Identifier: MIT

// ThinkGrove · Admin route middleware
// 保护 /admin/* 路由，要求有效的 tg_admin cookie

import { NextRequest, NextResponse } from 'next/server';
import { isAdminConfigured } from '@/lib/admin-auth';
import { getDb } from '@/lib/db/pool';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  if (!isAdminConfigured()) {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get('tg_admin');
  if (!adminCookie?.value) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const db = getDb();
  const row = db.prepare('SELECT id FROM admin_sessions WHERE id = ? AND expires_at > datetime("now")').get(adminCookie.value) as { id: string } | undefined;
  if (!row) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
