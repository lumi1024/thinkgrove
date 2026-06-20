import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExternalAgentResolver } from '@/lib/external-agents/resolver';
import { HermesAdapter } from '@/lib/external-agents/hermes/adapter';
import { OpenClawAdapter } from '@/lib/external-agents/openclaw/adapter';

describe('ExternalAgentResolver', () => {
  let resolver: ExternalAgentResolver;

  beforeEach(() => {
    resolver = new ExternalAgentResolver();
    vi.clearAllMocks();
  });

  it('returns null for non-external agent', () => {
    expect(resolver.resolve({ id: 'ai_atlas_sage', framework: '', endpoint: '' })).toBeNull();
  });

  it('creates HermesAdapter for hermes framework', () => {
    const adapter = resolver.resolve({
      id: 'ext_hermes',
      framework: 'hermes',
      endpoint: 'http://127.0.0.1:8642',
      authToken: 'key-123',
    });
    expect(adapter).toBeInstanceOf(HermesAdapter);
    expect(adapter?.framework).toBe('hermes');
  });

  it('creates OpenClawAdapter for openclaw framework', () => {
    const adapter = resolver.resolve({
      id: 'ext_openclaw',
      framework: 'openclaw',
      endpoint: 'ws://127.0.0.1:18789',
      authToken: 'token-123',
      deviceId: 'dev-123',
      publicKey: 'key',
    });
    expect(adapter).toBeInstanceOf(OpenClawAdapter);
    expect(adapter?.framework).toBe('openclaw');
  });

  it('skips adapter creation when authToken env var is missing', () => {
    const adapter = resolver.resolve({
      id: 'ext_hermes',
      framework: 'hermes',
      endpoint: 'http://127.0.0.1:8642',
      authToken: '${MISSING_VAR}',
    });
    expect(adapter).toBeNull();
  });

  it('resolves env var references in authToken', () => {
    process.env.TEST_RESOLVER_KEY = 'resolved-value';
    const adapter = resolver.resolve({
      id: 'ext_hermes',
      framework: 'hermes',
      endpoint: 'http://127.0.0.1:8642',
      authToken: '${TEST_RESOLVER_KEY}',
    });
    expect(adapter).not.toBeNull();
    delete process.env.TEST_RESOLVER_KEY;
  });
});
