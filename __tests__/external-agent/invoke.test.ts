import { vi } from 'vitest';

const { mockLoadAgents, mockResolverState, mockStore } = vi.hoisted(() => {
  const store: any = {
    isOffline: vi.fn().mockReturnValue(false),
    setOffline: vi.fn(),
    setOnline: vi.fn(),
  };
  const resolverState: any = {
    resolve: vi.fn().mockReturnValue(null),
  };
  return {
    mockLoadAgents: vi.fn().mockReturnValue([]),
    mockResolverState: resolverState,
    mockStore: store,
  };
});

vi.mock('@/lib/config/loader', () => ({
  loadAgentsFromYaml: () => mockLoadAgents(),
}));

vi.mock('@/lib/external-agents/resolver', () => ({
  ExternalAgentResolver: vi.fn().mockImplementation(() => mockResolverState),
}));

vi.mock('@/lib/external-agents/offline-state', () => ({
  OfflineStateStore: vi.fn().mockImplementation(() => mockStore),
}));

import { POST } from '@/app/api/external-agent/invoke/route';

describe('POST /api/external-agent/invoke', () => {
  beforeEach(() => {
    mockResolverState.resolve.mockReturnValue(null);
    mockLoadAgents.mockReturnValue([]);
    mockStore.isOffline.mockReturnValue(false);
    mockStore.setOffline.mockClear();
    mockStore.setOnline.mockClear();
  });

  it('returns 400 for missing agentId', async () => {
    const req = new Request('http://localhost:3000/api/external-agent/invoke', {
      method: 'POST',
      body: JSON.stringify({ action: 'answer' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-external agent', async () => {
    mockLoadAgents.mockReturnValue([
      { id: 'ai_atlas_sage', kind: 'ai', framework: undefined as any },
    ]);

    const req = new Request('http://localhost:3000/api/external-agent/invoke', {
      method: 'POST',
      body: JSON.stringify({
        agentId: 'ai_atlas_sage',
        action: 'answer',
        context: { topic: 't', domain: 'd', systemPrompt: '', maxTokens: 100 },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('returns 503 when agent is offline', async () => {
    mockLoadAgents.mockReturnValue([
      { id: 'ext_hermes', framework: 'hermes', endpoint: 'http://127.0.0.1:8642', authToken: 'key' },
    ]);
    mockStore.isOffline.mockReturnValue(true);

    const req = new Request('http://localhost:3000/api/external-agent/invoke', {
      method: 'POST',
      body: JSON.stringify({
        agentId: 'ext_hermes',
        action: 'answer',
        context: { topic: 't', domain: 'd', systemPrompt: '', maxTokens: 100 },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it('returns 503 when adapter is unavailable', async () => {
    mockLoadAgents.mockReturnValue([
      { id: 'ext_hermes', framework: 'hermes', endpoint: 'http://127.0.0.1:8642', authToken: 'key' },
    ]);
    mockResolverState.resolve.mockReturnValue(null);

    const req = new Request('http://localhost:3000/api/external-agent/invoke', {
      method: 'POST',
      body: JSON.stringify({
        agentId: 'ext_hermes',
        action: 'answer',
        context: { topic: 't', domain: 'd', systemPrompt: '', maxTokens: 100 },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it('returns 200 with result on successful invoke', async () => {
    mockLoadAgents.mockReturnValue([
      { id: 'ext_hermes', framework: 'hermes', endpoint: 'http://127.0.0.1:8642', authToken: 'key' },
    ]);

    const mockAdapter = {
      framework: 'hermes',
      invoke: vi.fn().mockResolvedValue({ text: 'hello from hermes', model: 'hermes-2' }),
      healthCheck: vi.fn().mockResolvedValue(true),
      dispose: vi.fn(),
    };
    mockResolverState.resolve.mockReturnValue(mockAdapter);

    const req = new Request('http://localhost:3000/api/external-agent/invoke', {
      method: 'POST',
      body: JSON.stringify({
        agentId: 'ext_hermes',
        action: 'answer',
        context: { topic: 'test', domain: 'ai', systemPrompt: '', maxTokens: 100 },
      }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.text).toBe('hello from hermes');
    expect(mockStore.setOnline).toHaveBeenCalledWith('ext_hermes');
  });
});
