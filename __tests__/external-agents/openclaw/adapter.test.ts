import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenClawAdapter } from '@/lib/external-agents/openclaw/adapter';

describe('OpenClawAdapter', () => {
  let adapter: OpenClawAdapter;

  beforeEach(() => {
    adapter = new OpenClawAdapter({
      endpoint: 'ws://127.0.0.1:18789',
      deviceToken: 'token-123',
      deviceId: 'dev-123',
      publicKey: '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----',
    });
  });

  it('returns framework=openclaw', () => {
    expect(adapter.framework).toBe('openclaw');
  });

  it('healthCheck returns false when WS is unavailable', async () => {
    const originalConnect = (adapter as any).connect;
    (adapter as any).connect = async () => {
      throw new Error('connection refused');
    };

    const result = await adapter.healthCheck();
    expect(result).toBe(false);

    (adapter as any).connect = originalConnect;
  });

  it('invoke throws when not connected', async () => {
    vi.spyOn(adapter, 'healthCheck').mockResolvedValue(false);

    await expect(
      adapter.invoke({
        agentId: 'ext_openclaw',
        action: 'answer',
        context: {
          topic: 'test',
          domain: 'ai',
          systemPrompt: '',
          maxTokens: 200,
        },
      }),
    ).rejects.toThrow('OpenClaw adapter not connected');
  });

  it('dispose closes WS connection', async () => {
    const mockWs = { close: vi.fn(), send: vi.fn(), addEventListener: vi.fn(), readyState: 0 };
    vi.spyOn(globalThis, 'WebSocket').mockReturnValue(mockWs as any);

    const freshAdapter = new OpenClawAdapter({
      endpoint: 'ws://127.0.0.1:18789',
      deviceToken: 'token',
      deviceId: 'dev',
      publicKey: 'key',
    });
    freshAdapter.dispose();
    expect(mockWs.close).toHaveBeenCalled();
  });
});
