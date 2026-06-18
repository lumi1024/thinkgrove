// Knowledge Forest · MiniMax (Anthropic-compatible) client.
//
// MiniMax exposes an Anthropic-compatible Messages API:
//   POST {ANTHROPIC_BASE_URL}/v1/messages
//   Headers: x-api-key, anthropic-version: 2023-06-01, content-type
//   Body: { model, max_tokens, system, messages: [{role, content:[{type,text}]}] }
//
// Documented at https://platform.minimaxi.com/docs/token-plan/quickstart
// (only Anthropic compatibility is shown there as of last fetch).
//
// Failure policy: if any of the network call, header, or response parsing
// fails, throw `AIClientError` with a descriptive message. Callers MUST
// catch and fall back to a deterministic mock — see `lib/ai/prompts.ts`.

export class AIClientError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AIClientError';
  }
}

const DEFAULT_BASE_URL = 'https://api.minimaxi.com/anthropic';
const DEFAULT_MODEL = 'MiniMax-M3';
const ANTHROPIC_VERSION = '2023-06-01';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  // Override the base URL / model / version if the protocol details
  // turn out to differ from defaults. Useful for environment-specific
  // adjustments without code changes.
  baseUrl?: string;
  model?: string;
  anthropicVersion?: string;
  // Skip the network call and go straight to fallback. Used by tests
  // and by callers that want deterministic output.
  forceFallback?: boolean;
}

export interface ChatResult {
  text: string;
  model: string;
  // Hash of the prompt so we can dedupe / audit. Frontend never sees
  // the actual prompt; this is the value that goes to DB.
  promptHash: string;
  // True when this came from the mock path. Important for logging
  // and for the AI residents' "by Gemini / by Claude / by Mock" line.
  fallback: boolean;
}

function getKey(): string | null {
  return process.env.MINIMAX_API_KEY || null;
}

export function hashPrompt(system: string, messages: ChatMessage[]): string {
  // Lightweight djb2 — enough to dedupe prompt runs, not a security hash.
  const s = (system || '') + '\n' + messages.map((m) => m.role + ':' + m.content).join('\n');
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return 'ph_' + (h >>> 0).toString(16).padStart(8, '0');
}

export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<ChatResult> {
  const baseUrl  = opts.baseUrl  || process.env.MINIMAX_BASE_URL || DEFAULT_BASE_URL;
  const model    = opts.model    || process.env.MINIMAX_MODEL   || DEFAULT_MODEL;
  const version  = opts.anthropicVersion || ANTHROPIC_VERSION;
  const maxTokens = opts.maxTokens ?? 600;
  const temperature = opts.temperature ?? 0.7;

  const system = opts.system || '';
  const promptHash = hashPrompt(system, messages);

  if (opts.forceFallback) {
    throw new AIClientError('forceFallback=true — caller should produce a mock result');
  }
  const key = getKey();
  if (!key) {
    throw new AIClientError('MINIMAX_API_KEY not set in env');
  }

  // Build the body in the Anthropic Messages shape.
  const body = {
    model,
    max_tokens: maxTokens,
    temperature,
    system: system || undefined,
    messages: messages.map((m) => ({ role: m.role, content: [{ type: 'text', text: m.content }] })),
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': version,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new AIClientError('network failure calling MiniMax', e);
  }

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new AIClientError(`MiniMax returned ${res.status}: ${detail.slice(0, 200)}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (e) {
    throw new AIClientError('failed to parse MiniMax response as JSON', e);
  }

  // Anthropic shape: content is an array of blocks. The text block is what
  // we want; "thinking" blocks are skipped (they're internal reasoning).
  const blocks: any[] = Array.isArray(data?.content) ? data.content : [];
  const text = blocks
    .filter((b) => b?.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n')
    .trim();
  if (!text) {
    throw new AIClientError('MiniMax response had no text block: ' + JSON.stringify(data).slice(0, 200));
  }

  return { text, model, promptHash, fallback: false };
}

// Helper: caller wraps `chat` and on failure returns a deterministic mock.
// Both branches return the same ChatResult shape so the rest of the
// pipeline doesn't care which path produced the text.
export async function chatWithFallback(
  messages: ChatMessage[],
  opts: ChatOptions & { fallbackText: string },
): Promise<ChatResult> {
  try {
    return await chat(messages, opts);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[ai] MiniMax call failed, using fallback:', (e as Error).message);
    return {
      text: opts.fallbackText,
      model: 'mock-fallback',
      promptHash: 'mock-fallback',
      fallback: true,
    };
  }
}
