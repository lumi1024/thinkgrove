// SPDX-License-Identifier: MIT

// ThinkGrove · Admin route middleware
// 保护 /admin/* 路由，要求有效的 tg_admin cookie
// 注意：中间件在 Edge Runtime 中运行，无法访问 better-sqlite3
// Session 有效性验证在 API 路由中通过 requireAdmin() 完成

import { NextRequest, NextResponse } from 'next/server';

function isAdminConfigured(): boolean {
  return (process.env.ADMIN_KEY || '').length > 0;
}

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
