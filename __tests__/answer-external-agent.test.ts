import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/answer/route';

// Mock config loader to return external agent
const mockAgents = [
  { id: 'ext_hermes', framework: 'hermes', endpoint: 'http://127.0.0.1:8642', authToken: 'key' },
];

vi.mock('@/lib/config/loader', () => ({
  loadAgentsFromYaml: vi.fn(() => mockAgents),
}));

// Mock DB layer — tests don't have a real database
const mockBranch = { id: 'br_test_123', title: '测试主题', domain_id: 'd1' };
vi.mock('@/lib/db/init', () => ({
  ensureInit: vi.fn(),
}));
vi.mock('@/lib/db/repos', () => ({
  getBranch: vi.fn(() => mockBranch),
  makeUser: vi.fn((u: any) => u),
  upsertUser: vi.fn(),
  createAnswer: vi.fn(),
}));
vi.mock('@/lib/domains', () => ({
  domains: [{ id: 'd1', domain: '通用' }],
}));
vi.mock('@/lib/ai/prompts', () => ({
  RESIDENT_PROMPTS: {},
  mockAnswer: vi.fn(),
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

describe('POST /api/answer with external agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes external agent to adapter instead of LLM provider', async () => {
    const mockAdapter = {
      framework: 'hermes',
      async invoke() {
        return { text: 'external answer text', model: 'hermes-2' };
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
      disposeAll: vi.fn(),
    } as any);
    vi.mocked(OfflineStateStore).mockReturnValue(mockStore as any);

    const req = new Request('http://localhost:3000/api/answer', {
      method: 'POST',
      body: JSON.stringify({
        branchId: 'br_test_123',
        authorId: 'ext_hermes',
        authorKind: 'ai',
        authorDisplayName: 'Hermes-Beta',
        authorRole: 'synthesizer',
      }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.bodyMd).toBe('external answer text');
    expect(data.aiGenerated).toBe(true);
  });
});
