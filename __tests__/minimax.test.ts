import { describe, it, expect, vi } from 'vitest';
import { chatWithFallback, AIClientError, hashPrompt } from '@/lib/ai/minimax';

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

  it('matches expected format', () => {
    const h = hashPrompt('s', [{ role: 'user', content: 'c' }]);
    expect(h).toMatch(/^ph_[0-9a-f]{8}$/);
  });
});

describe('chatWithFallback — HTTP success path', () => {
  const OLD_KEY = process.env.MINIMAX_API_KEY;

  afterEach(() => {
    process.env.MINIMAX_API_KEY = OLD_KEY;
  });

  it('returns parsed text from mock response', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const mockRes = new Response(JSON.stringify({
      content: [{ type: 'text', text: 'hello from api' }],
    }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    const result = await chatWithFallback(
      [{ role: 'user', content: 'hi' }],
      { fallbackText: 'should not reach', system: 'sys' },
    );
    expect(result.text).toBe('hello from api');
    expect(result.fallback).toBe(false);
    expect(result.model).toBe('MiniMax-M3');
    expect(result.promptHash).toMatch(/^ph_/);

    vi.unstubAllGlobals();
  });

  it('skips thinking blocks in response', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const mockRes = new Response(JSON.stringify({
      content: [
        { type: 'thinking', text: 'internal reasoning' },
        { type: 'text', text: 'visible answer' },
      ],
    }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    const result = await chatWithFallback(
      [{ role: 'user', content: 'q' }],
      { fallbackText: 'fb', forceFallback: false },
    );
    expect(result.text).toBe('visible answer');

    vi.unstubAllGlobals();
  });

  it('falls back on HTTP 500', async () => {
    const mockRes = new Response('server error', { status: 500 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    const result = await chatWithFallback(
      [{ role: 'user', content: 'q' }],
      { fallbackText: 'fb fallback' },
    );
    expect(result.fallback).toBe(true);
    expect(result.text).toBe('fb fallback');

    vi.unstubAllGlobals();
  });

  it('falls back on network error', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('ECONNREFUSED'))));

    const result = await chatWithFallback(
      [{ role: 'user', content: 'q' }],
      { fallbackText: 'fb network' },
    );
    expect(result.fallback).toBe(true);
    expect(result.text).toBe('fb network');

    vi.unstubAllGlobals();
  });

  it('falls back when response has no text block', async () => {
    const mockRes = new Response(JSON.stringify({ content: [] }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    const result = await chatWithFallback(
      [{ role: 'user', content: 'q' }],
      { fallbackText: 'fb empty' },
    );
    expect(result.fallback).toBe(true);
    expect(result.text).toBe('fb empty');

    vi.unstubAllGlobals();
  });
});

describe('forceFallback', () => {
  it('always returns fallback without calling fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await chatWithFallback(
      [{ role: 'user', content: 'q' }],
      { fallbackText: 'forced', forceFallback: true },
    );
    expect(result.fallback).toBe(true);
    expect(result.text).toBe('forced');
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
