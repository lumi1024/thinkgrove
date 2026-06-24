// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { runCollaboration, resolveCollaborationActor } from '@/lib/ai/collaboration';

vi.mock('@/lib/config/loader', () => ({
  loadAgentsFromYaml: () => [
    { id: 'ai_oracle', role: 'oracle', systemPrompt: 'oracle prompt' },
    { id: 'ai_critic', role: 'critic', systemPrompt: 'critic prompt' },
  ],
}));

vi.mock('@/lib/ai/provider', () => ({
  resolveProvider: () => ({
    name: 'mock',
    chat: async () => ({ text: 'mocked', model: 'mock', promptHash: 'ph', fallback: false }),
  }),
  hashPrompt: (system: string, messages: { role: string; content: string }[]) =>
    `ph:${system}:${messages.map((message) => message.content).join('|')}`,
}));

describe('resolveCollaborationActor', () => {
  it('returns first agent when actorId is omitted', () => {
    const actor = resolveCollaborationActor();
    expect(actor.id).toBe('ai_oracle');
    expect(actor.role).toBe('oracle');
  });

  it('resolves requested actor and falls back to tutor prompt when missing', () => {
    const actor = resolveCollaborationActor('ai_critic');
    expect(actor.id).toBe('ai_critic');
    expect(actor.systemPrompt).toBe('critic prompt');
  });
});

describe('runCollaboration', () => {
  it('builds collaboration result from provider', async () => {
    const result = await runCollaboration('oracle', {
      action: 'draft_answer',
      domain: 'ai',
      topic: 'test topic',
      questionId: 'q_1',
      sourceIds: ['src_1'],
      systemPrompt: 'custom prompt',
    });

    expect(result.role).toBe('oracle');
    expect(result.actorId).toBe('ai_oracle');
    expect(result.text).toBe('mocked');
    expect(result.metadata.action).toBe('draft_answer');
    expect(result.metadata.questionId).toBe('q_1');
  });
});
