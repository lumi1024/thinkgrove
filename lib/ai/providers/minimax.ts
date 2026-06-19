// SPDX-License-Identifier: MIT

// ThinkGrove · MiniMax provider.
// MiniMax exposes an Anthropic-compatible Messages API, so the body format
// and response parsing mirror the Anthropic provider.
// Config-only: all transport logic lives in http-client.ts.

import { createHttpProvider, type BuildBodyFn, type ParseResponseFn } from '../http-client';
import {
  AIProvider, ChatMessage, ChatOptions, ChatResult, AIClientError, hashPrompt,
} from '../provider';

export { AIClientError, hashPrompt } from '../provider';

const DEFAULT_BASE_URL = 'https://api.minimaxi.com/anthropic';
const DEFAULT_MODEL = 'MiniMax-M3';
const ANTHROPIC_VERSION = '2023-06-01';

const buildBody: BuildBodyFn = ({ model, maxTokens, temperature, system, messages }) => ({
  model,
  max_tokens: maxTokens,
  temperature,
  system: system || undefined,
  messages: messages.map((m) => ({
    role: m.role,
    content: [{ type: 'text' as const, text: m.content }],
  })),
});

const parseResponse: ParseResponseFn = (data) => {
  const blocks: unknown[] = Array.isArray((data as any)?.content)
    ? (data as any).content : [];
  return blocks
    .filter((b: any) => b?.type === 'text' && typeof b.text === 'string')
    .map((b: any) => b.text)
    .join('\n')
    .trim();
};

const resolve = (opts: ChatOptions) => {
  const baseUrl = (
    opts.baseUrl ||
    process.env.MINIMAX_BASE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, '');

  const model =
    opts.model ||
    process.env.MINIMAX_MODEL ||
    DEFAULT_MODEL;

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new AIClientError('MINIMAX_API_KEY not set in env');
  }

  return { baseUrl, model, apiKey };
};

export const MiniMaxProvider: AIProvider = createHttpProvider(
  {
    name: 'MiniMax',
    path: '/v1/messages',
    extraHeaders: {
      'x-api-key': '',
      'anthropic-version': ANTHROPIC_VERSION,
    },
    buildBody,
    parseResponse,
  },
  resolve,
);
