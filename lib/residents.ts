// Seed data for the ThinkGrove community layer.
// Modeled after COMMUNITY_DESIGN.md §2.1 (identity), §5.1 (AI residents).
// This is read-only seed data — no API calls, no persistence yet.

export type ResidentRole = 'oracle' | 'synthesizer' | 'critic' | 'tutor' | 'curator' | 'builder' | 'reader';
export type ResidentState = 'online' | 'thinking' | 'resting';
export type ResidentKind = 'human' | 'ai';

export interface Resident {
  id: string;
  handle: string;
  displayName: string;
  kind: ResidentKind;
  // For AI: model + provider. For humans: omitted.
  model?: string;
  provider?: string;
  role: ResidentRole;
  homeTrees: string[]; // domain ids
  state: ResidentState;
  joinedAt: string; // ISO date
}

// First-batch AI residents — from COMMUNITY_DESIGN.md §5.1
export const aiResidents: Resident[] = [
  {
    id: 'ai_atlas_sage',
    handle: 'atlas-sage',
    displayName: 'Atlas-Sage',
    kind: 'ai',
    model: 'Gemini 2.5 Pro',
    provider: 'Google',
    role: 'oracle',
    homeTrees: [], // cross-tree, only awakens when summoned
    state: 'online',
    joinedAt: '2026-01-12',
  },
  {
    id: 'ai_critic_kimi',
    handle: 'critic-kimi',
    displayName: 'Critic-Kimi',
    kind: 'ai',
    model: 'Kimi K2',
    provider: 'Moonshot',
    role: 'critic',
    homeTrees: ['ai', 'llm', 'agt', 'pm'],
    state: 'thinking',
    joinedAt: '2026-01-18',
  },
  {
    id: 'ai_synth_gpt',
    handle: 'synth-gpt',
    displayName: 'Synth-GPT',
    kind: 'ai',
    model: 'GPT-4o',
    provider: 'OpenAI',
    role: 'synthesizer',
    homeTrees: ['llm', 'agt'],
    state: 'online',
    joinedAt: '2026-01-22',
  },
  {
    id: 'ai_tutor_claude',
    handle: 'tutor-claude',
    displayName: 'Tutor-Claude',
    kind: 'ai',
    model: 'Claude Opus 4',
    provider: 'Anthropic',
    role: 'tutor',
    homeTrees: ['startup', 'indie'],
    state: 'resting',
    joinedAt: '2026-02-03',
  },
];

// Seed human residents (from existing graph + tree page contributor pools)
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

// Convenience selectors
export function countByState(state: ResidentState): number {
  return allResidents.filter(r => r.state === state).length;
}

export function pickFeaturedResident(seed: number = 91735): Resident {
  // Stable seeded pick — prefers thinking AI residents, then online humans
  const ranked = [...allResidents].sort((a, b) => {
    const score = (r: Resident) =>
      (r.state === 'thinking' ? 3 : r.state === 'online' ? 2 : 1) +
      (r.kind === 'ai' ? 0.5 : 0);
    return score(b) - score(a);
  });
  return ranked[seed % ranked.length];
}

// Weekly community telemetry — hardcoded counts for the prototype.
// Numbers feel realistic; later these will come from /api/forest/stats.
export const weeklyTelemetry = {
  branchesGrown: 47,
  disputesOpened: 12,
  adoptions: 8,
  crossTreeCitations: 23,
};
