// SPDX-License-Identifier: MIT

// DELETE /api/admin/logout
// Clears admin session cookie

import { NextResponse } from 'next/server';
import { adminLogout } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  return adminLogout();
}
