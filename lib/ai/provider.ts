// SPDX-License-Identifier: MIT

// ThinkGrove · AI Provider abstraction layer.
//
// Defines the AIProvider interface and resolveProvider() factory.
// Each provider implementation lives in lib/ai/providers/<name>.ts.
// Selection is controlled by TG_AI_PROVIDER env var.

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, string>;
  baseUrl?: string;
  model?: string;
  forceFallback?: boolean;
}

export interface ChatResult {
  text: string;
  model: string;
  promptHash: string;
  fallback: boolean;
}

export class AIClientError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AIClientError';
  }
}

export interface AIProvider {
  name: string;
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;
  healthCheck?(): Promise<boolean>;
  listModels?(): Promise<string[]>;
}

// djb2 prompt hash — enough to dedupe prompt runs, not a security hash.
export function hashPrompt(system: string, messages: ChatMessage[]): string {
  const s = (system || '') + '\n' + messages.map((m) => m.role + ':' + m.content).join('\n');
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return 'ph_' + (h >>> 0).toString(16).padStart(8, '0');
}

import { MiniMaxProvider } from './providers/minimax';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { MockProvider } from './providers/mock';

export function resolveProvider(): AIProvider {
  const name = (process.env.TG_AI_PROVIDER || 'minimax').toLowerCase();

  switch (name) {
    case 'openai':    return OpenAIProvider;
    case 'anthropic': return AnthropicProvider;
    case 'mock':      return new MockProvider();
    case 'minimax':
    default:
      if (name !== 'minimax') {
        console.warn(`[ai] unknown provider "${name}", falling back to minimax`);
      }
      return MiniMaxProvider;
  }
}
