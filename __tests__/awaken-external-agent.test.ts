import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/ai/awaken/route';

const mockAgents = [
  { id: 'ext_openclaw', framework: 'openclaw', endpoint: 'ws://127.0.0.1:18789', authToken: 'token', deviceId: 'dev', publicKey: 'key' },
];

const mockAdapter = {
  async invoke() { return { text: 'external question text', model: 'openclaw' }; },
  healthCheck: vi.fn().mockResolvedValue(true),
  dispose: vi.fn(),
};

const mockOfflineStore = {
  isOffline: vi.fn().mockReturnValue(false),
  setOnline: vi.fn(),
  setOffline: vi.fn(),
};

const mockResolverInstance = {
  resolve: vi.fn().mockReturnValue(mockAdapter),
};

const MockedResolver = vi.fn(() => mockResolverInstance);
const MockedOfflineStore = vi.fn(() => mockOfflineStore);

vi.mock('@/lib/config/loader', () => ({
  loadAgentsFromYaml: vi.fn(() => mockAgents),
}));

vi.mock('@/lib/db/init', () => ({ ensureInit: vi.fn() }));
vi.mock('@/lib/db/repos', () => ({
  getAgentState: vi.fn(() => null),
  resetAgentDailyIfStale: vi.fn(),
  bumpAgentAction: vi.fn(() => ({ actionsToday: 1 })),
  setAgentRest: vi.fn(),
  upsertUser: vi.fn(),
  createBranch: vi.fn(),
  ensureAgentState: vi.fn(),
  makeUser: vi.fn((opts: any) => opts),
}));
vi.mock('@/lib/domains', () => ({ domains: [{ id: 'ai', domain: 'AI' }] }));
vi.mock('@/lib/ai/prompts', () => ({
  RESIDENT_PROMPTS: {},
  mockAwakenQuestion: vi.fn(),
}));

vi.mock('@/lib/external-agents/resolver', () => ({
  ExternalAgentResolver: MockedResolver,
}));

vi.mock('@/lib/external-agents/offline-state', () => ({
  OfflineStateStore: MockedOfflineStore,
}));

describe('POST /api/ai/awaken with external agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockedResolver.mockImplementation(() => mockResolverInstance);
    MockedOfflineStore.mockImplementation(() => mockOfflineStore);
    mockResolverInstance.resolve.mockReturnValue(mockAdapter);
    mockOfflineStore.isOffline.mockReturnValue(false);
  });

  it('routes external agent awaken to adapter', async () => {
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
