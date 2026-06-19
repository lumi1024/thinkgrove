// SPDX-License-Identifier: MIT

// ThinkGrove · OpenAI provider.
// Config-only: all transport logic lives in http-client.ts.

import { createHttpProvider, type BuildBodyFn, type ParseResponseFn } from '../http-client';
import {
  AIProvider, ChatMessage, ChatOptions, ChatResult, AIClientError, hashPrompt,
} from '../provider';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o';

const buildBody: BuildBodyFn = ({ model, maxTokens, temperature, system, messages }) => {
  const chatMessages: { role: string; content: string }[] = [];
  if (system) {
    chatMessages.push({ role: 'system', content: system });
  }
  for (const m of messages) {
    chatMessages.push({ role: m.role, content: m.content });
  }
  return {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: chatMessages,
  };
};

const parseResponse: ParseResponseFn = (data) => {
  return (data as any)?.choices?.[0]?.message?.content?.trim() ?? '';
};

const resolve = (opts: ChatOptions) => {
  const baseUrl = (
    opts.baseUrl ||
    process.env.OPENAI_BASE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, '');

  const model =
    opts.model ||
    process.env.OPENAI_MODEL ||
    DEFAULT_MODEL;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIClientError('OPENAI_API_KEY not set in env');
  }

  return { baseUrl, model, apiKey };
};

export const OpenAIProvider: AIProvider = createHttpProvider(
  {
    name: 'OpenAI',
    path: '/chat/completions',
    buildBody,
    parseResponse,
  },
  resolve,
);
