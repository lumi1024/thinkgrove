import { describe, it, expect } from 'vitest';
import type {
  ExternalAgentRequest,
  ExternalAgentResponse,
  ExternalAgentAdapter,
} from '@/lib/external-agents/types';

describe('ExternalAgent types', () => {
  it('ExternalAgentRequest has required fields', () => {
    const req: ExternalAgentRequest = {
      agentId: 'ext_test',
      action: 'answer',
      context: {
        topic: 'test topic',
        domain: 'ai',
        systemPrompt: 'you are a test agent',
        maxTokens: 200,
      },
    };
    expect(req.agentId).toBe('ext_test');
    expect(req.action).toBe('answer');
  });

  it('ExternalAgentResponse has required fields', () => {
    const res: ExternalAgentResponse = {
      text: 'hello',
      model: 'test-model',
    };
    expect(res.text).toBe('hello');
    expect(res.model).toBe('test-model');
  });

  it('ExternalAgentAdapter interface is implementable', () => {
    const mockAdapter: ExternalAgentAdapter = {
      framework: 'hermes',
      async invoke(req) {
        return { text: 'mocked', model: 'mock' };
      },
      async healthCheck() {
        return true;
      },
      dispose() {},
    };
    expect(mockAdapter.framework).toBe('hermes');
  });
});
