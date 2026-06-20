// SPDX-License-Identifier: MIT

// ThinkGrove · Admin route middleware
// 保护 /admin/* 路由，要求有效的 tg_admin cookie

import { NextRequest, NextResponse } from 'next/server';
import { isAdminConfigured } from '@/lib/admin-auth';

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

  const { verifyAdminRequest } = require('@/lib/admin-auth');
  const valid = verifyAdminRequest(request);
  if (!valid) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
