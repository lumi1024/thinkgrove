import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/ai/awaken/route';

// Mock config loader to return external agent
const mockAgents = [
  { id: 'ext_openclaw', framework: 'openclaw', endpoint: 'ws://127.0.0.1:18789', authToken: 'token', deviceId: 'dev', publicKey: 'key' },
];

vi.mock('@/lib/config/loader', () => ({
  loadAgentsFromYaml: vi.fn(() => mockAgents),
}));

// Mock DB layer — tests don't have a real database
vi.mock('@/lib/db/init', () => ({
  ensureInit: vi.fn(),
}));
vi.mock('@/lib/db/repos', () => ({
  getAgentState: vi.fn(() => null),
  resetAgentDailyIfStale: vi.fn(),
  bumpAgentAction: vi.fn(() => ({ actionsToday: 1, totalActions: 1 })),
  setAgentRest: vi.fn(),
  upsertUser: vi.fn(),
  createBranch: vi.fn(),
}));
vi.mock('@/lib/domains', () => ({
  domains: [{ id: 'ai', domain: 'AI' }],
}));
vi.mock('@/lib/ai/prompts', () => ({
  RESIDENT_PROMPTS: {},
  mockAwakenQuestion: vi.fn(),
}));

// Mock the external agent modules
vi.mock('@/lib/external-agents/resolver', () => ({
  ExternalAgentResolver: vi.fn(),
}));

vi.mock('@/lib/external-agents/offline-state', () => ({
  OfflineStateStore: vi.fn(),
}));

import { ExternalAgentResolver } from '@/lib/external-agents/resolver';
import { OfflineStateStore } from '@/lib/external-agents/offline-state';

describe('POST /api/ai/awaken with external agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes external agent awaken to adapter', async () => {
    const mockAdapter = {
      framework: 'openclaw',
      async invoke() {
        return { text: 'external question text', model: 'openclaw' };
      },
      healthCheck: vi.fn().mockResolvedValue(true),
      dispose: vi.fn(),
    };

    const mockStore = {
      isOffline: vi.fn().mockReturnValue(false),
      setOnline: vi.fn(),
      setOffline: vi.fn(),
    };

    vi.mocked(ExternalAgentResolver).mockReturnValue({
      resolve: vi.fn().mockReturnValue(mockAdapter),
    } as any);
    vi.mocked(OfflineStateStore).mockReturnValue(mockStore as any);

    const req = new Request('http://localhost:3000/api/ai/awaken', {
      method: 'POST',
      body: JSON.stringify({
        agentId: 'ext_openclaw',
        domainId: 'ai',
      }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.title).toBe('external question text');
  });
});
