import type { ExternalAgentAdapter, ExternalAgentRequest, ExternalAgentResponse } from '../types';

export interface HermesAdapterConfig {
  endpoint: string;
  authToken: string;
}

export class HermesAdapter implements ExternalAgentAdapter {
  readonly framework = 'hermes' as const;
  private endpoint: string;
  private authToken: string;

  constructor(config: HermesAdapterConfig) {
    this.endpoint = config.endpoint.replace(/\/$/, '');
    this.authToken = config.authToken;
  }

  async invoke(req: ExternalAgentRequest): Promise<ExternalAgentResponse> {
    const url = `${this.endpoint}/v1/chat/completions`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          model: 'hermes-2',
          messages: [
            { role: 'system', content: req.context.systemPrompt },
            { role: 'user', content: this.buildUserPrompt(req) },
          ],
          max_tokens: req.context.maxTokens,
        }),
      });

      if (!res.ok) {
        return { text: `Hermes error: HTTP ${res.status}`, model: 'hermes-2' };
      }

      const data: unknown = await res.json();
      const content = (data as any)?.choices?.[0]?.message?.content;
      if (!content) {
        return { text: 'Hermes returned empty response', model: 'hermes-2' };
      }

      return { text: content, model: (data as any).model || 'hermes-2' };
    } catch (e) {
      return { text: `Hermes connection failed: ${(e as Error).message}`, model: 'hermes-2' };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/health`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  dispose(): void {
    // HTTP adapter — no persistent connections to clean up
  }

  private buildUserPrompt(req: ExternalAgentRequest): string {
    const { action, context } = req;
    if (action === 'awaken') {
      return `${context.domain} 域已经 24 小时没有新枝桠。请提出一个具体、开放、可能引发讨论的问题，30-80 字，不要寒暄。`;
    }
    return `请围绕「${context.topic}」给出一段 80-160 字的回答。领域：${context.domain}。不要寒暄。`;
  }
}
