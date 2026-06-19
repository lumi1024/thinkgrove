// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveProvider, hashPrompt, AIClientError } from '@/lib/ai/provider';
import { MiniMaxProvider } from '@/lib/ai/providers/minimax';

describe('hashPrompt', () => {
  it('is deterministic for same input', () => {
    const h1 = hashPrompt('sys', [{ role: 'user', content: 'hello' }]);
    const h2 = hashPrompt('sys', [{ role: 'user', content: 'hello' }]);
    expect(h1).toBe(h2);
  });

  it('changes with different content', () => {
    const h1 = hashPrompt('sys', [{ role: 'user', content: 'hello' }]);
    const h2 = hashPrompt('sys', [{ role: 'user', content: 'world' }]);
    expect(h1).not.toBe(h2);
  });

  it('matches ph_ prefix + 8 hex chars', () => {
    const h = hashPrompt('s', [{ role: 'user', content: 'c' }]);
    expect(h).toMatch(/^ph_[0-9a-f]{8}$/);
  });
});

describe('resolveProvider', () => {
  const OLD = process.env.TG_AI_PROVIDER;

  afterEach(() => {
    process.env.TG_AI_PROVIDER = OLD;
  });

  it('returns MiniMaxProvider by default', () => {
    delete process.env.TG_AI_PROVIDER;
    const p = resolveProvider();
    expect(p).toBe(MiniMaxProvider);
  });

  it('returns OpenAIProvider when TG_AI_PROVIDER=openai', () => {
    process.env.TG_AI_PROVIDER = 'openai';
    const p = resolveProvider();
    expect(p.name).toBe('OpenAI');
  });

  it('returns AnthropicProvider when TG_AI_PROVIDER=anthropic', () => {
    process.env.TG_AI_PROVIDER = 'anthropic';
    const p = resolveProvider();
    expect(p.name).toBe('Anthropic');
  });

  it('returns MockProvider when TG_AI_PROVIDER=mock', () => {
    process.env.TG_AI_PROVIDER = 'mock';
    const p = resolveProvider();
    expect(p.name).toBe('Mock');
  });

  it('falls back to MiniMax for unknown provider', () => {
    process.env.TG_AI_PROVIDER = 'unknown_provider';
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const p = resolveProvider();
    expect(p).toBe(MiniMaxProvider);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('unknown provider'),
    );
    consoleSpy.mockRestore();
  });

  it('is case-insensitive', () => {
    process.env.TG_AI_PROVIDER = 'OPENAI';
    const p = resolveProvider();
    expect(p.name).toBe('OpenAI');
  });
});

describe('AIClientError', () => {
  it('carries a cause', () => {
    const cause = new Error('network down');
    const err = new AIClientError('fetch failed', cause);
    expect(err.message).toBe('fetch failed');
    expect(err.cause).toBe(cause);
    expect(err.name).toBe('AIClientError');
  });

  it('works without a cause', () => {
    const err = new AIClientError('something went wrong');
    expect(err.message).toBe('something went wrong');
    expect(err.cause).toBeUndefined();
  });
});
