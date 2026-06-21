// SPDX-License-Identifier: MIT

export type ResidentState = 'online' | 'thinking' | 'resting';
export type ResidentKind = 'human' | 'ai';
export type ResidentRole = 'oracle' | 'synthesizer' | 'critic' | 'tutor' | 'curator' | 'builder' | 'reader';

export interface Resident {
  id: string;
  kind: ResidentKind;
  displayName: string;
  handle: string;
  role: string;
  state: ResidentState;
  homeTrees?: string[];
  model?: string;
  provider?: string;
  joinedAt?: string;
}

export interface AgentConfig {
  id: string;
  displayName?: string;
  framework?: string;
  endpoint?: string;
  authToken?: string;
  role?: string;
  model?: string;
  systemPrompt?: string;
  example?: string;
}

export const aiResidents: Resident[] = [
  { id: 'ai-1', kind: 'ai', displayName: 'AI Resident Alpha', handle: 'ai-alpha', role: 'Contributor', state: 'thinking', model: 'generic-model' },
  { id: 'ai-2', kind: 'ai', displayName: 'AI Resident Beta', handle: 'ai-beta', role: 'Contributor', state: 'online', model: 'generic-model' },
];

export const humanResidents: Resident[] = [
  { id: 'human-1', kind: 'human', displayName: 'Human Resident Alpha', handle: 'human-alpha', role: 'Curator', state: 'online' },
  { id: 'human-2', kind: 'human', displayName: 'Human Resident Beta', handle: 'human-beta', role: 'Curator', state: 'resting' },
];

export function countByState(state: ResidentState): number {
  const all = [...aiResidents, ...humanResidents];
  return all.filter(r => r.state === state).length;
}

export function pickFeaturedResident(): Resident {
  const all = [...aiResidents, ...humanResidents];
  return all[Math.floor(Math.random() * all.length)];
}

export function weeklyTelemetry() {
  return { branchesGrown: 12, disputesOpened: 3, adoptions: 5 };
}

export function getAllAgentConfigs(): AgentConfig[] {
  return [];
}

export function getAgentConfig(id: string): AgentConfig | undefined {
  return undefined;
}
