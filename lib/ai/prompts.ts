// SPDX-License-Identifier: MIT

// ThinkGrove · AI resident prompts.
// RESIDENT_PROMPTS merges static prompts with YAML-loaded configs.
// Client-safe: falls back to static prompts if YAML is unavailable.
// mockAnswer / mockAwakenQuestion are generic fallback generators.

import { STATIC_PROMPTS, type ResidentPrompt } from './prompts-static';
import { getAgentConfig, getAllAgentConfigs } from '@/lib/residents';

export { type ResidentPrompt } from './prompts-static';

export const RESIDENT_PROMPTS: Record<string, ResidentPrompt> = (() => {
  const out: Record<string, ResidentPrompt> = { ...STATIC_PROMPTS };

  try {
    for (const cfg of getAllAgentConfigs()) {
      if (cfg.systemPrompt) {
        out[cfg.id] = { system: cfg.systemPrompt, example: cfg.example || '' };
      }
    }
  } catch {
    // Client-side or YAML unavailable — static prompts are already loaded.
  }

  return out;
})();

// Domain-aware mock answer generator.
export function mockAnswer(agentId: string, topic: string, domain: string): string {
  switch (agentId) {
    case 'ai_atlas_sage':
      return `「${topic}」在 ${domain} 域里不是孤立问题——它和至少另外两个领域有连接：` +
             `一是被引用的次数（声誉分），二是被采纳 vs 被质疑的比率（争议密度）。` +
             `把这三个变量放在一起看，才能判断它是不是一棵真值得养的树。`;
    case 'ai_critic_kimi':
      return `默认假设："${topic}" 是一个清晰、可定义的问题——但定义它的人往往已经决定了答案。` +
             `反例：在 ${domain} 的真实项目里，这个问题 80% 的时间被绕开，因为成本不划算。` +
             `问题不是怎么解，而是为什么我们总在解它。`;
    case 'ai_synth_gpt':
      return `如果把 ${topic} 看作 A，把 ${domain} 里的失败案例看作 B，那么一个合成问题就是：\n` +
             `"A 的哪些子结构在 B 出现失败时也出现？"——` +
             `这等于把"症状"和"病因"对齐到一个坐标系，答案往往是某个被忽略的中间层。`;
    case 'ai_tutor_claude':
      return `先把"${topic}"翻译成你能用 30 秒说人话的问题——如果说不出来，先别看答案。` +
             `今晚能做的最小一步：把 ${domain} 里你最近一次踩的坑写成 3 行，写给一个 3 个月前的自己看。` +
             `写完再决定要不要继续深挖。`;
    default: {
      const cfg = getAgentConfig(agentId);
      if (cfg?.systemPrompt) {
        return `[${cfg.displayName}] 关于「${topic}」的一个视角：${domain} 域里的多数讨论结论是"该用 A 不用 B"，但 A 的失败成本从未被量化。建议先量 3 个真实案例的失败成本，再回到"该用 A 不用 B"。`;
      }
      return `关于「${topic}」的一个未充分讨论的视角：在 ${domain} 的多数讨论里，结论是"该用 A 不用 B"，但 A 的失败成本从未被量化。` +
             `建议先量 3 个真实案例的失败成本，再回到"该用 A 不用 B"。`;
    }
  }
}

// Mock "I am a 24h-silent-tree guardian" question — for awaken.
export function mockAwakenQuestion(domain: string, agentId: string): string {
  const cfg = getAgentConfig(agentId);
  const name = cfg?.displayName ?? agentId;
  return `[${name}] 在 ${domain} 域里，过去 30 天你最被忽略的那条枝桠为什么没人答？`;
}
