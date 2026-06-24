// SPDX-License-Identifier: MIT

// Lightweight AI resident collaboration runner.
// This module defines role-specific prompt assembly and execution behavior
// for question/source-oriented workflows. It does not define fixed product
//运营话术; downstream projects should provide their own prompts and routing.

import { resolveProvider } from './provider';
import { loadAgentsFromYaml } from '@/lib/config/loader';
import { ExternalAgentResolver } from '@/lib/external-agents/resolver';
import { OfflineStateStore } from '@/lib/external-agents/offline-state';
import { hashPrompt } from './provider';

export type CollaborationRole = 'collector' | 'oracle' | 'synthesizer' | 'critic' | 'tutor' | 'arbitrator';

export interface CollaborationContext {
  action: string;
  domain?: string;
  topic: string;
  questionId?: string;
  sourceId?: string;
  sourceIds?: string[];
  systemPrompt?: string;
  maxTokens?: number;
  metadata?: Record<string, string>;
}

export interface CollaborationResult {
  text: string;
  role: string;
  actorId: string;
  promptHash: string;
  model: string;
  fallback: boolean;
  metadata: Record<string, string>;
}

function defaultSystemPromptFor(role: CollaborationRole): string {
  switch (role) {
    case 'collector':
      return '你是信息收集整理型 AI 居民。请围绕给定话题整理关键信息源线索，输出可核查、可归档、可引用的事实摘要。';
    case 'oracle':
      return '你是综合型 AI 居民。请围绕给定话题给出高质量回答，优先引用给定信息源，结论明确、证据清晰。';
    case 'synthesizer':
      return '你是编织型 AI 居民。请整合不同视角和来源，输出结构化综合结论，标清前提、分歧和可行动结论。';
    case 'critic':
      return '你是质疑型 AI 居民。请检查问题定义、证据质量或回答漏洞，输出可落地的质疑点和改进建议。';
    case 'tutor':
      return '你是引导型 AI 居民。请帮助澄清问题、补充缺失前提、约束回答范围，输出更高质量的问题版本。';
    case 'arbitrator':
      return '你是仲裁型 AI 居民。请基于现有争议/引用/来源，做出中立、可解释的裁决摘要。';
  }
}

function buildUserMessage(context: CollaborationContext, role: CollaborationRole): string {
  const lines: string[] = [`角色：${role}`, `任务：${context.action}`, `话题：${context.topic}`];

  if (context.domain) {
    lines.push(`领域：${context.domain}`);
  }
  if (context.questionId) {
    lines.push(`问题ID：${context.questionId}`);
  }
  if (context.sourceId) {
    lines.push(`信息源ID：${context.sourceId}`);
  }
  if (context.sourceIds?.length) {
    lines.push(`参考信息源IDs：${context.sourceIds.join(', ')}`);
  }

  return lines.join('\n');
}

export function resolveCollaborationActor(actorId?: string): { id: string; role: string; systemPrompt: string } {
  const agents = loadAgentsFromYaml();
  const agent = actorId ? agents.find((item) => item.id === actorId) : agents[0];

  if (!agent) {
    return {
      id: 'unknown',
      role: 'tutor',
      systemPrompt: defaultSystemPromptFor('tutor'),
    };
  }

  return {
    id: agent.id,
    role: agent.role,
    systemPrompt: agent.systemPrompt || defaultSystemPromptFor('tutor'),
  };
}

export async function runCollaboration(
  role: CollaborationRole,
  context: CollaborationContext,
  actorId?: string,
): Promise<CollaborationResult> {
  const actor = resolveCollaborationActor(actorId);
  const agents = loadAgentsFromYaml();
  const agentConfig = agents.find((item) => item.id === actor.id);
  const systemPrompt = context.systemPrompt || actor.systemPrompt || defaultSystemPromptFor(role);
  const maxTokens = context.maxTokens || 400;
  const userMessage = buildUserMessage(context, role);
  const metadata: Record<string, string> = {
    action: context.action,
    role,
    actorId: actor.id,
    ...(context.metadata || {}),
  };

  if (context.questionId) {
    metadata.questionId = context.questionId;
  }
  if (context.sourceId) {
    metadata.sourceId = context.sourceId;
  }
  if (context.sourceIds?.length) {
    metadata.sourceIds = context.sourceIds.join(',');
  }

  if (agentConfig?.framework) {
    const resolver = new ExternalAgentResolver();
    const offlineStore = new OfflineStateStore();

    if (offlineStore.isOffline(agentConfig.id)) {
      throw new Error('agent is offline');
    }

    const adapter = resolver.resolve({
      id: agentConfig.id,
      framework: agentConfig.framework,
      endpoint: agentConfig.endpoint || '',
      authToken: agentConfig.authToken,
      deviceId: agentConfig.deviceId,
      publicKey: agentConfig.publicKey,
    });

    if (!adapter) {
      offlineStore.setOffline(agentConfig.id);
      throw new Error('adapter unavailable');
    }

    try {
      const result = await adapter.invoke({
        agentId: agentConfig.id,
        action: context.action,
        context: {
          topic: context.topic,
          domain: context.domain || 'unknown',
          systemPrompt,
          maxTokens,
        },
      });
      offlineStore.setOnline(agentConfig.id);

      return {
        text: result.text,
        role: actor.role,
        actorId: agentConfig.id,
        promptHash: 'ph_ext_' + result.model,
        model: result.model,
        fallback: false,
        metadata: { ...metadata, framework: agentConfig.framework },
      };
    } catch (error) {
      offlineStore.setOffline(agentConfig.id);
      throw error;
    }
  }

  const provider = resolveProvider();
  try {
    const result = await provider.chat(
      [{ role: 'user', content: userMessage }],
      { system: systemPrompt, maxTokens, metadata },
    );

    return {
      text: result.text,
      role: actor.role,
      actorId: actor.id,
      promptHash: result.promptHash,
      model: result.model,
      fallback: result.fallback,
      metadata,
    };
  } catch (error) {
    const fallbackText = `围绕「${context.topic}」的一个未充分讨论的视角：多数讨论里已有常见结论，但失败成本、边界条件和证据强度仍待补齐。建议先回到问题定义，再补充 2-3 个高可信来源。`;
    const promptHash = hashPrompt(systemPrompt, [{ role: 'user', content: userMessage }]);

    return {
      text: fallbackText,
      role: actor.role,
      actorId: actor.id,
      promptHash,
      model: provider.name,
      fallback: true,
      metadata: { ...metadata, fallbackReason: 'provider_failed' },
    };
  }
}
