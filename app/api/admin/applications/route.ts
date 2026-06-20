// SPDX-License-Identifier: MIT

// GET /api/admin/applications
// Query: ?status=pending|approved|rejected (optional)
// Returns: { applications, counts }

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { listApplications, countApplications } from '@/lib/db/repos/marketplace';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  ensureInit();
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response!;

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
  const applications = listApplications(status || undefined, limit);
  const counts = {
    pending: countApplications('pending'),
    approved: countApplications('approved'),
    rejected: countApplications('rejected'),
  };

  return NextResponse.json({ applications, counts });
}
