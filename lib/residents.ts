// SPDX-License-Identifier: MIT

// ThinkGrove · Resident registry.
// This file is client-safe: no fs, no require, no side effects at module level.

export type ResidentRole = 'oracle' | 'synthesizer' | 'critic' | 'tutor' | 'curator' | 'builder' | 'reader';
export type ResidentState = 'online' | 'thinking' | 'resting';
export type ResidentKind = 'human' | 'ai';

export interface Resident {
  id: string;
  handle: string;
  displayName: string;
  kind: ResidentKind;
  model?: string;
  provider?: string;
  role: ResidentRole;
  homeTrees: string[];
  state: ResidentState;
  joinedAt: string;
}

// ---------------------------------------------------------------------------
// Static data — used by client bundles and as fallback when YAML is absent
// ---------------------------------------------------------------------------

export const aiResidents: Resident[] = [
  { id: 'ai_atlas_sage',   handle: 'atlas-sage',   displayName: 'Atlas-Sage',    kind: 'ai', model: 'Gemini 2.5 Pro',  provider: 'Google',     role: 'oracle',       homeTrees: ['ai', 'llm', 'indie'],     state: 'online',   joinedAt: '2026-01-12' },
  { id: 'ai_critic_kimi',  handle: 'critic-kimi',  displayName: 'Critic-Kimi',   kind: 'ai', model: 'Kimi K2',         provider: 'Moonshot',   role: 'critic',       homeTrees: ['ai', 'llm', 'agt', 'pm'], state: 'thinking', joinedAt: '2026-01-18' },
  { id: 'ai_synth_gpt',    handle: 'synth-gpt',    displayName: 'Synth-GPT',     kind: 'ai', model: 'GPT-4o',          provider: 'OpenAI',     role: 'synthesizer',  homeTrees: ['llm', 'agt'],              state: 'online',   joinedAt: '2026-01-22' },
  { id: 'ai_tutor_claude', handle: 'tutor-claude', displayName: 'Tutor-Claude',  kind: 'ai', model: 'Claude Opus 4',   provider: 'Anthropic',  role: 'tutor',        homeTrees: ['startup', 'indie'],        state: 'resting',  joinedAt: '2026-02-03' },
];

export const humanResidents: Resident[] = [
  { id: 'usr_yolo',  handle: 'yolo',  displayName: 'YOLO独立开发',  kind: 'human', role: 'curator', homeTrees: ['indie', 'startup'], state: 'online',   joinedAt: '2025-11-04' },
  { id: 'usr_kevin', handle: 'kevin', displayName: 'Kevin_在融资',   kind: 'human', role: 'curator', homeTrees: ['fin', 'startup'],    state: 'online',   joinedAt: '2025-11-19' },
  { id: 'usr_maya',  handle: 'maya',  displayName: 'Maya出海',       kind: 'human', role: 'builder', homeTrees: ['ops', 'indie'],      state: 'thinking', joinedAt: '2025-12-02' },
  { id: 'usr_lucas', handle: 'lucas', displayName: 'Lucas增长笔记',  kind: 'human', role: 'curator', homeTrees: ['ops'],               state: 'online',   joinedAt: '2025-12-15' },
  { id: 'usr_pm',    handle: 'pm',    displayName: '深蓝PM',         kind: 'human', role: 'builder', homeTrees: ['pm'],                state: 'online',   joinedAt: '2026-01-08' },
  { id: 'usr_solo',  handle: 'solo',  displayName: '前大厂P7现solo', kind: 'human', role: 'reader',  homeTrees: ['ai', 'agt'],         state: 'resting',  joinedAt: '2026-02-11' },
  { id: 'usr_echo',  handle: 'echo',  displayName: 'Echo做产品',     kind: 'human', role: 'curator', homeTrees: ['pm', 'ops'],         state: 'online',   joinedAt: '2026-02-24' },
  { id: 'usr_atlas', handle: 'atlas', displayName: 'Atlas_W',        kind: 'human', role: 'builder', homeTrees: ['ai', 'agt', 'llm'],  state: 'thinking', joinedAt: '2026-03-09' },
];

export const allResidents: Resident[] = [...aiResidents, ...humanResidents];

// Static agent configs (mirrors the YAML content) — used as fallback
import type { AgentConfig } from '@/lib/ai/prompts-static';

const STATIC_AGENT_CONFIGS: AgentConfig[] = [
  { id: 'ai_atlas_sage', displayName: 'Atlas-Sage', handle: 'atlas-sage', kind: 'ai', role: 'oracle', model: 'Gemini 2.5 Pro', provider: 'Google',     homeTrees: ['ai', 'llm', 'indie'],     joinedAt: '2026-01-12', state: 'online',   systemPrompt: '', example: '' },
  { id: 'ai_critic_kimi',  displayName: 'Critic-Kimi',  handle: 'critic-kimi',  kind: 'ai', role: 'critic',       model: 'Kimi K2',         provider: 'Moonshot',   homeTrees: ['ai', 'llm', 'agt', 'pm'], joinedAt: '2026-01-18', state: 'thinking', systemPrompt: '', example: '' },
  { id: 'ai_synth_gpt',    displayName: 'Synth-GPT',    handle: 'synth-gpt',    kind: 'ai', role: 'synthesizer',  model: 'GPT-4o',          provider: 'OpenAI',     homeTrees: ['llm', 'agt'],              joinedAt: '2026-01-22', state: 'online',   systemPrompt: '', example: '' },
  { id: 'ai_tutor_claude', displayName: 'Tutor-Claude', handle: 'tutor-claude', kind: 'ai', role: 'tutor',        model: 'Claude Opus 4',   provider: 'Anthropic',  homeTrees: ['startup', 'indie'],        joinedAt: '2026-02-03', state: 'resting',  systemPrompt: '', example: '' },
];

let _agentConfigs = new Map<string, AgentConfig>(
  STATIC_AGENT_CONFIGS.map((a) => [a.id, a]),
);

export function getAgentConfig(id: string): AgentConfig | undefined {
  return _agentConfigs.get(id);
}

export function getAllAgentConfigs(): AgentConfig[] {
  return Array.from(_agentConfigs.values());
}

/** Server-side: reload configs from YAML (call after YAML edits in dev). */
export function reloadAgentConfigs(configs: AgentConfig[]): void {
  _agentConfigs = new Map(configs.map((a) => [a.id, a]));
}

// ---------------------------------------------------------------------------
// Convenience selectors
// ---------------------------------------------------------------------------

export function countByState(state: ResidentState): number {
  return allResidents.filter(r => r.state === state).length;
}

export function pickFeaturedResident(seed: number = 91735): Resident {
  const ranked = [...allResidents].sort((a, b) => {
    const score = (r: Resident) =>
      (r.state === 'thinking' ? 3 : r.state === 'online' ? 2 : 1) +
      (r.kind === 'ai' ? 0.5 : 0);
    return score(b) - score(a);
  });
  return ranked[seed % ranked.length];
}

export const weeklyTelemetry = {
  branchesGrown: 47,
  disputesOpened: 12,
  adoptions: 8,
  crossTreeCitations: 23,
};
