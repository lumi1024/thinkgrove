export interface ExternalAgentRequest {
  agentId: string;
  action: 'answer' | 'awaken';
  context: {
    topic: string;
    domain: string;
    systemPrompt: string;
    maxTokens: number;
  };
}

export interface ExternalAgentResponse {
  text: string;
  model: string;
}

export interface ExternalAgentAdapter {
  framework: 'openclaw' | 'hermes';
  invoke(req: ExternalAgentRequest): Promise<ExternalAgentResponse>;
  healthCheck(): Promise<boolean>;
  dispose(): void;
}
