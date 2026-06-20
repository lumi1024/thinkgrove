import { describe, it, expect } from 'vitest';
import type { AgentConfig } from '@/lib/config/loader';

describe('AgentConfig with external agent fields', () => {
  it('accepts framework, endpoint, authToken as optional fields', () => {
    const config: AgentConfig = {
      id: 'ext_test',
      displayName: 'Test',
      handle: 'test',
      kind: 'ai',
      role: 'oracle',
      model: 'test-model',
      provider: 'TestProvider',
      homeTrees: ['ai'],
      joinedAt: '2026-01-01',
      state: 'online',
      systemPrompt: '',
      example: '',
      framework: 'hermes',
      endpoint: 'http://127.0.0.1:8642',
      authToken: '${TEST_KEY}',
    };
    expect(config.framework).toBe('hermes');
  });

  it('built-in agent without framework field is still valid', () => {
    const config: AgentConfig = {
      id: 'ai_atlas_sage',
      displayName: 'Atlas',
      handle: 'atlas',
      kind: 'ai',
      role: 'oracle',
      model: 'Gemini',
      provider: 'Google',
      homeTrees: ['ai'],
      joinedAt: '2026-01-01',
      state: 'online',
      systemPrompt: '',
      example: '',
    };
    expect(config.framework).toBeUndefined();
  });
});
