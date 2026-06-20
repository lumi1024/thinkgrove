import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HermesAdapter } from '@/lib/external-agents/hermes/adapter';

describe('HermesAdapter', () => {
  let adapter: HermesAdapter;

  beforeEach(() => {
    adapter = new HermesAdapter({
      endpoint: 'http://127.0.0.1:8642',
      authToken: 'test-key',
    });
  });

  it('returns framework=hermes', () => {
    expect(adapter.framework).toBe('hermes');
  });

  it('healthCheck calls /health endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('OK', { status: 200 }) as Response,
    );
    const result = await adapter.healthCheck();
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:8642/health',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) }),
    );
    expect(result).toBe(true);
    fetchSpy.mockRestore();
  });

  it('invoke sends OpenAI-compatible request', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Hermes says hello' } }],
      model: 'hermes-2',
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }) as Response,
    );

    const result = await adapter.invoke({
      agentId: 'ext_hermes',
      action: 'answer',
      context: {
        topic: 'test topic',
        domain: 'ai',
        systemPrompt: 'be concise',
        maxTokens: 200,
      },
    });

    expect(result.text).toBe('Hermes says hello');
    expect(result.model).toBe('hermes-2');

    const [url, init] = (globalThis.fetch as any).mock.calls[0];
    expect(url).toBe('http://127.0.0.1:8642/v1/chat/completions');
    const body = JSON.parse(init.body);
    expect(body.messages).toContainEqual(
      expect.objectContaining({ role: 'system', content: 'be concise' }),
    );
    expect(body.messages).toContainEqual(
      expect.objectContaining({ role: 'user' }),
    );
  });

  it('invoke returns error text on non-200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Service Unavailable', { status: 503 }) as Response,
    );

    const result = await adapter.invoke({
      agentId: 'ext_hermes',
      action: 'answer',
      context: {
        topic: 'test',
        domain: 'ai',
        systemPrompt: '',
        maxTokens: 200,
      },
    });

    expect(result.text).toContain('503');
  });
});
