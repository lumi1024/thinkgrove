// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { MiniMaxProvider, AIClientError, hashPrompt } from '@/lib/ai/providers/minimax';

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

describe('MiniMaxProvider.chat', () => {
  const OLD_KEY = process.env.MINIMAX_API_KEY;
  const OLD_BASE = process.env.MINIMAX_BASE_URL;

  afterEach(() => {
    process.env.MINIMAX_API_KEY = OLD_KEY;
    process.env.MINIMAX_BASE_URL = OLD_BASE;
    vi.unstubAllGlobals();
  });

  it('returns parsed text from Anthropic-style response', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const mockRes = new Response(JSON.stringify({
      content: [{ type: 'text', text: 'hello from api' }],
    }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    const result = await MiniMaxProvider.chat(
      [{ role: 'user', content: 'hi' }],
      { system: 'sys' },
    );
    expect(result.text).toBe('hello from api');
    expect(result.fallback).toBe(false);
    expect(result.model).toBe('MiniMax-M3');
    expect(result.promptHash).toMatch(/^ph_/);
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

    const result = await MiniMaxProvider.chat([{ role: 'user', content: 'q' }], { system: 'sys' });
    expect(result.text).toBe('visible answer');
  });

  it('throws AIClientError on HTTP 500', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const mockRes = new Response('server error', { status: 500 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    await expect(MiniMaxProvider.chat([{ role: 'user', content: 'q' }], { system: 'sys' }))
      .rejects.toThrow(AIClientError);
  });

  it('throws AIClientError on network error', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('ECONNREFUSED'))));

    await expect(MiniMaxProvider.chat([{ role: 'user', content: 'q' }], { system: 'sys' }))
      .rejects.toThrow(AIClientError);
  });

  it('throws AIClientError when response has no text block', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const mockRes = new Response(JSON.stringify({ content: [] }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    await expect(MiniMaxProvider.chat([{ role: 'user', content: 'q' }], { system: 'sys' }))
      .rejects.toThrow(AIClientError);
  });

  it('throws AIClientError when forceFallback is set', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(MiniMaxProvider.chat([{ role: 'user', content: 'q' }], {
      system: 'sys',
      forceFallback: true,
    })).rejects.toThrow('forceFallback');

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses custom baseUrl and model from opts', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const mockRes = new Response(JSON.stringify({
      content: [{ type: 'text', text: 'custom' }],
    }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(mockRes)));

    await MiniMaxProvider.chat([{ role: 'user', content: 'q' }], {
      system: 'sys',
      baseUrl: 'https://custom.example.com/anthropic',
      model: 'Custom-Model',
    });

    expect(vi.mocked(globalThis.fetch).mock.calls[0][0]).toBe(
      'https://custom.example.com/anthropic/v1/messages',
    );
  });

  it('throws AIClientError when API key is missing', async () => {
    process.env.MINIMAX_API_KEY = '';
    await expect(MiniMaxProvider.chat([{ role: 'user', content: 'q' }], { system: 'sys' }))
      .rejects.toThrow('MINIMAX_API_KEY not set');
  });
});
