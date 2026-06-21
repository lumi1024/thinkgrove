// SPDX-License-Identifier: MIT

// Role palette — from COMMUNITY_DESIGN.md §8.1.
// AI roles use the 4-color role palette; human roles use slate scale.
// Roles are orthogonal to domain colors: a Critic in any domain
// uses the same role hue.

import type { ResidentRole } from './residents';

export type { ResidentRole };

export interface RoleStyle {
  // Hex used for accents, glows, and chip backgrounds.
  // 8.1 calls for "translucent blue-white gradient" for oracle, etc. — we
  // approximate with the existing motion-friendly flat colors that already
  // appear in the rest of the design.
  base: string;
  // The 5–7% tint applied as background on chips.
  tint: string;
  // Border color.
  border: string;
  // Foreground (text/icon) color.
  fg: string;
  // Whether this role gets the gold "guardian" ring.
  isGuardian?: boolean;
}

const STYLES: Record<ResidentRole, RoleStyle> = {
  // AI roles
  oracle:      { base: '#0ea5e9', tint: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.35)', fg: '#0369a1' },
  synthesizer: { base: '#f59e0b', tint: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.35)', fg: '#92400e' },
  critic:      { base: '#f43f5e', tint: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.35)',  fg: '#9f1239' },
  tutor:       { base: '#10b981', tint: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.35)', fg: '#065f46' },
  // Human roles — slate only, no new color
  curator:     { base: '#64748b', tint: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.30)', fg: '#334155' },
  builder:     { base: '#475569', tint: 'rgba(71,85,105,0.08)',   border: 'rgba(71,85,105,0.30)',  fg: '#1e293b' },
  reader:      { base: '#94a3b8', tint: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.30)', fg: '#475569' },
};

export function getRoleStyle(role: ResidentRole): RoleStyle {
  return STYLES[role];
}

export const ALL_ROLES: ResidentRole[] = [
  'oracle', 'synthesizer', 'critic', 'tutor',
  'curator', 'builder', 'reader',
];

// Node kind prefix for the citation graph (COMMUNITY_DESIGN.md §4.4).
// {A} = Author (human), {M} = Model (AI), {Q} = Question, {E} = External.
export type NodeKind = 'A' | 'M' | 'Q' | 'E';

export function nodePrefixFor(kind: 'human' | 'ai' | 'question' | 'external'): NodeKind {
  switch (kind) {
    case 'human':    return 'A';
    case 'ai':       return 'M';
    case 'question': return 'Q';
    case 'external': return 'E';
  }
}

// 4-class edge color scheme for CitationGraph.
export const EDGE_COLORS = {
  adopted:  '#64748b', // slate-500 — accepted (solid)
  cited:    '#94a3b8', // slate-400 — cited (dashed)
  disputed: '#ef4444', // red-500   — disputed
  rewrite:  '#f59e0b', // amber-500 — rewrite (gold)
} as const;

export type EdgeRelation = keyof typeof EDGE_COLORS;
