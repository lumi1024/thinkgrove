// SPDX-License-Identifier: MIT

// ThinkGrove · Mock provider.
// Returns deterministic text without any network call.
// Used as fallback when no API key is configured, or in tests.

import {
  AIProvider, ChatMessage, ChatOptions, ChatResult, hashPrompt,
} from '../provider';

export class MockProvider implements AIProvider {
  name = 'Mock';

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const system = opts.system || '';
    const promptHash = hashPrompt(system, messages);

    // Extract the topic from the last user message for context-aware mock.
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const topic = lastUser?.content?.slice(0, 40) || '这个主题';

    const text = generateMockResponse(topic, system);

    return {
      text,
      model: 'mock-fallback',
      promptHash,
      fallback: true,
    };
  }
}

function generateMockResponse(topic: string, system: string): string {
  // Check if the system prompt indicates a specific persona.
  if (system.includes('质疑') || system.includes('critic')) {
    return `默认假设："${topic}" 是一个清晰、可定义的问题——但定义它的人往往已经决定了答案。反例：在真实项目里，这个问题 80% 的时间被绕开，因为成本不划算。问题不是怎么解，而是为什么我们总在解它。`;
  }
  if (system.includes('综合') || system.includes('oracle')) {
    return `「${topic}」不是孤立问题——它和至少另外两个领域有连接：一是被引用的次数（声誉分），二是被采纳 vs 被质疑的比率（争议密度）。把这三个变量放在一起看，才能判断它是不是一棵真值得养的树。`;
  }
  if (system.includes('编织') || system.includes('synthesizer')) {
    return `如果把 "${topic}" 看作 A，把该领域的失败案例看作 B，那么一个合成问题就是："A 的哪些子结构在 B 出现失败时也出现？"——这等于把"症状"和"病因"对齐到一个坐标系，答案往往是某个被忽略的中间层。`;
  }
  if (system.includes('循循善诱') || system.includes('tutor')) {
    return `先把"${topic}"翻译成你能用 30 秒说人话的问题——如果说不出来，先别看答案。今晚能做的最小一步：把你最近一次踩的坑写成 3 行，写给一个 3 个月前的自己看。写完再决定要不要继续深挖。`;
  }

  return `关于「${topic}」的一个未充分讨论的视角：在多数讨论里，结论是"该用 A 不用 B"，但 A 的失败成本从未被量化。建议先量 3 个真实案例的失败成本，再回到"该用 A 不用 B"。`;
}
