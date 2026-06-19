// SPDX-License-Identifier: MIT

// ThinkGrove · Shared HTTP transport for all non-mock AI providers.
// Providers only specify three callbacks:
//   1. resolve()  — derive baseUrl, model, apiKey from opts/env/defaults
//   2. buildBody() — construct the provider-specific request payload
//   3. parseResponse() — extract plain text from the provider's JSON response
//
// Error handling, fetch, JSON parsing, and the return shape are 100% shared.
// No new runtime dependencies.

import type {
  AIProvider,
  ChatMessage,
  ChatOptions,
  ChatResult,
} from './provider';
import { AIClientError, hashPrompt } from './provider';

// ---------------------------------------------------------------------------
// Callback types
// ---------------------------------------------------------------------------

/** Resolve runtime configuration from ChatOptions + env + defaults. */
export type ResolveFn = (opts: ChatOptions) => {
  baseUrl: string;
  model: string;
  apiKey: string;
};

/** Build a JSON-serialisable request body from already-resolved inputs. */
export type BuildBodyFn = (p: {
  model: string;
  maxTokens: number;
  temperature: number;
  system: string | undefined;
  messages: ChatMessage[];
}) => unknown;

/** Extract plain text from a parsed JSON response body. */
export type ParseResponseFn = (data: unknown) => string;

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

export interface HttpProviderConfig {
  name: string;
  path: string;
  extraHeaders?: Record<string, string>;
  buildBody: BuildBodyFn;
  parseResponse: ParseResponseFn;
}

// ---------------------------------------------------------------------------
// Shared transport — identical for every HTTP provider
// ---------------------------------------------------------------------------

async function callAI(
  config: HttpProviderConfig,
  messages: ChatMessage[],
  resolved: { baseUrl: string; model: string; apiKey: string },
  opts: ChatOptions,
): Promise<ChatResult> {
  const { baseUrl, model, apiKey } = resolved;
  const promptHash = hashPrompt(opts.system || '', messages);

  if (opts.forceFallback) {
    throw new AIClientError(
      'forceFallback=true — caller should produce a mock result',
    );
  }

  const body = config.buildBody({
    model,
    maxTokens: opts.maxTokens ?? 600,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages,
  });

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  for (const [key, value] of Object.entries(config.extraHeaders ?? {})) {
    if (key === 'x-api-key' || key.toLowerCase() === 'authorization') {
      headers[key] = apiKey;
    } else {
      headers[key] = value;
    }
  }
  if (!Object.keys(config.extraHeaders ?? {}).some(
    (k) => k === 'x-api-key' || k.toLowerCase() === 'authorization',
  )) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${config.path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new AIClientError(`network failure calling ${config.name}`, { cause: e });
  }

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* best-effort */ }
    throw new AIClientError(
      `${config.name} returned ${res.status}: ${detail.slice(0, 200)}`,
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch (e) {
    throw new AIClientError(
      `failed to parse ${config.name} response as JSON`,
      { cause: e },
    );
  }

  const text = config.parseResponse(data);
  if (!text) {
    throw new AIClientError(
      `${config.name} response had no text: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }

  return { text, model, promptHash, fallback: false };
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

export function createHttpProvider(
  config: HttpProviderConfig,
  resolve: ResolveFn,
): AIProvider {
  return {
    name: config.name,
    async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
      const resolved = resolve(opts);
      return callAI(config, messages, resolved, opts);
    },
  };
}
