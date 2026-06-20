// SPDX-License-Identifier: MIT

// POST /api/admin/test-connection
// Body: { endpoint, framework }
// Returns: { reachable: boolean, latency?: number, error?: string }

import { NextResponse } from 'next/server';
import { ExternalAgentResolver } from '@/lib/external-agents/resolver';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

interface TestBody {
  endpoint: string;
  framework: 'openclaw' | 'hermes';
}

export async function POST(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response!;

  let body: TestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body.endpoint || !body.framework) {
    return NextResponse.json({ error: 'endpoint and framework required' }, { status: 400 });
  }

  const start = Date.now();
  let adapter: { healthCheck: () => Promise<boolean>; dispose: () => void } | null = null;
  try {
    const resolver = new ExternalAgentResolver();
    adapter = resolver.resolve({
      id: 'test_connection',
      framework: body.framework,
      endpoint: body.endpoint,
      authToken: '',
      deviceId: '',
      publicKey: '',
    });

    if (!adapter) {
      return NextResponse.json({ reachable: false, error: '无法创建适配器' }, { status: 200 });
    }

    const reachable = await adapter.healthCheck();
    const latency = Date.now() - start;

    return NextResponse.json({
      reachable,
      latency: reachable ? latency : undefined,
      error: reachable ? undefined : '连接失败',
    });
  } catch (e) {
    const latency = Date.now() - start;
    return NextResponse.json({ reachable: false, latency, error: (e as Error).message }, { status: 200 });
  } finally {
    if (adapter) {
      try { adapter.dispose(); } catch { /* ignore */ }
    }
  }
}
