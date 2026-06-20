// SPDX-License-Identifier: MIT

// GET /api/admin/applications/:id
// Returns: single application detail

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { getApplication } from '@/lib/db/repos/marketplace';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  ensureInit();
  const auth = requireAdmin(_req);
  if (!auth.ok) return auth.response!;

  const { id } = await ctx.params;
  const app = getApplication(id);
  if (!app) {
    return NextResponse.json({ error: 'application not found' }, { status: 404 });
  }
  return NextResponse.json({ application: app });
}
