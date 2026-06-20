import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { loadAgentsFromYaml } from '@/lib/config/loader';
import { ExternalAgentResolver } from '@/lib/external-agents/resolver';
import { OfflineStateStore } from '@/lib/external-agents/offline-state';

export const dynamic = 'force-dynamic';

const resolver = new ExternalAgentResolver();
const offlineStore = new OfflineStateStore();

interface InvokeBody {
  agentId: string;
  action: 'answer' | 'awaken';
  context: {
    topic: string;
    domain: string;
    systemPrompt: string;
    maxTokens: number;
  };
}

export async function POST(req: Request) {
  ensureInit();
  let body: InvokeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.agentId || !body?.action || !body?.context) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const agents = loadAgentsFromYaml();
  const agentConfig = agents.find((a) => a.id === body.agentId);

  if (!agentConfig?.framework) {
    return NextResponse.json({ error: 'agent not found or not external' }, { status: 404 });
  }

  if (offlineStore.isOffline(body.agentId)) {
    return NextResponse.json({ offline: true, error: 'agent is offline' }, { status: 503 });
  }

  const adapter = resolver.resolve({
    id: agentConfig.id,
    framework: agentConfig.framework,
    endpoint: agentConfig.endpoint || '',
    authToken: agentConfig.authToken,
    deviceId: agentConfig.deviceId,
    publicKey: agentConfig.publicKey,
  });

  if (!adapter) {
    offlineStore.setOffline(body.agentId);
    return NextResponse.json({ offline: true, error: 'adapter unavailable' }, { status: 503 });
  }

  try {
    const result = await adapter.invoke({
      agentId: body.agentId,
      action: body.action,
      context: body.context,
    });
    offlineStore.setOnline(body.agentId);
    return NextResponse.json({ ...result, ok: true });
  } catch (e) {
    offlineStore.setOffline(body.agentId);
    return NextResponse.json(
      { offline: true, error: (e as Error).message },
      { status: 503 },
    );
  }
}
